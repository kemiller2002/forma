# Object Metadata and Diagram Presentation Requirements

Status: proposed architecture baseline.

Tracking: #53. Related diagram-presentation gap: #52. Forma Studio consumer work: kemiller2002/forma-studio#4 and PR #5.

## Purpose

Forma MUST provide a reusable presentation vocabulary for descriptive object metadata and diagram/workflow presentation without becoming a graph editor, workflow engine, data store, or source of domain truth.

The consuming application owns object identity, metadata values, graph semantics, legal transitions, persistence, routing, and behavior. Forma owns reusable visual contracts, semantic HTML presentation patterns, design-token defaults, accessible non-color cues, themes, and print-safe visual behavior where applicable.

## 1. Metadata ownership and scope

- **FMD-META-001 MUST** permit consuming applications to associate descriptive metadata with an object without requiring Forma to understand the object's domain.
- **FMD-META-002 MUST** treat metadata values as application/profile supplied; Forma MUST NOT infer or manufacture missing metadata.
- **FMD-META-003 MUST** keep object identity separate from visible labels and metadata.
- **FMD-META-004 MUST** keep metadata separate from component CSS classes, geometry, color, icon choice, and DOM order.
- **FMD-META-005 MUST** NOT treat metadata as authorization, permission, workflow legality, scoring, severity, confidence, approval, or domain truth merely because a field exists.
- **FMD-META-006 MUST** allow metadata to remain machine-readable even when no metadata fields are visually rendered.
- **FMD-META-007 MUST** support applications that choose to render only a safe subset of available metadata.
- **FMD-META-008 MUST** preserve an explicit distinction between descriptive metadata and accessibility semantics such as accessible name/description.
- **FMD-META-009 MUST** preserve an explicit distinction between metadata and provenance/evidence references where the consuming application models both.
- **FMD-META-010 SHOULD** support metadata attached to ordinary components, cards, workflow/diagram nodes, edges/relationships, groups, lanes/phases, figures, and other reusable object presentations.

## 2. Metadata categories

Forma's presentation contracts SHOULD be able to display consumer-supplied fields such as:

- stable external/reference identifier;
- short title/name;
- longer description;
- type/category;
- tags/labels;
- owner/role/team;
- phase/stage;
- status text;
- source/provenance reference;
- created/updated/display dates;
- version/revision;
- external URL/reference;
- arbitrary namespaced custom fields.

- **FMD-META-020 MUST** NOT require every object to implement every metadata category.
- **FMD-META-021 MUST** allow profile/application contracts to define which fields are valid for a given object kind.
- **FMD-META-022 MUST** preserve unknown/unrecognized metadata as an application concern rather than visually fabricating an interpretation.
- **FMD-META-023 SHOULD** support a compact summary form and an expanded detail form using the same consumer-supplied values.
- **FMD-META-024 SHOULD** support ordered metadata fields when presentation order matters.
- **FMD-META-025 MUST** keep metadata labels visible or programmatically available when values would otherwise be ambiguous.
- **FMD-META-026 MUST** support Unicode and bidirectional text in rendered metadata.
- **FMD-META-027 SHOULD** provide semantic HTML recipes based on ordinary headings, lists, description lists, links, time elements, and text rather than opaque div-only markup.

## 3. Metadata serialization and DOM safety

- **FMD-META-040 MUST** NOT require hidden DOM attributes as the canonical store for arbitrary application metadata.
- **FMD-META-041 MAY** expose small documented `data-ef-*` presentation hooks only when they control Forma presentation rather than store private domain data.
- **FMD-META-042 MUST** NOT encourage secrets, credentials, tokens, sensitive personal data, or suppressed application values to be embedded in data attributes, CSS generated content, comments, or visually hidden metadata.
- **FMD-META-043 MUST** treat consumer-supplied metadata text/URLs as untrusted content and rely on safe semantic HTML/URL handling by the consuming application.
- **FMD-META-044 MUST** keep CSS selectors from depending on arbitrary metadata values as a source of semantic truth.
- **FMD-META-045 SHOULD** allow stable application object IDs to be exposed through a documented integration hook for inspection/testing when privacy permits, but visual styling MUST NOT depend on the ID value.
- **FMD-META-046 MUST** keep metadata presentation useful if Forma's inert `<ef-*>` wrapper is not upgraded because Forma has no runtime upgrade requirement.

## 4. Metadata presentation patterns

- **FMD-META-060 SHOULD** provide a reusable metadata-list recipe/pattern for label/value pairs.
- **FMD-META-061 SHOULD** support compact tags/chips/badges for short categorical metadata without forcing every metadata field into chip presentation.
- **FMD-META-062 SHOULD** support a details/inspector-style metadata region for larger field sets.
- **FMD-META-063 MUST** support links/reference metadata using semantic anchors rather than click handlers on generic containers.
- **FMD-META-064 MUST** support date/time metadata with text that remains understandable without locale-specific color/icon cues.
- **FMD-META-065 MUST** ensure metadata decorations do not obscure the object's primary label/content.
- **FMD-META-066 SHOULD** support truncation only with an accessible/full-value path when loss of text would matter.
- **FMD-META-067 MUST** support long values, localization, 200%+ text scaling, and 320px reflow.
- **FMD-META-068 MUST** keep metadata reading order logical and independent of purely visual placement.

