import assert from "node:assert/strict";
import test from "node:test";
import { STATIC_REASONS, interactionProblems, staticActions, staticExplanation } from "../tools/catalog/interaction.mjs";

// The catalog check that every rendered action is declared (ULI-A01, A09, A10).
test("static scan finds enabled actions with Playwright roles and skips disabled ones", () => {
  const html = `<a href="#x">Go</a><a>Anchor</a><button type="button">Run</button><button disabled>Off</button>
    <button aria-disabled="true">Soft</button><input type="submit" value="Send"><input type="text">
    <details><summary>More</summary></details><input type="checkbox" role="switch"><div role="tab">Tab</div>`;
  assert.deepEqual(staticActions(html).map(item => item.role), ["link", "button", "button", "disclosure", "switch", "tab"]);
});

test("an enabled action without a declaration fails the catalog check", () => {
  assert.match(interactionProblems(null, `<button type="button">Save</button>`)[0], /without an interaction declaration/);
  assert.deepEqual(interactionProblems(null, `<p>No actions</p><button disabled>Off</button>`), []);
});

test("static declarations need known reasons and nothing else", () => {
  assert.deepEqual(interactionProblems({ kind: "static", reasons: ["application-behavior"] }, `<button>Save</button>`), []);
  assert.match(interactionProblems({ kind: "static", reasons: [] }, `<button>Save</button>`)[0], /at least one reason/);
  assert.match(interactionProblems({ kind: "static", reasons: ["because"] }, `<button>Save</button>`)[0], /unknown static reason/);
  assert.match(interactionProblems({ kind: "static", reasons: ["form-handling"], actions: [] }, `<button>Save</button>`)[0], /unexpected field/);
  assert.match(staticExplanation({ reasons: ["placeholder-navigation"] }), /placeholder destinations/);
  assert.ok(Object.keys(STATIC_REASONS).length >= 3);
});

test("live declarations must cover every rendered action with a supported outcome", () => {
  const html = `<button popovertarget="p">Open</button><div popover id="p"><button popovertarget="p">Close</button></div><a href="#t">Jump</a>`;
  const actions = [
    { role: "button", name: "Open", expect: { open: true } },
    { role: "button", name: "Close", expect: { open: false } },
    { role: "link", name: "Jump", expect: { url: "#t" } }
  ];
  assert.deepEqual(interactionProblems({ kind: "live", actions }, html), []);
  assert.match(interactionProblems({ kind: "live", actions: actions.slice(0, 2) }, html).join(), /renders 1 enabled link control\(s\) but declares 0/);
  assert.match(interactionProblems({ kind: "live", actions: [...actions, { role: "tab", name: "X", expect: { open: true } }] }, html).join(), /does not render/);
  assert.match(interactionProblems({ kind: "live", actions: [{ role: "link", name: "Jump", expect: { clicked: true } }] }, `<a href="#t">Jump</a>`).join(), /not a supported outcome/);
  assert.match(interactionProblems({ kind: "live", actions: [{ role: "link", name: "Jump", expect: { url: "/elsewhere" } }] }, `<a href="#t">Jump</a>`).join(), /invalid value/);
  assert.match(interactionProblems({ kind: "live", actions: [{ role: "link", name: "Jump", expect: { url: "#t", open: true } }] }, `<a href="#t">Jump</a>`).join(), /exactly one outcome/);
  assert.match(interactionProblems({ kind: "live", actions }, `<p>none</p>`)[0], /renders no enabled action/);
  assert.match(interactionProblems({ kind: "maybe" }, html)[0], /must be "live" or "static"/);
});

test("live reset declarations may prepare a field and assert its restored value", () => {
  const html = `<form><label>Name <input value="Artemis"></label><button type="reset">Reset</button></form>`;
  const declaration = { kind: "live", actions: [{
    role: "button", name: "Reset", prepare: { kind: "fill", target: { role: "textbox", name: "Name" }, value: "Changed" }, expect: { value: "Artemis" }
  }] };
  assert.deepEqual(interactionProblems(declaration, html), []);
  assert.match(interactionProblems({ kind: "live", actions: [{ ...declaration.actions[0], prepare: { kind: "click" } }] }, html)[0], /prepare.kind/);
});

test("same-named actions in different landmarks are distinct declarations", () => {
  const html = `<nav><a href="#c">Get started</a></nav><main><a href="#c">Get started</a></main>`;
  const one = [{ role: "link", name: "Get started", expect: { url: "#c" } }];
  assert.match(interactionProblems({ kind: "live", actions: [...one, ...one] }, html).join(), /renders 2 enabled link/);
  const scoped = [
    { role: "link", name: "Get started", within: { role: "navigation" }, expect: { url: "#c" } },
    { role: "link", name: "Get started", within: { role: "main" }, expect: { url: "#c" } }
  ];
  assert.deepEqual(interactionProblems({ kind: "live", actions: scoped }, html), []);
});
