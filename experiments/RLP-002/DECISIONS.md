# RLP-002 decision log

Every decision taken during execution, with the reason and whether it came
before or after data was seen.

| # | When | Decision | Reason |
|---|---|---|---|
| 1 | Before data | The compiler is F# (.NET 10), with no NuGet dependencies, beside Forma's existing F# build tools. The research harness stays in JavaScript (Playwright). | Forma already builds tokens and brands with F#. The zero-runtime requirement applies to delivered pages, not to tooling. |
| 2 | Before data | The compiler keeps `data-rl-*` attributes as the authoring and semantic surface. It removes the engine script, links a static ruleset stylesheet and writes per-element values as inline custom properties. | One static stylesheet holds the vocabulary semantics, and per-page output stays small and inspectable. |
| 3 | Before data | Stage 2 includes a concurrent Arm C control: 6 held-out tasks × 3 = 18 attempts, for 54 attempts in total. | The script asks for a stronger causal comparison. The execution budget allows it (about 0.25 M tokens per attempt in RLP-001). |
| 4 | Before data | Visual review recaptures A, B, C, E and F in one pass and one randomized design. | Section 9 forbids comparing across batches. |
