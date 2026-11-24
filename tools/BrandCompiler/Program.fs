open System
open System.IO
open System.Text
open System.Text.Json
open System.Text.Json.Nodes
open System.Text.RegularExpressions

let fail (message: string) =
    eprintfn "ERROR %s" message
    Environment.ExitCode <- 1
    raise (InvalidOperationException message)

let requireObject (parent: JsonObject) (name: string) =
    match parent[name] with
    | :? JsonObject as value -> value
    | _ -> fail $"missing required object '{name}'"

let requireString (parent: JsonObject) (name: string) =
    match parent[name] with
    | :? JsonValue as value ->
        try
            let text = value.GetValue<string>()
            if String.IsNullOrWhiteSpace text then fail $"'{name}' must not be empty"
            text
        with _ -> fail $"'{name}' must be a string"
    | _ -> fail $"missing required string '{name}'"

let tryObject (parent: JsonObject) (name: string) =
    match parent[name] with
    | :? JsonObject as value -> Some value
    | _ -> None

let tryNode (parent: JsonObject) (name: string) =
    match parent[name] with
    | null -> None
    | value -> Some value

let pathText (segments: string list) = String.concat "." segments

let getPath (root: JsonObject) (segments: string list) =
    let mutable current: JsonNode = root
    for segment in segments do
        match current with
        | :? JsonObject as obj when not (isNull obj[segment]) -> current <- obj[segment]
        | _ -> fail $"missing required value '{pathText segments}'"
    current

let getStringPath (root: JsonObject) (path: string list) =
    match getPath root path with
    | :? JsonValue as value ->
        try value.GetValue<string>()
        with _ -> fail $"'{pathText path}' must be a string"
    | _ -> fail $"'{pathText path}' must be a string"

let parseHex (hex: string) =
    if not (Regex.IsMatch(hex, "^#[0-9A-Fa-f]{6}$")) then
        fail $"expected six-digit hex color, got '{hex}'"
    let text = hex.Substring(1)
    let part offset = Convert.ToInt32(text.Substring(offset, 2), 16)
    part 0, part 2, part 4

let linearize (channel: int) =
    let c = float channel / 255.0
    if c <= 0.04045 then c / 12.92
    else Math.Pow((c + 0.055) / 1.055, 2.4)

let luminance (hex: string) =
    let r, g, b = parseHex hex
    0.2126 * linearize r + 0.7152 * linearize g + 0.0722 * linearize b

let contrast (a: string) (b: string) =
    let x, y = luminance a, luminance b
    (max x y + 0.05) / (min x y + 0.05)

let ensureContrast (name: string) (foreground: string) (background: string) (minimum: float) =
    let ratio = contrast foreground background
    if ratio + 0.0001 < minimum then
        fail $"{name} contrast {ratio:F2}:1 is below required {minimum:F1}:1"

let genericFonts =
    set [ "serif"; "sans-serif"; "monospace"; "system-ui"; "ui-serif"; "ui-sans-serif"; "ui-monospace"; "cursive"; "fantasy" ]

let safeFontName (value: string) =
    if not (Regex.IsMatch(value, "^[A-Za-z0-9 ._-]+$")) then
        fail $"unsafe font-family value '{value}'"
    if genericFonts.Contains(value.ToLowerInvariant()) then value
    elif value.Contains(" ") then $"\"{value}\""
    else value

let renderFont (node: JsonNode) =
    match node with
    | :? JsonArray as arr ->
        if arr.Count = 0 then fail "font-family arrays must not be empty"
        arr
        |> Seq.map (fun item ->
            if isNull item then fail "font-family entries must be strings"
            item.GetValue<string>() |> safeFontName)
        |> String.concat ", "
    | :? JsonValue as value -> value.GetValue<string>() |> safeFontName
    | _ -> fail "font-family must be a string or array of strings"

let safeDimension (name: string) (value: string) =
    if not (Regex.IsMatch(value, "^(0|[0-9]+(?:\\.[0-9]+)?(?:px|rem|em))$")) then
        fail $"'{name}' must be a non-negative px/rem/em dimension"
    value