## 5. Diagram and workflow presentation family

Forma SHOULD define a small public presentation family usable by Forma Studio and other consumers without owning graph behavior.

Candidate presentation contracts include:

- diagram surface/container;
- node/object;
- node header/body/footer regions;
- port/connection-point marker when the product actually displays ports;
- connector/relationship line;
- connector label;
- direction/start/end markers;
- group/container/boundary;
- swimlane;
- phase/milestone divider;
- legend/key;
- metadata/data-decoration region.

- **FMD-DIA-001 MUST** keep these contracts presentation-only.
- **FMD-DIA-002 MUST** NOT implement graph storage, hit testing, routing, snapping, selection, dragging, command history, workflow execution, or domain validation in Forma.
- **FMD-DIA-003 MUST** support use from HTML/SVG composition without requiring a JavaScript Forma runtime.
- **FMD-DIA-004 MUST** keep authored graph semantics outside CSS shape/color.
- **FMD-DIA-005 MUST** allow one visual primitive to render multiple semantic object kinds when the consuming profile explicitly chooses that mapping.
- **FMD-DIA-006 MUST** allow one semantic object kind to choose among supported presentation variants without changing domain identity.
- **FMD-DIA-007 MUST** keep editor-only selection handles, guides, routing previews, marquee UI, and drag affordances outside the reusable production pattern.
- **FMD-DIA-008 SHOULD** support compact and comfortable density variants where labels/metadata remain legible.
- **FMD-DIA-009 MUST** preserve logical text/metadata reading order independently from connector paint order.
- **FMD-DIA-010 MUST** remain usable in screen, print, and exported-vector contexts supported by the consumer.

## 6. Workflow/diagram color model

Workflow and diagram objects MUST be colorable.

- **FMD-COLOR-001 MUST** allow an eligible node/object to specify an authored fill/background color treatment.
- **FMD-COLOR-002 MUST** allow an eligible node/object to specify an authored border/stroke treatment.
- **FMD-COLOR-003 MUST** allow an eligible node/object to specify an authored accent treatment.
- **FMD-COLOR-004 MUST** allow an eligible connector/relationship to specify an authored stroke/accent treatment.
- **FMD-COLOR-005 MAY** allow explicit foreground/text treatment when the consumer can prove contrast/accessibility.
- **FMD-COLOR-006 MUST** provide Forma token-based defaults for all diagram presentation surfaces.
- **FMD-COLOR-007 SHOULD** support project/brand palette slots through documented CSS custom properties or namespaced token inputs rather than requiring a separate component class for every color.
- **FMD-COLOR-008 MAY** allow consumer-authored literal color values when a consuming product explicitly permits them; literal color is an override, not a new semantic token.
- **FMD-COLOR-009 MUST** keep semantic type/status and visual color as separate data.
- **FMD-COLOR-010 MUST NOT** infer Error from red, Approved from green, Warning from yellow, Selected from blue, or any other domain meaning solely from a color value.
- **FMD-COLOR-011 MUST** allow two objects with the same semantic type to use different authored colors.
- **FMD-COLOR-012 MUST** allow two different semantic types to use the same authored color.
- **FMD-COLOR-013 MAY** support an explicit metadata-to-color mapping supplied by the application/profile.
- **FMD-COLOR-014 MUST** treat metadata-to-color mapping as an explicit mapping contract, never implicit inference inside Forma.
- **FMD-COLOR-015 MUST** expose the underlying text/type/status independently from the color where the color carries meaningful grouping/status information.

## 7. Color accessibility and fallback

- **FMD-COLOR-020 MUST** ensure color is never the only carrier of workflow state, relationship type, responsibility, phase, validation state, or other material information.
- **FMD-COLOR-021 MUST** pair meaningful color with text, label, icon, shape, line style, pattern, marker, grouping, or another non-color cue as appropriate.
- **FMD-COLOR-022 MUST** meet applicable WCAG contrast requirements for text/icons rendered on authored fills.
- **FMD-COLOR-023 SHOULD** validate or provide safe fallback foreground colors against configured fills when reliable.
- **FMD-COLOR-024 MUST** define forced-colors behavior that preserves object boundaries, labels, focus, and relationship distinction.
- **FMD-COLOR-025 MUST** provide grayscale-safe presentation for diagrams intended for print/export.
- **FMD-COLOR-026 MUST** remain intelligible when browser/print background colors are disabled.
- **FMD-COLOR-027 SHOULD** support line-style/marker alternatives when connector colors are used to distinguish relationship categories.
- **FMD-COLOR-028 MUST** preserve focus-visible/selection treatment independently from authored object color.
- **FMD-COLOR-029 MUST** prevent a user-authored fill from erasing validation/focus/disabled cues.
- **FMD-COLOR-030 MUST** test representative dark, light, high-contrast/forced-colors, grayscale, and backgrounds-off presentations.

