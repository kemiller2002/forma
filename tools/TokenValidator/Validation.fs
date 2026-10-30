/// Design-token reference validation (LRP-001). The source of truth is the
/// Forma installation being validated against: its DTCG token sources and
/// its shipped stylesheets. Nothing here lists token names of its own.
module Forma.TokenValidator.Validation

open System
open System.IO
open System.Text.Json.Nodes
open Forma.TokenValidator.Css

/// The Forma-owned custom property namespace.
let FormaPrefix = "--ef-"

/// Prefixes that look like an attempt at a Forma token but are not the
/// namespace (`--forma-text`, `--ef_color`, `--EF-color`).
let private lookalikePrefixes = [ "--forma-"; "--echelon-"; "--ef_"; "--ef--"; "--efc-" ]

type Severity =
    | Blocking
    | Advisory

type Finding =
    { Code: string
      Severity: Severity
      File: string
      Line: int
      Name: string
      Message: string }

type TokenEntry =
    { Path: string list
      CssName: string
      Theme: string option
      Alias: string option
      Deprecated: string option
      Source: string }

/// What a Forma installation exports.
type Registry =
    { Tokens: TokenEntry list
      /// Every --ef-* custom property Forma defines: token sources plus
      /// declarations in its shipped CSS.
      Defined: Set<string>
      /// --ef-* properties Forma reads with a fallback but never declares:
      /// documented inputs such as --ef-stack-gap. Consumers may set them.
      Hooks: Set<string>
      Deprecated: Map<string, string>
      /// Prefixes Forma's color contract marks as implementation variables
      /// (contracts/color-contract.json internalVariables): defined, but not
      /// a consumer compatibility contract, so applications must not read them.
      Internal: string list
      FormaCss: Declaration list }

// ---------------------------------------------------------------------------
// Token sources (DTCG)
// ---------------------------------------------------------------------------

let private cssSegment (segment: string) = segment.Trim().ToLowerInvariant().Replace("_", "-").Replace(" ", "-")

/// The custom property a token compiles to (tools/TokenCompiler): semantic
/// tokens drop the "semantic.<theme>" prefix; every other path is used whole.
let cssNameOf (path: string list) =
    match path with
    | "semantic" :: _ :: rest when not rest.IsEmpty -> FormaPrefix + (rest |> List.map cssSegment |> String.concat "-")
    | _ -> FormaPrefix + (path |> List.map cssSegment |> String.concat "-")

let private themeOf (path: string list) =
    match path with
    | "semantic" :: theme :: _ :: _ -> Some theme
    | _ -> None

let private deprecationOf (node: JsonObject) =
    match node["$deprecated"] with
    | null -> None
    | :? JsonValue as value ->
        match value.GetValueKind() with
        | Text.Json.JsonValueKind.True -> Some ""
        | Text.Json.JsonValueKind.String -> Some(value.GetValue<string>())
        | _ -> None
    | _ -> None

let private aliasOf (node: JsonNode) =
    match node with
    | :? JsonValue as value when value.GetValueKind() = Text.Json.JsonValueKind.String ->
        let text = value.GetValue<string>()
        if text.Length > 2 && text.StartsWith("{") && text.EndsWith("}") then Some(text.Substring(1, text.Length - 2)) else None
    | _ -> None

/// Tokens of one DTCG document. A group's $deprecated applies to its tokens.
let rec private collect (source: string) (deprecated: string option) (path: string list) (node: JsonNode) : TokenEntry list =
    match node with
    | :? JsonObject as obj ->
        let deprecated = deprecationOf obj |> Option.orElse deprecated
        match obj["$value"] with
        | null ->
            obj
            |> Seq.filter (fun pair -> not (pair.Key.StartsWith("$")) && not (isNull pair.Value))
            |> Seq.collect (fun pair -> collect source deprecated (path @ [ pair.Key ]) pair.Value)
            |> Seq.toList
        | value ->
            [ { Path = path
                CssName = cssNameOf path
                Theme = themeOf path
                Alias = aliasOf value
                Deprecated = deprecated
                Source = source } ]
    | _ -> []

let tokensOf (file: string) =
    match JsonNode.Parse(File.ReadAllText file) with
    | null -> []
    | root -> collect file None [] root

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

let private cssFilesUnder (directory: string) =
    if Directory.Exists directory then
        Directory.EnumerateFiles(directory, "*.css", SearchOption.AllDirectories) |> Seq.sort |> Seq.toList
    else []

let isForma (name: string) = name.StartsWith(FormaPrefix, StringComparison.Ordinal)

let declarationsOf (files: string list) =
    files |> List.collect (fun file -> declarations file (File.ReadAllText file))

