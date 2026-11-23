# Contextual AI assistance interaction patterns
Date: 2026-11-23. Proposed requirements only; no implementation.

Unbound requires a reusable, brand-neutral, zero-runtime Forma presentation family for contextual AI assistance. Inventory existing public patterns first (help, drawer, work queue, freshness, alerts, status, diff, navigation); reuse rather than duplicate.

Needed public contracts if gaps are verified: contextual help trigger, answer/evidence inspector, uncertainty/freshness annotation, structured before/after proposal diff, simulation/impact summary, next safe action, notification grouping/digest, escalation indicator, model unavailable/degraded state. Every element must have semantic HTML, focus/keyboard behavior, responsive mobile layout, 200-400% zoom, screen-reader text, forced colors, reduced motion, and visual states for Draft/Proposed/Validated/AwaitingApproval/Applied/Verified/Unknown.

Do not add model calls, domain data fetching, permissions or financial commands to Forma. The consuming F#/Limen app owns state and authorized actions. Ensure mandatory holds and compliance notices cannot be hidden by a decorative assistant panel. Add machine-readable assistant metadata per component under existing AI-discoverable contract requirements. Validate with synthetic Unbound consumer fixtures.