## 8. Metadata-driven decorations

- **FMD-DEC-001 MAY** provide presentation recipes that project metadata values as badges, icons, labels, bars, markers, or other data decorations.
- **FMD-DEC-002 MUST** keep the underlying metadata value separate from its decoration.
- **FMD-DEC-003 MUST** ensure decoration rules are explicit and inspectable.
- **FMD-DEC-004 MUST** NOT execute arbitrary application expressions/scripts in Forma to calculate decorations.
- **FMD-DEC-005 MUST** support a textual/structural equivalent for meaningful decorations.
- **FMD-DEC-006 MUST** permit decorations to be omitted without destroying the object's identity/primary content.
- **FMD-DEC-007 SHOULD** support legends generated by the consuming application/profile from explicit category/color/marker mappings.
- **FMD-DEC-008 MUST** NOT allow a legend to redefine application semantics independently from the consuming profile/model.

## 9. Theming and white-label behavior

- **FMD-THEME-001 MUST** integrate diagram defaults with Forma's existing token/theme/brand system.
- **FMD-THEME-002 MUST** preserve authored object colors when the consuming product declares them fixed authored content.
- **FMD-THEME-003 MUST** allow authored palette slots to resolve differently by theme/brand when the consuming contract defines them as semantic palette references rather than fixed literals.
- **FMD-THEME-004 MUST** distinguish fixed authored color from theme-relative token/palette color.
- **FMD-THEME-005 MUST** keep brand/theme changes from altering semantic object type/status.
- **FMD-THEME-006 SHOULD** provide print-safe palette guidance for common diagram/workflow use.
- **FMD-THEME-007 MUST** prevent white-label overrides from making required labels/non-color cues unreadable.

## 10. Integration with Forma Studio

- **FMD-STUDIO-001 MUST** publish stable presentation identifiers/metadata sufficient for Forma Studio profiles to map graph element kinds to Forma visual contracts.
- **FMD-STUDIO-002 MUST** expose presentation capabilities independently from Studio semantic profile IDs.
- **FMD-STUDIO-003 MUST** allow Studio to inspect supported color/palette/presentation properties without scraping CSS implementation details.
- **FMD-STUDIO-004 MUST** allow Studio to distinguish editor chrome from authored/exported Forma presentation.
- **FMD-STUDIO-005 SHOULD** provide example mappings for General, Workflow, State, and Architecture diagrams without claiming those profile semantics belong to Forma.
- **FMD-STUDIO-006 MUST** permit metadata presentation inside a node/object without requiring Studio to flatten metadata into the visible node label.
- **FMD-STUDIO-007 MUST** keep exact graph geometry/routing outside Forma.

## 11. Print/Folio interoperability

- **FMD-FOLIO-001 MUST** define diagram presentation so Folio can preserve authored colors, labels, outlines, markers, metadata, and non-color cues when projecting diagrams to paged media.
- **FMD-FOLIO-002 MUST** support a useful backgrounds-disabled fallback.
- **FMD-FOLIO-003 MUST** support grayscale-safe differentiation.
- **FMD-FOLIO-004 SHOULD** prefer vector-friendly CSS/SVG presentation when a diagram is exported as vector content.
- **FMD-FOLIO-005 MUST** keep print pagination/tiling outside Forma.

## 12. Testing and documentation

- **FMD-TEST-001 MUST** add conformance fixtures for plain node, colored node, metadata-rich node, connector, colored connector, group, lane/phase, legend, and metadata decoration once those contracts implement.
- **FMD-TEST-002 MUST** test long labels/metadata, RTL/bidirectional content, 320px screen presentation, 200%+ text sizing, forced colors, dark/light themes, grayscale, and backgrounds-disabled output as applicable.
- **FMD-TEST-003 MUST** test that authored color never hides focus-visible or selected state.
- **FMD-TEST-004 MUST** test that color-only removal still leaves meaningful workflow distinctions understandable in canonical examples.
- **FMD-TEST-005 MUST** document at least three examples for every newly public Forma pattern.
- **FMD-TEST-006 MUST** document which properties are authored presentation, which are application/profile metadata, and which remain editor-only.
- **FMD-TEST-007 MUST** add a Workflow example where multiple items have user-authored colors unrelated to their semantic status.
- **FMD-TEST-008 MUST** add an explicit metadata-to-color mapping example and explain that the mapping belongs to the consumer/profile.

## 13. Initial implementation slice

The first implementation SHOULD remain smaller than the complete architecture.

- **FMD-M1-001 MUST** first define stable node/object, connector, metadata-summary, and color presentation contracts.
- **FMD-M1-002 MUST** prove token/palette color plus an explicit authored override.
- **FMD-M1-003 MUST** prove a node with structured metadata where only a selected subset is visibly rendered.
- **FMD-M1-004 MUST** prove the same workflow remains understandable in grayscale and backgrounds-disabled output.
- **FMD-M1-005 MUST** preserve Forma's zero-runtime contract.
- **FMD-M1-006 MUST** leave graph behavior, routing, commands, and workflow semantics in Forma Studio/application code.
