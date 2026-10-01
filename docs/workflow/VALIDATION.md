# Validating workflows

Validation does not need Forma Studio. CI, Praxis, agents and external
applications all use the same implementation: `Forma.Workflow.Validation`. It
is available through the CLI, the .NET library and the browser package.

## Command line

```bash
dotnet run --project src/workflow/Forma.Workflow.Cli -c Release -- validate forma/workflows/*.forma-workflow.json
dotnet run --project src/workflow/Forma.Workflow.Cli -c Release -- validate --json forma/workflows/launch.forma-workflow.json
```

| Exit code | Meaning |
|---|---|
| 0 | Every file is valid. That includes valid with preserved extensions, valid with unavailable capabilities, and automatically migrated. |
| 1 | At least one file is invalid or needs a migration that cannot run automatically. |
| 2 | Invalid arguments. |
| 3 | A file could not be read. |

`--json` prints a report for each file:

```json
[
  {
    "file": "forma/workflows/extensions.forma-workflow.json",
    "report": {
      "class": "supported-with-preserved-extensions",
      "valid": true,
      "workflow": "extensions",
      "formatVersion": "1.0.0",
      "capabilities": ["workflow.core"],
      "extensions": ["com.example.scheduler", "org.example.audit", "gov.nasa.example.range"],
      "findings": []
    }
  }
]
```

## .NET

```fsharp
open Forma.Workflow

let report = Validation.load (System.IO.File.ReadAllText "forma/workflows/launch.forma-workflow.json")
match report.Class with
| FullySupported | SupportedWithPreservedExtensions _ -> printfn "ok"
| UnavailableCapabilities caps -> printfn "needs a newer Forma: %A" caps
| MigrationRequired(from, target, automatic, reason) -> printfn "%s" reason
| StructurallyInvalid | SemanticallyInvalid ->
    for f in report.Findings do printfn "%s %s %s" f.Code f.Pointer f.Message
```

## Browser

```js
const report = await document.querySelector("forma-workflow").validate(workflowObject);
```

## Compatibility classes

| Class | When |
|---|---|
| `fully-supported` | Valid, and everything in it is understood. |
| `supported-with-preserved-extensions` | Valid, and it carries namespaced extensions that Forma preserves but does not interpret. |
| `migration-required` | It declares another `formatVersion`. `migration.automatic` says whether Forma migrated it. |
| `structurally-invalid` | Not JSON, has duplicate keys, has the wrong `format`, or violates the published schema. |
| `semantically-invalid` | Schema-valid, but has broken references, ids, ports, membership, unsafe URLs or failed static accessibility rules. The document still decodes, so an editor can show the findings without deleting anyone's data. |
| `unavailable-capabilities` | Valid format, but it needs capabilities the target `forma.version` lacks, or capabilities this Forma does not provide. |

## What is checked

Structure is checked against the published schema file itself. A small built-in
JSON Schema validator enforces it, so there is no hand-maintained copy.

| Area | Finding codes |
|---|---|
| JSON | `JSON` (malformed, duplicate keys, more than 64 levels deep, larger than 16 MB) |
| Format | `FORMAT`, `FORMAT-VERSION`, `FORMAT-MIGRATED` |
| Schema | `SCHEMA` (with a JSON Pointer) |
| Identity | `ID-DUPLICATE`, `ID-DUPLICATE-PORT`, `ID-DUPLICATE-REFERENCE`, `ID-DUPLICATE-LEGEND` |
| References | `REF-DANGLING-EDGE`, `REF-MISSING-PORT`, `REF-INTERACTION-TARGET`, `REF-PALETTE` |
| Ports | `PORT-DIRECTION`, `PORT-CARDINALITY` |
| Groups | `GROUP-MISSING-MEMBER`, `GROUP-MISSING-PARENT`, `GROUP-CYCLE`, `GROUP-LANE-CONFLICT` |
| Extensions | `EXT-RESERVED` (and the schema's namespace and object rules) |
| Compatibility | `COMPAT-UNAVAILABLE`, `COMPAT-UNKNOWN-CAPABILITY` |
| Accessibility (static) | `A11Y-TITLE`, `A11Y-NAME`, `A11Y-CONTRAST` (authored text colour against fill below 4.5:1), `A11Y-BRANCH-LABEL`, `A11Y-LEGEND` |
| Security | `SEC-UNSAFE-URL` (anything other than http, https, mailto or relative; also control characters and leading spaces), `SEC-BIDI-CONTROL` |
| Semantics (warnings) | `SEM-DECISION-BRANCHES`, `SEM-START-INCOMING`, `SEM-END-OUTGOING`, `LAYOUT-PARTIAL` |

Errors decide the class. Warnings and notes do not.
