# Feature Manifest: Site CSS policy checker

## Purpose

Enforce MKT-LOCAL on a consuming site's stylesheets.

## Behavior

The checker reports five kinds of finding:

- `FORMA-COMPONENT`
- `GLOBAL-ELEMENT`
- `TOKEN-OVERRIDE`
- `IDENTITY-VALUE`
- `PALETTE-COPY`

It honors `/* forma-exception: <reason> */` and counts each exemption.

Exit codes:

- `0`: compliant
- `1`: findings
- `2`: usage error

## Interfaces

- CLI: `dotnet run --project tools/SiteCssPolicy/SiteCssPolicy.fsproj -- [--forma <forma.css>] <site.css>...`
- Composite action: `actions/check-site-css`

## Tests and verification

`tests/site-css-policy.test.mjs`, and the reference-fixture check in
`tests/marketing-structure.test.mjs`.
