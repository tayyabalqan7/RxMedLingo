import { describe, it, expect } from "vitest";
import { parseDosage, stripDosageTokens } from "./dosageParser.js";

describe("parseDosage", () => {
  it("parses strength and frequency", () => {
    const result = parseDosage("Tab Panadol 500mg twice daily for 5 days");
    expect(result.strength).toBe("500mg");
    expect(result.frequency).toBe("twice daily");
    expect(result.duration).toBe("5 days");
  });

  it("parses abbreviated frequencies", () => {
    const result = parseDosage("Amoxil 250mg bid");
    expect(result.frequency).toBe("twice daily");
  });

  it("returns null for unknown lines", () => {
    const result = parseDosage("Dr. Ahmed Clinic");
    expect(result.strength).toBeNull();
    expect(result.frequency).toBeNull();
    expect(result.duration).toBeNull();
  });
});

describe("stripDosageTokens", () => {
  it("removes dosage tokens leaving drug name", () => {
    const name = stripDosageTokens("Tab Panadol 500mg twice daily for 5 days");
    expect(name.toLowerCase()).toContain("panadol");
    expect(name.toLowerCase()).not.toContain("500mg");
    expect(name.toLowerCase()).not.toContain("twice");
  });
});
