export default {
  name: "Reorder states",
  category: "data",
  behavior: "Application / Limen",
  summary: "Presentation hooks for dragging, displaced siblings, drop candidates, accepted/rejected drops and post-release settling.",
  purpose: {
    description: "Reorder states are not a component of their own but a shared set of attribute hooks an application writes on items while the user moves them: `data-ef-manipulation` for the motion phase (dragging, displaced, settling, resizing) and `data-ef-drop` for the drop outcome (candidate, accepted, rejected), plus `--ef-drag-x` and `--ef-drag-y` for the live offset. Forma turns them into presentation: the dragged item tracks the offset with no lag and a lifting shadow, released and displaced items settle with a damped inertial response that never overshoots, and drop targets get dashed, solid or dashed-and-filled outlines. Pointer handling, keyboard reordering, legality checks and announcements are Limen/application behavior; the native move buttons remain the non-drag path.",
    useWhen: [
      "An application implements drag-to-reorder or drag-between-lanes on [[ranking]], [[lane-board]] or a similar list and needs consistent visual feedback.",
      "A drop can be refused and the item must visibly return to its authoritative position.",
      "Keyboard moves should end in the same visual state as pointer moves."
    ],
    avoidWhen: [
      "There is no application behavior writing the hooks: static markup with these attributes only illustrates states.",
      "Resizing panes: use [[resizable-split-pane]], which uses the same `data-ef-manipulation=\"resizing\"` phase with its own `--ef-split-size`.",
      "Order is chosen once from a short list without movement: use [[select]] or [[choice-group]]."
    ],
    characteristics: [
      "Direct phase: `dragging` and `resizing` use `--ef-motion-direct-duration` (0ms), so the item follows the application-supplied offset exactly.",
      "Settling and displacement use `--ef-motion-inertia-duration` with `--ef-motion-damped-easing`: no overshoot past the final position.",
      "Drop outcomes differ by outline style, not only color: candidate dashed, accepted solid, rejected dashed with a secondary fill.",
      "All hooks are attribute selectors, so they work on any element; mass comes from the nearest motion scope such as `.ef-ranking[data-ef-motion-weight]`."
    ]
  },
  examples: [
    {
      id: "accepted-drop",
      title: "Accepted drop settling into place",
      description: "The application accepted the move of Delivery speed to position 1. The moved item shows the solid accepted outline while it settles, its former neighbor is marked displaced, and the live region states the new order in words.",
      html: `<ef-reorder-states class="ef-component-tag">
  <fieldset class="ef-ranking">
    <legend class="ef-ranking__legend">Rank what matters most in a supplier</legend>
    <ol class="ef-ranking__list">
      <li class="ef-ranking__item" data-ef-rank="1" data-ef-drop="accepted" data-ef-manipulation="settling">
        <span class="ef-ranking__position" aria-hidden="true">1</span>
        <span class="ef-ranking__label">Delivery speed</span>
        <span class="ef-ranking__actions">
          <button type="button" disabled aria-label="Move Delivery speed up">↑</button>
          <button type="button" aria-label="Move Delivery speed down">↓</button>
        </span>
      </li>
      <li class="ef-ranking__item" data-ef-rank="2" data-ef-manipulation="displaced">
        <span class="ef-ranking__position" aria-hidden="true">2</span>
        <span class="ef-ranking__label">Reliability</span>
        <span class="ef-ranking__actions">
          <button type="button" aria-label="Move Reliability up">↑</button>
          <button type="button" aria-label="Move Reliability down">↓</button>
        </span>
      </li>
      <li class="ef-ranking__item" data-ef-rank="3">
        <span class="ef-ranking__position" aria-hidden="true">3</span>
        <span class="ef-ranking__label">Cost efficiency</span>
        <span class="ef-ranking__actions">
          <button type="button" aria-label="Move Cost efficiency up">↑</button>
          <button type="button" disabled aria-label="Move Cost efficiency down">↓</button>
        </span>
      </li>
    </ol>
    <p class="ef-ranking__announcement" aria-live="polite" aria-atomic="true">Delivery speed moved to position 1 of 3.</p>
  </fieldset>
</ef-reorder-states>`
    },
    {
      id: "keyboard-move-light",
      title: "Keyboard move with a light motion weight",
      description: "The user pressed Move down on Onboarding. There is no drag and no drop target: the application swaps the items and writes `settling` on the moved item and `displaced` on the sibling, so the keyboard path ends in the same visual state as a drag. The light weight on the ranking scope shortens the settle.",
      html: `<ef-reorder-states class="ef-component-tag">
  <fieldset class="ef-ranking" data-ef-motion-weight="light">
    <legend class="ef-ranking__legend">Order the release checklist</legend>
    <ol class="ef-ranking__list">
      <li class="ef-ranking__item" data-ef-rank="1" data-ef-manipulation="displaced">
        <span class="ef-ranking__position" aria-hidden="true">1</span>
        <span class="ef-ranking__label">Security review</span>
        <span class="ef-ranking__actions">
          <button type="button" disabled aria-label="Move Security review up">↑</button>
          <button type="button" aria-label="Move Security review down">↓</button>
        </span>
      </li>
      <li class="ef-ranking__item" data-ef-rank="2" data-ef-manipulation="settling">
        <span class="ef-ranking__position" aria-hidden="true">2</span>
        <span class="ef-ranking__label">Onboarding documentation</span>
        <span class="ef-ranking__actions">
          <button type="button" aria-label="Move Onboarding documentation up">↑</button>
          <button type="button" disabled aria-label="Move Onboarding documentation down">↓</button>
        </span>
      </li>
    </ol>
    <p class="ef-ranking__announcement" aria-live="polite" aria-atomic="true">Onboarding documentation moved down to position 2 of 2.</p>
  </fieldset>
</ef-reorder-states>`
    },
    {
      id: "mobile-drag-in-progress",
      title: "Mobile drag in progress",
      description: "A touch drag at phone width. The dragged item is offset by the application-written `--ef-drag-y` and lifted with a shadow; the item under it is the drop candidate with a dashed outline. The move buttons stay available as the non-drag path.",
      mobile: {
        height: 460,
        notes: [
          "At 44rem and below each ranking item stacks: position and label on the first row, move buttons in a full-width two-column row below, so the non-drag path keeps 2.75rem touch targets.",
          "The drag offset is whatever the application writes to `--ef-drag-y`; Forma adds no lag, so the item stays under the finger. Auto-scrolling the page during a drag is application behavior.",
          "The candidate outline is 2px dashed and offset 2px outside the item, so it remains visible next to the lifted item.",
          "Orientation changes do not alter any hook; the application should cancel or recompute an in-progress drag if the layout reflows."
        ]
      },
      html: `<ef-reorder-states class="ef-component-tag">
  <fieldset class="ef-ranking">
    <legend class="ef-ranking__legend">Rank your preferred contact methods</legend>
    <ol class="ef-ranking__list">
      <li class="ef-ranking__item" data-ef-rank="1" data-ef-drop="candidate" data-ef-manipulation="displaced">
        <span class="ef-ranking__position" aria-hidden="true">1</span>
        <span class="ef-ranking__label">Email</span>
        <span class="ef-ranking__actions">
          <button type="button" disabled aria-label="Move Email up">↑</button>
          <button type="button" aria-label="Move Email down">↓</button>
        </span>
      </li>
      <li class="ef-ranking__item" data-ef-rank="2" data-ef-manipulation="dragging" style="--ef-drag-y: -1.5rem">
        <span class="ef-ranking__position" aria-hidden="true">2</span>
        <span class="ef-ranking__label">Text message</span>
        <span class="ef-ranking__actions">
          <button type="button" aria-label="Move Text message up">↑</button>
          <button type="button" disabled aria-label="Move Text message down">↓</button>
        </span>
      </li>
    </ol>
    <p class="ef-ranking__announcement" aria-live="polite" aria-atomic="true">Dragging Text message. Release to place it at position 1.</p>
  </fieldset>
</ef-reorder-states>`
    }
  ],
  api: {
    attributes: [
      { name: "data-ef-manipulation", on: "the moving or affected item", values: "dragging | resizing | displaced | settling", default: "absent", description: "Motion phase written by the application. `dragging`/`resizing` track directly; `displaced`/`settling` return with damped settling. Remove it when the item is at rest." },
      { name: "data-ef-drop", on: "a drop target or dropped item", values: "candidate | accepted | rejected", default: "absent", description: "Drop presentation written by the application once it knows the target and the result. Remove it when the interaction ends." },
      { name: "style", on: "the moving item", values: "--ef-drag-x / --ef-drag-y lengths", default: "0px", description: "Application-written live offset of the item from its authoritative position. Reset to 0 on release so the item settles home." },
      { name: "data-ef-motion-weight", on: ".ef-ranking or another motion scope", values: "light | standard | heavy", default: "standard", description: "Perceived mass for settling within the scope. Presentation only; never encodes importance." },
      { name: "data-ef-rank", on: ".ef-ranking__item", values: "integer", default: "—", description: "Current position, maintained by the application as items move." },
      { name: "disabled", on: "move button", values: "boolean", default: "absent", description: "Disables a move that is not possible (first item up, last item down)." },
      { name: "aria-live", on: ".ef-ranking__announcement", values: "polite", default: "—", description: "Application-written text reporting each move, rejection or cancellation." },
      { name: "aria-atomic", on: ".ef-ranking__announcement", values: "true", default: "—", description: "Announces the whole message on each change." }
    ],
    hooks: {
      "data-ef-manipulation": "Applies `translate: var(--ef-drag-x) var(--ef-drag-y)` with a damped inertial transition. `dragging` and `resizing` switch to the 0ms direct duration, raise the item (`z-index: 1`), add a lifting shadow and a grabbing cursor.",
      "data-ef-drop": "`candidate`: 2px dashed accent outline. `accepted`: 2px solid accent outline. `rejected`: 2px dashed border-color outline plus a secondary surface fill. All offset 2px; CanvasText outlines in forced colors.",
      "--ef-drag-x": "Horizontal offset from the authoritative position, written by the application. Default 0px.",
      "--ef-drag-y": "Vertical offset from the authoritative position, written by the application. Default 0px.",
      "--ef-motion-inertia-duration": "Settling duration, derived from the scope's mass, stiffness and damping (214ms at standard weight, clamped to 110–420ms).",
      "--ef-motion-damped-easing": "Settling easing, `cubic-bezier(0.2, 0.8, 0.2, 1)`: decelerates without overshoot.",
      "--ef-motion-direct-duration": "Duration used during the direct phase: 0ms."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves between the native move buttons of each item." },
      { keys: "Enter / Space on a move button", action: "Activates the button; the application moves the item, writes the settling hooks and announces the result." },
      { keys: "Escape during a drag", action: "Not native: if the application supports keyboard-initiated drags, it must implement cancel and restore the authoritative order." }
    ],
    events: [
      { name: "click", description: "Native click on move buttons, the required non-drag path." }
    ],
    form: "The hooks carry no form data. If the order is submitted, the application writes it into form fields (for example hidden inputs or `data-ef-rank`-derived values) itself."
  },
  states: [
    { name: "At rest", how: "no data-ef-manipulation", description: "Item at its authoritative position; no offset." },
    { name: "Dragging", how: "data-ef-manipulation=\"dragging\" plus --ef-drag-x/-y", description: "Tracks the offset with no transition, raised with a shadow and grabbing cursor." },
    { name: "Displaced", how: "data-ef-manipulation=\"displaced\"", description: "A sibling moving out of the way with damped settling." },
    { name: "Settling", how: "data-ef-manipulation=\"settling\"", description: "Released item returning to its final position with damped settling, no overshoot." },
    { name: "Drop candidate", how: "data-ef-drop=\"candidate\"", description: "Dashed outline on the prospective target." },
    { name: "Drop accepted", how: "data-ef-drop=\"accepted\"", description: "Solid outline; set only after the application accepts the move." },
    { name: "Drop rejected", how: "data-ef-drop=\"rejected\"", description: "Dashed outline and filled background while the item returns to its authoritative position; the reason is announced in text." }
  ],
  accessibility: {
    forma: [
      "Distinguishes candidate, accepted and rejected by outline style and fill, not by color alone, and uses CanvasText outlines in forced-colors mode.",
      "Never delays the dragged item: the direct phase has a 0ms transition.",
      "Under `prefers-reduced-motion: reduce` settling and displacement become effectively instant, so items appear at their final position."
    ],
    consumer: [
      "Always provide native move buttons (or another keyboard path) that produce the same final order as dragging.",
      "Announce moves, rejections and cancellations in a polite live region with the item name and new position.",
      "Set `data-ef-drop=\"accepted\"` only after the move is legal and applied; on rejection reset the offset to 0 so the item returns home.",
      "Remove the hooks when the interaction ends so no item is left in a transient state.",
      "Implement pointer capture, touch handling, auto-scroll and cancel in Limen/application code."
    ]
  },
  responsive: [
    "The hooks themselves have no breakpoints; layout comes from the host component (for example [[ranking]] stacks its move buttons at 44rem and below).",
    "Offsets are lengths supplied by the application; recompute them if the host layout changes during a drag.",
    "The lifted shadow and outlines sit outside the item box and do not change layout, so nothing reflows during a drag."
  ],
  motion: [
    "Dragging and resizing are direct manipulation: `translate` follows `--ef-drag-x/-y` with `--ef-motion-direct-duration` (0ms), so there is no pointer lag.",
    "Settling and displacement use the inertial model with damped easing: `translate` transitions over `--ef-motion-inertia-duration` (214ms at standard weight) and decelerates into place without overshoot.",
    "Mass comes from the enclosing motion scope's `data-ef-motion-weight`: light settles faster, heavy slower and more damped. Weight never signals importance.",
    "Interruption re-targets from the current position because the transition always runs toward the latest offset the application writes.",
    "Drop outlines change instantly; they are state cues, not animated.",
    "Under `prefers-reduced-motion: reduce` the transition duration is 0.01ms, so items are placed directly at their final position."
  ],
  guidance: {
    do: [
      "Write `settling` on release and reset the offset to 0 in the same frame, so the item glides home from where it was dropped.",
      "Use `displaced` on siblings only to preview placement; keep the candidate position unambiguous."
    ],
    avoid: [
      "Making drag the only way to reorder.",
      "Showing `accepted` before the application has validated the move.",
      "Adding custom transitions on the dragged item, which would introduce lag."
    ]
  },
  related: [
    { slug: "ranking", note: "The ordered-choice list most often hosting these hooks, with native move buttons." },
    { slug: "lane-board", note: "Moves items between lanes using the same drop and manipulation hooks." },
    { slug: "resizable-split-pane", note: "Uses the `resizing` phase with a clamped `--ef-split-size` instead of drag offsets." },
    { slug: "allocation", note: "Distributes a total across items without reordering them." }
  ]
};
