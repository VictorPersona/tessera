import { describe, expect, it } from "vitest";
import { DatabaseError } from "pg";
import {
  ConflictError,
  ConnectionError,
  PrivilegeError,
  RetryError,
  shouldRetry,
} from "../public.errors.js";
import { throwAppropriateError } from "../postgres.errormapping.js";

class ValidationError extends Error {}

const translated = (code: string): unknown => {
  const pgError = new DatabaseError("simulated", 0, "error");
  pgError.code = code;
  try {
    throwAppropriateError(pgError);
  } catch (err) {
    return err;
  }
};

const rawConnReset = Object.assign(new Error("socket hang up"), {
  code: "ECONNRESET",
});

describe("shouldRetry", () => {
  it.each([
    ["serialization failure (40001)", translated("40001")],
    ["deadlock (40P01)", translated("40P01")],
    ["ConnectionError", new ConnectionError()],
    ["raw ECONNRESET", rawConnReset],
  ])("retries %s", (_name, err) => {
    expect(shouldRetry(err)).toBe(true);
  });

  it.each([
    ["validation error", new ValidationError("document no longer exists")],
    ["ConflictError", new ConflictError("documents_pkey")],
    ["PrivilegeError", new PrivilegeError()],
    ["plain Error", new Error("bug")],
    ["a non-Error value", "oops"],
  ])("does not retry %s", (_name, err) => {
    expect(shouldRetry(err)).toBe(false);
  });

  it("translates both retryable codes to RetryError", () => {
    expect(translated("40001")).toBeInstanceOf(RetryError);
    expect(translated("40P01")).toBeInstanceOf(RetryError);
  });
});