let semanticPaths =
    [ "color.text.primary", [ "color"; "text"; "primary" ]
      "color.text.heading", [ "color"; "text"; "heading" ]
      "color.text.secondary", [ "color"; "text"; "secondary" ]
      "color.text.on-secondary-surface", [ "color"; "text"; "on-secondary-surface" ]
      "color.text.inverse", [ "color"; "text"; "inverse" ]
      "color.surface.primary", [ "color"; "surface"; "primary" ]
      "color.surface.secondary", [ "color"; "surface"; "secondary" ]
      "color.surface.inverse", [ "color"; "surface"; "inverse" ]
      "color.surface.inverse-secondary", [ "color"; "surface"; "inverse-secondary" ]
      "color.accent.primary", [ "color"; "accent"; "primary" ]
      "color.accent.secondary", [ "color"; "accent"; "secondary" ]
      "color.border.subtle", [ "color"; "border"; "subtle" ]
      "color.border.functional", [ "color"; "border"; "functional" ]
      "color.focus.ring", [ "color"; "focus"; "ring" ]
      "color.focus.gap", [ "color"; "focus"; "gap" ]
      "color.control.track", [ "color"; "control"; "track" ]
      "color.control.thumb", [ "color"; "control"; "thumb" ]
      "color.control.active", [ "color"; "control"; "active" ] ]

// Additive roles remain optional in third-party 1.0 manifests. Omitted roles
// inherit from the active core theme; shipped brands override all public roles.
let optionalSemanticPaths =
    [ "color.surface.elevated", [ "color"; "surface"; "elevated" ]
      "color.text.muted", [ "color"; "text"; "muted" ]
      "color.accent.hover", [ "color"; "accent"; "hover" ]
      "color.status.success", [ "color"; "status"; "success" ]
      "color.status.warning", [ "color"; "status"; "warning" ]
      "color.status.danger", [ "color"; "status"; "danger" ]
      "color.status.info", [ "color"; "status"; "info" ] ]

// Application surface roles (forma#201). Optional in a 1.0 manifest: when a
// role is absent the compiler derives it from the brand's own core roles, so
// a white-labelled product never inherits another brand's surfaces.
let surfaceRolePaths =
    [ "color.surface.raised", [ "color"; "surface"; "raised" ]
      "color.surface.sunken", [ "color"; "surface"; "sunken" ]
      "color.surface.chrome", [ "color"; "surface"; "chrome" ]
      "color.text.on-chrome", [ "color"; "text"; "on-chrome" ] ]

let cssName (path: string) = "--forma-" + path.Replace(".", "-")

let hasPath (root: JsonObject) (segments: string list) =
    segments
    |> List.fold
        (fun (node: JsonNode option) segment ->
            match node with
            | Some(:? JsonObject as obj) when not (isNull obj[segment]) -> Some obj[segment]
            | _ -> None)
        (Some(root :> JsonNode))
    |> Option.isSome

/// sRGB interpolation, the same as CSS color-mix(in srgb, a, b weight).
let mixHex (a: string) (b: string) (weight: float) =
    let ra, ga, ba = parseHex a
    let rb, gb, bb = parseHex b
    let channel (x: int) (y: int) = int (Math.Round(float x + (float y - float x) * weight))
    $"#{channel ra rb:x2}{channel ga gb:x2}{channel ba bb:x2}"

/// Explicit text pairings for each surface role. Secondary text is valid on
/// raised; on sunken (a secondary-family surface) the secondary role is
/// text.on-secondary-surface; chrome carries text.on-chrome.
let surfacePairs =
    [ "raised-surface primary text", "--forma-color-text-primary", "--forma-color-surface-raised", 4.5
      "raised-surface heading", "--forma-color-text-heading", "--forma-color-surface-raised", 4.5
      "raised-surface secondary text", "--forma-color-text-secondary", "--forma-color-surface-raised", 4.5
      "raised-surface focus ring", "--forma-color-focus-ring", "--forma-color-surface-raised", 3.0
      "sunken-surface primary text", "--forma-color-text-primary", "--forma-color-surface-sunken", 4.5
      "sunken-surface heading", "--forma-color-text-heading", "--forma-color-surface-sunken", 4.5
      "sunken-surface secondary text", "--forma-color-text-on-secondary-surface", "--forma-color-surface-sunken", 4.5
      "chrome text", "--forma-color-text-on-chrome", "--forma-color-surface-chrome", 4.5 ]

let lookup (values: (string * string) list) (name: string) =
    values |> List.tryFind (fst >> (=) name) |> Option.map snd

