/// A deliberately tiny test harness (no external test framework, matching the
/// repository dependency policy): named tests, assertions that raise, a runner.
module Harness

open System
open System.IO
open Forma.Workflow

exception AssertionFailed of string

type Test = { Name: string; Body: unit -> unit }

let test name body = { Name = name; Body = body }
let fail message = raise (AssertionFailed message)
let expect condition message = if not condition then fail message

let equal (expected: 'T) (actual: 'T) label =
    if expected <> actual then fail (sprintf "%s\n  expected: %A\n  actual:   %A" label expected actual)

/// The repository root (the directory holding package.json and schemas/workflow).
let root =
    let rec up (dir: DirectoryInfo) =
        if isNull dir then failwith "repository root not found"
        elif File.Exists(Path.Combine(dir.FullName, "schemas", "workflow", "1.0", "forma-workflow.schema.json")) then dir.FullName
        else up dir.Parent
    up (DirectoryInfo(AppContext.BaseDirectory))

let path (parts: string list) = Path.Combine(root :: parts |> Array.ofList)
let readText parts = File.ReadAllText(path parts)

let fixtureDir = [ "examples"; "workflows"; "forma"; "workflows" ]
let fixtureText (id: string) = readText (fixtureDir @ [ id + Format.suffix ])

let fixtureIds =
    match Json.parse (readText [ "examples"; "workflows"; "fixtures.json" ]) with
    | Ok json ->
        match Json.field "fixtures" json with
        | Some(Json.Array items) ->
            items |> List.choose (fun i -> match Json.field "id" i, Json.field "class" i with Some(Json.String id), Some(Json.String c) -> Some(id, c) | _ -> None)
        | _ -> failwith "fixtures.json has no fixtures"
    | Error e -> failwith e

/// Loads a fixture that must be valid.
let fixture (id: string) =
    let report = Validation.load (fixtureText id)
    match report.Workflow with
    | Some w when Validation.isValid report -> w
    | _ -> fail (sprintf "fixture %s did not load: %A" id report.Findings)

let codes (report: ValidationReport) = report.Findings |> List.map _.Code

let hasCode code (report: ValidationReport) =
    if not (codes report |> List.contains code) then fail (sprintf "expected finding %s, got %A" code (report.Findings |> List.map (fun f -> f.Code, f.Message)))

/// Parses JSON text and replaces the value at a simple path (object keys and
/// array indexes) — a way to derive adversarial documents from valid ones.
let rec setAt (pathParts: string list) (value: Json) (json: Json) : Json =
    match pathParts, json with
    | [], _ -> value
    | key :: rest, Json.Object props ->
        if props |> List.exists (fst >> (=) key) then Json.Object(props |> List.map (fun (k, v) -> if k = key then k, setAt rest value v else k, v))
        else Json.Object(props @ [ key, setAt rest value (Json.Object []) ])
    | index :: rest, Json.Array items ->
        let i = int index
        Json.Array(items |> List.mapi (fun j v -> if j = i then setAt rest value v else v))
    | _ -> json

let parse text = match Json.parse text with Ok j -> j | Error e -> fail e

let mutate (id: string) (edits: (string list * Json) list) =
    edits |> List.fold (fun j (p, v) -> setAt p v j) (parse (fixtureText id)) |> Json.serialize |> Validation.load

let run (tests: Test list) =
    let results =
        tests
        |> List.map (fun t ->
            try
                t.Body()
                printfn "ok     %s" t.Name
                true
            with
            | AssertionFailed message ->
                printfn "FAILED %s\n  %s" t.Name message
                false
            | error ->
                printfn "ERROR  %s\n  %s" t.Name (error.ToString())
                false)
    let failed = results |> List.filter not |> List.length
    printfn "\n%d passed, %d failed, %d total" (List.length tests - failed) failed (List.length tests)
    if failed = 0 then 0 else 1
