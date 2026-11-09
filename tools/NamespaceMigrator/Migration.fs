/// FORMA-NS-001: the pure rewrite from Forma's pre-1.0 `ef-` namespace to the
/// 1.0 `forma-` namespace. No I/O lives here.
///
/// Only namespace tokens are rewritten. A token starts at a boundary: the
/// preceding character is not part of an identifier (a letter, digit, `_`,
/// `$` or `-`) or it follows a regular-expression `\b`; so `ref-`, `chef-`,
/// `beef-`, `--ref-` and `x-ef-` are words,
/// not Forma names, and are left alone.
///
///   --ef-*          custom property         -> --forma-*
///   data-ef-*       attribute               -> data-forma-*
///   ef-*            class, tag, id, string  -> forma-*   (.ef-x, <ef-x>, "ef-component-tag")
///   dataset.efX     DOM dataset property    -> dataset.formaX  (data-ef-x)
module Forma.NamespaceMigrator.Migration

open System
open System.Text.RegularExpressions

/// The token forms and their 1.0 spelling, applied in order.
type Rule =
    { Name: string
      Pattern: Regex
      Replacement: string }

let private boundary = @"(?:(?<![A-Za-z0-9_$\-])|(?<=\\b))"

let private rule name pattern replacement =
    { Name = name
      Pattern = Regex(pattern, RegexOptions.CultureInvariant ||| RegexOptions.Compiled)
      Replacement = replacement }

let rules =
    [ rule "custom-property" (boundary + "--ef-") "--forma-"
      rule "attribute" (boundary + "data-ef-") "data-forma-"
      rule "dataset" @"(?<=\bdataset\??\.)ef(?=[A-Z])" "forma"
      rule "name" (boundary + "ef-") "forma-" ]

/// One rewritten occurrence: 1-based line, the rule that matched, and the
/// line before and after.
type Change =
    { Line: int
      Rule: string
      Before: string
      After: string }

let private applyRule (text: string) (rule: Rule) = rule.Pattern.Replace(text, rule.Replacement)

/// The text with every namespace token rewritten. Idempotent: `forma-` never
/// matches a rule.
let migrate (text: string) = rules |> List.fold applyRule text

let private countRule (text: string) (rule: Rule) = rule.Pattern.Matches(text).Count

/// Occurrences per rule in a text, before rewriting.
let count (text: string) =
    rules |> List.map (fun rule -> rule.Name, countRule text rule) |> List.filter (snd >> (<) 0)

let private lines (text: string) = text.Split('\n')

/// Line-level changes, for --dry-run and --check reports. Rules never match
/// across a newline, so a line rewrites independently.
let changes (text: string) =
    lines text
    |> Array.toList
    |> List.mapi (fun index before ->
        let after = migrate before
        if after = before then
            None
        else
            let rule =
                rules
                |> List.filter (fun r -> r.Pattern.IsMatch before)
                |> List.map _.Name
                |> String.concat ","
            Some
                { Line = index + 1
                  Rule = rule
                  Before = before.TrimEnd('\r')
                  After = after.TrimEnd('\r') })
    |> List.choose id

/// The file kinds the migrator rewrites.
let supportedExtensions =
    set [ ".html"; ".htm"; ".css"; ".js"; ".mjs"; ".cjs"; ".fs"; ".fsi"; ".fsx"; ".json"; ".md"; ".markdown" ]

let isSupported (path: string) =
    supportedExtensions.Contains(IO.Path.GetExtension(path).ToLowerInvariant())

/// Directories never descended into.
let skippedDirectories = set [ "node_modules"; ".git"; "bin"; "obj" ]