let pairsPass (values: (string * string) list) (surface: string) =
    surfacePairs
    |> List.filter (fun (_, _, background, _) -> background = surface)
    |> List.forall (fun (_, foreground, background, minimum) ->
        match lookup values foreground, lookup values background with
        | Some fg, Some bg -> contrast fg bg + 0.0001 >= minimum
        | _ -> true)

/// Derives the surface roles a manifest omits, from its own core roles.
/// Raised moves toward white on a light theme and toward surface.secondary
/// on a dark one; sunken moves toward surface.secondary; each takes the
/// strongest step whose explicit pairs pass, ending at surface.primary,
/// whose primary and secondary text are already validated. Chrome is the
/// inverse surface with inverse text, which are validated as a pair.
/// Pure: returns the values to add; declared roles are never replaced.
let deriveSurfaceRoles (values: (string * string) list) =
    let value = lookup values >> Option.defaultWith (fun () -> fail "missing core role for surface derivation")
    let primary = value "--forma-color-surface-primary"
    let secondary = value "--forma-color-surface-secondary"
    let light = luminance primary > luminance (value "--forma-color-text-primary")
    let choose (name: string) (target: string) (weights: float list) =
        match lookup values name with
        | Some _ -> []
        | None ->
            let chosen =
                weights
                |> List.map (mixHex primary target)
                |> List.tryFind (fun candidate -> pairsPass ((name, candidate) :: values) name)
                |> Option.defaultValue primary
            [ name, chosen ]
    let raised =
        choose "--forma-color-surface-raised" (if light then "#ffffff" else secondary) [ 0.6; 0.45; 0.3; 0.15; 0.0 ]
    let sunken =
        choose "--forma-color-surface-sunken" secondary [ 1.0; 0.75; 0.5; 0.25; 0.0 ]
    let chrome =
        [ "--forma-color-surface-chrome", "--forma-color-surface-inverse"
          "--forma-color-text-on-chrome", "--forma-color-text-inverse" ]
        |> List.choose (fun (name, source) ->
            match lookup values name with
            | Some _ -> None
            | None -> Some(name, value source))
    raised @ sunken @ chrome, light

// Elevation shadows: a layer list of "<x> <y> <blur> [<spread>] <color>" with
// px lengths and a hex or rgb(r g b / a) colour, or "none". Validated
// strictly so a manifest cannot inject other CSS.
let shadowLayer =
    "(?:inset )?-?[0-9]+(?:\\.[0-9]+)?px(?: -?[0-9]+(?:\\.[0-9]+)?px){1,3} (?:#[0-9A-Fa-f]{6}|rgb\\([0-9]{1,3} [0-9]{1,3} [0-9]{1,3} / (?:0|1|0?\\.[0-9]+)\\))"

let safeShadow (name: string) (value: string) =
    if not (Regex.IsMatch(value, $"^(?:none|{shadowLayer}(?:, {shadowLayer})*)$")) then
        fail $"'{name}' must be 'none' or a box-shadow layer list of px lengths and a hex or rgb(r g b / a) colour"
    value

let defaultElevation (light: bool) =
    if light then
        [ "--forma-elevation-1", "0px 1px 2px 0px rgb(22 22 22 / 0.08), 0px 8px 24px -8px rgb(22 22 22 / 0.08)"
          "--forma-elevation-2", "0px 2px 4px 0px rgb(22 22 22 / 0.08), 0px 16px 40px -12px rgb(22 22 22 / 0.18)" ]
    else
        [ "--forma-elevation-1", "0px 1px 2px 0px rgb(0 0 0 / 0.4), 0px 8px 24px -8px rgb(0 0 0 / 0.32)"
          "--forma-elevation-2", "0px 2px 4px 0px rgb(0 0 0 / 0.45), 0px 16px 40px -12px rgb(0 0 0 / 0.5)" ]

let readElevation (theme: JsonObject) (light: bool) =
    let defaults = defaultElevation light
    match tryObject theme "elevation" with
    | None -> defaults
    | Some elevation ->
        defaults
        |> List.map (fun (name, fallback) ->
            let level = name.Substring(name.Length - 1)
            match tryNode elevation level with
            | Some node -> name, safeShadow $"elevation.{level}" (node.GetValue<string>())
            | None -> name, fallback)

