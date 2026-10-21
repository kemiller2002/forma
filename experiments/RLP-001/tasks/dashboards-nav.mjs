// RLP-001 benchmark tasks: Dashboards and navigation (T05–T08). See tasks.mjs.

import { e } from "./element.mjs";

export default [
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
  }
];
