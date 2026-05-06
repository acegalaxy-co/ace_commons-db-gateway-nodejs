// Smoke test for @acegalaxy/db-gateway — no network calls, just verify package loads + exports.
// Run: npm test
const test = require("node:test");
const assert = require("node:assert/strict");

test("@acegalaxy/db-gateway: dist/index.js loads + primary exports present", () => {
  const m = require("../dist/index.js");
  assert.equal(typeof m.query, "function", "query should be exported");
});