/// Token sources shipped with (or kept in) a Forma root: the core token file
/// and any theme token files.
let tokenSourcesOf (root: string) =
    let core = Path.Combine(root, "tokens", "echelon.tokens.json")
    let themes =
        let directory = Path.Combine(root, "themes")
        if Directory.Exists directory then
            Directory.EnumerateFiles(directory, "*.tokens.json", SearchOption.AllDirectories) |> Seq.sort |> Seq.toList
        else []
    (if File.Exists core then [ core ] else []) @ themes

let private internalPrefixesOf (root: string) =
    let contract = Path.Combine(root, "contracts", "color-contract.json")
    if not (File.Exists contract) then []
    else
        match JsonNode.Parse(File.ReadAllText contract) with
        | :? JsonObject as obj ->
            match obj["internalVariables"] with
            | :? JsonObject as internalVariables ->
                match internalVariables["prefixes"] with
                | :? JsonArray as prefixes -> prefixes |> Seq.choose (fun p -> if isNull p then None else Some(p.GetValue<string>())) |> Seq.toList
                | _ -> []
            | _ -> []
        | _ -> []

/// Build the registry from a Forma root: a repository checkout after
/// `npm run build`, or an installed package
/// (node_modules/@echelon-foundry/design-system). Both carry the token source
/// and the built stylesheets in dist/.
let registryOf (root: string) =
    let sources = tokenSourcesOf root
    if sources.IsEmpty then failwith $"no token source under '{root}' (expected tokens/echelon.tokens.json)"
    let dist = Path.Combine(root, "dist")
    let css = cssFilesUnder dist
    if css.IsEmpty then failwith $"no built stylesheets under '{dist}' (run npm run build, or point --forma at an installed package)"
    let tokens = sources |> List.collect tokensOf
    let formaCss = declarationsOf css
    let declared = formaCss |> List.map (fun d -> d.Property) |> List.filter isForma |> Set.ofList
    let defined = Set.union declared (tokens |> List.map (fun t -> t.CssName) |> Set.ofList)
    let hooks =
        formaCss
        |> List.collect (fun d -> d.References)
        |> List.filter (fun r -> r.HasFallback && isForma r.Name && not (defined.Contains r.Name))
        |> List.map (fun r -> r.Name)
        |> Set.ofList
    { Tokens = tokens
      Defined = defined
      Hooks = hooks
      Deprecated = tokens |> List.choose (fun t -> t.Deprecated |> Option.map (fun d -> t.CssName, d)) |> Map.ofList
      Internal = internalPrefixesOf root
      FormaCss = formaCss }

let exported (registry: Registry) = Set.union registry.Defined registry.Hooks

let isInternal (registry: Registry) (name: string) =
    registry.Internal |> List.exists (fun prefix -> name.StartsWith(prefix, StringComparison.Ordinal))

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

let private finding code file line name message =
    { Code = code; Severity = Blocking; File = file; Line = line; Name = name; Message = message }

/// A known name this one would be if a namespace segment had not been
/// dropped (--ef-spacing-4 for --ef-primitive-spacing-4, --ef-text-primary
/// for --ef-color-text-primary).
let namespaceSlip (known: Set<string>) (name: string) =
    let tail = name.Substring(FormaPrefix.Length)
    known
    |> Seq.tryFind (fun candidate ->
        let parts = candidate.Substring(FormaPrefix.Length).Split('-') |> List.ofArray
        parts.Length > 1
        && (parts |> List.indexed |> List.exists (fun (i, _) ->
                parts |> List.removeAt i |> String.concat "-" = tail)))

