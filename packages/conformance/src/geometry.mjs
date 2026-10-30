import { expect } from "@playwright/test";
import { STATUS, evaluateContainment, evaluateFocusVisibility } from "./evaluate.mjs";
import { settleFontsAndFrames } from "./settle.mjs";

// Geometry adapters for layout reliability (LRP-001): element containment and
// focus-indicator clipping. Like index.mjs, they only observe; evaluate.mjs
// decides. Re-exported from index.mjs, so the package API is unchanged.

// ---------------------------------------------------------------------------
// ULI-L05: element containment (contain.element)
// ---------------------------------------------------------------------------
// Every descendant box and text line of the element lies inside its content
// box. Not observed (their contracts permit overflow): popovers, dialogs
// other than the element itself, fixed-position layers, anything matching
// `exclude`, and the contents of a nested scroll or clip container (that
// container's own box is still measured). `axes` is ["inline"] (default) or
// ["inline", "block"].
export const measureContainment = async (locator, { axes = ["inline"], exclude = null, tolerance } = {}) => {
  await expect(locator).toBeVisible();
  await settleFontsAndFrames(locator);
  const observation = await locator.evaluate((root, { axes, exclude }) => {
    const px = value => parseFloat(value) || 0;
    const style = getComputedStyle(root);
    const box = root.getBoundingClientRect();
    const content = {
      left: box.left + px(style.borderLeftWidth) + px(style.paddingLeft),
      right: box.right - px(style.borderRightWidth) - px(style.paddingRight),
      top: box.top + px(style.borderTopWidth) + px(style.paddingTop),
      bottom: box.bottom - px(style.borderBottomWidth) - px(style.paddingBottom)
    };
    const describe = element => {
      const classes = [...element.classList].slice(0, 2).map(name => "." + name).join("");
      return element.tagName.toLowerCase() + classes;
    };
    const layer = element => element.matches("[popover], dialog") || getComputedStyle(element).position === "fixed" || (exclude && element.matches(exclude));
    const contains = element => {
      const own = getComputedStyle(element);
      return own.overflowX !== "visible" || own.overflowY !== "visible";
    };
    const rectItem = (label, rect) => ({ label, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom });
    const visit = element => {
      if (layer(element) || !element.checkVisibility()) return [];
      const rect = element.getBoundingClientRect();
      if (rect.width <= 1 && rect.height <= 1) return []; // visually hidden
      const self = [rectItem(describe(element), rect)];
      return contains(element) ? self : [...self, ...observeChildren(element)];
    };
    const textItems = (text, owner) => {
      if (!text.textContent.trim()) return [];
      const range = document.createRange();
      range.selectNodeContents(text);
      const label = `${describe(owner)} "${text.textContent.trim().slice(0, 40)}"`;
      return [...range.getClientRects()].filter(rect => rect.width > 0).map(rect => rectItem(label, rect));
    };
    const observeChildren = element => [...element.childNodes].flatMap(node =>
      node.nodeType === Node.ELEMENT_NODE ? visit(node)
        : node.nodeType === Node.TEXT_NODE ? textItems(node, element) : []);
    return {
      name: describe(root) + (root.id ? "#" + root.id : ""),
      content,
      axes,
      items: observeChildren(root)
    };
  }, { axes, exclude });
  return evaluateContainment(observation, tolerance === undefined ? {} : { tolerance });
};

export const expectContained = async (locator, options) => {
  const report = await measureContainment(locator, options);
  const detail = report.escapes.slice(0, 8).map(escape => `${escape.label}: ${escape.side} +${escape.excess}px`).join("\n");
  expect(report.status, `${report.ruleId} ${report.check} ${report.status}: ${report.name}: ${report.reason}\n${detail}`).toBe(STATUS.PASS);
  return report;
};

// ---------------------------------------------------------------------------
// WCAG 2.4.7 / 2.4.11: the focused element's indicator is painted and unclipped
// ---------------------------------------------------------------------------
// Observes document.activeElement: whether it paints an outline or
// box-shadow, how far that indicator extends, and every ancestor that would
// clip it (overflow other than visible, or contain: paint).
export const measureFocusVisibility = async page => {
  await settleFontsAndFrames(page);
  const observation = await page.evaluate(() => {
    const element = document.activeElement;
    if (!element || element === document.body) return { name: null, ring: null, viewport: null };
    const style = getComputedStyle(element);
    // An indicator is a visible outline or an outward box-shadow with a
    // spread: a decorative 0 1px 2px shadow, an inset shadow or a
    // transparent outline is not a focus indicator.
    const visibleColor = color => !/^transparent$|rgba?\([^)]*[,/]\s*0(\.0+)?\s*\)$/.test(color.trim());
    const outline = style.outlineStyle !== "none" && (parseFloat(style.outlineWidth) || 0) > 0 && visibleColor(style.outlineColor)
      ? (parseFloat(style.outlineWidth) || 0) + Math.max(0, parseFloat(style.outlineOffset) || 0) : 0;
    const layers = style.boxShadow === "none" ? [] : style.boxShadow.split(/,(?![^(]*\))/);
    const shadowReach = Math.max(0, ...layers
      .filter(layer => !/\binset\b/.test(layer))
      .map(layer => {
        const color = layer.match(/rgba?\([^)]*\)|transparent/)?.[0] ?? "currentcolor";
        const [x = 0, y = 0, , spread = 0] = [...layer.replace(/rgba?\([^)]*\)/, "").matchAll(/(-?[\d.]+)px/g)].map(([, value]) => +value);
        return spread >= 1 && visibleColor(color) ? Math.max(Math.abs(x), Math.abs(y)) + spread : 0;
      }));
    const reach = Math.max(outline, shadowReach);
    const rect = element.getBoundingClientRect();
    const ring = { left: rect.left - reach, top: rect.top - reach, right: rect.right + reach, bottom: rect.bottom + reach };
    const ancestors = [];
    for (let node = element.parentElement; node && node !== document.documentElement; node = node.parentElement) ancestors.push(node);
    // Overflow clips at the padding box: inside the borders. A scroll
    // container's edge is a scroll position the user controls; a hidden or
    // clip edge is not (see evaluateFocusVisibility).
    const clips = ancestors
      .filter(node => { const own = getComputedStyle(node); return own.overflowX !== "visible" || own.overflowY !== "visible" || /paint|strict|content/.test(own.contain); })
      .map(node => {
        const box = node.getBoundingClientRect();
        const own = getComputedStyle(node);
        const px = value => parseFloat(value) || 0;
        return {
          label: node.tagName.toLowerCase() + [...node.classList].slice(0, 1).map(name => "." + name).join(""),
          scrolls: /auto|scroll/.test(own.overflowX + " " + own.overflowY),
          left: box.left + px(own.borderLeftWidth), top: box.top + px(own.borderTopWidth),
          right: box.right - px(own.borderRightWidth), bottom: box.bottom - px(own.borderBottomWidth)
        };
      });
    const label = (element.getAttribute("aria-label") || element.textContent || element.tagName).replace(/\s+/g, " ").trim().slice(0, 40);
    return { name: label, indicator: reach > 0, ring, clips, viewport: { width: document.documentElement.clientWidth, height: window.innerHeight } };
  });
  return evaluateFocusVisibility(observation);
};

export const expectFocusVisible = async page => {
  const report = await measureFocusVisibility(page);
  expect(report.status, `${report.ruleId} ${report.check} ${report.status}: "${report.name}": ${report.reason}`).toBe(STATUS.PASS);
  return report;
};
