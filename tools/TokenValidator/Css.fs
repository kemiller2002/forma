/// A minimal, dependency-free CSS reader: enough structure to find custom
/// property declarations and var() references with their selector, file and
/// line. It is not a validating parser; malformed CSS still yields whatever
/// declarations can be recognised.
module Forma.TokenValidator.Css

open System
open System.Text

type VarReference =
    { Name: string
      HasFallback: bool }

type Declaration =
    { File: string
      Line: int
      Selector: string
      Property: string
      Value: string
      References: VarReference list }

/// Replace comments with spaces (newlines kept) so offsets and line numbers
/// still match the source.
let stripComments (text: string) =
    let builder = StringBuilder(text.Length)
    let rec go index inComment =
        if index >= text.Length then ()
        elif inComment then
            if index + 1 < text.Length && text[index] = '*' && text[index + 1] = '/' then
                builder.Append("  ") |> ignore
                go (index + 2) false
            else
                builder.Append(if text[index] = '\n' then '\n' else ' ') |> ignore
                go (index + 1) true
        elif index + 1 < text.Length && text[index] = '/' && text[index + 1] = '*' then
            builder.Append("  ") |> ignore
            go (index + 2) true
        else
            builder.Append(text[index]) |> ignore
            go (index + 1) false
    go 0 false
    builder.ToString()

let private isNameChar (c: char) = Char.IsLetterOrDigit c || c = '-' || c = '_'

/// Index of the parenthesis closing the one opened just before `start`.
let private closingParen (value: string) start =
    let rec go index depth =
        if index >= value.Length then value.Length
        else
            match value[index] with
            | '(' -> go (index + 1) (depth + 1)
            | ')' when depth = 0 -> index
            | ')' -> go (index + 1) (depth - 1)
            | _ -> go (index + 1) depth
    go start 0

/// Every var(--name[, fallback]) in a value, including those nested in
/// fallbacks, in source order.
let rec references (value: string) : VarReference list =
    let index = value.IndexOf("var(", StringComparison.OrdinalIgnoreCase)
    if index < 0 then []
    else
        let start = index + 4
        let close = closingParen value start
        let inner = value.Substring(start, close - start)
        let nameStart = inner.Length - inner.TrimStart().Length
        let name = inner.Substring(nameStart) |> Seq.takeWhile isNameChar |> Seq.toArray |> String
        let rest = inner.Substring(nameStart + name.Length).TrimStart()
        let fallback = if rest.StartsWith(",") then rest.Substring(1) else ""
        let own =
            if name.StartsWith("--") then [ { Name = name; HasFallback = rest.StartsWith(",") } ] else []
        own @ references fallback @ references (value.Substring(min value.Length (close + 1)))

/// Offsets at which each line starts, for line lookup by binary search.
let private lineStarts (text: string) =
    Array.append [| 0 |] (text |> Seq.indexed |> Seq.filter (fun (_, c) -> c = '\n') |> Seq.map (fun (i, _) -> i + 1) |> Seq.toArray)

let private lineAt (starts: int array) offset =
    let found = Array.BinarySearch(starts, offset)
    if found >= 0 then found + 1 else ~~~found

/// Split a block body at top-level semicolons, keeping each piece's offset.
let private pieces (body: string) (offset: int) =
    let rec go index depth quote start acc =
        if index >= body.Length then List.rev ((start, body.Substring(start)) :: acc)
        else
            let c = body[index]
            match quote with
            | Some q when c = q -> go (index + 1) depth None start acc
            | Some _ -> go (index + 1) depth quote start acc
            | None ->
                match c with
                | '"' | '\'' -> go (index + 1) depth (Some c) start acc
                | '(' -> go (index + 1) (depth + 1) None start acc
                | ')' -> go (index + 1) (max 0 (depth - 1)) None start acc
                | ';' when depth = 0 -> go (index + 1) depth None (index + 1) ((start, body.Substring(start, index - start)) :: acc)
                | _ -> go (index + 1) depth None start acc
    go 0 0 None 0 [] |> List.map (fun (start, piece) -> offset + start, piece)

/// Declarations of one file. Nested blocks (@media, @layer, nesting) are
/// walked; a declaration's selector is the innermost enclosing prelude.
let declarations (file: string) (source: string) : Declaration list =
    let text = stripComments source
    let starts = lineStarts text
    let declarationOf selector (offset: int, piece: string) =
        let colon = piece.IndexOf(':')
        let property = if colon > 0 then piece.Substring(0, colon).Trim() else ""
        if colon <= 0 || property.Length = 0 || property.Contains("{") || property.Contains("}") || property.StartsWith("@") then None
        else
            let value = piece.Substring(colon + 1).Trim()
            let leading = piece.Length - piece.TrimStart().Length
            Some
                { File = file
                  Line = lineAt starts (offset + leading)
                  Selector = selector
                  Property = property
                  Value = value
                  References = references value }
    // Walk the text, splitting at braces. Text between braces at one level is
    // either declarations (inside a block) or a prelude (before '{').
    let rec walk index segmentStart stack acc =
        if index >= text.Length then
            let tail =
                match stack with
                | selector :: _ -> pieces (text.Substring(segmentStart)) segmentStart |> List.choose (declarationOf selector)
                | [] -> []
            List.rev acc @ tail
        else
            match text[index] with
            | '{' ->
                // The segment before '{' may hold declarations followed by a nested prelude.
                let segment = text.Substring(segmentStart, index - segmentStart)
                let lastSemicolon = segment.LastIndexOf(';')
                let declared, prelude =
                    if lastSemicolon >= 0 then segment.Substring(0, lastSemicolon + 1), segment.Substring(lastSemicolon + 1)
                    else "", segment
                let found =
                    match stack with
                    | selector :: _ when declared.Length > 0 -> pieces declared segmentStart |> List.choose (declarationOf selector)
                    | _ -> []
                walk (index + 1) (index + 1) (prelude.Trim() :: stack) (List.rev found @ acc)
            | '}' ->
                let found =
                    match stack with
                    | selector :: _ -> pieces (text.Substring(segmentStart, index - segmentStart)) segmentStart |> List.choose (declarationOf selector)
                    | [] -> []
                walk (index + 1) (index + 1) (match stack with _ :: rest -> rest | [] -> []) (List.rev found @ acc)
            | _ -> walk (index + 1) segmentStart stack acc
    walk 0 0 [] []
