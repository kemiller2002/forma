namespace Forma.Layout.Probe

/// Adversarial text. Character count is not rendered width: a CJK ideograph or
/// an emoji is about twice a Latin letter, combining marks add none, and an
/// unbroken identifier cannot wrap at a space.
[<RequireQualifiedAccess>]
module Corpus =
    type Script =
        | Latin
        | Accented
        | Cjk
        | Hebrew
        | Arabic
        | Emoji
        | Combining

    type Sample = { Kind: string; Script: Script; Text: string }

    let private sample kind script text = { Kind = kind; Script = script; Text = text }

    let private paragraph =
        "Counter interrupts from the rendezvous radar coupling data units stole computer capacity, and the executive raised a program alarm each time its queue overflowed."

    let samples =
        [ sample "empty" Latin ""
          sample "one-char" Latin "A"
          sample "short" Latin "Root cause"
          sample "short-words" Latin "It is a go or no go if we do so"
          sample "medium" Latin "Cold O-ring resilience at launch temperature"
          sample "paragraph" Latin paragraph
          sample "long-paragraph" Latin (String.concat " " [ paragraph; paragraph ])
          sample "extreme-paragraph" Latin (String.concat " " (List.replicate 5 paragraph))
          sample "long-words" Latin "Incomprehensibilities notwithstanding, electroencephalographically counterrevolutionaries"
          sample "unbroken" Latin "Pneumonoultramicroscopicsilicovolcanoconiosis_and_then_some_more_characters"
          sample "punctuation" Latin "Wait—what?! (Really…) «quoted» [bracketed]; semi: colon / slash"
          sample "numbers" Latin "1202 1201 12.5% 1,234,567.89 −40 °C 3.14159265358979"
          sample "url" Latin "https://www.example.com/a/very/long/path/to/a/resource?with=query&and=parameters#fragment"
          sample "path" Latin "/home/user/repos/forma/src/workflow/Forma.Workflow/LayoutGeometry.fs"
          sample "identifier" Latin "e3adbee5-5096-5a10-bbfb-cecda86a154b"
          sample "whitespace" Latin "spaced     out      text\twith\ttabs   and   gaps"
          sample "accented" Accented "Ångström élève naïve façade Øresund Šibenik Łódź"
          sample "cjk" Cjk "原因分析の結果として酸素環境下での電気的故障が火災の原因と判断された"
          sample "cjk-short" Cjk "根本原因"
          sample "hebrew" Hebrew "ניתוח שורש הבעיה הראה כשל בטבעת האיטום בטמפרטורה נמוכה"
          sample "arabic" Arabic "أظهر تحليل السبب الجذري فشل حلقة الإحكام في درجة حرارة منخفضة"
          sample "emoji" Emoji "🚀 Launch ✅ Verified 🔥 Fire 🧑‍🚀 Crew 👩🏽‍🔬 Analyst"
          sample "combining" Combining "Z̷̢a̴l̸g̵o̶ ẹ́ q̣̇ n̈ ạ̀ t̃ combining marks stacked" ]

    let byKind kind = samples |> List.find (fun s -> s.Kind = kind)

    let kinds = samples |> List.map _.Kind

    /// Short labels for badges, buttons and connector labels.
    let shortKinds = [ "one-char"; "short"; "medium"; "numbers"; "accented"; "cjk-short"; "hebrew"; "emoji"; "unbroken"; "identifier" ]

    /// What a circular indicator holds: a step number, a glyph or a short count.
    let indicatorTexts = [ "1"; "9"; "10"; "42"; "100"; "999"; "?"; "!"; "✓"; "根"; "א"; "🚀"; "1.5k" ]

    /// A probe string per script, measured in the browser to confirm a font
    /// renders it (a missing glyph falls back to a box of a fixed width).
    let scriptProbes =
        [ Latin, "Hamburgefonstiv"; Accented, "Ångström élève"; Cjk, "原因"; Hebrew, "שורש"; Arabic, "تحليل"; Emoji, "🚀✅"; Combining, "ẹ́" ]

    let scriptName (s: Script) =
        match s with
        | Latin -> "latin"
        | Accented -> "accented"
        | Cjk -> "cjk"
        | Hebrew -> "hebrew"
        | Arabic -> "arabic"
        | Emoji -> "emoji"
        | Combining -> "combining"

    let isRtl (s: Script) = s = Hebrew || s = Arabic
