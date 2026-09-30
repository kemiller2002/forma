export default {
  name: "Conversation",
  category: "assisted",
  behavior: "Application / Limen",
  summary: "Inspectable user/application turns with explicit speakers and no consumer-chat authority assumptions.",
  owns: ["ef-conversation","ef-turn"],
  purpose: {
    description: "A conversation renders an ordered history of turns between people and an application or agent. It is an `ol` of `.ef-turn` items, each with a visible speaker label, content that can hold any structured HTML, and optional application-supplied actions. It deliberately avoids chat-bubble conventions: turns are full-width rows with the speaker in a label column, so position, alignment or color never suggest who is right, trusted or in charge. Application turns get a tinted background only to separate them; the speaker text is the real cue. Sending, streaming, retrying and what the turns mean are application or Limen behavior.",
    useWhen: [
      "Users exchange messages with an assistant or application and need to inspect what each party said.",
      "Turns contain structured content (lists, facts, links) and actions such as reviewing a proposal.",
      "The history must be readable as a document, for audit or handover, not only as a live chat."
    ],
    avoidWhen: [
      "Only the latest input matters: use [[composer]] alone.",
      "The application's interpretation needs item-by-item review before a transition: use [[understanding]].",
      "The content is an activity log of system events: use [[timeline]] or [[feed-item]].",
      "An agent is handing a proposed consequence to a human for approval: use [[handoff-summary]]."
    ],
    characteristics: [
      "Each turn is a two-column grid: speaker label (`minmax(6rem, 0.22fr)`) and content; actions align under the content.",
      "The speaker label is mono uppercase text on every turn, including the user's.",
      "`data-ef-speaker=\"assistant\"` tints the turn background; any other value is unstyled.",
      "At 40rem and below each turn is one column and turn actions are full width."
    ]
  },
  examples: [
    {
      id: "multi-party",
      title: "Multi-party care conversation",
      description: "Two people and an application in one history. Every turn names its speaker; the application turn contains a structured list and an action to review its proposal. Nothing about layout or color says whose statement is correct.",
      html: `<ef-conversation class="ef-component-tag">
  <section class="ef-conversation" aria-labelledby="conversation-multi-party-title">
    <header class="ef-conversation__header">
      <span class="ef-component-kicker">Care team</span>
      <h2 id="conversation-multi-party-title">Medication follow-up</h2>
    </header>
    <ol class="ef-conversation__turns">
      <li class="ef-turn" data-ef-speaker="user">
        <p class="ef-turn__speaker">Maria (daughter)</p>
        <div class="ef-turn__content"><p>The pharmacy gave Dad 20 mg tablets, but the doctor said 40 mg.</p></div>
      </li>
      <li class="ef-turn" data-ef-speaker="user">
        <p class="ef-turn__speaker">Nurse Kim</p>
        <div class="ef-turn__content"><p>Two 20 mg tablets once a day is correct until the new prescription arrives.</p></div>
      </li>
      <li class="ef-turn" data-ef-speaker="assistant">
        <p class="ef-turn__speaker">Care record assistant</p>
        <div class="ef-turn__content">
          <p>I can propose these record updates:</p>
          <ul>
            <li>Dose: 40 mg once daily, taken as 2 × 20 mg</li>
            <li>Note: new prescription pending</li>
          </ul>
        </div>
        <div class="ef-turn__actions"><button type="button">Review proposed updates</button></div>
      </li>
    </ol>
  </section>
</ef-conversation>`
    },
    {
      id: "failed-turn",
      title: "Application turn that could not complete",
      description: "The application could not finish a request. Its turn says so in text with a status lozenge and offers a retry, and the user's original message stays visible so nothing they wrote is lost.",
      html: `<ef-conversation class="ef-component-tag">
  <section class="ef-conversation" aria-labelledby="conversation-failed-turn-title">
    <header class="ef-conversation__header">
      <span class="ef-component-kicker">Conversation</span>
      <h2 id="conversation-failed-turn-title">Travel booking</h2>
    </header>
    <ol class="ef-conversation__turns">
      <li class="ef-turn" data-ef-speaker="user">
        <p class="ef-turn__speaker">You</p>
        <div class="ef-turn__content"><p>Move my Lisbon flight to Friday morning and keep the aisle seat.</p></div>
      </li>
      <li class="ef-turn" data-ef-speaker="assistant">
        <p class="ef-turn__speaker">Booking assistant</p>
        <div class="ef-turn__content">
          <p><span class="ef-status-lozenge" data-state="unknown">Not completed</span></p>
          <p>The airline did not respond, so I don't know whether Friday seats are available. Your current booking is unchanged.</p>
        </div>
        <div class="ef-turn__actions"><button type="button">Try again</button><button type="button">Contact an agent</button></div>
      </li>
    </ol>
  </section>
</ef-conversation>`
    },
    {
      id: "mobile-history",
      title: "Mobile history",
      description: "At phone width the speaker label sits above each turn's content and actions become full-width buttons.",
      mobile: {
        height: 520,
        notes: [
          "At 40rem and below each turn is a single column: speaker label, then content, then actions.",
          "Turn action buttons become full width and keep the 2.75rem base height for touch.",
          "Turns are full-width rows, not side-aligned bubbles, so nothing is squeezed into a narrow column at 320px and long words wrap within the content.",
          "Order is the document order of the list; the application decides whether to scroll to the newest turn after rotation or a new message."
        ]
      },
      html: `<ef-conversation class="ef-component-tag">
  <section class="ef-conversation" aria-labelledby="conversation-mobile-title">
    <header class="ef-conversation__header">
      <span class="ef-component-kicker">Conversation</span>
      <h2 id="conversation-mobile-title">Expense help</h2>
    </header>
    <ol class="ef-conversation__turns">
      <li class="ef-turn" data-ef-speaker="user">
        <p class="ef-turn__speaker">You</p>
        <div class="ef-turn__content"><p>Can I claim the taxi from the airport?</p></div>
      </li>
      <li class="ef-turn" data-ef-speaker="assistant">
        <p class="ef-turn__speaker">Expense assistant</p>
        <div class="ef-turn__content"><p>Airport taxis are claimable up to $80 with a receipt.</p></div>
        <div class="ef-turn__actions"><button type="button">Start a taxi claim</button></div>
      </li>
    </ol>
  </section>
</ef-conversation>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-labelledby", on: "root section", values: "id of the conversation heading", default: "—", description: "Names the conversation region." },
      { name: "data-ef-speaker", on: ".ef-turn", values: "assistant | user", default: "absent", description: "Speaker category for presentation. `assistant` tints the turn; `user` (or absent) is untinted. The visible speaker label is the authoritative cue." },
      { name: "data-state", on: ".ef-status-lozenge", values: "ok | attention | blocked | unknown", default: "absent", description: "Adds a symbol to a text status inside a turn." }
    ],
    hooks: {
      "ef-conversation": "Root bordered region.",
      "ef-conversation__header": "Padded header with a bottom rule for kicker and heading.",
      "ef-conversation__turns": "The ordered list of turns, unstyled and gapless; turns are separated by their own rules.",
      "ef-turn": "One turn: a two-column grid of speaker label and content with a bottom rule.",
      "ef-turn__speaker": "Visible speaker name in small mono uppercase. Required on every turn.",
      "ef-turn__content": "Flow content of the turn; any structured HTML, allowed to shrink.",
      "ef-turn__actions": "Wrapping row of application-supplied actions under the content; full-width buttons at 40rem and below.",
      "data-ef-speaker": "Presentation hook. `assistant` gives the turn the secondary surface background so application turns are distinguishable at a glance; it implies nothing about correctness or authority."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through links and action buttons in turn order. No added keyboard behavior." }
    ],
    events: [
      { name: "click", description: "Native click on turn actions; the application handles it." }
    ],
    form: "Not a form control. Pair with a [[composer]] form for new input."
  },
  states: [
    { name: "User or person turn", how: "data-ef-speaker=\"user\" or absent", description: "Untinted row with a speaker label." },
    { name: "Application turn", how: "data-ef-speaker=\"assistant\"", description: "Secondary surface background; speaker label still required." },
    { name: "Turn outcome", how: "text and optional .ef-status-lozenge in the content", description: "Application-reported outcomes such as not completed or pending, written as text." },
    { name: "Stacked turns", how: "@media (max-width: 40rem)", description: "One column per turn; actions full width." },
    { name: "Forced colors", how: "@media (forced-colors: active)", description: "Root border uses CanvasText; the tint disappears and speaker labels carry the distinction." }
  ],
  accessibility: {
    forma: [
      "Uses an ordered list so turn count and position are exposed.",
      "Puts a visible speaker label on every turn, so speakers are distinguishable without color or alignment.",
      "Keeps turns full width and stacks the speaker label above content on phones, avoiding narrow bubbles and overflow."
    ],
    consumer: [
      "Write the real speaker name on every turn, including agents and the user.",
      "Announce new turns politely (for example through a separate status region) without moving focus away from the composer.",
      "Report failures, pending work and uncertainty in text inside the turn.",
      "Do not present generated text as fact or approval; route consequential proposals to [[understanding]] or [[handoff-summary]]."
    ]
  },
  responsive: [
    "Wide: turn grid `minmax(6rem, 0.22fr) minmax(0, 1fr)`; content can shrink.",
    "At 40rem and below: `grid-template-columns: 1fr`, actions move to the single column and buttons become full width.",
    "Long content wraps inside the content column; wide tables or code in a turn need a [[bounded-overflow]] container."
  ],
  motion: [
    "No animation: turns appear without transitions and there is no typing indicator. Streaming or typing animations are application-owned and must stop under `prefers-reduced-motion: reduce`."
  ],
  guidance: {
    do: [
      "Keep the user's original words visible next to the application's interpretation.",
      "Put actions that change records behind a review step rather than directly in a turn."
    ],
    avoid: [
      "Styling turns as left/right bubbles to signal speaker.",
      "Omitting the speaker label on consecutive turns from the same speaker."
    ]
  },
  related: [
    { slug: "composer", note: "The input surface for the next turn." },
    { slug: "understanding", note: "Item-by-item review of what the application understood." },
    { slug: "handoff-summary", note: "An agent's proposal with retained human authority." },
    { slug: "timeline", note: "A chronological log of events rather than an exchange of turns." }
  ]
};
