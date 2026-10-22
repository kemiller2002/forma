/// rlc: relational layout compiler (RLP-002). Build-time only; the compiled
/// page links a static ruleset stylesheet and runs no layout code.
///
///   rlc compile <in.html> <out.html> <report.json> <stylesheet-href>
///   rlc batch <jobs.tsv>     one job per line: in, out, report, href (tab separated)
module Rlc.Program

open System.IO
open System.Text.Json
open Rlc.Analysis

let version = "rlc/1"

let private statusName =
    function
    | Exact -> "exact"
    | Approximated -> "approximated"
    | Unsupported -> "unsupported"

let private report (input: string) (href: string) (findings: Finding list) (removed: int) =
    let rows =
        findings
        |> List.map (fun f ->
            dict [ "element", box f.Element; "feature", box f.Feature; "status", box (statusName f.Status); "reason", box f.Reason ])
    let status =
        if findings |> List.exists (fun f -> f.Status = Unsupported) then "unsupported"
        elif findings |> List.exists (fun f -> f.Status = Approximated) then "approximated"
        else "exact"
    let doc =
        dict [ "compiler", box version
               "source", box (Path.GetFileName input)
               "stylesheet", box href
               "engineScriptsRemoved", box removed
               "status", box status
               "findings", box rows ]
    JsonSerializer.Serialize(doc, JsonSerializerOptions(WriteIndented = true))

let private run (input: string) (output: string) (reportPath: string) (href: string) =
    let compiled, findings, removed = Emit.compile (File.ReadAllText input) href
    match Path.GetDirectoryName(Path.GetFullPath output) with
    | null -> ()
    | dir -> Directory.CreateDirectory dir |> ignore
    File.WriteAllText(output, compiled)
    File.WriteAllText(reportPath, report input href findings removed + "\n")

[<EntryPoint>]
let main argv =
    match List.ofArray argv with
    | [ "compile"; input; output; reportPath; href ] ->
        run input output reportPath href
        0
    | [ "batch"; jobs ] ->
        File.ReadAllLines jobs
        |> Array.filter (fun l -> l.Trim() <> "")
        |> Array.iter (fun l ->
            match l.Split('\t') with
            | [| input; output; reportPath; href |] -> run input output reportPath href
            | _ -> failwithf "bad job line: %s" l)
        0
    | [ "--version" ] ->
        printfn "%s" version
        0
    | _ ->
        eprintfn "usage: rlc compile <in.html> <out.html> <report.json> <stylesheet-href> | rlc batch <jobs.tsv>"
        2
