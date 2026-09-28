open System
open System.Collections.Generic
open System.Globalization
open System.IO
open System.Text
open System.Text.Json.Nodes

type Token =
    { Path: string list
      DeclaredType: string option
      Value: JsonNode }

let fail message =
    eprintfn "ERROR %s" message
    Environment.ExitCode <- 1
    raise (InvalidOperationException message)

let invariant (value: float) = value.ToString("0.####", CultureInfo.InvariantCulture)

let rec collectTokens (inheritedType: string option) (path: string list) (node: JsonNode) : Token list =
    match node with
    | :? JsonObject as obj ->
        let tokenType =
            match obj["$type"] with
            | null -> inheritedType
            | typeNode -> Some(typeNode.GetValue<string>())

        match obj["$value"] with
        | null ->
            obj
            |> Seq.choose (fun pair ->
                if pair.Key.StartsWith("$", StringComparison.Ordinal) || isNull pair.Value then None
                else Some(collectTokens tokenType (path @ [ pair.Key ]) pair.Value))
            |> Seq.concat
            |> Seq.toList
        | value ->
            [ { Path = path
                DeclaredType = tokenType
                Value = value } ]
    | _ -> []

let pathText path = String.concat "." path

let tryAlias (node: JsonNode) =
    match node with
    | :? JsonValue as value ->
        try
            let text = value.GetValue<string>()
            if text.StartsWith("{", StringComparison.Ordinal)
               && text.EndsWith("}", StringComparison.Ordinal)
               && text.Length > 2 then
                Some(text.Substring(1, text.Length - 2))
            else None
        with _ -> None
    | _ -> None

let cssName (segments: string list) =
    segments
    |> List.map (fun segment -> segment.Trim().ToLowerInvariant().Replace("_", "-").Replace(" ", "-"))
    |> String.concat "-"

let quoteFont (value: string) =
    let generic =
        set [ "serif"; "sans-serif"; "monospace"; "system-ui"; "ui-serif"; "ui-sans-serif"; "ui-monospace"; "cursive"; "fantasy" ]
    if generic.Contains(value.ToLowerInvariant()) then value
    elif value.Contains(" ") then $"\"{value}\""
    else value

let renderDimension (node: JsonNode) =
    let obj = node.AsObject()
    (obj["value"].GetValue<float>() |> invariant) + obj["unit"].GetValue<string>()

let renderColor (node: JsonNode) =
    let obj = node.AsObject()
    let toByte c = Math.Clamp(int (Math.Round(c * 255.0)), 0, 255)
    let alpha =
        match obj["alpha"] with
        | null -> 1.0
        | a -> a.GetValue<float>()
    let channels () =
        let components = obj["components"].AsArray() |> Seq.map (fun n -> n.GetValue<float>()) |> Seq.toArray
        if components.Length <> 3 then fail "color token requires three sRGB components"
        components |> Array.map toByte
    if alpha < 1.0 then
        let c = channels ()
        $"rgb({c[0]} {c[1]} {c[2]} / {invariant alpha})"
    else
        match obj["hex"] with
        | null ->
            let c = channels ()
            $"#{c[0]:x2}{c[1]:x2}{c[2]:x2}"
        | hex -> hex.GetValue<string>().ToLowerInvariant()

let renderLiteral tokenType (value: JsonNode) =
    match tokenType with
    | "color" -> renderColor value
    | "dimension"
    | "duration" -> renderDimension value
    | "fluidDimension" ->
        // Fluid sizes keep a rem term in the preferred value so text still
        // scales with browser zoom and user font-size preferences (WCAG 1.4.4).
        let obj = value.AsObject()
        let preferred =
            obj["preferred"].AsArray()
            |> Seq.map renderDimension
            |> String.concat " + "
        let bound (key: string) = renderDimension obj[key]
        let lower, upper = bound "min", bound "max"
        $"clamp({lower}, {preferred}, {upper})"
    | "shadow" ->
        let layer (node: JsonNode) =
            let obj = node.AsObject()
            let inset =
                match obj["inset"] with
                | null -> ""
                | flag when flag.GetValue<bool>() -> "inset "
                | _ -> ""
            [ "offsetX"; "offsetY"; "blur"; "spread" ]
            |> List.map (fun key -> renderDimension obj[key])
            |> fun parts -> inset + String.concat " " (parts @ [ renderColor obj["color"] ])
        match value with
        | :? JsonArray as layers -> layers |> Seq.map layer |> String.concat ", "
        | single -> layer single
    | "cubicBezier" ->
        let values = value.AsArray() |> Seq.map (fun n -> n.GetValue<float>() |> invariant)
        let joined = String.concat ", " values
        $"cubic-bezier({joined})"
    | "fontFamily" ->
        match value with
        | :? JsonArray as arr ->
            arr |> Seq.map (fun n -> n.GetValue<string>() |> quoteFont) |> String.concat ", "
        | _ -> value.GetValue<string>() |> quoteFont
    | "fontWeight"
    | "number" ->
        value.GetValue<float>() |> invariant
    | other -> fail $"unsupported token type '{other}'"

