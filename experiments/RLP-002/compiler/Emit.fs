/// Rewrites a page: removes the run-time engine script, links the static
/// ruleset stylesheet, and writes each patched element's flags and values
/// into its start tag. Everything else is copied from the source unchanged.
module Rlc.Emit

open Rlc.Html
open Rlc.Analysis

type Merged = { Flags: string list; Props: (string * string) list }

let private merge (patches: Patch list) : Map<int, Merged> =
    patches
    |> List.groupBy (fun p -> p.Element)
    |> List.map (fun (id, ps) ->
        id,
        { Flags = ps |> List.collect (fun p -> p.Flags) |> List.distinct
          Props = ps |> List.collect (fun p -> p.Props) |> List.distinctBy fst })
    |> Map.ofList

let private isEngine (el: Element) =
    el.Tag = "script"
    && (value "src" el |> Option.exists (fun s -> s.EndsWith "rlp.mjs" || s.Contains "/rlp/"))

let private isBaseLink (el: Element) =
    el.Tag = "link" && (value "href" el |> Option.exists (fun h -> h.EndsWith "base.css"))

let private rewrite (el: Element) (m: Merged) (selfClosing: bool) =
    let flagged =
        match List.tryFind (fun (a: Attr) -> a.Name = "data-rlc") el.Attrs with
        | Some _ -> el.Attrs
        | None -> el.Attrs @ [ { Name = "data-rlc"; Value = Some "" } ]
    let props = m.Props |> List.map (fun (k, v) -> sprintf "%s: %s" k v) |> String.concat "; "
    let withStyle =
        match List.tryFind (fun (a: Attr) -> a.Name = "style") flagged with
        | Some _ when props <> "" -> flagged
        | None when props <> "" -> flagged @ [ { Name = "style"; Value = Some "" } ]
        | _ -> flagged
    let attrs =
        withStyle
        |> List.map (fun a ->
            match a.Name with
            | "data-rlc" ->
                let existing = a.Value |> Option.map (fun v -> v.Split(' ', System.StringSplitOptions.RemoveEmptyEntries) |> List.ofArray) |> Option.defaultValue []
                { a with Value = Some(existing @ m.Flags |> List.distinct |> String.concat " ") }
            | "style" when props <> "" ->
                let own = a.Value |> Option.defaultValue "" |> fun s -> s.Trim().TrimEnd(';')
                { a with Value = Some(if own = "" then props else own + "; " + props) }
            | _ -> a)
        |> List.filter (fun a -> not (a.Name = "data-rlc" && a.Value = Some ""))
    startTag el.Tag attrs selfClosing

/// Compiles one page. `href` is the ruleset stylesheet the page links.
let compile (source: string) (href: string) : string * Finding list * int =
    let tokens = tokenize source |> Array.ofList
    let els = elements (List.ofArray tokens)
    let patches, findings = analyze els
    let merged = merge patches
    let byToken = els |> Array.map (fun e -> e.Token, e) |> Map.ofArray
    let engineStarts = els |> Array.filter isEngine |> Array.map (fun e -> e.Token) |> Set.ofArray
    let hasBase = els |> Array.exists isBaseLink
    let link = sprintf "<link rel=\"stylesheet\" href=\"%s\">" href
    let text (a: int) (b: int) = source.Substring(a, b - a)
    // Drop each engine script: its start tag, raw body and end tag.
    let dropped =
        engineStarts
        |> Set.toList
        |> List.collect (fun start ->
            let close = [ start + 1 .. tokens.Length - 1 ] |> List.tryFind (fun i -> match tokens.[i] with EndTag("script", _, _) -> true | _ -> false)
            [ start .. defaultArg close start ])
        |> Set.ofList
    let render (i: int) (token: Token) =
        if dropped.Contains i then ""
        else
            match token with
            | StartTag(_, _, selfClosing, a, b) ->
                let el = byToken.[i]
                let tag = match merged.TryFind el.Id with Some m -> rewrite el m selfClosing | None -> text a b
                if isBaseLink el then tag + "\n  " + link else tag
            | EndTag("head", a, b) when not hasBase -> link + "\n" + text a b
            | EndTag(_, a, b) | Other(a, b) -> text a b
    let output = tokens |> Array.mapi render |> String.concat ""
    // Collapse the blank line left where a script tag stood alone on a line.
    let output = System.Text.RegularExpressions.Regex.Replace(output, @"\n[ \t]*\n(?=[ \t]*</head>)", "\n")
    output, findings, engineStarts.Count
