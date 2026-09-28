// Site CSS policy: a marketing site must not recreate presentation that Forma
// already supplies. This checker reads a site's local stylesheets and reports
// rules that restyle Forma components, redefine global element presentation,
// override Forma tokens outside the identity allowlist, or copy Forma palette
// values instead of using tokens.
//
// usage: SiteCssPolicy [--forma <forma.css>] <site.css>...
//
// A rule preceded by a comment "/* forma-exception: <reason> */" is exempt;
// the reason should name the Forma capability gap (for example GAP-MKT-03 or
// an issue URL) so the exception can be promoted into Forma later.
//
// Exit codes: 0 compliant, 1 violations found, 2 usage or input error.

open System
open System.IO
open System.Text.RegularExpressions

type Rule =
    { Selector: string
      Declarations: string
      Line: int
      Exception: string option }

type Finding =
    { File: string
      Line: int
      Code: string
      Message: string }

// Identity tokens a product may retarget, only to other Forma tokens.
let identityTokens =
    set [ "--ef-color-accent-primary"
          "--ef-color-accent-hover"
          "--ef-color-accent-secondary"
          "--ef-site-backdrop"
          "--ef-site-backdrop-size"
          "--ef-site-backdrop-opacity" ]

let lineAt (text: string) (index: int) =
    text.AsSpan(0, index).Count('\n') + 1

let exceptionReason (comment: string) =
    let m = Regex.Match(comment, @"forma-exception:\s*(?<reason>\S.*?)\s*\*/", RegexOptions.Singleline)
    if m.Success then Some m.Groups["reason"].Value else None

// Parse into flat style rules. At-rules that contain rules (@media,
// @supports, @container, @layer) are descended into; @keyframes, @font-face,
// @property and @page carry no selectors the policy governs.
let parse (text: string) : Rule list =
    let skipComment i =
        let close = text.IndexOf("*/", i + 2, StringComparison.Ordinal)
        if close < 0 then text.Length else close + 2

    let rec matchingBrace i depth =
        if i >= text.Length then text.Length
        else
            match text[i] with
            | '/' when i + 1 < text.Length && text[i + 1] = '*' -> matchingBrace (skipComment i) depth
            | '"' | '\'' as quote ->
                let close = text.IndexOf(quote, i + 1)
                matchingBrace (if close < 0 then text.Length else close + 1) depth
            | '{' -> matchingBrace (i + 1) (depth + 1)
            | '}' when depth = 1 -> i
            | '}' -> matchingBrace (i + 1) (depth - 1)
            | _ -> matchingBrace (i + 1) depth

    let rec rules (i: int) (stop: int) (pendingException: string option) (acc: Rule list) =
        if i >= stop then List.rev acc
        elif Char.IsWhiteSpace text[i] then rules (i + 1) stop pendingException acc
        elif text[i] = '/' && i + 1 < stop && text[i + 1] = '*' then
            let finish = skipComment i
            let comment = text.Substring(i, finish - i)
            rules finish stop (exceptionReason comment |> Option.orElse pendingException) acc
        else
            let openBrace = text.IndexOf('{', i)
            let semicolon = text.IndexOf(';', i)
            if openBrace < 0 || openBrace >= stop then List.rev acc
            elif text[i] = '@' && semicolon >= 0 && semicolon < openBrace then
                // Statement at-rule such as @import or @layer a, b;
                rules (semicolon + 1) stop None acc
            else
                let close = matchingBrace openBrace 0
                let prelude = text.Substring(i, openBrace - i).Trim()
                let inner = text.Substring(openBrace + 1, max 0 (close - openBrace - 1))
                let next = close + 1
                if prelude.StartsWith("@", StringComparison.Ordinal) then
                    let name = (prelude.Split([| ' '; '('; '\n'; '\t' |], 2)).[0].ToLowerInvariant()
                    match name with
                    | "@media" | "@supports" | "@container" | "@layer" | "@scope" | "@document" ->
                        let nested = rules (openBrace + 1) close pendingException []
                        rules next stop None (List.rev nested @ acc)
                    | _ -> rules next stop None acc
                else
                    let rule =
                        { Selector = prelude
                          Declarations = inner
                          Line = lineAt text i
                          Exception = pendingException }
                    rules next stop None (rule :: acc)

    rules 0 text.Length None []

let globalElements =
    set [ "html"; "body"; "*"; ":root"; "h1"; "h2"; "h3"; "h4"; "h5"; "h6"; "p"; "a"; "button"
          "nav"; "header"; "footer"; "main"; "section"; "article"; "aside"; "ul"; "ol"; "li"
          "input"; "select"; "textarea"; "label"; "img"; "blockquote"; "code"; "pre"; "table"
          "hr"; "small"; "strong"; "em" ]

// A selector is "global" when no class, id, or attribute qualifies it: it
// would restyle every such element, which is Forma foundations' job.
let isGlobal (selector: string) =
    let withoutPseudo =
        Regex.Replace(selector, @"::?[a-zA-Z-]+(\([^)]*\))?", "")
    let qualified = Regex.IsMatch(selector, @"[.#\[]")
    let parts =
        Regex.Split(withoutPseudo, @"[\s>+~]+")
        |> Array.filter (fun p -> p <> "")
    not qualified
    && (selector.Trim() = ":root"
        || (parts.Length > 0 && parts |> Array.forall (fun p -> globalElements.Contains(p.ToLowerInvariant()))))