let parseHex (hex: string) =
    let text = hex.TrimStart('#')
    if text.Length <> 6 then fail $"contrast validation requires six-digit hex, got '{hex}'"
    let part offset = Convert.ToInt32(text.Substring(offset, 2), 16)
    part 0, part 2, part 4

let linearize channel =
    let c = float channel / 255.0
    if c <= 0.04045 then c / 12.92
    else Math.Pow((c + 0.055) / 1.055, 2.4)

let luminance hex =
    let r, g, b = parseHex hex
    0.2126 * linearize r + 0.7152 * linearize g + 0.0722 * linearize b

let contrast a b =
    let x, y = luminance a, luminance b
    (max x y + 0.05) / (min x y + 0.05)

[<EntryPoint>]
let main argv =
    try
        // usage: TokenCompiler <tokens.json> <output.css> [--reference <tokens.json>]...
        // Reference sources resolve aliases (for example a theme aliasing core
        // primitives) but are never emitted, so a theme cannot silently
        // redefine the core scale it builds on.
        let positional, references =
            let rec parse args positional references =
                match args with
                | [] -> List.rev positional, List.rev references
                | "--reference" :: path :: rest -> parse rest positional (path :: references)
                | "--reference" :: [] -> fail "--reference requires a path"
                | value :: rest -> parse rest (value :: positional) references
            parse (List.ofArray argv) [] []

        if positional.Length <> 2 then
            fail "usage: TokenCompiler <tokens.json> <output.css> [--reference <tokens.json>]..."

        let sourcePath = Path.GetFullPath positional[0]
        let outputPath = Path.GetFullPath positional[1]
        let load path =
            match JsonNode.Parse(File.ReadAllText path) with
            | null -> fail $"token source '{Path.GetFileName(path: string)}' is empty"
            | root -> collectTokens None [] root

        let tokens = load sourcePath
        if tokens.IsEmpty then fail "token source contains no tokens"
        let referenceTokens = references |> List.collect (Path.GetFullPath >> load)

        let byPath = Dictionary<string, Token>(StringComparer.Ordinal)
        for token in tokens do
            let key = pathText token.Path
            if byPath.ContainsKey key then fail $"duplicate token path '{key}'"
            byPath[key] <- token

        // The emitted source shadows its references: a theme may restate a
        // semantic role that the reference also defines.
        for token in referenceTokens do
            byPath.TryAdd(pathText token.Path, token) |> ignore

        let rec resolveType stack (token: Token) =
            match token.DeclaredType with
            | Some t -> t
            | None ->
                match tryAlias token.Value with
                | Some alias ->
                    if stack |> List.contains alias then fail $"circular token reference involving '{alias}'"
                    match byPath.TryGetValue alias with
                    | true, target -> resolveType (alias :: stack) target
                    | _ -> fail $"unknown token reference '{{{alias}}}'"
                | None -> fail $"token '{pathText token.Path}' has no type"

        let rec resolveCss stack (token: Token) =
            let key = pathText token.Path
            if stack |> List.contains key then fail $"circular token reference involving '{key}'"
            match tryAlias token.Value with
            | Some alias ->
                match byPath.TryGetValue alias with
                | true, target -> resolveCss (key :: stack) target
                | _ -> fail $"unknown token reference '{{{alias}}}'"
            | None -> renderLiteral (resolveType stack token) token.Value

        let semantic theme =
            tokens
            |> List.choose (fun token ->
                match token.Path with
                | "semantic" :: actualTheme :: rest when actualTheme = theme && not rest.IsEmpty ->
                    Some("--ef-" + cssName rest, resolveCss [] token)
                | _ -> None)
            |> List.sortBy fst

        let themes =
            tokens
            |> List.choose (fun token ->
                match token.Path with
                | "semantic" :: theme :: _ -> Some theme
                | _ -> None)
            |> Set.ofList
            |> Set.toList
            |> List.sort

        if not (themes |> List.contains "light") || not (themes |> List.contains "dark") then
            fail "semantic themes must include light and dark"

        let themeValues = themes |> List.map (fun theme -> theme, semantic theme)
        let baselineNames = semantic "light" |> List.map fst |> Set.ofList
        for theme, values in themeValues do
            let names = values |> List.map fst |> Set.ofList
            if names <> baselineNames then
                let missing = Set.difference baselineNames names |> String.concat ", "
                let extra = Set.difference names baselineNames |> String.concat ", "
                fail $"theme variable mismatch for '{theme}'; missing=[{missing}] extra=[{extra}]"

        let resolved key =
            match byPath.TryGetValue key with
            | true, token -> resolveCss [] token
            | _ -> fail $"missing required token '{key}'"

        for theme in themes do
            let key suffix = $"semantic.{theme}.color.{suffix}"
            let checks =
                [ "primary text", key "text.primary", key "surface.primary", 4.5
                  "secondary text", key "text.secondary", key "surface.primary", 4.5
                  "secondary-surface text", key "text.on-secondary-surface", key "surface.secondary", 4.5
                  "primary accent", key "accent.primary", key "surface.primary", 4.5
                  "secondary accent", key "accent.secondary", key "surface.primary", 4.5
                  "focus ring", key "focus.ring", key "surface.primary", 3.0 ]
            // Extended semantic roles are optional so existing application
            // themes stay valid; any theme that declares them is gated too.
            let optionalChecks =
                [ "muted text", key "text.muted", key "surface.primary", 4.5
                  "accent hover", key "accent.hover", key "surface.primary", 4.5
                  "elevated-surface text", key "text.primary", key "surface.elevated", 4.5
                  "success status", key "status.success", key "surface.primary", 4.5
                  "warning status", key "status.warning", key "surface.primary", 4.5
                  "danger status", key "status.danger", key "surface.primary", 4.5
                  "info status", key "status.info", key "surface.primary", 4.5
                  "inverse text", key "text.inverse", key "surface.inverse", 4.5 ]
                |> List.filter (fun (_, foreground, background, _) ->
                    byPath.ContainsKey foreground && byPath.ContainsKey background)
            for name, foreground, background, minimum in checks @ optionalChecks do
                let ratio = contrast (resolved foreground) (resolved background)
                if ratio + 0.0001 < minimum then
                    fail $"{theme} {name} contrast {ratio:F2}:1 is below required {minimum:F1}:1"

        let neutral =
            tokens
            |> List.choose (fun token ->
                match token.Path with
                | "semantic" :: _ -> None
                | path -> Some("--ef-" + cssName path, resolveCss [] token))
            |> List.sortBy fst

        let writeBlock (builder: StringBuilder) selector values =
            builder.AppendLine(selector + " {") |> ignore
            for name, value in values do
                builder.AppendLine($"  {name}: {value};") |> ignore
            builder.AppendLine("}") |> ignore

        let css = StringBuilder()
        css.AppendLine($"/* Generated from {Path.GetFileName sourcePath}. Do not edit directly. */") |> ignore
        css.AppendLine("@layer echelon.tokens {") |> ignore
        writeBlock css "  :root" neutral
        writeBlock css "  :root, [data-ef-theme=\"light\"]" (semantic "light")
        css.AppendLine("  @media (prefers-color-scheme: dark) {") |> ignore
        writeBlock css "    :root:not([data-ef-theme])" (semantic "dark")
        css.AppendLine("  }") |> ignore
        for theme, values in themeValues do
            if theme <> "light" then
                writeBlock css $"  [data-ef-theme=\"{theme}\"]" values
        css.AppendLine("}") |> ignore

        Directory.CreateDirectory(Path.GetDirectoryName outputPath) |> ignore
        File.WriteAllText(outputPath, css.ToString().Replace("\r\n", "\n"))

        printfn "token compilation passed: %d tokens, %d semantic variables across %d themes" tokens.Length baselineNames.Count themes.Length
        0
    with ex ->
        if Environment.ExitCode = 0 then eprintfn "ERROR %s" ex.Message
        1
