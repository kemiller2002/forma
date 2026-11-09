export default {
  name: "Start-up screen",
  category: "feedback",
  behavior: "Application state",
  basicInteraction: { kind: "static", reasons: ["application-behavior"] },
  summary: "The first thing a script- or WebAssembly-driven application shows: its identity, indeterminate activity and a meaningful status, rendered from the initial HTML before any runtime exists, with slow, failed, timed-out and no-script states.",
  purpose: {
    description: "A start-up screen covers the time between the first HTML arriving and the application's own runtime taking over. It is authored in the initial HTML and needs only Forma CSS, so it is visible while a WebAssembly or script bundle is still downloading. It shows the application's identity, an indeterminate activity indicator with a status sentence that says what is starting, and a note that appears by itself if the start is slow. The host page's loader marks a failed or timed-out start and the screen replaces the activity with an explanation and a recovery action. The application removes the screen, or sets hidden, once it has mounted.",
    useWhen: [
      "An application renders its interface from WebAssembly or a script bundle, leaving the page blank until it runs.",
      "Start-up can be slow on some connections or devices and the person needs to know the page is working."
    ],
    avoidWhen: [
      "The page is server-rendered and usable as it arrives: show its content instead.",
      "Loading data inside a running application: use [[skeleton]] for a region or [[spinner]] for an action, and keep the shell.",
      "Work with measurable progress: use [[progress-bar]]. The start-up screen never shows a percentage it does not have."
    ],
    characteristics: [
      "Zero runtime: identity, indicator and status render from HTML and CSS alone. Use an inline SVG mark so the identity needs no request either.",
      "The status sentence names the application and the work, never the word Loading alone.",
      "The slow-start note is revealed after --forma-startup-slow-after (default 8s) without script, and at once when the host sets data-forma-state=\"slow\".",
      "Failed and timed-out states remove the indicator and show the problem with a recovery action, so nothing spins forever.",
      "With scripting turned off, the screen says what the application needs instead of starting."
    ]
  },
  examples: [
    {
      id: "slow-start",
      interaction: {kind: "static",reasons: ["application-behavior"]},
      title: "Slow connection: still starting",
      description: "The host marked the start as slow (`data-forma-state=\"slow\"`), so the \"still starting\" note is visible at once. Without the attribute the same note appears by itself after `--forma-startup-slow-after` (8 seconds), with no script. Setting the attribute makes the announcement dependable, because the note then changes inside the status region.",
      html: `<forma-startup class="forma-component-tag">
  <div class="forma-startup" data-forma-extent="region" data-forma-state="slow">
    <span class="forma-app-identity" data-forma-size="64">
      <span class="forma-app-identity__mark">
        <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M6 0h20a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6Zm10 8-8 14h16Z"/></svg>
      </span>
      <span class="forma-app-identity__name">Northwind Ledger</span>
    </span>
    <div class="forma-startup__status" role="status">
      <p class="forma-spinner">
        <span class="forma-spinner__indicator" aria-hidden="true"></span>
        <span class="forma-spinner__label">Starting Northwind Ledger: preparing your workspace</span>
      </p>
      <p class="forma-startup__slow">Still starting. A slow connection can take up to a minute.</p>
    </div>
    <div class="forma-startup__problem" role="alert">
      <p class="forma-startup__problem-title">Northwind Ledger could not start.</p>
      <p>A required file did not load. Your work is not affected.</p>
      <div class="forma-actions">
        <a class="forma-button" href="#startup-slow">Reload</a>
      </div>
    </div>
    <p class="forma-startup__noscript">Northwind Ledger needs JavaScript and WebAssembly. Turn them on in your browser settings, then reload this page.</p>
  </div>
</forma-startup>`
    },
    {
      id: "failed-start",
      interaction: {kind: "static",reasons: ["application-behavior"]},
      title: "Runtime failed to load",
      description: "The host caught a failed download and set `data-forma-state=\"failed\"`. The activity indicator and status are removed so nothing keeps spinning, and the alert explains the failure and offers a reload. Do not offer retry or cancel actions the application cannot perform safely.",
      html: `<forma-startup class="forma-component-tag">
  <div class="forma-startup" data-forma-extent="region" data-forma-state="failed">
    <span class="forma-app-identity" data-forma-size="64">
      <span class="forma-app-identity__mark">
        <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M6 0h20a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6Zm10 8-8 14h16Z"/></svg>
      </span>
      <span class="forma-app-identity__name">Northwind Ledger</span>
    </span>
    <div class="forma-startup__status" role="status">
      <p class="forma-spinner">
        <span class="forma-spinner__indicator" aria-hidden="true"></span>
        <span class="forma-spinner__label">Starting Northwind Ledger: preparing your workspace</span>
      </p>
      <p class="forma-startup__slow">Still starting. A slow connection can take up to a minute.</p>
    </div>
    <div class="forma-startup__problem" role="alert">
      <p class="forma-startup__problem-title">Northwind Ledger could not start.</p>
      <p>A required file did not load. Your work is not affected.</p>
      <div class="forma-actions">
        <a class="forma-button" href="#startup-failed">Reload</a>
      </div>
    </div>
    <p class="forma-startup__noscript">Northwind Ledger needs JavaScript and WebAssembly. Turn them on in your browser settings, then reload this page.</p>
  </div>
</forma-startup>`
    },
    {
      id: "timed-out-start",
      interaction: {kind: "static",reasons: ["application-behavior"]},
      title: "Start timed out",
      description: "The host gave up after its own deadline and set `data-forma-state=\"timed-out\"`. It is presented like a failure but says the application ran out of time, which tells the person that reloading may work.",
      html: `<forma-startup class="forma-component-tag">
  <div class="forma-startup" data-forma-extent="region" data-forma-state="timed-out">
    <span class="forma-app-identity" data-forma-size="64">
      <span class="forma-app-identity__mark">
        <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M6 0h20a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6Zm10 8-8 14h16Z"/></svg>
      </span>
      <span class="forma-app-identity__name">Northwind Ledger</span>
    </span>
    <div class="forma-startup__status" role="status">
      <p class="forma-spinner">
        <span class="forma-spinner__indicator" aria-hidden="true"></span>
        <span class="forma-spinner__label">Starting Northwind Ledger: preparing your workspace</span>
      </p>
      <p class="forma-startup__slow">Still starting. A slow connection can take up to a minute.</p>
    </div>
    <div class="forma-startup__problem" role="alert">
      <p class="forma-startup__problem-title">Northwind Ledger is taking too long to start.</p>
      <p>The application did not finish loading in 60 seconds. Your work is not affected.</p>
      <div class="forma-actions">
        <a class="forma-button" href="#startup-timed-out">Reload</a>
      </div>
    </div>
    <p class="forma-startup__noscript">Northwind Ledger needs JavaScript and WebAssembly. Turn them on in your browser settings, then reload this page.</p>
  </div>
</forma-startup>`
    },
    {
      id: "mobile-start",
      interaction: { kind: "static", reasons: ["application-behavior"] },
      title: "Phone start-up",
      description: "The start-up surface at phone width.",
      mobile: {
        height: 420,
        notes: ["The identity, status and actions stack in one centered column capped at 36rem, so nothing scrolls sideways at 320 pixels.","The 64 pixel mark keeps its size; long application names wrap below it.","The reload action is a full-size link button when a failure is shown."]
      },
      html: `<forma-startup class="forma-component-tag">
  <div class="forma-startup" data-forma-extent="region" data-forma-state="starting">
    <span class="forma-app-identity" data-forma-size="64">
      <span class="forma-app-identity__mark">
        <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M6 0h20a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6Zm10 8-8 14h16Z"/></svg>
      </span>
      <span class="forma-app-identity__name">Northwind Ledger</span>
    </span>
    <div class="forma-startup__status" role="status">
      <p class="forma-spinner">
        <span class="forma-spinner__indicator" aria-hidden="true"></span>
        <span class="forma-spinner__label">Starting Northwind Ledger: preparing your workspace</span>
      </p>
      <p class="forma-startup__slow">Still starting. A slow connection can take up to a minute.</p>
    </div>
    <div class="forma-startup__problem" role="alert">
      <p class="forma-startup__problem-title">Northwind Ledger could not start.</p>
      <p>A required file did not load. Your work is not affected.</p>
      <div class="forma-actions">
        <a class="forma-button" href="#startup-starting">Reload</a>
      </div>
    </div>
    <p class="forma-startup__noscript">Northwind Ledger needs JavaScript and WebAssembly. Turn them on in your browser settings, then reload this page.</p>
  </div>
</forma-startup>`
    }
  ],
  api: {
    attributes: [
      { name: "data-forma-state", on: ".forma-startup", values: "starting | slow | failed | timed-out", default: "starting", description: "Set by the host page's loader. slow shows the slow-start note at once; failed and timed-out replace the status with the problem region." },
      { name: "data-forma-extent", on: ".forma-startup", values: "region", default: "absent (fills the viewport)", description: "Sizes the screen to a 16rem region instead of the full viewport, for an embedded application or a documentation preview." },
      { name: "role", on: ".forma-startup__status", values: "status", default: "—", description: "Polite live region that holds the activity sentence and the slow-start note." },
      { name: "role", on: ".forma-startup__problem", values: "alert", default: "—", description: "Announces the failure or timeout when the host writes or reveals it." }
    ],
    hooks: {
      "forma-startup": "Root: a centered single column filling the viewport (or a region) on the primary surface.",
      "forma-startup__status": "The live status: an [[spinner]] with the activity sentence and the slow-start note.",
      "forma-startup__slow": "The slow-start note. Space is reserved for it, so its appearance does not move the layout.",
      "forma-startup__problem": "Failure or timeout explanation and recovery action; shown only in the failed and timed-out states.",
      "forma-startup__problem-title": "The bold first line of the problem region.",
      "forma-startup__noscript": "Shown instead of the status when scripting is unavailable (the scripting: none media query).",
      "hidden": "`.forma-startup[hidden]` restores display: none, which the root's grid display would otherwise override. Set it, or remove the element, once the application has mounted.",
      "--forma-startup-slow-after": "Delay before the slow-start note appears without host help. Default 8s.",
      "data-forma-state": "The host-owned state selector.",
      "data-forma-extent": "Viewport or region sizing."
    },
    keyboard: [
      { keys: "Tab", action: "Nothing is focusable while starting; focus is not trapped. In failed and timed-out states Tab reaches the recovery action." },
      { keys: "Enter", action: "Activates the recovery action." }
    ],
    events: [
      { name: "—", description: "None. The host page's loader sets data-forma-state, and the application removes or hides the screen when it mounts." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Starting", how: "data-forma-state=\"starting\" or absent", description: "Identity, spinning indicator and the status sentence." },
    { name: "Slow", how: "data-forma-state=\"slow\", or --forma-startup-slow-after elapsed", description: "The slow-start note appears below the status sentence in reserved space." },
    { name: "Failed", how: "data-forma-state=\"failed\"", description: "Status and indicator are removed; the alert explains the failure and offers recovery." },
    { name: "Timed out", how: "data-forma-state=\"timed-out\"", description: "As failed, with wording that says the start ran out of time." },
    { name: "No scripting", how: "@media (scripting: none)", description: "Status and problem are removed; the no-script message says what to turn on." },
    { name: "Reduced motion", how: "prefers-reduced-motion: reduce", description: "The indicator is a static ring; the status sentence still identifies the activity and the slow-start note still appears." },
    { name: "Mounted", how: "element removed or hidden", description: "The application replaces the screen." }
  ],
  accessibility: {
    forma: [
      "Puts the activity sentence and slow-start note in one polite status region, so a slow start is announced once rather than on every animation frame.",
      "Removes the indicator in failed and timed-out states, so animation never contradicts the failure.",
      "Shows a static indicator under reduced motion while the text keeps identifying the activity.",
      "Traps no focus; the only focusable element appears with the recovery action."
    ],
    consumer: [
      "Name the application and the work in the status sentence (Starting Northwind Ledger: preparing your workspace), not Loading alone.",
      "Set data-forma-state from the loader on a real failure or your own deadline; write the problem text into the alert when you reveal it so it is announced.",
      "Offer only recovery actions the application can perform safely; reload is usually the only one before the runtime exists.",
      "Remove or hide the screen once the application has mounted and move focus to the application's main heading if focus was on the page body."
    ]
  },
  responsive: [
    "A single centered column capped at 36rem; it never scrolls sideways at 320 pixels.",
    "Fills the small viewport height (100svh) so mobile browser chrome does not cut off the status.",
    "data-forma-extent=\"region\" sizes it for embedded use."
  ],
  motion: [
    "The indicator is the shared [[spinner]] cadence: one constant-velocity turn per --forma-motion-cadence-rotation-period.",
    "The slow-start note is a discrete reveal after a delay, not motion; it is not removed by reduced motion.",
    "No progress percentage, stage list or estimated time is ever animated."
  ],
  guidance: {
    do: [
      "Put the screen in the initial HTML of the page the runtime mounts into, so it paints with the first frame.",
      "Use the same identity as the shell header, so the person sees one application from first paint to mounted interface."
    ],
    avoid: [
      "Fake progress bars or stages that do not report real work.",
      "Leaving the indicator running after the loader has failed or given up."
    ]
  },
  related: [
    { slug: "app-identity", note: "The mark and name the start-up screen shows." },
    { slug: "spinner", note: "The indicator used for the activity." },
    { slug: "fault-blocking", note: "Whole-surface failures once the application is running." },
    { slug: "skeleton", note: "Region loading inside a running application." }
  ]
};
