import { describe, expect, it } from "vitest";
import { parseConfig } from "../src/parseConfig.js";

const minimal = {
  DATABASE_URL: "postgres://user:pw@localhost:5432/tessera",
  S3_ACCESS_KEY_ID: "id",
  S3_SECRET_ACCESS_KEY: "secret",
};

const errorsOf = (env: Record<string, string | undefined>): string[] => {
  const result = parseConfig(env);
  if (result.ok) throw new Error("expected parseConfig to fail");
  return result.errors;
};

const configOf = (env: Record<string, string | undefined>) => {
  const result = parseConfig(env);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.config;
};

describe("parseConfig", () => {
  it("applies every default when only the required variables are set", () => {
    expect(configOf(minimal)).toMatchObject({
      NODE_ENV: "development",
      PORT: 3000,
      LOG_LEVEL: "info",
      DATABASE_POOL_MAX: 10,
      S3_REGION: "us-east-1",
      S3_BUCKET: "tessera-documents",
      S3_FORCE_PATH_STYLE: false,
      SHUTDOWN_TIMEOUT_MS: 8000,
      READINESS_DB_TIMEOUT_MS: 1000,
    });
  });

  it("lists every missing required variable at once", () => {
    expect(errorsOf({}).sort()).toEqual([
      "DATABASE_URL: required",
      "S3_ACCESS_KEY_ID: required",
      "S3_SECRET_ACCESS_KEY: required",
    ]);
  });

  it("treats an empty string as unset", () => {
    expect(configOf({ ...minimal, PORT: "" }).PORT).toBe(3000);
    expect(errorsOf({ ...minimal, DATABASE_URL: "" })).toEqual([
      "DATABASE_URL: required",
    ]);
  });

  it("says a number was expected for PORT=abc", () => {
    const errors = errorsOf({ ...minimal, PORT: "abc" });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^PORT: .*expected number/);
  });

  it("enforces the PORT range", () => {
    expect(errorsOf({ ...minimal, PORT: "0" })[0]).toMatch(/^PORT: /);
    expect(errorsOf({ ...minimal, PORT: "65536" })[0]).toMatch(/^PORT: /);
  });

  it.each([
    ["false", false],
    ["true", true],
  ])("reads S3_FORCE_PATH_STYLE=%s as %s", (raw, expected) => {
    expect(
      configOf({ ...minimal, S3_FORCE_PATH_STYLE: raw }).S3_FORCE_PATH_STYLE,
    ).toBe(expected);
  });

  it("rejects a DATABASE_URL that isn't postgres:// or postgresql://", () => {
    expect(
      configOf({ ...minimal, DATABASE_URL: "postgresql://h/db" }).DATABASE_URL,
    ).toBe("postgresql://h/db");
    expect(errorsOf({ ...minimal, DATABASE_URL: "mysql://h/db" })).toEqual([
      "DATABASE_URL: invalid value (hidden)",
    ]);
  });

  it("never prints a secret's value, even when it's malformed", () => {
    const errors = errorsOf({
      ...minimal,
      PORT: "abc",
      DATABASE_URL: "hunter2",
      S3_SECRET_ACCESS_KEY: "hunter2",
    });
    expect(errors).toContain("DATABASE_URL: invalid value (hidden)");
    expect(errors.join("\n")).not.toContain("hunter2");
  });

  describe("production shutdown budget (Docker SIGKILLs after 10 s)", () => {
    it("rejects SHUTDOWN_TIMEOUT_MS >= 10000 in production, and says why", () => {
      const errors = errorsOf({
        ...minimal,
        NODE_ENV: "production",
        SHUTDOWN_TIMEOUT_MS: "10000",
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatch(/^SHUTDOWN_TIMEOUT_MS: .*10000.*Docker/);
    });

    it("allows 9999 in production", () => {
      expect(
        configOf({
          ...minimal,
          NODE_ENV: "production",
          SHUTDOWN_TIMEOUT_MS: "9999",
        }).SHUTDOWN_TIMEOUT_MS,
      ).toBe(9999);
    });

    it("allows 10000 outside production", () => {
      expect(
        configOf({ ...minimal, SHUTDOWN_TIMEOUT_MS: "10000" })
          .SHUTDOWN_TIMEOUT_MS,
      ).toBe(10000);
    });
  });
});