/// The theme's colour roles, with omitted surface roles derived, and its
/// elevation. Returns (colours, elevation, names of derived roles).
let readTheme (themes: JsonObject) (themeName: string) =
    let theme = requireObject themes themeName
    let declared =
        semanticPaths @ ((optionalSemanticPaths @ surfaceRolePaths) |> List.filter (snd >> hasPath theme))
        |> List.map (fun (name, path) ->
            let value = getStringPath theme path
            parseHex value |> ignore
            cssName name, value.ToLowerInvariant())
    let derived, light = deriveSurfaceRoles declared
    declared @ derived, readElevation theme light, derived |> List.map fst

let valueByCssName (name: string) (values: (string * string) list) =
    match values |> List.tryFind (fun (key, _) -> key = name) with
    | Some (_, value) -> value
    | None -> fail $"missing generated semantic value '{name}'"

let validateTheme (themeName: string) (values: (string * string) list) (derived: string list) =
    let value name = valueByCssName name values
    let surface = value "--forma-color-surface-primary"
    ensureContrast $"{themeName} primary text" (value "--forma-color-text-primary") surface 4.5
    ensureContrast $"{themeName} secondary text" (value "--forma-color-text-secondary") surface 4.5
    ensureContrast $"{themeName} secondary-surface text" (value "--forma-color-text-on-secondary-surface") (value "--forma-color-surface-secondary") 4.5
    ensureContrast $"{themeName} primary accent" (value "--forma-color-accent-primary") surface 4.5
    ensureContrast $"{themeName} secondary accent" (value "--forma-color-accent-secondary") surface 4.5
    ensureContrast $"{themeName} inverse text" (value "--forma-color-text-inverse") (value "--forma-color-surface-inverse") 4.5
    ensureContrast $"{themeName} focus ring" (value "--forma-color-focus-ring") surface 3.0
    [ "muted text", "--forma-color-text-muted", "--forma-color-surface-primary"
      "accent hover", "--forma-color-accent-hover", "--forma-color-surface-primary"
      "elevated-surface text", "--forma-color-text-primary", "--forma-color-surface-elevated"
      "success status", "--forma-color-status-success", "--forma-color-surface-primary"
      "warning status", "--forma-color-status-warning", "--forma-color-surface-primary"
      "danger status", "--forma-color-status-danger", "--forma-color-surface-primary"
      "info status", "--forma-color-status-info", "--forma-color-surface-primary" ]
    |> List.filter (fun (_, foreground, background) ->
        [ foreground; background ] |> List.forall (fun n -> values |> List.exists (fst >> (=) n)))
    |> List.iter (fun (name, foreground, background) ->
        ensureContrast $"{themeName} {name}" (value foreground) (value background) 4.5)
    // Declared surface roles are gated on their explicit pairs. A derived
    // role was chosen to pass them (or is surface.primary itself), so an
    // existing manifest that omits the roles never starts failing.
    surfacePairs
    |> List.filter (fun (_, _, background, _) -> not (List.contains background derived))
    |> List.filter (fun (_, foreground, background, _) ->
        [ foreground; background ] |> List.forall (fun n -> values |> List.exists (fst >> (=) n)))
    |> List.iter (fun (name, foreground, background, minimum) ->
        ensureContrast $"{themeName} {name}" (value foreground) (value background) minimum)

let optionalPresentation (root: JsonObject) =
    match tryObject root "presentation" with
    | None -> []
    | Some presentation ->
        let values = ResizeArray<string * string>()
        match tryObject presentation "fontFamily" with
        | Some fonts ->
            for name in [ "display"; "sans"; "mono" ] do
                match tryNode fonts name with
                | Some node -> values.Add(($"--forma-primitive-font-family-{name}", renderFont node))
                | None -> ()
        | None -> ()
        match tryObject presentation "radius" with
        | Some radius ->
            for name in [ "small"; "medium"; "pill" ] do
                match tryNode radius name with
                | Some node ->
                    let raw = node.GetValue<string>()
                    values.Add(($"--forma-primitive-radius-{name}", safeDimension $"presentation.radius.{name}" raw))
                | None -> ()
        | None -> ()
        values |> Seq.toList

let writeBlock (builder: StringBuilder) (selector: string) (values: (string * string) list) =
    builder.AppendLine(selector + " {") |> ignore
    for name, value in values do
        builder.AppendLine($"  {name}: {value};") |> ignore
    builder.AppendLine("}") |> ignore

