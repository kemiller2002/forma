# Producing workflows outside Forma

Any system can create a valid workflow from the published schema alone.
[`examples/external-producer/produce.mjs`](../../examples/external-producer/produce.mjs)
does it with plain Node.js and no Forma code at all.
[`consume.mjs`](../../examples/external-producer/consume.mjs) reads the file
back after other tools have edited it.

## Rules for producers

1. Write `format`, `formatVersion: "1.0.0"`, `id`, `title`, `forma.version` and `nodes`.
2. Give every node, edge and group a stable id. Never reuse array positions as ids.
3. Leave out coordinates unless you mean them. Forma lays out a workflow with no layout deterministically.
4. Put meaning in core fields: `kind`, `status`, `color`, `references`, group `members`. Put your own data in `metadata` or in `extensions["your.namespace"]`.
5. Validate before publishing: `forma-workflow validate --json your.forma-workflow.json`.
6. Save to `forma/workflows/<id>.forma-workflow.json`.

## Rules for consumers

- Read the core fields you understand. Keep everything else, including unknown extensions and metadata, and write it back unchanged.
- Check `formatVersion` and the validation class before relying on a document.

## The round-trip proof

1. An external producer writes a `.forma-workflow.json` file.
2. Forma validates it.
3. Forma Studio opens it and edits it.
4. Forma Studio saves it.
5. An external consumer reads it.

`npm run proof:external` in kemiller2002/forma-studio runs all five steps. It
checks that stable ids, nodes, edges, semantics, colours, metadata, unknown
namespaced extensions and domain references survive. The evidence is recorded
in that repository under `docs/evidence/`.
