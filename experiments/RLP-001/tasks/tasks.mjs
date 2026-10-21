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
//
// Definitions live in one module per pair of categories; this module is the
// single entry point and preserves the original order.

import formsCards from "./forms-cards.mjs";
import dashboardsNav from "./dashboards-nav.mjs";
import dynamicAdversarial from "./dynamic-adversarial.mjs";

export const TASKS = [...formsCards, ...dashboardsNav, ...dynamicAdversarial];

export const VIEWPORTS = Object.freeze([320, 375, 768, 1024, 1440]);
export const DEV_VIEWPORTS = Object.freeze([375, 1024]);
