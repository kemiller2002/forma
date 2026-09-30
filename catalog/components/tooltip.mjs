export default {
  name: "Tooltip / contextual hint",
  category: "overlays",
  behavior: "Native HTML",
  summary: "Supplemental hint on a native button: opens by click, tap or keyboard (popovertarget) and, where supported, on hover or focus (interestfor); light motion with a static reduced-motion substitute.",
  purpose: {
    description: "A contextual hint explains a term, value or field in one or two sentences without taking space on the page. It is a small native button (`ef-tooltip__trigger`, usually showing \"?\" with a visually hidden name) inside an `ef-tooltip` wrapper, and a `popover` surface (`ef-tooltip__surface`). `popovertarget` opens the hint on click, tap, Enter or Space, so no path depends on hover; Escape or an outside press closes it. Where the browser supports interest invokers, `interestfor` on the same button also opens it on hover or keyboard focus, and the browser owns the delay and hover travel. Where anchor positioning is supported, the hint is placed next to its button with flip fallbacks that keep it in the viewport. The hint is supplemental: required information and essential actions never live only in it.",
    useWhen: [
      "A label, column heading or value uses a term some users will not know (error budget, retention period).",
      "The explanation is short, plain text and the page is complete without it.",
      "A definition applies in several places and repeating it inline would add noise."
    ],
    avoidWhen: [
      "The information is needed to complete the task, such as a format requirement: put it in visible help text (`ef-field__description`) instead.",
      "The content has links, controls or more than a couple of sentences: use [[popover]].",
      "You want to name an icon-only button: give the button a real accessible name (see [[visually-hidden]]); a hint is not a label.",
      "The message reports a result or error: use [[validation-message]], [[alert]] or [[toast]]."
    ],
    characteristics: [
      "The trigger is a 44 by 44px round native button, so the hint is reachable by keyboard, touch and switch access.",
      "The surface is at most `min(20rem, 100vw - 2rem)` wide and wraps long words; inverse colors distinguish it from the page.",
      "Anchor placement above the button (flipping below or to the other side when there is no room) where supported. Without anchor positioning the surface has `margin: 0`, so it opens at the block-start, inline-start corner of the viewport, readable but away from its button.",
      "Light perceived weight: a small upward settle and fade on entry, a shorter exit, and no displacement under reduced motion."
    ]
  },
  examples: [
    {
      id: "metric-definition",
      title: "Metric definition in a summary",
      description: "Two terms in a [[key-value-list]] each carry a hint. The trigger's hidden text names what the hint is about, so a screen-reader user can tell the two buttons apart. Values stay visible on the page; only the definitions are in hints.",
      html: `<ef-tooltip class="ef-component-tag">
  <dl class="ef-key-value-list">
    <div>
      <dt>
        Apdex
        <span class="ef-tooltip">
          <button class="ef-tooltip__trigger" type="button" popovertarget="tooltip-metric-definition-apdex" interestfor="tooltip-metric-definition-apdex"><span aria-hidden="true">?</span><span class="ef-visually-hidden">What is Apdex?</span></button>
          <span class="ef-tooltip__surface" id="tooltip-metric-definition-apdex" popover>A 0 to 1 score of how many requests met the response-time target. 1 means every request was fast enough.</span>
        </span>
      </dt>
      <dd>0.94</dd>
    </div>
    <div>
      <dt>
        p95 latency
        <span class="ef-tooltip">
          <button class="ef-tooltip__trigger" type="button" popovertarget="tooltip-metric-definition-p95" interestfor="tooltip-metric-definition-p95"><span aria-hidden="true">?</span><span class="ef-visually-hidden">What is p95 latency?</span></button>
          <span class="ef-tooltip__surface" id="tooltip-metric-definition-p95" popover>95% of requests completed faster than this time.</span>
        </span>
      </dt>
      <dd>320 ms</dd>
    </div>
  </dl>
</ef-tooltip>`
    },
    {
      id: "long-hint-standard-weight",
      title: "Long translated hint",
      description: "A longer hint in Spanish with `data-ef-motion-weight=\"standard\"` on the wrapper, giving a slightly slower settle than the light default. The surface stops at 20rem and wraps, and long compound words break rather than overflow.",
      html: `<ef-tooltip class="ef-component-tag">
  <p lang="es">
    Periodo de conservación: 90 días
    <span class="ef-tooltip" data-ef-motion-weight="standard">
      <button class="ef-tooltip__trigger" type="button" popovertarget="tooltip-long-hint-standard-weight" interestfor="tooltip-long-hint-standard-weight"><span aria-hidden="true">?</span><span class="ef-visually-hidden">Acerca del periodo de conservación</span></button>
      <span class="ef-tooltip__surface" id="tooltip-long-hint-standard-weight" popover>Los eventos más antiguos que el periodo de conservación se eliminan automáticamente cada noche. Si necesita un registro más largo, expórtelos antes desde la página de auditoría.</span>
    </span>
  </p>
</ef-tooltip>`
    },
    {
      id: "mobile-edge-hint",
      title: "Hint at the edge of a phone screen",
      description: "A hint whose button sits at the far inline end of a row at phone width. The placement fallbacks move the surface to the side with more room so it stays on screen.",
      mobile: {
        height: 300,
        notes: [
          "The trigger stays a 44 by 44px tap target at every width; tapping it opens the hint (popovertarget), and tapping elsewhere closes it. Hover is never required.",
          "Where anchor positioning is supported, the hint prefers the area above the button extending toward the inline end, and falls back to the inline start or below, choosing the area with the most room; its width is limited to that area so it cannot overflow the viewport.",
          "Without anchor positioning the hint opens at the top-start corner of the viewport; `max-inline-size: min(20rem, 100vw - 2rem)` keeps it inside at 320px.",
          "Long text wraps (`overflow-wrap: anywhere`); rotating the phone only changes which fallback area is chosen."
        ]
      },
      html: `<ef-tooltip class="ef-component-tag">
  <div class="ef-cluster">
    <span>Two-step sign-in: Required</span>
    <span class="ef-tooltip">
      <button class="ef-tooltip__trigger" type="button" popovertarget="tooltip-mobile-edge-hint" interestfor="tooltip-mobile-edge-hint"><span aria-hidden="true">?</span><span class="ef-visually-hidden">Why two-step sign-in is required</span></button>
      <span class="ef-tooltip__surface" id="tooltip-mobile-edge-hint" popover>Your organization requires a second step for every account with administrator access.</span>
    </span>
  </div>
</ef-tooltip>`
    }
  ],
  api: {
    attributes: [
      { name: "popovertarget", on: ".ef-tooltip__trigger", values: "id of the surface", default: "—", description: "Required. Opens and closes the hint on click, tap, Enter and Space; the non-hover path." },
      { name: "interestfor", on: ".ef-tooltip__trigger", values: "id of the surface", default: "—", description: "Optional enhancement. Where interest invokers are supported, hover or focus also opens the hint, with browser-owned delays. Ignored elsewhere." },
      { name: "popover", on: ".ef-tooltip__surface", values: "auto (empty)", default: "auto", description: "Makes the surface a top-layer popover that light-dismisses on outside press or Escape." },
      { name: "type", on: ".ef-tooltip__trigger", values: "button", default: "—", description: "Keeps the trigger from submitting a surrounding form." },
      { name: "aria-hidden", on: "the visible \"?\" glyph", values: "true", default: "—", description: "Hides the glyph so the visually hidden text is the trigger's whole name." },
      { name: "data-ef-motion-weight", on: ".ef-tooltip", values: "light | standard | heavy", default: "light", description: "Presentation-only perceived mass for the hint's entry and exit." }
    ],
    hooks: {
      "ef-tooltip": "Inline-flex wrapper that aligns the trigger with surrounding text and scopes the hint's motion (it reduces the motion distance to a small origin-related displacement).",
      "ef-tooltip__trigger": "Round native button, at least 44 by 44px, monospace glyph, no padding.",
      "ef-tooltip__surface": "The popover hint: inverse surface, small text, max-content width up to 20rem, word wrapping, anchor placement with flip fallbacks where supported, and the entry/exit transition.",
      "data-ef-motion-weight": "On `.ef-tooltip`. Presentation-only perceived mass: light (default for hints), standard or heavy.",
      "--ef-tooltip-offset": "Vertical displacement the surface travels from on entry and back to on exit. Default 0.25rem; forced to 0 under reduced motion."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves focus to the trigger. Where interest invokers are supported, keyboard focus can also show the hint after the browser's delay." },
      { keys: "Enter / Space", action: "Toggles the hint (popovertarget)." },
      { keys: "Escape", action: "Closes the open hint." }
    ],
    events: [
      { name: "beforetoggle / toggle", description: "Native popover events on the surface when the hint opens or closes, whichever invoker opened it." }
    ],
    form: "No form participation. The trigger is `type=\"button\"` so it never submits."
  },
  states: [
    { name: "Hidden", how: "surface not :popover-open", description: "Only the trigger is visible." },
    { name: "Open", how: ":popover-open", description: "The hint appears next to the trigger (anchor placement) or at the viewport's top-start corner (fallback), fully opaque." },
    { name: "Flipped", how: "position-try-fallbacks", description: "Where supported, the hint moves below or to the other side when there is not enough room." },
    { name: "Trigger focus", how: ":focus-visible on the trigger", description: "Shared two-tone focus ring on the round button." }
  ],
  accessibility: {
    forma: [
      "Provides a click, tap and keyboard path (popovertarget) so the hint never depends on hover.",
      "Keeps the trigger a native button with a 44 by 44px target.",
      "Keeps the surface within the viewport with placement fallbacks and a width limit.",
      "Uses Canvas/CanvasText with a visible border in forced-colors mode, and removes displacement under reduced motion."
    ],
    consumer: [
      "Give every trigger a unique, specific accessible name with `ef-visually-hidden` text.",
      "Keep required information and actions out of hints; show them on the page.",
      "Keep hint text short, plain and free of links or controls.",
      "Decide any additional focus, timeout or accessible-description policy in application/Limen code."
    ]
  },
  responsive: [
    "The surface is `max-content` wide up to `min(20rem, 100vw - 2rem)` and wraps text anywhere.",
    "With anchor positioning, `position-try-order: most-inline-size` picks the area with the most room and the hint never grows beyond that area.",
    "Without anchor positioning, the hint sits at the viewport's block-start, inline-start corner (the surface resets the popover's auto margins).",
    "The trigger stays 44 by 44px at every width and aligns with surrounding text through `vertical-align: middle`."
  ],
  motion: [
    "Entry: opacity fades by perceptual interpolation while the surface settles from `--ef-tooltip-offset` below its resting position over the light inertial duration with damped easing.",
    "Exit: the reverse over the shorter derived exit duration; `display` and `overlay` are held until it finishes.",
    "`data-ef-motion-weight` on `.ef-tooltip` changes perceived mass; light is the default.",
    "Under `prefers-reduced-motion: reduce` the displacement is removed (the hint only fades) and durations become effectively instant."
  ],
  guidance: {
    do: [
      "Write hints as a single definition or clarification in one or two sentences.",
      "Place the trigger right after the term it explains."
    ],
    avoid: [
      "Putting hints on every label; if most users need it, show it as help text.",
      "Using a hint as the only name of an icon button.",
      "Hiding validation rules or error details in a hint."
    ]
  },
  related: [
    { slug: "popover", note: "For longer or interactive supplemental content." },
    { slug: "text-field", note: "Field help text (`ef-field__description`) for information users need to fill the field." },
    { slug: "visually-hidden", note: "Provides the trigger's accessible name." },
    { slug: "callout", note: "Visible, in-page explanation when the content is important." }
  ]
};
