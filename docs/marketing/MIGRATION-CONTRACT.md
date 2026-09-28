# Forma marketing migration contract

This contract is the complete instruction for migrating one Echelon marketing
site onto Forma. To hand a site to an agent, say: "Perform the Forma
marketing migration for `<site>` under
kemiller2002/forma `docs/marketing/MIGRATION-CONTRACT.md` at `v<version>`."

Authority:

- [`requirements/MARKETING-PRESENTATION.md`](../../requirements/MARKETING-PRESENTATION.md)
- [`docs/MARKETING-SITES.md`](../MARKETING-SITES.md)

Where a site's existing requirements conflict with this architecture, the
Forma architecture wins. Record the superseded requirement in the site
repository (step 0).

## Preconditions

- Work happens in the site's repository, under that repository's work
  protocol (Praxis or ROS), with its own work item.
- The target Forma version is released: the GitHub release has the
  `forma-echelon-marketing.css` asset.
- Read the site's row in [`MIGRATION-INVENTORY.md`](MIGRATION-INVENTORY.md).

## Sequence

| Step | Action | Done when |
|---|---|---|
| 0 | **Baseline and revise requirements.** Screenshot the current site at 1280, 768, 390, and 320 px. List the site's presentation requirements. Mark each as kept, superseded by Forma, or a Forma gap. | A revision note is committed in the site repository |
| 1 | **Pin the Forma presentation version.** Add `forma.lock` (`forma X.Y.Z`, `destination`, `asset forma-echelon-marketing.css`). Run `install.sh --update`. Add the destination to `.gitignore`. | The lock is committed and `install.sh` passes |
| 2 | **Adopt the Echelon Marketing Theme.** Load the installed `forma-echelon-marketing.css` first, before any site CSS. Pin `data-ef-theme="light"` unless dark mode is intended. | Pages render with Forma tokens |
| 3 | **Adopt the MarketingShell.** Replace the header, navigation, main wrapper, and footer templates with the shell structure. Add the skip link and `aria-current`. Set `data-ef-layout`. | The structure checks pass (question 8 of the guide) |
| 4 | **Replace local global styles with Forma foundations.** Delete the site's palette, reset, typography, links, focus rules, containers, spacing, and responsive rules. | The policy reports no `GLOBAL-ELEMENT` or `TOKEN-OVERRIDE` findings |
| 5 | **Replace duplicated components.** Map site classes to Forma components using the inventory's mapping. Change the markup, not the CSS. | No local rule restyles hero, cards, buttons, badges, CTA, section headings, code, or prose |
| 6 | **Keep only legitimate site-specific CSS.** Prefix the remaining rules with the site prefix. Annotate each pending-gap rule with `/* forma-exception: GAP-MKT-xx */`. Open a Forma issue for any gap not yet listed. | `SiteCssPolicy` exits 0 |
| 7 | **Run visual, accessibility, and responsive checks.** Compare against the step-0 screenshots. Run axe (WCAG 2.2 A/AA) at 1280 and 390 in light (and dark if enabled). Check for no overflow at 320, keyboard focus, 44px targets, reduced motion, and 200% text. | All checks pass. Differences from baseline are intended Forma behavior (see EV-DESIGN-2026-0014 defects) or recorded |
| 8 | **Remove obsolete CSS and tests.** Delete the unused stylesheet sections, palette copies, and palette-contrast tests that Forma now owns. Keep tests for local presentation. | The inventory's "obsolete" list is gone |
| 9 | **Deploy through the existing workflow.** Add `install-presentation@vX.Y.Z` and `check-site-css@vX.Y.Z` before the site build in the Pages workflow. | The Pages deploy is green from a clean checkout |
| 10 | **Record the Forma version.** Keep `forma.lock` as the version record. Note the version and any exceptions in the site handoff or README, and link the work item. | A reviewer can read the version from the repository |

## Rules during migration

- Never copy Forma CSS or patterns into the site.
- Never edit installed files under `assets/forma/`.
- Do not add `ef-` classes of your own. Do not restyle `ef-` classes locally.
- If Forma cannot express something generally useful, follow the gap process
  in MKT-LOCAL-4. Do not build a local look-alike.
- Content, copy, and information architecture are out of scope unless the
  site's work item says otherwise.

## Site-specific notes

### Dokimos (early target)

Dokimos requirements to revise at step 0, per the inventory survey of
`requirements/WEBSITE-REQUIREMENTS.md` (DOK-WEB-001), `docs/website/SITE.md`,
and `requirements/REQUIREMENTS.md`:

1. **W1.3** scopes Forma to the results UI only. Amend it: Forma also owns the
   website presentation.
2. **SITE.md "Relationship to Echelon Foundry"** describes a copied palette
   and type system. This is superseded by consuming
   `forma-echelon-marketing.css`. The verdigris accent becomes an
   identity-token retarget. The graph-paper backdrop becomes a
   `--ef-site-backdrop` value.
3. **W7 "palette contrast"** and `site/test/contrast.test.mjs` read a local
   `:root`. Palette contrast becomes Forma's responsibility. Keep local
   contrast tests only for Dokimos-specific tones.
4. **SITE.md "one CSS file in dist"** conflicts with shipping Forma plus local
   CSS. Either accept two stylesheets, or concatenate the installed Forma file
   with `site.css` at build time. Hashing stays the site's concern.
5. **REQUIREMENTS.md** "pinned Forma, not silently forked" is currently
   violated by the forked website palette. The migration satisfies it.
6. **W6.1–W6.3** remain valid, but their shared parts are now provided and
   tested by Forma:
   - recomposition across viewports;
   - forced colors;
   - 200% zoom;
   - skip link.

   W6.3's third-party rule must permit the chosen font delivery (GAP-MKT-02).

Do not preserve a Dokimos requirement merely because it was written first.
The Forma architecture is authoritative where it supersedes one.

### Sites with an F# build (Ordo, Limen)

- Run `install.sh` in the Pages workflow before `dotnet`.
- Neither site needs Node for presentation.

### Echelon Culinary

- Decide first whether to keep Tailwind.
- If Tailwind stays, load Forma after preflight. Do not recreate Forma
  components as Tailwind utilities.
