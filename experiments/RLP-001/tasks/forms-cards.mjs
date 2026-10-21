// RLP-001 benchmark tasks: Forms and cards (T01–T04). See tasks.mjs.

import { e, LONG } from "./element.mjs";

export default [
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
  }
];
