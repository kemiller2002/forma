namespace Forma.Layout.Probe

open System
open System.Diagnostics
open System.IO
open Forma.Workflow

type Fragment = { Owner: string; Text: string; Rects: Rect list }

type Measured =
    { Role: string
      Name: string
      Shape: string option
      Rect: Rect
      Radii: string list
      Border: Sides
      Padding: Sides
      Overflow: string list
      FontSize: float
      LineHeight: string
      LetterSpacing: string
      FontFamily: string
      Direction: string
      /// Layout-allocated geometry of a diagram node, in canvas px.
      Allocation: Rect option
      Scroll: float list
      /// CSS zoom applied to this element (computed lengths are unzoomed; rects are zoomed).
      Zoom: float
      Text: Fragment list }

type Connector = { Id: string; Points: Point list }

type MeasuredCase =
    { Id: string
      Subjects: Measured list
      Connectors: Connector list
      Canvas: Rect option
      Zoom: float
      Invalid: string option }

type MeasuredPage =
    { File: string
      Ms: int
      ViewportW: float
      DocumentOverflow: float
      Fonts: (string * bool) list
      Cases: MeasuredCase list
      Repeat: MeasuredCase list option }

/// Runs the browser adapter and decodes what it saw.
[<RequireQualifiedAccess>]
module Measure =
    let private field name json = Json.field name json
    let private num name json = field name json |> Option.bind Json.tryFloat |> Option.defaultValue 0.0
    let private str name json = match field name json with Some(Json.String s) -> s | _ -> ""
    let private items name json = match field name json with Some(Json.Array xs) -> xs | _ -> []
    let private floats json = match json with Json.Array xs -> xs |> List.map (Json.tryFloat >> Option.defaultValue 0.0) | _ -> []

    let private rect json = { X = num "x" json; Y = num "y" json; W = num "w" json; H = num "h" json }
    let private sidesOf json = match floats json with [ t; r; b; l ] -> LayoutGeometry.sides t r b l | _ -> LayoutGeometry.noSides

    let private measured (json: Json) =
        let font = field "font" json |> Option.defaultValue Json.Null
        { Role = str "role" json
          Name = str "name" json
          Shape = match field "shape" json with Some(Json.String s) -> Some s | _ -> None
          Rect = field "rect" json |> Option.map rect |> Option.defaultValue { X = 0.0; Y = 0.0; W = 0.0; H = 0.0 }
          Radii = items "radii" json |> List.map (function Json.String s -> s | _ -> "0px")
          Border = field "border" json |> Option.map sidesOf |> Option.defaultValue LayoutGeometry.noSides
          Padding = field "padding" json |> Option.map sidesOf |> Option.defaultValue LayoutGeometry.noSides
          Overflow = items "overflow" json |> List.map (function Json.String s -> s | _ -> "")
          FontSize = num "size" font
          LineHeight = str "lineHeight" font
          LetterSpacing = str "letterSpacing" font
          FontFamily = str "family" font
          Direction = str "direction" json
          Allocation =
            match field "allocation" json with
            | Some(Json.Array _ as a) -> match floats a with [ x; y; w; h ] -> Some { X = x; Y = y; W = w; H = h } | _ -> None
            | _ -> None
          Scroll = field "scroll" json |> Option.map floats |> Option.defaultValue []
          Zoom = 1.0
          Text =
            items "text" json
            |> List.map (fun f -> { Owner = str "owner" f; Text = str "text" f; Rects = items "rects" f |> List.map rect }) }

    let private measuredCase (json: Json) =
        { Id = str "id" json
          Subjects = items "subjects" json |> List.map measured
          Connectors = items "connectors" json |> List.map (fun c -> { Id = str "id" c; Points = items "points" c |> List.map (fun p -> { X = num "x" p; Y = num "y" p }) })
          Canvas = match field "canvas" json with Some(Json.Object _ as c) -> Some(rect c) | _ -> None
          Zoom = (let z = num "zoom" json in if z > 0.0 then z else 1.0)
          Invalid = match field "invalid" json with Some(Json.String s) -> Some s | _ -> None }

    let private page (json: Json) =
        let vp = field "viewport" json |> Option.defaultValue Json.Null
        let doc = field "document" json |> Option.defaultValue Json.Null
        { File = str "file" json
          Ms = int (num "ms" json)
          ViewportW = num "width" vp
          DocumentOverflow = num "scrollWidth" doc - num "clientWidth" doc
          Fonts = match field "fonts" json with Some(Json.Object ps) -> ps |> List.map (fun (k, v) -> k, (v = Json.Bool true)) | _ -> []
          Cases = items "cases" json |> List.map measuredCase
          Repeat = match field "repeat" json with Some(Json.Array xs) -> Some(xs |> List.map measuredCase) | _ -> None }

    /// A page to measure: file, page setup, whether to re-render for determinism, and a
    /// selector that must match once per case before measuring (a runtime renders late).
    type PageRequest = { File: string; Setup: PageSetup; Repeat: bool; WaitFor: string option }

    let manifest (serve: string option) (pages: PageRequest list) =
        Json.Object
            [ yield "pages",
              Json.Array(
                  pages
                  |> List.map (fun p ->
                      Json.Object
                          [ yield "file", Json.String p.File
                            yield "viewport", Json.Object [ "width", Json.number (float p.Setup.ViewportW); "height", Json.number (float p.Setup.ViewportH) ]
                            yield "repeat", Json.Bool p.Repeat
                            match p.WaitFor with Some w -> yield "waitFor", Json.String w | None -> () ])
              )
              match serve with Some dir -> yield "serve", Json.String dir | None -> ()
              yield "scriptProbes", Json.Array(Corpus.scriptProbes |> List.map (fun (s, p) -> Json.Array [ Json.String(Corpus.scriptName s); Json.String p ])) ]

    /// Measures pages in the browser. Returns the decoded pages and the browser version.
    let runServed (root: string) (workDir: string) (serve: string option) (pages: PageRequest list) =
        let manifestPath = Path.Combine(workDir, "manifest.json")
        let outPath = Path.Combine(workDir, "measured.json")
        File.WriteAllText(manifestPath, Json.serialize (manifest serve pages))
        let psi = ProcessStartInfo("node", [ Path.Combine(root, "tests", "layout", "measure.mjs"); manifestPath; outPath ])
        psi.WorkingDirectory <- root
        psi.RedirectStandardError <- true
        use p = Process.Start psi
        let err = p.StandardError.ReadToEnd()
        p.WaitForExit()
        if p.ExitCode <> 0 then failwithf "measure.mjs failed (%d): %s" p.ExitCode err
        match Json.parseWith { MaxBytes = Int32.MaxValue; MaxDepth = 64 } (File.ReadAllText outPath) with
        | Ok json -> items "pages" json |> List.map page, str "browser" json
        | Error e -> failwith e

    let run (root: string) (workDir: string) (pages: (string * PageSetup * bool) list) =
        runServed root workDir None (pages |> List.map (fun (f, s, r) -> { File = f; Setup = s; Repeat = r; WaitFor = None }))
