import assert from "node:assert/strict";
import test from "node:test";
import {
  crewLabel,
  missionById,
  missionsForProgram,
  nasaPrograms,
  nasaSpaceflights
} from "../catalog/example-data/nasa-spaceflight.mjs";

test("NASA example missions have unique stable ids and a common complete shape", () => {
  const ids = nasaSpaceflights.map(mission => mission.id);
  assert.equal(new Set(ids).size, ids.length);

  for (const mission of nasaSpaceflights) {
    for (const field of [
      "id", "name", "program", "missionType", "launchDate", "returnDate",
      "spacecraft", "launchVehicle", "destination", "status", "highlight"
    ]) {
      assert.equal(typeof mission[field], "string", `${mission.id} missing ${field}`);
      assert.ok(mission[field].length > 0, `${mission.id} has empty ${field}`);
    }

    assert.equal(mission.status, "Complete", `${mission.id} must be a completed reference mission`);
    assert.match(mission.launchDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(mission.returnDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(mission.returnDate >= mission.launchDate, `${mission.id} return precedes launch`);
    assert.equal(Array.isArray(mission.crew), true);
    assert.equal(mission.crewed, mission.crew.length > 0);
    assert.equal(mission.source.title.length > 0, true);
    assert.match(mission.source.url, /^https:\/\/(?:www\.)?nasa\.gov\//);
  }
});

test("the reference collection spans the intended NASA programs and data shapes", () => {
  assert.deepEqual(nasaPrograms, ["Gemini", "Apollo", "Space Shuttle", "Artemis"]);
  assert.deepEqual(missionsForProgram("Apollo").map(mission => mission.id), ["apollo-8", "apollo-11", "apollo-13"]);
  assert.equal(missionById("artemis-i").crewed, false);
  assert.equal(crewLabel(missionById("artemis-i")), "Uncrewed");
  assert.match(crewLabel(missionById("sts-95")), /John H\. Glenn/);
});

test("mission lookup fails loudly instead of inventing example data", () => {
  assert.throws(() => missionById("apollo-99"), /Unknown NASA example mission/);
});
