import { describe, expect, it } from "vitest";
import { config } from "../src/index.js";

describe("config", () => {
  it("is frozen, so nothing can change it at runtime", () => {
    expect(Object.isFrozen(config)).toBe(true);
    expect(() => {
      (config as { PORT: number }).PORT = 1;
    }).toThrow(TypeError);
  });
});
