// RLP-001 benchmark tasks. Each task is defined by semantic and functional
// requirements only; no task prescribes an implementation. TASK.md for every
// arm is generated from these definitions, so requirements are identical
// across arms.
//
// Element kinds: region (structural, no visible boundary), panel (visible
// boundary), heading, text, label, control, select, textarea, checkbox,
// radio, button, link, media, message, table, list, item, status.
//
// `for` links a label or message to the control it describes.
// `pairs` must sit close together (within 1.5rem). `rowPairs` must share a
// visual row, or sit stacked close together when the row has no room.
// `hidden` elements exist in the markup from the start with the `hidden`
// attribute; dynamic steps reveal them.
//
// split: "dev" tasks were available while the engines and harness were
// built; "heldout" tasks were written in the same session but never used for
// engine or harness tuning, and run only after the engine freeze.

const e = (id, kind, parent, text, extra = {}) => ({ id, kind, parent, ...(text === undefined ? {} : { text }), ...extra });

const LONG = "This label is deliberately long so that it wraps across several lines on narrow screens and tests whether neighboring fields stay aligned and readable";

export const TASKS = [
  {
    id: "T01-form-account",
    title: "Create-account form",
    category: "forms",
    split: "dev",
    pilot: true,
    goal: "A sign-up form in a single bordered panel with grouped fields, required indicators, hint text, validation messages and a preferences group.",
    elements: [
      e("form", "panel", null, undefined, { tag: "form" }),
      e("title", "heading", "form", "Create your account", { level: 1 }),
      e("intro", "text", "form", "All fields marked with an asterisk are required."),
      e("name-label", "label", "form", "Full name *", { for: "name-input" }),
      e("name-input", "control", "form", undefined, { attrs: { type: "text", autocomplete: "name", required: true } }),
      e("email-label", "label", "form", "Email address *", { for: "email-input" }),
      e("email-input", "control", "form", undefined, { attrs: { type: "email", autocomplete: "email", required: true } }),
      e("email-error", "message", "form", "Enter an email address in the format name@example.com.", { for: "email-input", hidden: true }),
      e("password-label", "label", "form", "Password *", { for: "password-input" }),
      e("password-input", "control", "form", undefined, { attrs: { type: "password", autocomplete: "new-password", required: true } }),
      e("password-hint", "text", "form", "Use at least 12 characters.", { for: "password-input" }),
      e("password-error", "message", "form", "Your password is too short.", { for: "password-input", hidden: true }),
      e("confirm-label", "label", "form", "Confirm password *", { for: "confirm-input" }),
      e("confirm-input", "control", "form", undefined, { attrs: { type: "password", autocomplete: "new-password", required: true } }),
      e("prefs", "region", "form", undefined, { tag: "fieldset" }),
      e("prefs-legend", "heading", "prefs", "Email preferences", { tag: "legend" }),
      e("pref-news-input", "checkbox", "prefs"),
      e("pref-news-label", "label", "prefs", "Product news", { for: "pref-news-input" }),
      e("pref-tips-input", "checkbox", "prefs"),
      e("pref-tips-label", "label", "prefs", "Tips and tutorials", { for: "pref-tips-input" }),
      e("actions", "region", "form"),
      e("cancel", "button", "actions", "Cancel", { variant: "secondary" }),
      e("submit", "button", "actions", "Create account", { attrs: { type: "submit" } })
    ],
    structure: [
      "Full name and email address are peers; password and confirm password are peers. Peers sit side by side when there is room and stack when there is not.",
      "The password hint and password error belong to the password field; the email error belongs to the email field.",
      "Each checkbox sits beside its own label.",
      "The two actions form one group at the end of the form, with Create account as the primary action."
    ],
    alignTop: [["name-input", "email-input"], ["password-input", "confirm-input"]],
    order: ["title", "intro", "name-input", "email-input", "password-input", "confirm-input", "prefs-legend", "pref-news-input", "pref-tips-input", "submit"],
    dynamic: [
      { op: "reveal", id: "email-error" },
      { op: "reveal", id: "password-error" },
      { op: "text", id: "name-label", text: `${LONG} *` },
      { op: "hide", id: "email-error" }
    ],
    heldout: { text: { "email-label": "Email address used for account recovery and billing notices *", "pref-tips-label": "Occasional tips, tutorials and invitations to research studies" }, fontScale: 2 }
  },
  {
    id: "T02-form-shipping",
    title: "Shipping address form",
    category: "forms",
    split: "heldout",
    pilot: false,
    goal: "A checkout shipping step with an address block, a delivery-option group with descriptions, and navigation actions.",
    elements: [
      e("form", "panel", null, undefined, { tag: "form" }),
      e("title", "heading", "form", "Shipping address", { level: 2 }),
      e("street-label", "label", "form", "Street address *", { for: "street-input" }),
      e("street-input", "control", "form", undefined, { attrs: { type: "text", autocomplete: "address-line1", required: true } }),
      e("unit-label", "label", "form", "Apartment, suite, or unit", { for: "unit-input" }),
      e("unit-input", "control", "form", undefined, { attrs: { type: "text", autocomplete: "address-line2" } }),
      e("city-label", "label", "form", "City *", { for: "city-input" }),
      e("city-input", "control", "form", undefined, { attrs: { type: "text", autocomplete: "address-level2", required: true } }),
      e("state-label", "label", "form", "State *", { for: "state-input" }),
      e("state-input", "select", "form", undefined, { options: ["Choose a state", "Ohio", "Oregon", "Texas"] }),
      e("zip-label", "label", "form", "ZIP code *", { for: "zip-input" }),
      e("zip-input", "control", "form", undefined, { attrs: { type: "text", autocomplete: "postal-code", inputmode: "numeric", required: true } }),
      e("zip-error", "message", "form", "Enter a five-digit ZIP code.", { for: "zip-input", hidden: true }),
      e("delivery", "region", "form", undefined, { tag: "fieldset" }),
      e("delivery-legend", "heading", "delivery", "Delivery speed", { tag: "legend" }),
      e("standard-input", "radio", "delivery", undefined, { attrs: { name: "speed", checked: true } }),
      e("standard-label", "label", "delivery", "Standard — free", { for: "standard-input" }),
      e("standard-note", "text", "delivery", "Arrives in 5 to 7 business days.", { for: "standard-input" }),
      e("express-input", "radio", "delivery", undefined, { attrs: { name: "speed" } }),
      e("express-label", "label", "delivery", "Express — $12.00", { for: "express-input" }),
      e("express-note", "text", "delivery", "Arrives in 2 business days.", { for: "express-input" }),
      e("save-input", "checkbox", "form"),
      e("save-label", "label", "form", "Save this address for next time", { for: "save-input" }),
      e("actions", "region", "form"),
      e("back", "button", "actions", "Back to cart", { variant: "secondary" }),
      e("continue", "button", "actions", "Continue to payment", { attrs: { type: "submit" } })
    ],
    structure: [
      "Street address and apartment are peers. City, state and ZIP code are peers on one line when there is room; ZIP code may be narrower than city.",
      "Each delivery option shows its radio button, label and note together; notes sit under their own label.",
      "Back to cart and Continue to payment form one action group at the end."
    ],
    alignTop: [["street-input", "unit-input"], ["city-input", "state-input", "zip-input"]],
    order: ["title", "street-input", "unit-input", "city-input", "state-input", "zip-input", "delivery-legend", "standard-input", "express-input", "save-input", "continue"],
    dynamic: [
      { op: "reveal", id: "zip-error" },
      { op: "text", id: "city-label", text: "City, town, or municipality as it appears on official mail *" },
      { op: "hide", id: "zip-error" }
    ],
    heldout: { text: { "express-note": "Arrives in 2 business days when ordered before 2:00 p.m. Eastern time on a weekday that is not a federal holiday." }, fontScale: 2 }
  },
  {
    id: "T03-cards-product",
    title: "Product cards with nested panels",
    category: "cards",
    split: "dev",
    pilot: true,
    goal: "A section of three product cards. Each card has an illustration, a heading, a description of varying length, a nested specifications panel, and two actions.",
    elements: [
      e("section", "region", null, undefined, { tag: "section" }),
      e("section-title", "heading", "section", "Recommended for your studio", { level: 2 }),
      ...["a", "b", "c"].flatMap((k, i) => [
        e(`card-${k}`, "panel", "section", undefined, { tag: "article" }),
        e(`card-${k}-media`, "media", `card-${k}`, undefined, { alt: ["Desk lamp illustration", "Chair illustration", "Shelf illustration"][i], ratio: "3 / 2" }),
        e(`card-${k}-title`, "heading", `card-${k}`, ["Arc desk lamp", "Task chair", "Modular shelf"][i], { level: 3 }),
        e(`card-${k}-text`, "text", `card-${k}`, [
          "Warm, dimmable light.",
          "Adjustable lumbar support, breathable mesh, and armrests that move in four directions so long work sessions stay comfortable.",
          "Stackable units that grow with your collection."
        ][i]),
        e(`card-${k}-specs`, "panel", `card-${k}`),
        e(`card-${k}-spec-1-label`, "text", `card-${k}-specs`, "Price"),
        e(`card-${k}-spec-1-value`, "text", `card-${k}-specs`, ["$89", "$420", "$65 per unit"][i]),
        e(`card-${k}-spec-2-label`, "text", `card-${k}-specs`, "Ships"),
        e(`card-${k}-spec-2-value`, "text", `card-${k}-specs`, ["Tomorrow", "In 2 weeks", "In 3 days"][i]),
        e(`card-${k}-actions`, "region", `card-${k}`),
        e(`card-${k}-save`, "button", `card-${k}-actions`, "Save", { variant: "secondary" }),
        e(`card-${k}-add`, "button", `card-${k}-actions`, "Add to cart")
      ])
    ],
    structure: [
      "Cards are peers: same width when they share a line, wrapping to fewer per line on narrower screens.",
      "Inside each card: illustration, heading, description, specifications panel, then actions.",
      "Each specification row pairs a label with its value.",
      "The specifications panel is visibly nested inside its card."
    ],
    alignTop: [["card-a", "card-b", "card-c"]],
    equalWidth: [["card-a", "card-b", "card-c"]],
    pairs: [["card-a-title", "card-a-text"], ["card-b-title", "card-b-text"], ["card-c-title", "card-c-text"]],
    rowPairs: [["card-a-spec-1-label", "card-a-spec-1-value"], ["card-b-spec-2-label", "card-b-spec-2-value"]],
    order: ["section-title", "card-a", "card-b", "card-c"],
    dynamic: [
      { op: "text", id: "card-a-text", text: "Warm, dimmable light with a weighted base, a fabric cord, and a hinge that holds any angle without drifting over time." },
      { op: "text", id: "card-c-title", text: "Modular shelf system with optional doors" }
    ],
    heldout: { text: { "card-b-spec-2-value": "Ships separately from other items in 2 to 3 weeks", "card-a-add": "Add to cart and continue shopping" }, fontScale: 2 }
  },
  {
    id: "T04-cards-profile",
    title: "Profile panel with nested sections",
    category: "cards",
    split: "heldout",
    pilot: false,
    goal: "A team-member profile: a header with avatar, name, role and a follow action; a row of three statistics; an about section; and a nested recent-activity list.",
    elements: [
      e("profile", "panel", null, undefined, { tag: "article" }),
      e("header", "region", "profile"),
      e("avatar", "media", "header", undefined, { alt: "Portrait of Dana Okafor", ratio: "1 / 1", size: "4rem" }),
      e("name", "heading", "header", "Dana Okafor", { level: 2 }),
      e("role", "text", "header", "Principal engineer, Platform reliability"),
      e("follow", "button", "header", "Follow"),
      e("stats", "region", "profile"),
      ...["reviews", "deploys", "incidents"].flatMap((k, i) => [
        e(`stat-${k}`, "panel", "stats"),
        e(`stat-${k}-value`, "text", `stat-${k}`, ["128", "56", "3"][i]),
        e(`stat-${k}-label`, "text", `stat-${k}`, ["Reviews this quarter", "Deploys", "Open incidents"][i])
      ]),
      e("about", "region", "profile", undefined, { tag: "section" }),
      e("about-title", "heading", "about", "About", { level: 3 }),
      e("about-text", "text", "about", "Dana leads the reliability guild and maintains the incident review process. Ask about capacity planning and on-call health."),
      e("activity", "panel", "profile", undefined, { tag: "section" }),
      e("activity-title", "heading", "activity", "Recent activity", { level: 3 }),
      ...[1, 2, 3].flatMap(n => [
        e(`activity-${n}`, "item", "activity"),
        e(`activity-${n}-text`, "text", `activity-${n}`, ["Approved the database failover runbook", "Opened a capacity review for the search cluster", "Closed incident INC-2231"][n - 1]),
        e(`activity-${n}-time`, "text", `activity-${n}`, ["2 hours ago", "Yesterday", "Monday"][n - 1])
      ])
    ],
    structure: [
      "The header keeps avatar, name and role together; the follow action belongs to the header.",
      "The three statistics are equal-width peers when they share a line.",
      "Each activity entry pairs its description with its time."
    ],
    alignTop: [["stat-reviews", "stat-deploys", "stat-incidents"]],
    equalWidth: [["stat-reviews", "stat-deploys", "stat-incidents"]],
    pairs: [["name", "role"], ["about-title", "about-text"]],
    rowPairs: [["activity-1-text", "activity-1-time"]],
    order: ["name", "follow", "stat-reviews", "stat-deploys", "stat-incidents", "about-title", "activity-title", "activity-1", "activity-2", "activity-3"],
    dynamic: [
      { op: "text", id: "role", text: "Principal engineer, Platform reliability and developer productivity programs" },
      { op: "remove", id: "activity-2" }
    ],
    heldout: { text: { "stat-reviews-label": "Code reviews completed this quarter across all repositories", "name": "Dana Okafor-Lindqvist-Ramaswamy" }, fontScale: 2 }
  },
  {
    id: "T05-dashboard-ops",
    title: "Operations dashboard",
    category: "dashboards",
    split: "dev",
    pilot: false,
    goal: "An operations overview: a header with title, period and refresh action; four summary tiles; a requests table panel; and an alerts panel.",
    elements: [
      e("dashboard", "region", null, undefined, { tag: "main" }),
      e("header", "region", "dashboard", undefined, { tag: "header" }),
      e("title", "heading", "header", "Service health", { level: 1 }),
      e("period", "text", "header", "Last 24 hours"),
      e("refresh", "button", "header", "Refresh", { variant: "secondary" }),
      e("tiles", "region", "dashboard"),
      ...[["uptime", "Uptime", "99.98%", "+0.01%"], ["latency", "Median latency", "182 ms", "−12 ms"], ["errors", "Error rate", "0.4%", "+0.1%"], ["traffic", "Requests", "1.2 M", "+8%"]].flatMap(([k, label, value, delta]) => [
        e(`tile-${k}`, "panel", "tiles"),
        e(`tile-${k}-label`, "text", `tile-${k}`, label),
        e(`tile-${k}-value`, "text", `tile-${k}`, value),
        e(`tile-${k}-delta`, "text", `tile-${k}`, delta)
      ]),
      e("requests", "panel", "dashboard", undefined, { tag: "section" }),
      e("requests-title", "heading", "requests", "Slowest endpoints", { level: 2 }),
      e("requests-table", "table", "requests", undefined, {
        columns: ["Endpoint", "Calls", "p95", "Errors"],
        rows: [["/api/search", "41,200", "640 ms", "0.2%"], ["/api/checkout", "8,930", "512 ms", "1.1%"], ["/api/profile", "22,410", "301 ms", "0.0%"], ["/api/recommendations", "17,004", "288 ms", "0.3%"], ["/api/cart", "12,775", "190 ms", "0.1%"]]
      }),
      e("alerts", "panel", "dashboard", undefined, { tag: "section" }),
      e("alerts-title", "heading", "alerts", "Active alerts", { level: 2 }),
      ...[1, 2, 3].map(n => e(`alert-${n}`, "item", "alerts", ["Checkout error rate above 1%", "Search p95 above 600 ms", "Certificate renews in 9 days"][n - 1]))
    ],
    structure: [
      "The refresh action belongs to the header; title and period stay together.",
      "The four tiles are equal-width peers: four per line on wide screens, two on medium, one on narrow.",
      "The requests and alerts panels sit side by side on wide screens, requests wider than alerts, and stack on narrower screens.",
      "The table must remain readable; it may scroll horizontally inside its own panel on narrow screens but must not widen the page."
    ],
    alignTop: [["tile-uptime", "tile-latency", "tile-errors", "tile-traffic"], ["requests", "alerts"]],
    equalWidth: [["tile-uptime", "tile-latency", "tile-errors", "tile-traffic"]],
    pairs: [["title", "period"], ["tile-uptime-label", "tile-uptime-value"]],
    order: ["title", "refresh", "tile-uptime", "tile-latency", "tile-errors", "tile-traffic", "requests-title", "alerts-title"],
    dynamic: [
      { op: "text", id: "alert-2", text: "Search p95 latency has been above 600 ms for 25 minutes across two regions" },
      { op: "remove", id: "alert-3" }
    ],
    heldout: { text: { "tile-latency-label": "Median latency across all public endpoints", "title": "Service health and reliability overview" }, fontScale: 2 }
  },
  {
    id: "T06-dashboard-finance",
    title: "Finance dashboard",
    category: "dashboards",
    split: "heldout",
    pilot: false,
    goal: "A spending dashboard with three summary tiles, a chart panel, a dense transactions table, and a filter panel.",
    elements: [
      e("dashboard", "region", null, undefined, { tag: "main" }),
      e("title", "heading", "dashboard", "Team spending", { level: 1 }),
      e("summary", "region", "dashboard"),
      ...[["budget", "Budget", "$48,000"], ["spent", "Spent", "$31,420"], ["left", "Remaining", "$16,580"]].flatMap(([k, label, value]) => [
        e(`tile-${k}`, "panel", "summary"),
        e(`tile-${k}-label`, "text", `tile-${k}`, label),
        e(`tile-${k}-value`, "text", `tile-${k}`, value)
      ]),
      e("filters", "panel", "dashboard", undefined, { tag: "form" }),
      e("filters-title", "heading", "filters", "Filters", { level: 2 }),
      e("category-label", "label", "filters", "Category", { for: "category-input" }),
      e("category-input", "select", "filters", undefined, { options: ["All categories", "Travel", "Software", "Hardware"] }),
      e("month-label", "label", "filters", "Month", { for: "month-input" }),
      e("month-input", "select", "filters", undefined, { options: ["October", "September", "August"] }),
      e("apply", "button", "filters", "Apply filters"),
      e("chart", "panel", "dashboard", undefined, { tag: "figure" }),
      e("chart-media", "media", "chart", undefined, { alt: "Bar chart of weekly spending", ratio: "2 / 1" }),
      e("chart-caption", "text", "chart", "Weekly spending, October", { tag: "figcaption" }),
      e("transactions", "panel", "dashboard", undefined, { tag: "section" }),
      e("transactions-title", "heading", "transactions", "Recent transactions", { level: 2 }),
      e("transactions-table", "table", "transactions", undefined, {
        columns: ["Date", "Merchant", "Category", "Amount"],
        rows: [["Oct 18", "Northwind Air", "Travel", "$612.40"], ["Oct 17", "Figma", "Software", "$75.00"], ["Oct 16", "Contoso Hardware", "Hardware", "$1,240.00"], ["Oct 15", "Fabrikam Hotels", "Travel", "$389.10"], ["Oct 14", "GitHub", "Software", "$210.00"], ["Oct 12", "Adatum Rentals", "Travel", "$96.75"]]
      })
    ],
    structure: [
      "The three tiles are equal-width peers on one line when there is room.",
      "The filter panel sits beside the chart and transactions on wide screens (as a narrower side column) and above them on narrow screens.",
      "The chart caption belongs to the chart. The table must not widen the page."
    ],
    alignTop: [["tile-budget", "tile-spent", "tile-left"]],
    equalWidth: [["tile-budget", "tile-spent", "tile-left"]],
    pairs: [["chart-media", "chart-caption"], ["tile-budget-label", "tile-budget-value"]],
    order: ["title", "tile-budget", "tile-spent", "tile-left", "filters-title", "apply"],
    dynamic: [{ op: "text", id: "chart-caption", text: "Weekly spending for October, compared with the same weeks last year and the quarterly budget" }],
    heldout: { text: { "tile-left-label": "Remaining budget before the end of the fiscal quarter", "apply": "Apply filters and refresh the table" }, fontScale: 2 }
  },
  {
    id: "T07-nav-docs",
    title: "Documentation site header",
    category: "navigation",
    split: "dev",
    pilot: false,
    goal: "A site header with brand, five navigation links (one active, one with a long label), a search field, and a sign-in action.",
    elements: [
      e("header", "panel", null, undefined, { tag: "header" }),
      e("brand", "link", "header", "Northwind Docs", { attrs: { href: "#" } }),
      e("nav", "region", "header", undefined, { tag: "nav", label: "Primary" }),
      ...[["guides", "Guides"], ["api", "API reference", true], ["sdks", "SDKs"], ["integrations", "Integrations and partner ecosystem"], ["changelog", "Changelog"]].map(([k, label, active]) =>
        e(`link-${k}`, "link", "nav", label, { attrs: { href: "#", ...(active ? { "aria-current": "page" } : {}) } })),
      e("search-label", "label", "header", "Search documentation", { for: "search-input" }),
      e("search-input", "control", "header", undefined, { attrs: { type: "search" } }),
      e("signin", "button", "header", "Sign in")
    ],
    structure: [
      "Brand first, then navigation, then search, then sign in.",
      "Navigation links read as one group; the active link is visibly marked.",
      "On narrow screens everything stays visible and reachable without horizontal scrolling; wrapping onto more lines is acceptable. Nothing may be cut off.",
      "The search label may be visually hidden only if it remains the accessible name; if visible it belongs to the search field."
    ],
    order: ["brand", "link-guides", "link-api", "link-sdks", "link-integrations", "link-changelog", "search-input", "signin"],
    dynamic: [{ op: "text", id: "link-sdks", text: "SDKs and command-line tools" }],
    heldout: { text: { "link-changelog": "Changelog and deprecation schedule", "brand": "Northwind Developer Documentation" }, fontScale: 2 }
  },
  {
    id: "T08-nav-workspace",
    title: "Workspace section navigation",
    category: "navigation",
    split: "heldout",
    pilot: false,
    goal: "A workspace toolbar: breadcrumb trail, page heading, a row of six section links with one active, and two actions.",
    elements: [
      e("bar", "panel", null, undefined, { tag: "header" }),
      e("breadcrumb", "region", "bar", undefined, { tag: "nav", label: "Breadcrumb" }),
      ...["Workspaces", "Acme Corporation", "Billing", "Invoices"].map((label, i) =>
        e(`crumb-${i + 1}`, i < 3 ? "link" : "text", "breadcrumb", label, i < 3 ? { attrs: { href: "#" } } : { attrs: { "aria-current": "page" } })),
      e("heading", "heading", "bar", "Invoices", { level: 1 }),
      e("sections", "region", "bar", undefined, { tag: "nav", label: "Billing sections" }),
      ...["Overview", "Invoices", "Payment methods", "Tax registrations and exemptions", "Usage", "Settings"].map((label, i) =>
        e(`section-${i + 1}`, "link", "sections", label, { attrs: { href: "#", ...(i === 1 ? { "aria-current": "page" } : {}) } })),
      e("actions", "region", "bar"),
      e("export", "button", "actions", "Export CSV", { variant: "secondary" }),
      e("new", "button", "actions", "New invoice")
    ],
    structure: [
      "Breadcrumb above the heading; actions belong with the heading row when there is room.",
      "Section links read as one group and wrap rather than overflow on narrow screens.",
      "Nothing may be cut off or widen the page."
    ],
    order: ["crumb-1", "crumb-4", "heading", "section-1", "section-6", "new"],
    dynamic: [{ op: "text", id: "heading", text: "Invoices for Acme Corporation international subsidiaries" }],
    heldout: { text: { "section-5": "Usage-based charges and metered billing", "crumb-2": "Acme Corporation International Holdings" }, fontScale: 2 }
  },
  {
    id: "T09-dynamic-checkout",
    title: "Checkout summary with dynamic content",
    category: "dynamic",
    split: "dev",
    pilot: true,
    goal: "An order summary with line items, a promo code field, a shipping section that starts in a loading state, totals, and a place-order action. Content changes after load.",
    elements: [
      e("summary", "panel", null, undefined, { tag: "section" }),
      e("title", "heading", "summary", "Order summary", { level: 2 }),
      e("items", "region", "summary", undefined, { tag: "ul" }),
      ...[1, 2, 3].flatMap(n => [
        e(`item-${n}`, "item", "items", undefined, { tag: "li" }),
        e(`item-${n}-name`, "text", `item-${n}`, ["Linen notebook", "Fountain pen", "Ink refills, pack of 12"][n - 1]),
        e(`item-${n}-qty`, "text", `item-${n}`, ["Qty 2", "Qty 1", "Qty 3"][n - 1]),
        e(`item-${n}-price`, "text", `item-${n}`, ["$24.00", "$58.00", "$18.00"][n - 1]),
        e(`item-${n}-remove`, "button", `item-${n}`, "Remove", { variant: "secondary", label: ["Remove Linen notebook", "Remove Fountain pen", "Remove Ink refills"][n - 1] })
      ]),
      e("promo-label", "label", "summary", "Promo code", { for: "promo-input" }),
      e("promo-input", "control", "summary", undefined, { attrs: { type: "text" } }),
      e("promo-apply", "button", "summary", "Apply", { variant: "secondary" }),
      e("promo-error", "message", "summary", "That code has expired.", { for: "promo-input", hidden: true }),
      e("shipping", "region", "summary", undefined, { tag: "section" }),
      e("shipping-title", "heading", "shipping", "Shipping", { level: 3 }),
      e("shipping-loading", "status", "shipping", "Calculating shipping options…", { attrs: { role: "status" } }),
      e("shipping-options", "region", "shipping", undefined, { hidden: true }),
      e("ship-ground-input", "radio", "shipping-options", undefined, { attrs: { name: "ship", checked: true } }),
      e("ship-ground-label", "label", "shipping-options", "Ground — $6.00", { for: "ship-ground-input" }),
      e("ship-air-input", "radio", "shipping-options", undefined, { attrs: { name: "ship" } }),
      e("ship-air-label", "label", "shipping-options", "Air — $19.00", { for: "ship-air-input" }),
      e("total-label", "text", "summary", "Total"),
      e("total-value", "text", "summary", "$160.00"),
      e("place", "button", "summary", "Place order", { attrs: { type: "submit" } })
    ],
    structure: [
      "Each line item keeps name, quantity, price and remove action together on one line when there is room; price aligns to the end.",
      "Promo code field and its apply action sit together; the error message belongs to the field.",
      "The shipping section shows a loading status that is later replaced by the shipping options.",
      "Total label and value form one row. The place-order action comes last.",
      "Items can be added or removed after load; the layout must adapt without overlap or clipping."
    ],
    alignTop: [["promo-input", "promo-apply"]],
    rowPairs: [["total-label", "total-value"], ["item-1-name", "item-1-price"], ["item-1-name", "item-1-remove"]],
    order: ["title", "item-1", "item-2", "item-3", "promo-input", "shipping-title", "total-label", "place"],
    dynamic: [
      { op: "clone", source: "item-3", id: "item-4", text: { "item-4-name": "Blotting paper", "item-4-qty": "Qty 1", "item-4-price": "$6.00" } },
      { op: "remove", id: "item-2" },
      { op: "text", id: "item-1-name", text: "Linen notebook, dotted grid, 240 numbered pages with two ribbon markers" },
      { op: "reveal", id: "promo-error" },
      { op: "hide", id: "shipping-loading", then: { op: "reveal", id: "shipping-options" } }
    ],
    heldout: { text: { "ship-air-label": "Air — $19.00, guaranteed delivery by noon the next business day", "promo-label": "Promo code or gift card number" }, fontScale: 2 }
  },
  {
    id: "T10-dynamic-thread",
    title: "Comment thread with dynamic content",
    category: "dynamic",
    split: "heldout",
    pilot: false,
    goal: "A discussion thread with three comments, a load-more region, and a composer with validation. Comments are inserted, removed and expanded after load.",
    elements: [
      e("thread", "panel", null, undefined, { tag: "section" }),
      e("title", "heading", "thread", "Discussion", { level: 2 }),
      e("comments", "region", "thread", undefined, { tag: "ol" }),
      ...[1, 2, 3].flatMap(n => [
        e(`comment-${n}`, "item", "comments", undefined, { tag: "li" }),
        e(`comment-${n}-avatar`, "media", `comment-${n}`, undefined, { alt: "", ratio: "1 / 1", size: "2.5rem" }),
        e(`comment-${n}-author`, "text", `comment-${n}`, ["Priya", "Marcus", "Lena"][n - 1]),
        e(`comment-${n}-time`, "text", `comment-${n}`, ["3 hours ago", "2 hours ago", "1 hour ago"][n - 1]),
        e(`comment-${n}-body`, "text", `comment-${n}`, ["Can we ship the migration behind a flag first?", "Agreed. I added a flag to the rollout plan.", "Looks good to me."][n - 1]),
        e(`comment-${n}-reply`, "button", `comment-${n}`, "Reply", { variant: "secondary", label: `Reply to ${["Priya", "Marcus", "Lena"][n - 1]}` })
      ]),
      e("more-status", "status", "thread", "Loading earlier comments…", { attrs: { role: "status" } }),
      e("composer-label", "label", "thread", "Add a comment", { for: "composer-input" }),
      e("composer-input", "textarea", "thread", undefined, { attrs: { rows: 3 } }),
      e("composer-error", "message", "thread", "Write a comment before posting.", { for: "composer-input", hidden: true }),
      e("post", "button", "thread", "Post comment")
    ],
    structure: [
      "Each comment shows avatar beside author, time, body and reply action; author and time stay together.",
      "The composer label, field, error and post action form one group after the comments.",
      "Comments can be added and removed after load without overlap or clipping."
    ],
    pairs: [["comment-1-author", "comment-1-time"], ["composer-label", "composer-input"]],
    order: ["title", "comment-1", "comment-2", "comment-3", "composer-input", "post"],
    dynamic: [
      { op: "clone", source: "comment-3", id: "comment-4", text: { "comment-4-author": "Tomás", "comment-4-time": "Just now", "comment-4-body": "Flag is live in staging." } },
      { op: "remove", id: "comment-2" },
      { op: "text", id: "comment-1-body", text: "Can we ship the migration behind a flag first? That gives us a clean rollback path if the backfill runs long, and it lets support verify the new export format with a few accounts before everyone sees it." },
      { op: "reveal", id: "composer-error" },
      { op: "hide", id: "more-status" }
    ],
    heldout: { text: { "comment-3-author": "Lena Abernathy-Kowalczyk" }, fontScale: 2 }
  },
  {
    id: "T11-adversarial-settings",
    title: "Deeply nested settings in a narrow column",
    category: "adversarial",
    split: "dev",
    pilot: false,
    goal: "A settings page whose sections nest four levels deep, with an unbroken extremely long label, a field that prefers more width than its column offers, and toggles.",
    elements: [
      e("page", "region", null, undefined, { tag: "main" }),
      e("page-title", "heading", "page", "Device settings", { level: 1 }),
      e("layout", "region", "page"),
      e("sidebar", "panel", "layout", undefined, { tag: "nav", label: "Settings sections" }),
      ...["General", "Sync", "Security"].map((label, i) => e(`side-${i + 1}`, "link", "sidebar", label, { attrs: { href: "#", ...(i === 1 ? { "aria-current": "page" } : {}) } })),
      e("content", "panel", "layout", undefined, { tag: "section" }),
      e("sync-title", "heading", "content", "Sync", { level: 2 }),
      e("group", "panel", "content", undefined, { tag: "fieldset" }),
      e("group-legend", "heading", "group", "Synchronization", { tag: "legend" }),
      e("row", "panel", "group"),
      e("auto-input", "checkbox", "row"),
      e("auto-label", "label", "row", "AutomaticallySynchronizeAcrossAllRegisteredDevicesAndWorkspaces", { for: "auto-input" }),
      e("auto-hint", "text", "row", "Changes appear on every signed-in device within a minute.", { for: "auto-input" }),
      e("endpoint-label", "label", "group", "Sync endpoint URL (prefers at least 30rem of width)", { for: "endpoint-input" }),
      e("endpoint-input", "control", "group", undefined, { attrs: { type: "url" } }),
      e("interval-label", "label", "group", "Interval in minutes", { for: "interval-input" }),
      e("interval-input", "control", "group", undefined, { attrs: { type: "number", min: 1 } }),
      e("save", "button", "content", "Save settings")
    ],
    structure: [
      "The sidebar sits beside the content on wide screens (narrow side column, at most 20rem) and above it on narrow screens.",
      "Content nests four levels: content panel, fieldset group, row panel, and the checkbox with its label and hint.",
      "The endpoint field prefers at least 30rem of width, but it may never overflow its container: when the space is smaller it must shrink.",
      "The extremely long unbroken label must stay fully visible: it may wrap anywhere but must not be clipped or overflow.",
      "When preferences conflict, visibility of content and containment win."
    ],
    order: ["page-title", "side-1", "side-3", "sync-title", "group-legend", "auto-input", "endpoint-input", "interval-input", "save"],
    dynamic: [{ op: "text", id: "auto-hint", text: "Changes appear on every signed-in device within a minute. Devices that have been offline for more than 30 days must be re-approved by an administrator before they sync again." }],
    heldout: { text: { "interval-label": "SynchronizationIntervalInMinutesBetweenAutomaticAttempts" }, fontScale: 2 }
  },
  {
    id: "T12-adversarial-pricing",
    title: "Pricing comparison with conflicting demands",
    category: "adversarial",
    split: "heldout",
    pilot: false,
    goal: "Four pricing plans compared side by side, with wildly different feature-list lengths, a badge nested in one plan, very long plan names, and a request that conflicts with small screens.",
    elements: [
      e("pricing", "region", null, undefined, { tag: "section" }),
      e("pricing-title", "heading", "pricing", "Choose a plan", { level: 1 }),
      e("plans", "region", "pricing"),
      ...[
        ["free", "Free", "$0", ["1 project"]],
        ["team", "Team", "$12 per seat", ["Unlimited projects", "Shared libraries", "Version history", "Priority email support"]],
        ["business", "Business with advanced compliance controls", "$45 per seat", ["Everything in Team", "Single sign-on", "Audit log export", "Data residency", "Custom retention", "Dedicated success manager"]],
        ["enterprise", "Enterprise", "Contact sales", ["Everything in Business", "On-premises option"]]
      ].flatMap(([k, name, price, features]) => [
        e(`plan-${k}`, "panel", "plans", undefined, { tag: "article" }),
        ...(k === "team" ? [e("badge", "text", `plan-${k}`, "Most popular")] : []),
        e(`plan-${k}-name`, "heading", `plan-${k}`, name, { level: 2 }),
        e(`plan-${k}-price`, "text", `plan-${k}`, price),
        e(`plan-${k}-features`, "list", `plan-${k}`, undefined, { items: features }),
        e(`plan-${k}-choose`, "button", `plan-${k}`, k === "enterprise" ? "Talk to sales" : `Choose ${name.split(" ")[0]}`)
      ])
    ],
    structure: [
      "Stakeholder request: all four plans side by side at every screen width, with plan names on a single line that never wraps. On narrow screens this request cannot be met.",
      "Priority rule: content must remain fully visible, contained and readable; plans may wrap to fewer per line and names may wrap. Do not hide content to satisfy the request.",
      "Plans that share a line are equal width and their tops align. The choose action is the last element of each plan.",
      "The badge sits inside the Team plan, above its name."
    ],
    alignTop: [["plan-free", "plan-team", "plan-business", "plan-enterprise"]],
    equalWidth: [["plan-free", "plan-team", "plan-business", "plan-enterprise"]],
    pairs: [["plan-team-name", "plan-team-price"], ["badge", "plan-team-name"]],
    order: ["pricing-title", "plan-free", "plan-team", "plan-business", "plan-enterprise"],
    dynamic: [{ op: "text", id: "plan-enterprise-price", text: "Custom pricing for organizations with more than 500 seats" }],
    heldout: { text: { "plan-free-name": "Free for individuals and open-source maintainers" }, fontScale: 2 }
  }
];

export const VIEWPORTS = Object.freeze([320, 375, 768, 1024, 1440]);
export const DEV_VIEWPORTS = Object.freeze([375, 1024]);
