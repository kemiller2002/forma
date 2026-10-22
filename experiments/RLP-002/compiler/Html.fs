/// Minimal, lossless HTML tokenizer and element tree. Every token keeps its
/// source span so a compiled page reproduces the input byte for byte except
/// for the start tags the compiler rewrites.
module Rlc.Html

open System

type Attr = { Name: string; Value: string option }

type Token =
    | StartTag of name: string * attrs: Attr list * selfClosing: bool * span: int * int
    | EndTag of name: string * span: int * int
    | Other of span: int * int

type Element =
    { Id: int
      Tag: string
      Attrs: Attr list
      Token: int
      Parent: int option
      Children: int list }

let private voids =
    set [ "area"; "base"; "br"; "col"; "embed"; "hr"; "img"; "input"; "link"; "meta"; "source"; "track"; "wbr" ]

let private rawText = set [ "script"; "style"; "textarea"; "title" ]

let private isSpace (c: char) = Char.IsWhiteSpace c

let private indexFrom (s: string) (needle: string) (start: int) =
    let i = s.IndexOf(needle, start, StringComparison.OrdinalIgnoreCase)
    if i < 0 then s.Length else i

/// Parses the attribute text of a start tag (between the name and `>`).
let rec private attrs (s: string) (i: int) (stop: int) (acc: Attr list) : Attr list * int * bool =
    let skip j = Seq.initInfinite ((+) j) |> Seq.find (fun k -> k >= stop || not (isSpace s.[k]))
    let i = skip i
    if i >= stop then List.rev acc, stop, false
    elif s.[i] = '/' && i + 1 = stop then List.rev acc, stop, true
    elif s.[i] = '/' then attrs s (i + 1) stop acc
    else
        let nameEnd =
            Seq.initInfinite ((+) i)
            |> Seq.find (fun k -> k >= stop || isSpace s.[k] || s.[k] = '=' || s.[k] = '>' || (s.[k] = '/' && k + 1 = stop))
        let name = s.Substring(i, nameEnd - i).ToLowerInvariant()
        let afterName = skip nameEnd
        if afterName < stop && s.[afterName] = '=' then
            let v0 = skip (afterName + 1)
            let value, next =
                if v0 < stop && (s.[v0] = '"' || s.[v0] = '\'') then
                    let close = s.IndexOf(s.[v0], v0 + 1)
                    let close = if close < 0 || close > stop then stop else close
                    s.Substring(v0 + 1, close - v0 - 1), min stop (close + 1)
                else
                    let e = Seq.initInfinite ((+) v0) |> Seq.find (fun k -> k >= stop || isSpace s.[k])
                    s.Substring(v0, e - v0), e
            attrs s next stop ({ Name = name; Value = Some value } :: acc)
        else
            attrs s afterName stop ({ Name = name; Value = None } :: acc)

/// Splits a document into tokens. Raw-text elements (script, style, textarea,
/// title) keep their content as a single Other token.
let tokenize (s: string) : Token list =
    let rec go (i: int) (acc: Token list) =
        if i >= s.Length then List.rev acc
        elif s.[i] <> '<' then
            let j = s.IndexOf('<', i)
            let j = if j < 0 then s.Length else j
            go j (Other(i, j) :: acc)
        elif String.CompareOrdinal(s, i, "<!--", 0, 4) = 0 then
            let j = indexFrom s "-->" (i + 4)
            let e = min s.Length (j + 3)
            go e (Other(i, e) :: acc)
        elif i + 1 < s.Length && (s.[i + 1] = '!' || s.[i + 1] = '?') then
            let e = min s.Length (indexFrom s ">" i + 1)
            go e (Other(i, e) :: acc)
        elif i + 1 < s.Length && s.[i + 1] = '/' then
            let e = min s.Length (indexFrom s ">" i + 1)
            let name = s.Substring(i + 2, e - i - 3).Trim().ToLowerInvariant()
            go e (EndTag(name, i, e) :: acc)
        elif i + 1 < s.Length && Char.IsLetter s.[i + 1] then
            let gt = indexFrom s ">" i
            let nameEnd = Seq.initInfinite ((+) (i + 1)) |> Seq.find (fun k -> k >= gt || isSpace s.[k] || s.[k] = '/')
            let name = s.Substring(i + 1, nameEnd - i - 1).ToLowerInvariant()
            let parsed, _, selfClosing = attrs s nameEnd gt []
            let e = min s.Length (gt + 1)
            let tag = StartTag(name, parsed, selfClosing, i, e)
            if rawText.Contains name then
                let close = indexFrom s ("</" + name) e
                let body = if close > e then [ Other(e, close) ] else []
                go close (List.rev body @ (tag :: acc))
            else
                go e (tag :: acc)
        else
            go (i + 1) (Other(i, i + 1) :: acc)
    go 0 []

/// Builds the element tree. Unmatched end tags close back to the nearest
/// matching open element; unclosed elements end with their parent.
let elements (tokens: Token list) : Element array =
    let folder (els: Map<int, Element>, stack: int list, next: int) (index: int, token: Token) =
        match token with
        | StartTag(name, attrs, selfClosing, _, _) ->
            let parent = List.tryHead stack
            let el = { Id = next; Tag = name; Attrs = attrs; Token = index; Parent = parent; Children = [] }
            let els =
                match parent with
                | Some p -> els.Add(p, { els.[p] with Children = els.[p].Children @ [ next ] })
                | None -> els
            let opens = not (selfClosing || voids.Contains name)
            els.Add(next, el), (if opens then next :: stack else stack), next + 1
        | EndTag(name, _, _) ->
            match List.tryFindIndex (fun id -> els.[id].Tag = name) stack with
            | Some depth -> els, List.skip (depth + 1) stack, next
            | None -> els, stack, next
        | Other _ -> els, stack, next
    let els, _, count = tokens |> List.indexed |> List.fold folder (Map.empty, [], 0)
    Array.init count (fun i -> els.[i])

let attr (name: string) (el: Element) : string option option =
    el.Attrs |> List.tryFind (fun a -> a.Name = name) |> Option.map (fun a -> a.Value)

let has name el = (attr name el).IsSome

let value name el = attr name el |> Option.bind id

// Values are kept as written (entities stay encoded); only a double quote
// from a single-quoted source value needs escaping inside double quotes.
let private escape (v: string) = v.Replace("\"", "&quot;")

/// Serializes a start tag from its attributes (used only for rewritten tags).
let startTag (name: string) (attrs: Attr list) (selfClosing: bool) =
    let rendered =
        attrs
        |> List.map (fun a ->
            match a.Value with
            | Some v -> sprintf " %s=\"%s\"" a.Name (escape v)
            | None -> " " + a.Name)
        |> String.concat ""
    sprintf "<%s%s%s>" name rendered (if selfClosing then " /" else "")
