export default {
  name: "Identifier & critical value",
  category: "data",
  behavior: "Application content",
  summary: "Low-context identifiers, codes, numeric values, and consequential values with stronger glyph distinction and verification cues.",
  owns: ["ef-identifier", "ef-critical-value"],
  purpose: {
    description: "Identifiers, hashes, account numbers, amounts and other low-context values get little help from language: a reader cannot guess that `0O1I` is wrong the way they can spot a misspelled word. `.ef-identifier` and `.ef-critical-value` are inline text treatments that set these values in the monospace family with tabular, slashed-zero numerals, slight letter spacing and break-anywhere wrapping. `.ef-critical-value` adds weight for values that carry consequence, and `data-ef-verify=\"true\"` adds a double underline that invites deliberate checking. Both remain ordinary selectable text; neither states validity, authority or state.",
    useWhen: [
      "Users read, copy or compare codes such as invoice numbers, execution IDs, commit hashes, IBANs or license keys.",
      "A value such as an amount, dose, limit or destination account must be checked before a consequential action.",
      "Long unbroken tokens must wrap inside narrow containers instead of overflowing."
    ],
    avoidWhen: [
      "The text is a multi-line code sample or configuration: use [[code-sample]].",
      "The value is ordinary prose, a person's name or a heading: body text is easier to read.",
      "You need to show whether the value is valid, current or approved: state that in text or a [[status-lozenge]]; typography is not a state channel.",
      "The whole screen follows recognize, verify, act: compose the values inside [[verification-frame]]."
    ],
    characteristics: [
      "Monospace family with `tabular-nums` and `slashed-zero` (plus the `tnum` and `zero` OpenType features), so 0 and O, and digit columns, are distinguishable.",
      "`overflow-wrap: anywhere` lets hashes and IDs break at any character.",
      "`.ef-identifier` is set at 0.9375em so it sits comfortably in running text; `.ef-critical-value` is set at weight 750.",
      "`data-ef-verify=\"true\"` on a critical value adds inline padding and a double bottom border; in forced-colors mode the border uses CanvasText."
    ]
  },
  examples: [
    {
      id: "confusable-codes",
      title: "Codes with confusable characters",
      description: "Support identifiers containing O/0, I/1/l and B/8 in running text. The slashed zero and monospace shapes separate the characters, and the surrounding sentence still says what each code is.",
      html: `<ef-identifier class="ef-component-tag">
  <p>Quote reference <span class="ef-identifier">Q-B8O0-1Il7</span> replaces <span class="ef-identifier">Q-B80O-I1l7</span>. Give the new reference to the customer; the old one no longer resolves.</p>
</ef-identifier>`
    },
    {
      id: "transfer-verification",
      title: "Transfer amount and destination to verify",
      description: "Before approving a transfer, the destination account and amount are marked for deliberate verification. The reference is only an identifier; the fee is consequential but not flagged for verification. The double underline invites checking; it does not mean the value is correct.",
      html: `<ef-identifier class="ef-component-tag">
  <section aria-labelledby="identifier-transfer-verification-title">
    <h3 id="identifier-transfer-verification-title">Confirm outgoing transfer</h3>
    <dl class="ef-key-value-list">
      <div><dt>Reference</dt><dd><span class="ef-identifier">TRF-20260929-004117</span></dd></div>
      <div><dt>Destination IBAN</dt><dd><span class="ef-critical-value" data-ef-verify="true">DE89 3704 0044 0532 0130 00</span></dd></div>
      <div><dt>Amount</dt><dd><span class="ef-critical-value" data-ef-verify="true">€48,000.00</span></dd></div>
      <div><dt>Fee</dt><dd><span class="ef-critical-value">€0.00</span></dd></div>
    </dl>
    <p>Compare the IBAN with the supplier's signed payment instruction before approving.</p>
    <button type="button">Approve transfer</button>
  </section>
</ef-identifier>`
    },
    {
      id: "long-hash",
      title: "Long hash in a narrow column",
      description: "A 64-character digest has no spaces. `overflow-wrap: anywhere` lets it break at any character inside its container instead of forcing horizontal scrolling.",
      html: `<ef-identifier class="ef-component-tag">
  <dl class="ef-key-value-list">
    <div><dt>Artifact digest (SHA-256)</dt><dd><span class="ef-identifier">9d2f4c1a7e0b83f56a1c9e02d4b7f3a8c6e15d90b2a47f8e3c1d06b59a2e7f4c</span></dd></div>
    <div><dt>Signed by</dt><dd>release-signing@builds</dd></div>
  </dl>
</ef-identifier>`
    },
    {
      id: "mobile-execution-id",
      title: "Mobile execution reference",
      description: "An execution ID and a critical limit at phone width. The ID wraps across lines and the verified value keeps its double underline on each line.",
      mobile: {
        height: 300,
        notes: [
          "Long identifiers break at any character (`overflow-wrap: anywhere`), so a 30-character ID wraps at 320px instead of overflowing.",
          "The verified critical value is `inline-block`; if it is wider than the line it wraps inside its own box and the double underline stays at its bottom edge.",
          "Values remain selectable text, so long-press copy works on touch devices.",
          "Nothing changes with orientation other than where lines break."
        ]
      },
      html: `<ef-identifier class="ef-component-tag">
  <section aria-labelledby="identifier-mobile-execution-id-title">
    <h3 id="identifier-mobile-execution-id-title">Job run</h3>
    <p>Execution <span class="ef-identifier">EXE-20260929T081402Z-7B51-0O1I-A9Q2</span> stopped at the configured limit of <span class="ef-critical-value" data-ef-verify="true">2,500 records</span>.</p>
  </section>
</ef-identifier>`
    }
  ],
  api: {
    attributes: [
      { name: "data-ef-verify", on: ".ef-critical-value", values: "true", default: "absent", description: "Adds the deliberate-verification cue (inline padding and a double bottom border). Descriptive presentation only; it does not assert validity." }
    ],
    hooks: {
      "ef-identifier": "Inline treatment for low-context identifiers and codes: monospace, tabular slashed-zero numerals, slight tracking, break-anywhere wrapping, 0.9375em.",
      "ef-critical-value": "Inline treatment for consequential values: the same glyph treatment as identifiers at weight 750.",
      "data-ef-verify": "On `.ef-critical-value`, `true` shows the verification cue: `inline-block` with 0.25em inline padding and a 0.15em double bottom border in currentColor."
    },
    keyboard: [
      { keys: "None", action: "Plain inline text; not focusable. Standard text selection and copy apply." }
    ],
    events: [],
    form: "Not a form control. For entering identifiers use a [[text-field]]; the class may be applied to the input for the same glyph treatment."
  },
  states: [
    { name: "Identifier", how: "class=\"ef-identifier\"", description: "Distinct glyphs, regular weight, slightly smaller than body text." },
    { name: "Critical value", how: "class=\"ef-critical-value\"", description: "Distinct glyphs at heavy weight." },
    { name: "Marked for verification", how: "data-ef-verify=\"true\" on .ef-critical-value", description: "Double underline and inline padding; CanvasText border in forced colors." }
  ],
  accessibility: {
    forma: [
      "Keeps values as selectable, copyable text; nothing is drawn with images or CSS content.",
      "Improves glyph differentiation (slashed zero, monospace shapes) without relying on color.",
      "The verification cue is a border style, not a hue, and survives forced-colors mode."
    ],
    consumer: [
      "Keep a visible label (a `dt`, header or sentence) that says what the value is; the class does not name it.",
      "State validity, freshness and approval separately in text; the verify cue is an invitation to check, not a result.",
      "Group long numbers the way users read them (IBAN in fours, amounts with separators).",
      "Where screen-reader users must verify character by character, offer the value in a form they can step through, such as a read-only input."
    ]
  },
  responsive: [
    "Inline and intrinsic: the treatment adds no layout of its own except `inline-block` for verified critical values.",
    "`overflow-wrap: anywhere` keeps long tokens inside any container down to 320px.",
    "Sizes are relative (`em`), so values scale with the surrounding text and with user zoom."
  ],
  motion: [
    "No animation: both classes are static typography."
  ],
  guidance: {
    do: [
      "Use `.ef-identifier` for references users will copy or read aloud, and `.ef-critical-value` for the few values that carry consequence.",
      "Reserve `data-ef-verify=\"true\"` for values the user must actively check before acting."
    ],
    avoid: [
      "Marking every value for verification; the cue loses its meaning.",
      "Truncating identifiers with an ellipsis where users must compare the full value.",
      "Using weight or the double underline to imply that a value is approved or authoritative."
    ]
  },
  related: [
    { slug: "verification-frame", note: "Recognize, verify, act composition that typically contains identifiers and verified critical values." },
    { slug: "key-value-list", note: "Labelled rows that give each identifier its visible label." },
    { slug: "code-sample", note: "Multi-line code or configuration, not inline values." },
    { slug: "text-roles", note: "Eyebrow, lead and kicker roles for ordinary text hierarchy rather than low-context values." }
  ]
};