let private lookalike (name: string) =
    lookalikePrefixes |> List.tryFind (fun prefix -> name.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
    |> Option.orElse (if name.StartsWith("--ef-", StringComparison.OrdinalIgnoreCase) && not (isForma name) then Some "--EF-" else None)

/// Levenshtein distance, for "did you mean" on misspelt token names.
let editDistance (a: string) (b: string) =
    let step (previous: int array) (i, ca: char) =
        b
        |> Seq.indexed
        |> Seq.fold (fun (row: int list) (j, cb) ->
            let cost = if ca = cb then 0 else 1
            min (min (previous[j + 1] + 1) (List.head row + 1)) (previous[j] + cost) :: row) [ i + 1 ]
        |> List.rev
        |> Array.ofList
    a |> Seq.indexed |> Seq.fold step [| 0 .. b.Length |] |> Array.last

let private nearest (known: Set<string>) (name: string) =
    known
    |> Seq.map (fun candidate -> candidate, editDistance name candidate)
    |> Seq.filter (fun (_, distance) -> distance <= 2)
    |> Seq.sortBy snd
    |> Seq.tryHead
    |> Option.map fst

let private suggestion (registry: Registry) (name: string) =
    let known = exported registry
    if isForma name then namespaceSlip known name |> Option.orElse (nearest known name)
    else
        let lowered = name.ToLowerInvariant()
        lookalikePrefixes
        |> List.tryPick (fun prefix ->
            if lowered.StartsWith(prefix) then
                let candidate = FormaPrefix + lowered.Substring(prefix.Length).TrimStart('-')
                if known.Contains candidate then Some candidate else namespaceSlip known candidate
            else None)
        |> Option.orElse (if lowered.StartsWith(FormaPrefix) && known.Contains lowered then Some lowered else None)

let private hint registry name =
    match suggestion registry name with
    | Some known -> $" Did you mean {known}?"
    | None -> ""

/// One var() reference in application or Forma CSS. A fallback never makes
/// an unknown Forma token valid: var(--ef-nonexistent, white) is reported.
let checkReference (registry: Registry) (declaration: Declaration) (reference: VarReference) : Finding list =
    let name = reference.Name
    let at code message = [ finding code declaration.File declaration.Line name message ]
    let fallbackNote = if reference.HasFallback then " A fallback value does not make it valid." else ""
    if isForma name then
        match registry.Deprecated |> Map.tryFind name with
        | Some note ->
            let detail = if String.IsNullOrWhiteSpace note then "" else " " + note
            at "deprecated-token" $"{name} is deprecated in this Forma version.{detail}"
        | None when isInternal registry name ->
            at "internal-variable" $"{name} is a Forma implementation variable (contracts/color-contract.json internalVariables), not a consumer contract. Use a public token."
        | None when (exported registry).Contains name -> []
        | None ->
            match namespaceSlip (exported registry) name with
            | Some known -> at "namespace" $"{name} is not a Forma token; it drops a namespace segment of {known}.{fallbackNote}"
            | None -> at "unknown-token" $"{name} is not exported by this Forma version.{fallbackNote}{hint registry name}"
    else
        match lookalike name with
        | Some prefix -> at "namespace" $"{name} uses '{prefix}', which is not the Forma namespace '{FormaPrefix}'.{hint registry name}"
        | None -> [] // application-owned custom property

/// A custom property declared by application CSS. Applications may set
/// Forma tokens and hooks (themes, brands, component inputs) but may not
/// mint new names in the Forma namespace.
let checkDeclaration (registry: Registry) (declaration: Declaration) : Finding list =
    let name = declaration.Property
    if not (name.StartsWith("--")) then []
    elif isForma name then
        if (exported registry).Contains name then []
        else
            [ finding "namespace" declaration.File declaration.Line name
                  $"{name} declares a new name in the Forma-owned namespace '{FormaPrefix}'. Use an application prefix, or a token this Forma version exports.{hint registry name}" ]
    else
        match lookalike name with
        | Some prefix ->
            [ finding "namespace" declaration.File declaration.Line name
                  $"{name} uses '{prefix}', which is not the Forma namespace '{FormaPrefix}'.{hint registry name}" ]
        | None -> []

/// Custom properties that refer to each other in a cycle within one rule are
/// invalid at computed-value time (CSS Variables 1, section 2.3); every
/// property on the cycle becomes the guaranteed-invalid value.
let cyclesIn (declarations: Declaration list) : Finding list =
    let custom = declarations |> List.filter (fun d -> d.Property.StartsWith("--"))
    let edges = custom |> List.map (fun d -> d.Property, d.References |> List.map (fun r -> r.Name)) |> Map.ofList
    let rec reaches target visited current =
        match edges |> Map.tryFind current with
        | None -> false
        | Some next -> next |> List.exists (fun n -> n = target || (not (Set.contains n visited) && reaches target (Set.add n visited) n))
    custom
    |> List.filter (fun d -> reaches d.Property (Set.singleton d.Property) d.Property)
    |> List.map (fun d -> finding "cycle" d.File d.Line d.Property $"{d.Property} refers back to itself through custom properties in '{d.Selector}', so it is invalid at computed-value time.")

let private byRule (declarations: Declaration list) =
    declarations |> List.groupBy (fun d -> d.File, d.Selector) |> List.map snd

/// Validate application CSS against a Forma installation.
let validateCss (registry: Registry) (declarations: Declaration list) : Finding list =
    let referenceFindings =
        declarations |> List.collect (fun d -> d.References |> List.collect (checkReference registry d))
    let declarationFindings = declarations |> List.collect (checkDeclaration registry)
    let cycleFindings = declarations |> byRule |> List.collect cyclesIn
    referenceFindings @ declarationFindings @ cycleFindings

// ---------------------------------------------------------------------------
// Forma's own sources (--self)
// ---------------------------------------------------------------------------

/// Alias targets, alias cycles and theme completeness across the token
/// sources, reporting every problem rather than stopping at the first.
let validateTokens (tokens: TokenEntry list) : Finding list =
    let dotted (t: TokenEntry) = String.concat "." t.Path
    let byPath = tokens |> List.map (fun t -> dotted t, t) |> Map.ofList
    let at (t: TokenEntry) code message = finding code t.Source 0 (dotted t) message
    let invalidAliases =
        tokens
        |> List.choose (fun t ->
            t.Alias
            |> Option.filter (fun alias -> not (byPath.ContainsKey alias))
            |> Option.map (fun alias -> at t "invalid-alias" $"{dotted t} aliases {{{alias}}}, which no token source defines."))
    let rec onCycle origin visited (t: TokenEntry) =
        match t.Alias |> Option.bind (fun alias -> byPath |> Map.tryFind alias) with
        | Some next when dotted next = origin -> true
        | Some next when Set.contains (dotted next) visited -> false
        | Some next -> onCycle origin (Set.add (dotted next) visited) next
        | None -> false
    let cycles =
        tokens
        |> List.filter (fun t -> onCycle (dotted t) Set.empty t)
        |> List.map (fun t -> at t "cycle" $"{dotted t} is on an alias cycle.")
    let themed = tokens |> List.filter (fun t -> t.Theme.IsSome) |> List.groupBy (fun t -> t.Source)
    let themeGaps =
        themed
        |> List.collect (fun (source, entries) ->
            let names theme = entries |> List.filter (fun t -> t.Theme = Some theme) |> List.map (fun t -> t.CssName) |> Set.ofList
            let themes = entries |> List.choose (fun t -> t.Theme) |> List.distinct
            let all = themes |> List.map names |> Set.unionMany
            themes
            |> List.collect (fun theme ->
                Set.difference all (names theme)
                |> Set.toList
                |> List.map (fun name -> finding "theme-missing" source 0 name $"theme '{theme}' does not define {name}, which another theme in this source defines.")))
    invalidAliases @ cycles @ themeGaps

/// A brand manifest's themes must define the same color roles, or a dark
/// page would show the light brand value for the missing role.
let validateBrand (file: string) : Finding list =
    match JsonNode.Parse(File.ReadAllText file) with
    | :? JsonObject as root ->
        match root["themes"] with
        | :? JsonObject as themes ->
            let rec leaves (prefix: string list) (node: JsonNode) =
                match node with
                | :? JsonObject as obj -> obj |> Seq.collect (fun pair -> leaves (prefix @ [ pair.Key ]) pair.Value) |> Seq.toList
                | _ -> [ cssNameOf prefix ]
            let perTheme = themes |> Seq.map (fun pair -> pair.Key, leaves [] pair.Value |> Set.ofList) |> Seq.toList
            let all = perTheme |> List.map snd |> Set.unionMany
            perTheme
            |> List.collect (fun (theme, names) ->
                Set.difference all names
                |> Set.toList
                |> List.map (fun name -> finding "theme-missing" file 0 name $"brand theme '{theme}' does not define {name}, which another theme of this brand defines."))
        | _ -> []
    | _ -> []

/// Forma's own CSS: every --ef-* reference without a fallback must be
/// defined (a missing required definition), every reference must be in the
/// namespace, and no rule may hold a custom property cycle.
let validateFormaCss (registry: Registry) : Finding list =
    let missing =
        registry.FormaCss
        |> List.collect (fun d ->
            d.References
            |> List.filter (fun r -> isForma r.Name && not r.HasFallback && not (registry.Defined.Contains r.Name))
            |> List.map (fun r -> finding "missing-definition" d.File d.Line r.Name $"{r.Name} is read without a fallback but no token source or stylesheet defines it.{hint registry r.Name}"))
    let deprecatedUse =
        registry.FormaCss
        |> List.collect (fun d ->
            d.References
            |> List.filter (fun r -> registry.Deprecated.ContainsKey r.Name)
            |> List.map (fun r -> finding "deprecated-token" d.File d.Line r.Name $"{r.Name} is deprecated but Forma's own CSS still reads it."))
    let lookalikes =
        registry.FormaCss
        |> List.collect (fun d -> d.References |> List.filter (fun r -> lookalike r.Name |> Option.isSome) |> List.collect (checkReference registry d))
    let cycles = registry.FormaCss |> byRule |> List.collect cyclesIn
    missing @ deprecatedUse @ lookalikes @ cycles
