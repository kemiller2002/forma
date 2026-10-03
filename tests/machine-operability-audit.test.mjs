import test from "node:test";
import assert from "node:assert/strict";
import { deriveMachineContract } from "../tools/catalog/machine-operability.mjs";

const component = (slug, behavior = "HTML / CSS") => ({ slug, behavior });

test("static semantic content passes", () => {
  const result = deriveMachineContract(component("prose"), "<article><h2>Summary</h2><p>Text</p></article>");
  assert.equal(result.interaction, "static");
  assert.equal(result.status, "pass");
});

test("native controls expose semantic machine actions", () => {
  const result = deriveMachineContract(component("switch"), '<label for="n">Notifications</label><input id="n" type="checkbox" role="switch">');
  assert.equal(result.interaction, "native");
  assert.ok(result.actions.includes("native-form-control"));
  assert.equal(result.status, "pass");
});

test("application-owned interactive components require executable parity evidence", () => {
  const result = deriveMachineContract(component("tabs", "Application / Limen"), '<button type="button" role="tab" id="t" aria-controls="p" aria-selected="true">Overview</button><section id="p" role="tabpanel" aria-labelledby="t"></section>');
  assert.equal(result.status, "needs-test");
});

test("reorder direct manipulation requires move controls", () => {
  const good = deriveMachineContract(component("reorder-states", "Application / Limen"), '<li data-ef-manipulation="dragging"><button aria-label="Move Reliability up">Up</button><button aria-label="Move Reliability down">Down</button></li>');
  assert.notEqual(good.status, "needs-retrofit");

  const bad = deriveMachineContract(component("reorder-states", "Application / Limen"), '<li data-ef-manipulation="dragging">Reliability</li>');
  assert.equal(bad.status, "needs-retrofit");
});

test("broken semantic references require retrofit", () => {
  const result = deriveMachineContract(component("dialog"), '<button commandfor="missing">Open</button>');
  assert.equal(result.status, "needs-retrofit");
});
