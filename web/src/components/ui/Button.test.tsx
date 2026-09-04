import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button.js";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeDefined();
  });

  it("is disabled when loading", () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true);
  });
});