let compileBrand (outputDir: string) (sourcePath: string) =
    let parsed = JsonNode.Parse(File.ReadAllText sourcePath)
    let root =
        match parsed with
        | :? JsonObject as value -> value
        | _ -> fail $"brand manifest '{sourcePath}' must contain a JSON object"

    let schemaVersion = requireString root "schemaVersion"
    if schemaVersion <> "1.0" then fail $"unsupported brand manifest schemaVersion '{schemaVersion}'"

    let id = requireString root "id"
    if not (Regex.IsMatch(id, "^[a-z0-9][a-z0-9-]*$")) then
        fail $"brand id '{id}' must match ^[a-z0-9][a-z0-9-]*$"

    let identity = requireObject root "identity"
    let name = requireString identity "name"
    let themes = requireObject root "themes"
    let lightColors, lightElevation, lightDerived = readTheme themes "light"
    let darkColors, darkElevation, darkDerived = readTheme themes "dark"
    validateTheme "light" lightColors lightDerived
    validateTheme "dark" darkColors darkDerived
    let light = lightColors @ lightElevation
    let dark = darkColors @ darkElevation
    let presentation = optionalPresentation root

    let css = StringBuilder()
    css.AppendLine($"/* Generated from {Path.GetFileName sourcePath}. Do not edit directly. */") |> ignore
    css.AppendLine("@layer forma.brand {") |> ignore
    writeBlock css $"  [data-forma-brand=\"{id}\"]" (presentation @ light)
    writeBlock css $"  [data-forma-theme=\"light\"] [data-forma-brand=\"{id}\"], [data-forma-brand=\"{id}\"][data-forma-theme=\"light\"]" light
    writeBlock css $"  [data-forma-theme=\"dark\"] [data-forma-brand=\"{id}\"], [data-forma-brand=\"{id}\"][data-forma-theme=\"dark\"]" dark
    css.AppendLine("  @media (prefers-color-scheme: dark) {") |> ignore
    writeBlock css $"    :root:not([data-forma-theme]) [data-forma-brand=\"{id}\"]:not([data-forma-theme]), :root[data-forma-brand=\"{id}\"]:not([data-forma-theme])" dark
    css.AppendLine("  }") |> ignore
    css.AppendLine("}") |> ignore

    Directory.CreateDirectory(outputDir) |> ignore
    let outputPath = Path.Combine(outputDir, id + ".css")
    File.WriteAllText(outputPath, css.ToString().Replace("\r\n", "\n"))
    printfn "brand compilation passed: %s (%s) -> %s" id name outputPath
    id, name, Path.GetFileName(sourcePath)

[<EntryPoint>]
let main argv =
    try
        if argv.Length <> 2 then fail "usage: BrandCompiler <brand-directory> <output-directory>"
        let sourceDir = Path.GetFullPath argv[0]
        let outputDir = Path.GetFullPath argv[1]
        if not (Directory.Exists sourceDir) then fail $"brand directory does not exist: {sourceDir}"

        let files = Directory.GetFiles(sourceDir, "*.brand.json", SearchOption.TopDirectoryOnly) |> Array.sort
        if files.Length = 0 then fail $"brand directory contains no *.brand.json files: {sourceDir}"

        Directory.CreateDirectory(outputDir) |> ignore
        for oldFile in Directory.GetFiles(outputDir, "*.css", SearchOption.TopDirectoryOnly) do
            File.Delete(oldFile)

        let compiled = files |> Array.map (compileBrand outputDir)
        let index = JsonArray()
        for id, name, source in compiled do
            let item = JsonObject()
            item["id"] <- JsonValue.Create(id)
            item["name"] <- JsonValue.Create(name)
            item["source"] <- JsonValue.Create(source)
            item["css"] <- JsonValue.Create(id + ".css")
            index.Add(item)
        let indexRoot = JsonObject()
        indexRoot["schemaVersion"] <- JsonValue.Create("1.0")
        indexRoot["brands"] <- index
        let options = JsonSerializerOptions(WriteIndented = true)
        File.WriteAllText(Path.Combine(outputDir, "index.json"), indexRoot.ToJsonString(options) + "\n")
        0
    with ex ->
        if Environment.ExitCode = 0 then eprintfn "ERROR %s" ex.Message
        1
