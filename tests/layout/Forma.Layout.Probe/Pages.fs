namespace Forma.Layout.Probe

open System
open System.IO
open Forma.Workflow

/// Fixture pages. Components use their canonical pattern markup and the built
/// Forma stylesheets; diagrams come from the real Forma.Workflow engine
/// (Layout.resolve and Render.figure), the path Causa uses. The per-case
/// stylesheet here is test fixture only: it sets the variable under test
/// (a radius, a host width, a probe's padding) and the WCAG 1.4.12 text
/// spacing override, never component styling.
[<RequireQualifiedAccess>]
module Pages =
    let private el = Markup.el
    let private text = Markup.text
    let private css (v: float) = $"{v:F1}px"

    /// Stylesheets every page loads, relative to the repository root.
    let stylesheets = [ "dist/all.css"; "dist/marketing.css"; "packages/workflow/src/forma-workflow.css" ]

    let private sanitize (s: string) = s |> String.map (fun ch -> if Char.IsLetterOrDigit ch || ch = '-' then ch else '_')

    /// A class name for a case's fixture rules; ids may contain dots, which a class selector cannot.
    let private cls (c: Case) suffix = $"lc-{sanitize c.Id}-{suffix}"

    let private probeRule (selector: string) (p: Probe) =
        let s = p.Padding
        [ yield $"{selector} {{"
          yield $"  inline-size: {css p.Width};"
          match p.Height with Some h -> yield $"  block-size: {css h};" | None -> ()
          yield $"  padding: {css s.Top} {css s.Right} {css s.Bottom} {css s.Left};"
          yield $"  border: {css p.Border} solid #555555;"
          yield $"  border-radius: {p.Radius};"
          yield "  background: #fafafa;"
          if p.Center then yield "  display: grid; place-content: center; text-align: center;"
          yield "}"
          yield $"{selector} > p {{ margin: 0; }}" ]
        |> String.concat "\n"

    let private siteRadius (selector: string) (radius: string) = $"{selector} {{ --forma-shape-radius: {radius}; }}"

    let private componentMarkup (c: Case) (comp: Component) (body: string) =
        let subject = [ "data-lc-subject", Cases.componentName comp ]
        let content = if body = "" then [] else [ text body ]
        match comp with
        | Card -> el "article" ([ "class", "forma-card" ] @ subject) [ el "h3" [ "class", "forma-card__title" ] content; el "p" [] content ]
        | Badge -> el "span" ([ "class", "forma-badge" ] @ subject) content
        | Button -> el "a" ([ "class", "forma-button"; "href", "#" + c.Id ] @ subject) content
        | Alert ->
            el
                "aside"
                ([ "class", "forma-alert"; "role", "status"; "data-tone", "attention" ] @ subject)
                [ el "div" [ "class", "forma-alert__icon"; "aria-hidden", "true" ] [ text "!" ]
                  el "div" [] [ el "h3" [ "class", "forma-alert__title" ] content; el "p" [] content ]
                  el "button" [ "type", "button" ] [ text "Review" ] ]
        | MetricCard ->
            el
                "article"
                ([ "class", "forma-metric-card" ] @ subject)
                [ el "div" [ "class", "forma-metric-card__label" ] content
                  el "div" [ "class", "forma-metric-card__value" ] [ text "$42,500" ]
                  el "div" [ "class", "forma-metric-card__context" ] content ]
        | Callout ->
            el
                "aside"
                ([ "class", "forma-callout"; "data-forma-callout", "note"; "aria-label", "Note" ] @ subject)
                [ el "p" [ "class", "forma-callout__label" ] [ text "Note" ]; el "p" [] content ]
        | WizardStep ->
            el
                "section"
                [ "class", "forma-wizard"; "aria-label", "Steps" ]
                [ el "ol" [ "class", "forma-wizard__steps"; "aria-label", "Workflow steps" ] [ el "li" [ "data-state", "current"; "aria-current", "step" ] [ el "span" subject content; text "Review" ] ] ]
        | TooltipTrigger ->
            el
                "span"
                [ "class", "forma-tooltip" ]
                [ el "button" ([ "class", "forma-tooltip__trigger"; "type", "button" ] @ subject) [ el "span" [ "aria-hidden", "true" ] content; el "span" [ "class", "forma-visually-hidden" ] [ text "Help" ] ] ]

    let private isMarketing comp = match comp with Card | Badge | Button | Callout -> true | _ -> false

    /// Markup and fixture rules for one subject. `slot` names it inside the case.
    let rec private subjectParts (c: Case) (slot: string) (s: Subject) : Markup * string list =
        match s with
        | ComponentCase(comp, body, radius, hostWidth) ->
            let host = cls c (slot + "host")
            let classes = if isMarketing comp then $"forma-site {host}" else host
            el "div" [ "class", classes ] [ componentMarkup c comp body ],
            [ $".{host} {{ inline-size: {css hostWidth}; max-inline-size: 100%%; }}"; siteRadius $".{host}.forma-site" radius ]
        | ProbeCase p ->
            let k = cls c (slot + "probe")
            el "div" [ "class", k; "data-lc-subject", "probe" ] [ el "p" [] [ text p.Text ] ], [ probeRule $".{k}" p ]
        | DiagramCase d ->
            match Cases.workflow d with
            | Ok w ->
                let zoom = cls c (slot + "zoom")
                let figure = Render.figure { RenderOptions.defaults with IdPrefix = Some(cls c slot) } w
                el "div" [ "class", $"forma-workflow-editor__canvas {zoom}"; "data-lc-diagram", "true" ] [ figure ],
                [ $".{zoom} {{ --forma-workflow-zoom: {d.Zoom}; }}" ]
            | Error e -> el "p" [ "data-lc-invalid", "true" ] [ text e ], []
        | Nested(host, inner) ->
            let innerMarkup, innerRules = subjectParts c (slot + "in") inner
            match host with
            | CardHost radius ->
                let k = cls c (slot + "card")
                el "div" [ "class", $"forma-site {k}" ] [ el "article" [ "class", "forma-card"; "data-lc-host", "card" ] [ innerMarkup ] ],
                [ $".{k} {{ inline-size: 360px; max-inline-size: 100%%; }}"; siteRadius $".{k}.forma-site" radius ] @ innerRules
            | ProbeHost p ->
                let k = cls c (slot + "outer")
                el "div" [ "class", k; "data-lc-host", "probe" ] [ innerMarkup ], [ probeRule $".{k}" { p with Height = None } ] @ innerRules

    let private caseParts (c: Case) =
        let markup, rules = subjectParts c "s" c.Subject
        let dir = if Corpus.isRtl c.Script then [ "dir", "rtl" ] else []
        el "section" ([ "class", "lc-case"; "data-lc-case", c.Id ] @ dir) [ el "h2" [ "class", "lc-case__id" ] [ text c.Id ]; markup ], rules

    let private pageRules (p: PageSetup) =
        let t = p.Typography
        [ yield "html { font-size: " + string t.RootPercent + "%; }"
          yield "body { margin: 16px; }"
          yield ".lc-case { margin: 0 0 48px; }"
          yield ".lc-case__id { font-size: 12px; margin: 0 0 8px; font-weight: 400; }"
          // WCAG 1.4.12 text spacing applies to every element, as a user stylesheet would.
          if t.LetterSpacingEm > 0.0 then yield $".lc-case * {{ letter-spacing: {t.LetterSpacingEm}em !important; word-spacing: 0.16em !important; }}"
          match t.LineHeight with Some lh -> yield $".lc-case * {{ line-height: {lh} !important; }}" | None -> ()
          if t.Weight <> 400 then yield $".lc-case * {{ font-weight: {t.Weight} !important; }}" ]

    /// Writes one page per page setup; returns (file, setup, case ids).
    let write (root: string) (outDir: string) (cases: Case list) =
        Directory.CreateDirectory outDir |> ignore
        cases
        |> List.groupBy _.Page
        |> List.mapi (fun i (page, group) ->
            let parts = group |> List.map caseParts
            let links = stylesheets |> List.map (fun s -> $"<link rel=\"stylesheet\" href=\"{Uri(Path.Combine(root, s)).AbsoluteUri}\">") |> String.concat "\n"
            let style = (pageRules page @ (parts |> List.collect snd)) |> String.concat "\n"
            let body = parts |> List.map (fst >> Markup.toHtml) |> String.concat "\n"
            let html =
                String.concat
                    "\n"
                    [ "<!doctype html>"; "<html lang=\"en\">"; "<head>"; "<meta charset=\"utf-8\">"
                      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
                      "<title>LCE-001 " + Cases.pageKey page + "</title>"; links; "<style>"; style; "</style>"; "</head>"; "<body>"; body; "</body>"; "</html>"; "" ]
            let file = Path.Combine(outDir, $"page-{i:D3}-{sanitize (Cases.pageKey page)}.html")
            File.WriteAllText(file, html)
            file, page, group |> List.map _.Id)
