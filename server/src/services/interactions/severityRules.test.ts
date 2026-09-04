import { describe, it, expect } from "vitest";
import { findCuratedInteraction } from "./severityRules.js";

describe("findCuratedInteraction", () => {
  it("detects warfarin + ibuprofen as red", () => {
    const result = findCuratedInteraction("warfarin", "ibuprofen");
    expect(result).not.toBeNull();
    expect(result?.severity).toBe("red");
  });

  it("detects interaction regardless of order", () => {
    const a = findCuratedInteraction("ibuprofen", "warfarin");
    const b = findCuratedInteraction("warfarin", "ibuprofen");
    expect(a?.severity).toBe(b?.severity);
  });

  it("returns null for unrelated pair", () => {
    const result = findCuratedInteraction("vitamin c", "calcium");
    expect(result).toBeNull();
  });
});