let declarations (block: string) =
    Regex.Replace(block, @"/\*.*?\*/", "", RegexOptions.Singleline).Split(';')
    |> Array.choose (fun d ->
        match d.IndexOf(':') with
        | -1 -> None
        | at -> Some(d.Substring(0, at).Trim(), d.Substring(at + 1).Trim()))
    |> List.ofArray

let tokenReferenceOnly (value: string) =
    let stripped = Regex.Replace(value, @"var\(\s*--ef-[a-z0-9-]+\s*\)", "").Trim()
    stripped = "" && value.Contains("var(--ef-")

let paletteOf (formaCss: string) =
    Regex.Matches(formaCss, @"--ef-[a-z0-9-]*color[a-z0-9-]*:\s*(#[0-9a-fA-F]{6})\b")
    |> Seq.map (fun m -> m.Groups[1].Value.ToLowerInvariant())
    |> Set.ofSeq

let check (palette: Set<string>) (file: string) (rules: Rule list) : Finding list * int =
    let finding (rule: Rule) code message =
        { File = file; Line = rule.Line; Code = code; Message = message }

    // A rule that only retargets identity tokens to Forma tokens is the
    // sanctioned product-identity mechanism, whatever scope it selects.
    let identityOnly (rule: Rule) =
        let decls = declarations rule.Declarations |> List.filter (fun (p, _) -> p <> "")
        not decls.IsEmpty
        && decls |> List.forall (fun (p, v) -> identityTokens.Contains p && tokenReferenceOnly v)

    let ruleFindings (rule: Rule) =
        if identityOnly rule then []
        else
          let selectors = rule.Selector.Split(',') |> Array.map (fun s -> s.Trim()) |> List.ofArray
          let formaClass =
              selectors
              |> List.tryFind (fun s -> Regex.IsMatch(s, @"\.ef-[a-zA-Z0-9_-]"))
              |> Option.map (fun s ->
                  finding rule "FORMA-COMPONENT" $"'{s}' restyles a Forma class; compose Forma components or record a Forma capability gap")
          let globalFindings =
              selectors
              |> List.filter isGlobal
              |> List.map (fun s ->
                  finding rule "GLOBAL-ELEMENT" $"'{s}' redefines global element presentation owned by Forma foundations")
          let tokens =
              declarations rule.Declarations
              |> List.choose (fun (property, value) ->
                  if not (property.StartsWith("--ef-", StringComparison.Ordinal)) then None
                  elif not (identityTokens.Contains property) then
                      Some(finding rule "TOKEN-OVERRIDE" $"'{property}' is a Forma token; only identity tokens may be retargeted locally")
                  elif not (tokenReferenceOnly value) then
                      Some(finding rule "IDENTITY-VALUE" $"'{property}' must reference Forma tokens (var(--ef-...)), not literal values, so contrast stays validated")
                  else None)
          let copiedPalette =
              Regex.Matches(rule.Declarations, @"#[0-9a-fA-F]{6}\b")
              |> Seq.map (fun m -> m.Value.ToLowerInvariant())
              |> Seq.filter palette.Contains
              |> Seq.distinct
              |> Seq.map (fun hex -> finding rule "PALETTE-COPY" $"{hex} copies a Forma palette value; use the corresponding --ef-color-* role token")
              |> List.ofSeq
          (Option.toList formaClass) @ globalFindings @ tokens @ copiedPalette

    let exempt, governed = rules |> List.partition (fun r -> r.Exception.IsSome)
    governed |> List.collect ruleFindings, exempt.Length

[<EntryPoint>]
let main argv =
    let rec parseArgs args forma files =
        match args with
        | [] -> forma, List.rev files
        | "--forma" :: path :: rest -> parseArgs rest (Some path) files
        | file :: rest -> parseArgs rest forma (file :: files)

    let forma, files = parseArgs (List.ofArray argv) None []
    if files.IsEmpty then
        eprintfn "usage: SiteCssPolicy [--forma <forma.css>] <site.css>..."
        2
    else
        match files |> List.tryFind (File.Exists >> not) with
        | Some missing ->
            eprintfn "ERROR %s does not exist" missing
            2
        | None ->
            let palette =
                forma
                |> Option.filter File.Exists
                |> Option.map (File.ReadAllText >> paletteOf)
                |> Option.defaultValue Set.empty
            let results = files |> List.map (fun f -> check palette f (parse (File.ReadAllText f)))
            let findings = results |> List.collect fst
            let exemptions = results |> List.sumBy snd
            findings |> List.iter (fun f -> printfn "%s:%d: %s %s" f.File f.Line f.Code f.Message)
            printfn "site css policy: %d file(s), %d finding(s), %d documented exception(s)" files.Length findings.Length exemptions
            if findings.IsEmpty then 0 else 1
