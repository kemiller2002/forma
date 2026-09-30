export default {
  name: "Switcher",
  category: "layout",
  behavior: "Native CSS",
  summary: "Keeps related regions side by side when space permits and stacks them without semantic reordering.",
  purpose: {
    description: "A switcher holds a primary region and a secondary region in one row while both fit at useful widths, and stacks them as whole blocks when they do not. Unlike a cluster, it never leaves a region squeezed at an awkward in-between width: the primary region wants about 28rem and the secondary about 16rem, and as soon as the row cannot hold both, each takes a full line. The decision comes from the switcher's own width, so it behaves the same in a page, a panel or a dialog.",
    useWhen: [
      "Two related regions, such as a narrative and its supporting material or a form and its help, should sit side by side on wide screens.",
      "The primary region should get most of the extra width when both fit.",
      "The switch between row and stack should follow available space, not device type."
    ],
    avoidWhen: [
      "The secondary region is navigation or a filter list of a preferred width: use [[sidebar]].",
      "You need a fixed start or end rail with a known breakpoint: use [[rail]].",
      "There are more than two regions of equal weight: use [[grid]].",
      "Inline items such as buttons should wrap individually: use [[cluster]]."
    ],
    characteristics: [
      "Regions are aligned to the start of the cross axis, so a short secondary region does not stretch to the primary region's height.",
      "When stacked, both regions are full width and in source order.",
      "Minimum sizes are clamped to 100%, so neither region overflows a phone screen."
    ]
  },
  examples: [
    {
      id: "form-with-help",
      title: "Form with help text",
      description: "A payment details form with a help panel. The form is the primary region; the help panel sits beside it on wide screens and below it when the pane narrows.",
      html: `<ef-switcher class="ef-component-tag">
  <div class="ef-switcher">
    <form class="ef-switcher__primary ef-stack" aria-labelledby="switcher-form-with-help-title">
      <h2 id="switcher-form-with-help-title">Bank account</h2>
      <div class="ef-field">
        <label class="ef-field__label" for="switcher-form-with-help-holder">Account holder</label>
        <input id="switcher-form-with-help-holder" name="holder" type="text" autocomplete="name">
      </div>
      <div class="ef-field">
        <label class="ef-field__label" for="switcher-form-with-help-iban">IBAN</label>
        <input id="switcher-form-with-help-iban" name="iban" type="text" autocomplete="off" spellcheck="false">
      </div>
      <div class="ef-cluster"><button type="submit">Save account</button></div>
    </form>
    <aside class="ef-switcher__secondary ef-surface" aria-labelledby="switcher-form-with-help-help">
      <h3 id="switcher-form-with-help-help">Where to find your IBAN</h3>
      <p>It is printed on your bank statement and shown in your banking app under account details.</p>
    </aside>
  </div>
</ef-switcher>`
    },
    {
      id: "comparison-before-after",
      title: "Before and after comparison",
      description: "A change summary with the current configuration as the primary region and the proposed change as the secondary. A narrower gap is set with `--ef-switcher-space`.",
      html: `<ef-switcher class="ef-component-tag">
  <section class="ef-switcher" style="--ef-switcher-space: 1rem" aria-label="Retention policy change">
    <article class="ef-switcher__primary ef-surface" aria-labelledby="switcher-comparison-before-after-current">
      <h2 id="switcher-comparison-before-after-current">Current policy</h2>
      <p>Audit logs are kept for 90 days and then deleted. Exports are available for the full period.</p>
    </article>
    <article class="ef-switcher__secondary ef-surface" aria-labelledby="switcher-comparison-before-after-proposed">
      <h2 id="switcher-comparison-before-after-proposed">Proposed policy</h2>
      <p>Keep audit logs for 400 days.</p>
    </article>
  </section>
</ef-switcher>`
    },
    {
      id: "mobile-stacked",
      title: "Mobile stacked regions",
      description: "A release note with a supporting download panel at phone width. The row cannot hold both minimums, so the regions stack.",
      mobile: {
        height: 440,
        notes: [
          "Below roughly 45rem of available width (28rem + 16rem + gap) the regions wrap and each takes the full width.",
          "The primary region stays first because it is first in the source.",
          "Minimum sizes use `min(100%, …)`, so at 320px neither region forces horizontal scrolling.",
          "In landscape on a large phone the regions may fit side by side again; the markup is unchanged."
        ]
      },
      html: `<ef-switcher class="ef-component-tag">
  <div class="ef-switcher">
    <article class="ef-switcher__primary ef-stack" aria-labelledby="switcher-mobile-stacked-title">
      <h2 id="switcher-mobile-stacked-title">Version 5.1</h2>
      <p>Offline mode now syncs drafts automatically when the connection returns.</p>
    </article>
    <aside class="ef-switcher__secondary" aria-labelledby="switcher-mobile-stacked-download">
      <h3 id="switcher-mobile-stacked-download">Download</h3>
      <p><a href="#release-5-1">Release notes and installers</a></p>
    </aside>
  </div>
</ef-switcher>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "regions", values: "id of the region heading", default: "—", description: "Names each region by its visible heading." },
      { name: "aria-label", on: ".ef-switcher", values: "string", default: "—", description: "Names the pair when the switcher element is a section." },
      { name: "style", on: ".ef-switcher", values: "--ef-switcher-space: <length>", default: "—", description: "Per-instance gap override." }
    ],
    hooks: {
      "ef-switcher": "Wrapping flex container with start-aligned regions.",
      "ef-switcher__primary": "Primary region: flex basis 28rem, grows strongly, minimum `min(100%, 20rem)`.",
      "ef-switcher__secondary": "Secondary region: flex basis 16rem, minimum `min(100%, 16rem)`.",
      "--ef-switcher-space": "Gap between the regions in both directions. Default `--ef-primitive-spacing-5` (1.5rem).",
      "--ef-switcher-threshold": "Declared with a default of 42rem but not read by any rule; setting it currently has no effect. The switch point comes from the region flex bases."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the primary region, then the secondary, in source order." }
    ],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Side by side", how: "row holds both flex bases", description: "Primary region takes most of the width; secondary keeps about 16rem." },
    { name: "Stacked", how: "row too narrow for both", description: "Each region is full width, in source order." }
  ],
  accessibility: {
    forma: [
      "Never reorders regions; reading, focus and visual order match in both states.",
      "Adds no landmarks or roles.",
      "Clamped minimum sizes keep both regions inside a 320px viewport."
    ],
    consumer: [
      "Put the region users need first earlier in the source.",
      "Name aside and section regions so landmarks are distinguishable.",
      "Do not place content in the secondary region that must be read before the primary one."
    ]
  },
  responsive: [
    "Container-driven wrap with no media queries: the switch happens when the switcher's own width cannot hold both flex bases.",
    "When stacked, both regions stretch to the full row.",
    "Long words wrap inside each region; the regions never force page overflow.",
    "For a switch point you control exactly, use [[rail]] (fixed 48rem breakpoint)."
  ],
  motion: [
    "No animation: regions switch between row and stack instantly."
  ],
  guidance: {
    do: [
      "Use the switcher for exactly two related regions.",
      "Keep secondary content short enough to read comfortably at 16rem."
    ],
    avoid: [
      "Relying on `--ef-switcher-threshold` to control the switch point; it is not wired to any rule.",
      "Putting a third child in the switcher; only the primary and secondary element classes are sized."
    ]
  },
  related: [
    { slug: "sidebar", note: "Supporting region of a preferred width beside flexible content." },
    { slug: "rail", note: "Fixed supporting column with explicit start/end placement." },
    { slug: "split", note: "Marketing-layer equivalent for site pages inside the shell." },
    { slug: "cluster", note: "Wraps individual inline items rather than whole regions." }
  ]
};
