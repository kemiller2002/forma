export default {
  name: "Steps",
  category: "site",
  behavior: "Site content",
  summary: "Numbered method or process using CSS counters on a native ordered list.",
  purpose: {
    description: "Steps present a short method or procedure as a native `ol`. Forma removes the default markers and draws a two-digit counter (01, 02, …) in the mono face before each item, with rules between items. Because list styling is removed, the pattern adds `role=\"list\"` so browsers that drop list semantics for unstyled lists still announce it as a list with its count. Steps are static content: there is no current step or completion state.",
    useWhen: [
      "Describing how an engagement, method or installation proceeds, in order.",
      "Each step is one sentence or a short paragraph.",
      "Pairing an install procedure with a [[code-sample]] on a product page."
    ],
    avoidWhen: [
      "Users are moving through a multi-step form and need to see progress: use [[wizard]] or [[survey-progress]].",
      "Showing events with dates: use [[timeline]].",
      "The items are ordered destinations with links: use [[entry-index]]."
    ],
    characteristics: [
      "Numbers come from a CSS counter, so they always match item order; they are decorative and assistive technology announces the list position instead.",
      "The number column keeps its width while the text wraps beside it.",
      "Item text uses the tone's primary text color."
    ]
  },
  examples: [
    {
      id: "install-procedure",
      title: "Installation procedure with a code sample",
      description: "A product install section: the steps sit in the primary column of a split and the matching command in the supporting column. Inline `code` stays legible inside a step.",
      html: `<ef-steps class="ef-component-tag">
  <div class="ef-site">
    <section class="ef-section" aria-labelledby="steps-install-procedure-title">
      <div class="ef-split">
        <div>
          <p class="ef-eyebrow">Install</p>
          <h3 id="steps-install-procedure-title">Three steps to a first report</h3>
          <ol class="ef-steps" role="list" aria-label="Installation">
            <li>Add <code>example-quality</code> to the repository's tool manifest.</li>
            <li>Run the baseline collection on the main branch.</li>
            <li>Publish the report from CI on every pull request.</li>
          </ol>
        </div>
        <figure class="ef-code-figure">
          <figcaption id="steps-install-procedure-code">Collect a baseline</figcaption>
          <pre class="ef-code" tabindex="0" aria-labelledby="steps-install-procedure-code"><code>example-quality collect --baseline</code></pre>
        </figure>
      </div>
    </section>
  </div>
</ef-steps>`
    },
    {
      id: "long-method",
      title: "Ten-step method with long items",
      description: "A longer method on the surface tone. Numbers keep two digits (01 to 10) so the text column stays aligned, and multi-line items wrap beside their number.",
      html: `<ef-steps class="ef-component-tag">
  <div class="ef-site">
    <div data-ef-tone="surface">
      <ol class="ef-steps" role="list" aria-label="Diagnostic method">
        <li>Understand the domain, its constraints and the decisions people make inside it.</li>
        <li>Collect the reported symptoms without explaining them yet.</li>
        <li>Group symptoms that recur together across teams, releases and environments.</li>
        <li>Name candidate mechanisms for each group.</li>
        <li>Design observations that would distinguish between the candidates.</li>
        <li>Run the observations and record the results.</li>
        <li>Eliminate candidates the evidence contradicts.</li>
        <li>State the remaining cause and the evidence for it.</li>
        <li>Propose treatment and prevention, with the cost of each.</li>
        <li>Agree how the treatment will be verified after release.</li>
      </ol>
    </div>
  </div>
</ef-steps>`
    },
    {
      id: "mobile-method",
      title: "Phone method",
      description: "A four-step engagement method at phone width with longer step text.",
      mobile: {
        height: 380,
        notes: [
          "The counter column keeps its minimum width and each item's text wraps beside it, so numbers stay aligned at 320px.",
          "Items have no fixed height; text-spacing overrides and 200% text grow the rows instead of clipping them.",
          "There are no interactive targets; any links inside a step keep the shell's underline and focus ring.",
          "Orientation changes only reflow line breaks."
        ]
      },
      html: `<ef-steps class="ef-component-tag">
  <div class="ef-site">
    <ol class="ef-steps" role="list" aria-label="Engagement method">
      <li>Understand the domain and its constraints before proposing anything.</li>
      <li>Identify recurring symptom patterns across teams.</li>
      <li>Trace the causal mechanism with evidence.</li>
      <li>Deliver treatment and prevention, then verify both.</li>
    </ol>
  </div>
</ef-steps>`
    }
  ],
  api: {
    attributes: [
      { name: "role", on: "ol.ef-steps", values: "list", default: "—", description: "Restores list semantics that some browsers drop when list-style is removed." },
      { name: "aria-label", on: "ol.ef-steps", values: "string", default: "—", description: "Names the procedure when no visible heading introduces it directly." }
    ],
    hooks: {
      "ef-steps": "The `ol`. Resets the `ef-step` counter, removes default markers and padding, and draws a top rule; each direct `li` increments the counter, shows it as a two-digit mono number, and draws a bottom rule."
    },
    keyboard: [
      { keys: "—", action: "Not interactive. Links placed inside a step follow native link behavior." }
    ],
    events: []
  },
  states: [
    { name: "Default", how: "no attributes", description: "Static numbered list; there is no current or completed step." },
    { name: "Toned", how: "data-ef-tone on an ancestor", description: "Text and rules follow the surrounding surface tone." }
  ],
  accessibility: {
    forma: [
      "Uses a native ordered list, so position and count are announced.",
      "Generates numbers with CSS counters that always match source order.",
      "Keeps text at primary contrast on every tone."
    ],
    consumer: [
      "Keep `role=\"list\"` on the `ol`.",
      "Introduce the steps with a heading or `aria-label`.",
      "Do not refer to steps only by their visual number in other text; name the step."
    ]
  },
  responsive: [
    "Each item is a flex row: a fixed-width counter and a wrapping text column. No breakpoints.",
    "Items grow with their content; there are no fixed heights."
  ],
  motion: [
    "No animation: steps are static and have no hover or focus states."
  ],
  guidance: {
    do: [
      "Start each step with a verb.",
      "Keep steps to one action or idea each."
    ],
    avoid: [
      "Typing numbers into the step text; the counter already numbers it.",
      "Using steps to show live progress; they have no state."
    ]
  },
  related: [
    { slug: "wizard", note: "For multi-step tasks with a current step and progress." },
    { slug: "timeline", note: "For dated events rather than a method." },
    { slug: "entry-index", note: "For ordered entries that link to destinations." },
    { slug: "code-sample", note: "Often paired with install steps." }
  ]
};
