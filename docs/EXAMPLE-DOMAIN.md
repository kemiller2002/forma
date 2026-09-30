# NASA spaceflight example domain

Forma's component catalog uses one stable reference domain for realistic
examples: completed NASA human-spaceflight and exploration missions.

The goal is not to turn the documentation site into a NASA application. The
goal is to stop teaching each component with an unrelated fictional product,
customer, invoice, support ticket, or settings screen. A reader should be able
to move from a select to a data grid to a record header and recognize the same
records and vocabulary.

## Canonical collection

The build-time source of truth is:

`catalog/example-data/nasa-spaceflight.mjs`

The initial collection is:

- Gemini IV
- Apollo 8
- Apollo 11
- Apollo 13
- STS-1
- STS-31
- STS-95
- Artemis I

Each record supplies a stable id, mission/program identity, mission type,
launch and return dates, crew, spacecraft, launch vehicle, destination,
completion status, a short distinguishing fact, and an official NASA source.

These are deliberately completed missions. Catalog rendering must not depend on
a live NASA API, current launch schedules, or mutable program status.

## Authoring rule

When an example needs domain data, prefer this collection and import
`missionById`, `nasaSpaceflights`, or another helper from the shared module.

Good uses include:

- select/combobox options;
- filters and checkboxes;
- data-grid rows;
- cards and master/detail records;
- timelines;
- record headers;
- pagination and collection summaries;
- mobile versions of the same examples.

Do not force the NASA vocabulary into a component when doing so would obscure
the thing the example exists to teach. Security, Aegis fault, diagnostic,
psychometric, and highly specialized infrastructure examples may retain their
specialized language. Where NASA language is natural, prefer mission-control
or mission-record examples over unrelated placeholders.

## Runtime boundary

This file is catalog/build-time data. It is not shipped as a Forma runtime and
does not change Forma's zero-runtime contract.

Forma still owns only HTML structure and CSS presentation.

For a real interactive application:

1. native HTML emits browser events;
2. Limen carries those events across the browser/application boundary;
3. the consuming application's typed state decides what the event means;
4. Ordo/state-directed rules determine legal transitions, capabilities and
   obligations when domain meaning is involved;
5. the application projects authoritative state back through Limen;
6. Forma renders that state.

Limen already contains the proven F#/.NET WebAssembly consumer pattern. Do not
add a second application-state implementation in TypeScript merely for Forma
examples.

## Data maintenance

NASA source URLs live beside each record. If a fact changes because a source is
corrected, change the canonical record and every generated example will consume
the correction. Do not silently fork mission facts inside component files.

New missions should be added only when they improve example coverage. Favor
well-documented, completed missions with materially different data shapes, such
as crewed versus uncrewed, different programs, or different mission purposes.
