import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseCommand, intentPath } from "./search.ts";

describe("natural language admin search", () => {
  it("finds delayed orders today", () => {
    const intent = parseCommand("Find all delayed orders today.");
    assert.equal(intent.type, "orders");
    if (intent.type === "orders") assert.equal(intent.delayed, true);
    assert.equal(intentPath(intent), "/app/orders?delayed=1");
  });

  it("finds restaurants with cancellations", () => {
    const intent = parseCommand("Show restaurants with more than 10 cancellations this week.");
    assert.equal(intent.type, "restaurants");
    if (intent.type === "restaurants") assert.equal(intent.cancellationsGt, 10);
  });

  it("finds pending rider payouts", () => {
    const intent = parseCommand("Show rider payouts pending.");
    assert.equal(intent.type, "riders");
  });

  it("parses karimganj delayed over 30 minutes", () => {
    const intent = parseCommand("Show orders in Karimganj delayed over 30 minutes.");
    assert.equal(intent.type, "orders");
    if (intent.type === "orders") {
      assert.equal(intent.delayed, true);
      assert.equal(intent.minutes, 30);
      assert.equal(intent.city, "karimganj");
    }
    assert.equal(intentPath(intent), "/app/orders?delayed=1&city=karimganj&minutes=30");
  });

  it("opens a restaurant by name", () => {
    const intent = parseCommand("Open restaurant ABC");
    assert.equal(intent.type, "open");
    if (intent.type === "open") {
      assert.equal(intent.module, "restaurants");
      assert.match(intent.query ?? "", /abc/i);
    }
  });
});
