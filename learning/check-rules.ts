import assert from "node:assert/strict";
import { flags, type Shipment } from "../lib/checks.ts";
const s: Shipment = {
  id: "test",
  mawb: "020-12345675",
  route: "FRA → JFK",
  pieces: "24",
  weight: "1200",
  manifestPieces: "24",
  manifestWeight: "1200",
  mrn: "26DE12345678901234",
  procedure: "T1",
  status: "pending",
  checks: [false, false, false, false, false],
  documents: [],
  history: [],
};
assert.deepEqual(flags(s), []);
assert(flags({ ...s, mrn: "", manifestPieces: "22" }).includes("Missing MRN"));
assert(
  flags({ ...s, mrn: "", manifestPieces: "22" }).includes(
    "Piece count mismatch",
  ),
);
assert(flags({ ...s, manifestWeight: "1100" }).includes("Weight mismatch"));
assert(flags({ ...s, weight: "-2" }).includes("Incomplete pieces / weight"));
assert(flags({ ...s, mrn: "not-a-reference" }).includes("Check MRN format"));
assert.equal(flags({ ...s, mrn: "" }, true)[0], "MRN fehlt");
assert(
  flags({ ...s, customsStatus: "release", evidence: "" }).includes(
    "Missing customs-status source",
  ),
);
console.log("8 comparison checks passed.");
