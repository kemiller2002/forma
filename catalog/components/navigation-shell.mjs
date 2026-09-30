export default {
  name: "Navigation shell",
  category: "navigation",
  behavior: "Application / Limen",
  summary: "Preserves current location and destination identity across persistent and compact navigation modes.",
  purpose: {
    description: "The navigation shell pairs a content region with primary navigation that changes form with the viewport. Above 48rem a persistent `nav` sits in a side column; at 48rem and below the side column is hidden and a native `details` disclosure labelled Navigation shows the same destinations above the content. The application renders both lists with identical destinations, order and `aria-current`, so the current location and each destination's identity survive the switch. Only one of the two is displayed at a time, so assistive technology meets a single navigation landmark.",
    useWhen: [
      "An application area has a handful of top-level destinations that should stay visible on wide screens.",
      "On phones the destinations should collapse behind one control without a script-driven drawer.",
      "The current destination must be exposed the same way in both modes."
    ],
    avoidWhen: [
      "The page needs header, navigation, primary and inspector regions: use [[workspace-shell]].",
      "Navigation is a modal drawer with focus trapping: use [[flyout]].",
      "The page is a public marketing site: use [[marketing-shell]] and [[site-header]].",
      "Destinations are deeply nested: use [[hierarchy-tree]] inside the navigation."
    ],
    characteristics: [
      "Grid of `var(--ef-navigation-width)` (default `minmax(11rem, 16rem)`) and a `minmax(0, 1fr)` content column.",
      "Mode switch at a 48rem viewport width via a media query; there is no script.",
      "The compact summary is at least 44px tall and the disclosure uses native open/close behavior. The summary is a flex row, so the browser's disclosure triangle is not drawn; its text must say what it opens.",
      "Forma does not style `aria-current`; any visual current-location cue comes from the application's link styling."
    ]
  },
  examples: [
    {
      id: "project-settings",
      title: "Project settings area",
      description: "Five destinations with Access as the current page. Both lists carry the same aria-current. The content region is shown as a labelled section here; in an application it is the page's main element.",
      html: `<ef-navigation-shell class="ef-component-tag">
  <div class="ef-navigation-shell">
    <details class="ef-navigation-shell__compact">
      <summary>Settings navigation</summary>
      <nav aria-label="Project settings"><a href="#navshell-settings-general">General</a><a href="#navshell-settings-access" aria-current="page">Access</a><a href="#navshell-settings-billing">Billing</a><a href="#navshell-settings-webhooks">Webhooks</a><a href="#navshell-settings-danger">Danger zone</a></nav>
    </details>
    <nav class="ef-navigation-shell__persistent" aria-label="Project settings"><a href="#navshell-settings-general">General</a><a href="#navshell-settings-access" aria-current="page">Access</a><a href="#navshell-settings-billing">Billing</a><a href="#navshell-settings-webhooks">Webhooks</a><a href="#navshell-settings-danger">Danger zone</a></nav>
    <section class="ef-navigation-shell__content" id="navshell-settings-access" aria-labelledby="navshell-settings-title">
      <h2 id="navshell-settings-title">Access</h2>
      <p>Three people and one service account can change this project.</p>
    </section>
  </div>
</ef-navigation-shell>`
    },
    {
      id: "narrow-rail",
      title: "Narrower navigation column",
      description: "The application narrows the navigation column with the --ef-navigation-width custom property and tightens the gap with --ef-navigation-space. Long destination names wrap within the column.",
      html: `<ef-navigation-shell class="ef-component-tag">
  <div class="ef-navigation-shell" style="--ef-navigation-width: minmax(8rem, 10rem); --ef-navigation-space: 0.5rem;">
    <details class="ef-navigation-shell__compact">
      <summary>Reports navigation</summary>
      <nav aria-label="Reports"><a href="#navshell-narrow-summary" aria-current="page">Summary</a><a href="#navshell-narrow-quarterly">Quarterly incident retrospectives</a><a href="#navshell-narrow-exports">Exports</a></nav>
    </details>
    <nav class="ef-navigation-shell__persistent" aria-label="Reports"><a href="#navshell-narrow-summary" aria-current="page">Summary</a><a href="#navshell-narrow-quarterly">Quarterly incident retrospectives</a><a href="#navshell-narrow-exports">Exports</a></nav>
    <section class="ef-navigation-shell__content" id="navshell-narrow-summary" aria-labelledby="navshell-narrow-title">
      <h2 id="navshell-narrow-title">Summary</h2>
      <p>Twelve reports were generated this month.</p>
    </section>
  </div>
</ef-navigation-shell>`
    },
    {
      id: "mobile-compact-open",
      title: "Compact navigation on a phone",
      description: "At phone width the persistent column is hidden and the compact disclosure appears above the content. It is shown open here so the destinations are visible.",
      mobile: {
        height: 360,
        notes: [
          "At 48rem and below the grid becomes one column, the persistent nav is removed with display: none and the compact details is shown.",
          "The summary row is at least 44px tall and toggles the list natively with a tap, Enter or Space.",
          "Opened destinations stack vertically in the order of the persistent list; the application keeps the same aria-current.",
          "The disclosure stays open after a same-page link is followed; closing it on navigation is application behavior."
        ]
      },
      html: `<ef-navigation-shell class="ef-component-tag">
  <div class="ef-navigation-shell">
    <details class="ef-navigation-shell__compact" open>
      <summary>Account navigation</summary>
      <nav aria-label="Account"><a href="#navshell-mobile-profile" aria-current="page">Profile</a><a href="#navshell-mobile-security">Security</a><a href="#navshell-mobile-notifications">Notifications</a></nav>
    </details>
    <nav class="ef-navigation-shell__persistent" aria-label="Account"><a href="#navshell-mobile-profile" aria-current="page">Profile</a><a href="#navshell-mobile-security">Security</a><a href="#navshell-mobile-notifications">Notifications</a></nav>
    <section class="ef-navigation-shell__content" id="navshell-mobile-profile" aria-labelledby="navshell-mobile-title">
      <h2 id="navshell-mobile-title">Profile</h2>
      <p>Your name and photo are visible to your organization.</p>
    </section>
  </div>
</ef-navigation-shell>`
    }
  ],
  api: {
    attributes: [
      { name: "aria-label", on: "both nav elements", values: "the same string", default: "—", description: "Names the navigation landmark. Use the same label on both, because only one is displayed at a time." },
      { name: "aria-current", on: "link", values: "page", default: "absent", description: "Marks the current destination. Set it identically in both lists." },
      { name: "open", on: "details.ef-navigation-shell__compact", values: "boolean", default: "absent (closed)", description: "Native disclosure state in compact mode. The browser toggles it; the application may close it after navigation." }
    ],
    hooks: {
      "ef-navigation-shell": "Root grid: navigation column and content column above 48rem; a single column at or below it.",
      "ef-navigation-shell__persistent": "Side-column nav shown above 48rem as a vertical list of links.",
      "ef-navigation-shell__compact": "Native details disclosure shown at or below 48rem; its summary is a 44px row.",
      "ef-navigation-shell__content": "The content region (normally the page's main element). It can shrink to avoid overflow.",
      "--ef-navigation-width": "Width track of the navigation column. Default `minmax(11rem, 16rem)`.",
      "--ef-navigation-space": "Gap between navigation and content. Default 1rem."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Moves through the visible navigation links, then into the content." },
      { keys: "Enter / Space on summary", action: "Opens or closes the compact disclosure (native details behavior)." },
      { keys: "Enter on a link", action: "Follows the link (native)." }
    ],
    events: [
      { name: "toggle", description: "Native event fired by the compact details when it opens or closes." }
    ],
    form: "Does not participate in forms."
  },
  states: [
    { name: "Persistent", how: "viewport wider than 48rem", description: "Side-column nav visible; compact disclosure hidden." },
    { name: "Compact closed", how: "viewport 48rem or narrower, details without open", description: "Only the Navigation summary row is visible above the content." },
    { name: "Compact open", how: "open on details", description: "Destinations listed vertically under the summary." },
    { name: "Current destination", how: "aria-current=\"page\"", description: "Exposed to assistive technology in both modes. Forma adds no visual styling for it." }
  ],
  accessibility: {
    forma: [
      "Displays exactly one of the two navigation elements at any width, so there is never a duplicate visible landmark.",
      "Uses native details for the compact mode, so expanded state and keyboard toggling come from the platform.",
      "Gives the compact summary a 44px target."
    ],
    consumer: [
      "Render both lists with identical destinations, order and aria-current.",
      "Provide a visible current-location cue (for example bold or an indicator) in application styling, since Forma does not style aria-current here.",
      "Make persistent-mode links at least 44px tall if they are primary touch targets.",
      "Use a single main element for the content region and a [[skip-link]] where the navigation precedes it."
    ]
  },
  responsive: [
    "Above 48rem: two columns, navigation width set by `--ef-navigation-width`.",
    "At 48rem and below: one column; the compact disclosure sits above the content.",
    "The content column is `minmax(0, 1fr)` with `min-inline-size: 0`, so wide content cannot push the page sideways.",
    "The switch is viewport-based, not container-based; a narrow shell inside a wide page stays in persistent mode."
  ],
  motion: [
    "No animation: the mode switch is a media-query change and the compact disclosure opens and closes instantly with native details."
  ],
  guidance: {
    do: [
      "Keep top-level destinations short and stable across pages.",
      "Label the compact summary with a word users recognise, such as Navigation or Menu."
    ],
    avoid: [
      "Showing different destinations in the two modes.",
      "Hiding the current destination only in compact mode."
    ]
  },
  related: [
    { slug: "workspace-shell", note: "Multi-region application layout with header, navigation, primary and inspector." },
    { slug: "sidebar", note: "A generic layout for a supporting column beside content; it has no compact navigation mode." },
    { slug: "flyout", note: "Modal edge drawer when compact navigation needs a full panel." },
    { slug: "skip-link", note: "Lets keyboard users bypass the navigation to the content." }
  ]
};
