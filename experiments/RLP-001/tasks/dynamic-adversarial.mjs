// RLP-001 benchmark tasks: Dynamic content and adversarial (T09–T12). See tasks.mjs.

import { e } from "./element.mjs";

export default [
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
