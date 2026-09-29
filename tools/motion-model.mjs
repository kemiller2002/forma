// Deterministic physics-derived motion model (requirements/MOTION-AND-INTERACTION.md,
// MOT-008, MOT-010). These pure functions mirror the CSS derivations in
// src/styles/components.css so tests can check the CSS static fallbacks and
// preset ordering without a browser.

export const PRESETS = Object.freeze({
  light: Object.freeze({ mass: 0.65, stiffness: 1.15, damping: 0.94 }),
  standard: Object.freeze({ mass: 1, stiffness: 1, damping: 0.84 }),
  heavy: Object.freeze({ mass: 1.8, stiffness: 0.92, damping: 0.76 })
});

export const BASE_DURATION_MS = 180;

// Clamp bounds are part of the canonical derivation; they keep every preset
// inside a usable UI range.
export const BOUNDS = Object.freeze({
  inertia: Object.freeze([110, 420]),
  gravity: Object.freeze([100, 420]),
  state: Object.freeze([90, 240]),
  press: Object.freeze([70, 160]),
  exit: Object.freeze([80, 220])
});

export const FACTORS = Object.freeze({ state: 0.72, press: 0.5, exit: 0.68 });

const clamp = ([low, high]) => (value) => Math.min(high, Math.max(low, value));

// T_inertia ∝ sqrt(m / k) / ζ
export const inertiaDuration = ({ mass, stiffness, damping }, base = BASE_DURATION_MS) =>
  clamp(BOUNDS.inertia)((base * Math.sqrt(mass / stiffness)) / damping);

// T_gravity ∝ sqrt(2s / g). Mass is intentionally not a parameter.
export const gravityDuration = ({ distance = 1, gravity = 1 } = {}, base = BASE_DURATION_MS) =>
  clamp(BOUNDS.gravity)(base * Math.sqrt((2 * distance) / gravity));

const derived = (factor, bounds) => (preset, base = BASE_DURATION_MS) =>
  clamp(bounds)(inertiaDuration(preset, base) * factor);

export const stateDuration = derived(FACTORS.state, BOUNDS.state);
export const pressDuration = derived(FACTORS.press, BOUNDS.press);
export const exitDuration = derived(FACTORS.exit, BOUNDS.exit);

// The static fallback values authored in CSS for browsers without typed
// sqrt()/calc() multiplication: the standard preset, rounded to whole ms.
export const staticFallbacks = (preset = PRESETS.standard) =>
  Object.freeze({
    "--ef-motion-inertia-duration": Math.round(inertiaDuration(preset)),
    "--ef-motion-gravity-duration": Math.round(gravityDuration()),
    "--ef-motion-state-duration": Math.round(stateDuration(preset)),
    "--ef-motion-press-duration": Math.round(pressDuration(preset)),
    "--ef-motion-exit-duration": Math.round(exitDuration(preset))
  });

export const presetOrder = ["light", "standard", "heavy"];

// Parse a CSS time into milliseconds; returns NaN for anything else.
export const milliseconds = (value) => {
  const match = String(value).trim().match(/^(-?\d*\.?\d+)(ms|s)$/i);
  if (!match) return Number.NaN;
  return match[2].toLowerCase() === "s" ? Number(match[1]) * 1000 : Number(match[1]);
};
