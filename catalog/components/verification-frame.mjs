export default {
  name: "Verification frame",
  category: "verification",
  behavior: "Ordo / application",
  summary: "Recognize, deliberately verify, then act without letting presentation invent authority, certainty, or legal actions.",
  purpose: {
    description: "A verification frame structures a consequential decision into three stacked parts: Recognize (what this is and what state the application reports), Verify (the facts, evidence, freshness and unresolved work to check deliberately) and Act (the actions the application or Ordo currently allows). The frame makes the pause for verification visible and puts facts before buttons in both source and visual order. It is presentation only: it never decides that an action is legal, that evidence is sufficient or that a state is certain. Everything inside comes from application or Ordo state.",
    useWhen: [
      "A user is about to take an action that is hard to reverse or has consequences for others, such as approving a payment, releasing a build or closing a case.",
      "Specific values must be read deliberately before acting, such as an amount, an account number or a target environment.",
      "The application can supply the facts, their freshness and the currently legal actions."
    ],
    avoidWhen: [
      "The action is routine and easily undone: use a plain [[button]] with an [[alert]] or [[toast]] outcome.",
      "The user is only confirming a single sentence: use a [[dialog]].",
      "The concern is which of several regions leads: use [[attention-path]] or [[emphasis-budget]].",
      "The content to check is a rendered document: use [[preview-surface]], optionally inside the Verify part."
    ],
    characteristics: [
      "Three padded parts separated by rules: recognize (header), verify (facts grid) and act (footer).",
      "Facts are a `dl` in an auto-fit grid of columns at least 12rem wide, each fact separated by a thin rule.",
      "Designed to pair with `.ef-identifier` and `.ef-critical-value` for low-context values.",
      "At 30rem and below the act area is a one-column grid of full-width, wrapping buttons."
    ]
  },
  examples: [
    {
      id: "production-release",
      title: "Production release with stale evidence",
      description: "The application reports that one piece of evidence is stale. The frame shows it as stale, not as failed or passed, and the act area offers refreshing the evidence first. The target environment and commit are low-context values marked for deliberate reading.",
      html: `<ef-verification-frame class="ef-component-tag">
  <section class="ef-verification-frame" aria-labelledby="verification-frame-production-release-title">
    <header class="ef-verification-frame__recognize">
      <span class="ef-component-kicker">Recognition</span>
      <h2 id="verification-frame-production-release-title">Release 4.2.0 to production</h2>
      <p><span class="ef-status-lozenge" data-state="unknown">Evidence stale</span> Verify the facts below before releasing.</p>
    </header>
    <section class="ef-verification-frame__verify" aria-labelledby="verification-frame-production-release-verify">
      <h3 id="verification-frame-production-release-verify">Verify</h3>
      <dl class="ef-verification-frame__facts">
        <div><dt>Environment</dt><dd><span class="ef-critical-value" data-ef-verify="true">prod-eu-west-1</span></dd></div>
        <div><dt>Commit</dt><dd><span class="ef-identifier">9f3c1a7e0b</span></dd></div>
        <div><dt>Integration tests</dt><dd>Passed · 148 of 148</dd></div>
        <div><dt>Security scan</dt><dd>Last run 26 hours ago (stale)</dd></div>
      </dl>
      <p><strong>Unresolved work:</strong> the security scan is older than the 24-hour release policy.</p>
    </section>
    <footer class="ef-verification-frame__act">
      <p>Release is available after a current security scan.</p>
      <button type="button">Run security scan</button>
    </footer>
  </section>
</ef-verification-frame>`
    },
    {
      id: "payment-approval",
      title: "Payment approval with long identifiers",
      description: "Content stress: a long IBAN and a long payee name wrap inside their fact cells. The critical amount carries the deliberate-verification cue, and both a review action and the approval come from the application's current capabilities.",
      html: `<ef-verification-frame class="ef-component-tag">
  <section class="ef-verification-frame" aria-labelledby="verification-frame-payment-approval-title">
    <header class="ef-verification-frame__recognize">
      <span class="ef-component-kicker">Recognition</span>
      <h2 id="verification-frame-payment-approval-title">Approve outgoing payment</h2>
      <p>The payee's bank details changed 3 days ago. Check them against the supplier record before approving.</p>
    </header>
    <section class="ef-verification-frame__verify" aria-labelledby="verification-frame-payment-approval-verify">
      <h3 id="verification-frame-payment-approval-verify">Verify</h3>
      <dl class="ef-verification-frame__facts">
        <div><dt>Payee</dt><dd>Hanseatische Maschinenbau- und Anlagentechnik GmbH</dd></div>
        <div><dt>IBAN</dt><dd><span class="ef-identifier">DE89370400440532013000</span></dd></div>
        <div><dt>Amount</dt><dd><span class="ef-critical-value" data-ef-verify="true">€148,200.00</span></dd></div>
        <div><dt>Bank details changed</dt><dd><time datetime="2026-09-27">27 September 2026</time> by M. Chen</dd></div>
      </dl>
    </section>
    <footer class="ef-verification-frame__act">
      <p>You are the second approver for this payment.</p>
      <button type="button">Open supplier record</button>
      <button type="button">Approve payment</button>
    </footer>
  </section>
</ef-verification-frame>`
    },
    {
      id: "mobile-case-closure",
      title: "Mobile case closure",
      description: "At phone width facts stack in one column and the actions become full-width buttons below the facts.",
      mobile: {
        height: 640,
        notes: [
          "The facts grid uses `minmax(min(100%, 12rem), 1fr)`, so at 320px each fact takes a full row.",
          "At 30rem and below the act area becomes a one-column grid; each button is full width, wraps long labels and keeps a 2.75rem minimum height.",
          "Headings, facts and buttons wrap anywhere, so long identifiers never cause horizontal scrolling, even at 200% text.",
          "Actions stay after the facts in portrait and landscape, so users meet the facts before the buttons."
        ]
      },
      html: `<ef-verification-frame class="ef-component-tag">
  <section class="ef-verification-frame" aria-labelledby="verification-frame-mobile-title">
    <header class="ef-verification-frame__recognize">
      <span class="ef-component-kicker">Recognition</span>
      <h2 id="verification-frame-mobile-title">Close case CASE-4407</h2>
      <p>The customer confirmed the refund arrived.</p>
    </header>
    <section class="ef-verification-frame__verify" aria-labelledby="verification-frame-mobile-verify">
      <h3 id="verification-frame-mobile-verify">Verify</h3>
      <dl class="ef-verification-frame__facts">
        <div><dt>Refund</dt><dd><span class="ef-critical-value">$84.00</span></dd></div>
        <div><dt>Confirmed</dt><dd>Today, 10:14</dd></div>
      </dl>
    </section>
    <footer class="ef-verification-frame__act">
      <button type="button">Close case and notify customer</button>
    </footer>
  </section>
</ef-verification-frame>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "root and verify section", values: "id of a heading", default: "—", description: "Names the frame by its recognition heading and the verify region by its heading." },
      { name: "data-ef-verify", on: ".ef-critical-value", values: "true", default: "absent", description: "Adds a double underline to a value that must be read deliberately. Descriptive presentation only; it does not assert that the value was verified." },
      { name: "data-state", on: ".ef-status-lozenge", values: "ok | attention | blocked | unknown", default: "absent", description: "Adds a symbol to an application-reported state shown in the recognize part." },
      { name: "datetime", on: "time", values: "ISO date or date-time", default: "—", description: "Machine-readable timestamp for freshness facts." }
    ],
    hooks: {
      "ef-verification-frame": "Root bordered grid of the three parts.",
      "ef-verification-frame__recognize": "Header part with a bottom rule: kicker, heading and the application-reported state.",
      "ef-verification-frame__verify": "The part to read deliberately: heading, facts and unresolved work.",
      "ef-verification-frame__facts": "A `dl` laid out as an auto-fit grid of fact cells at least 12rem wide, each with a bottom rule and a small secondary-color `dt`.",
      "ef-verification-frame__act": "Footer part with a top rule. A wrapping flex row; a leading `p` takes the remaining width. One full-width column at 30rem and below."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Reaches the actions only after the facts in source order. No added keyboard behavior." },
      { keys: "Enter / Space", action: "Activates the focused native button; the effect is application-owned." }
    ],
    events: [
      { name: "click", description: "Native click on act buttons. The application performs the transition after re-checking legality." }
    ],
    form: "Not a form control. Act buttons may submit an application form that wraps the frame."
  },
  states: [
    { name: "Reported state", how: "text (and optional .ef-status-lozenge) in the recognize part", description: "Whatever the application reports, such as ready, stale, unknown or reconciling, shown without strengthening it." },
    { name: "Deliberate value", how: ".ef-critical-value[data-ef-verify=\"true\"]", description: "Bold mono value with a double underline." },
    { name: "Stacked actions", how: "@media (max-width: 30rem)", description: "Act area becomes one column of full-width buttons." },
    { name: "Forced colors", how: "@media (forced-colors: active)", description: "Frame border and verified-value underline use CanvasText." }
  ],
  accessibility: {
    forma: [
      "Places facts before actions in source, visual and focus order.",
      "Separates the three parts with rules and headings rather than color.",
      "Wraps every heading, fact and button label anywhere and stacks actions at narrow widths, keeping the frame within 320px at 200% text."
    ],
    consumer: [
      "Render only actions the application or Ordo currently allows, and re-check legality when an action is taken.",
      "Report unknown, stale, partial and reconciling states as themselves; never show them as success or failure.",
      "Label every fact and include units and freshness where they matter.",
      "Use `.ef-identifier` and `.ef-critical-value` for codes, amounts and targets that are easy to misread.",
      "Announce the outcome of the action in text after it completes."
    ]
  },
  responsive: [
    "Root and parts set `min-inline-size: 0` and `max-inline-size: 100%`; headings, paragraphs, facts and buttons wrap anywhere.",
    "Facts: `repeat(auto-fit, minmax(min(100%, 12rem), 1fr))`, one fact per row on phones.",
    "Act area: wrapping flex row with a flexible leading paragraph; at 30rem and below a single-column grid of full-width, wrapping buttons."
  ],
  motion: [
    "No animation: the frame is static. Deliberate verification is supported by structure and a pause in the flow, not by motion. Buttons keep only the base perceptual hover and press color change."
  ],
  guidance: {
    do: [
      "State in the recognize part what the user is about to do, in plain words.",
      "List unresolved work explicitly, even when there is none."
    ],
    avoid: [
      "Showing an action because the facts look fine; legality comes from application or Ordo state.",
      "Hiding facts behind a disclosure when they are needed to decide."
    ]
  },
  related: [
    { slug: "identifier", note: "Low-context identifiers and critical values used in the Verify part." },
    { slug: "attention-path", note: "Declares first-glance order across competing regions." },
    { slug: "readiness-checklist", note: "Lists prerequisites; can sit inside the Verify part." },
    { slug: "understanding", note: "Reviews proposed understanding and conflicts before a transition." }
  ]
};
