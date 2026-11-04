import { afterEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import errMiddleware from "../error.middleware.js";
import { AppError } from "../../utils/response.js";
import {
  ConflictError,
  ConnectionError,
  PrivilegeError,
  RetryError,
} from "@tessera/db/errors";

const requestId = "test-request-id";

const callMiddleware = (err: unknown) => {
  const req = { requestId } as Request;

  const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  errMiddleware(err, req, res as unknown as Response, vi.fn() as NextFunction);
  return res;
};

const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});
afterEach(() => logSpy.mockClear());

describe("error middleware", () => {
  it.each([
    [
      "ConflictError",
      new ConflictError("documents_pkey"),
      409,
      "CONFLICT",
      false,
    ],
    ["RetryError", new RetryError(), 503, "TRY_AGAIN", false],
    ["PrivilegeError", new PrivilegeError(), 500, "INTERNAL", true],
    [
      "ConnectionError",
      new ConnectionError(),
      503,
      "SERVICE_UNAVAILABLE",
      true,
    ],
    [
      "AppError",
      new AppError(404, "NOT_FOUND", "Not found"),
      404,
      "NOT_FOUND",
      false,
    ],
  ])(
    "maps %s to its status and envelope",
    (_name, err, status, code, logged) => {
      const res = callMiddleware(err);

      expect(res.status).toHaveBeenCalledWith(status);
      expect(res.json).toHaveBeenCalledWith({
        error: { code, message: expect.any(String), requestId },
      });
      expect(logSpy).toHaveBeenCalledTimes(logged ? 1 : 0);
    },
  );

  it("turns an unknown error into a 500 with a request id and no internals", () => {
    const err = new Error("secret db text");
    const res = callMiddleware(err);

    expect(res.status).toHaveBeenCalledWith(500);
    // ?. because indexing an array may give undefined (noUncheckedIndexedAccess).
    const body = res.json.mock.calls[0]?.[0];
    expect(body).toEqual({
      error: { code: "INTERNAL", message: "Something went wrong", requestId },
    });
    expect(JSON.stringify(body)).not.toContain("secret db text");
    expect(JSON.stringify(body)).not.toContain(err.stack);
    // The full error goes to the log, tagged with the same id.
    expect(logSpy).toHaveBeenCalledWith(`requestId=${requestId}`, err);
  });
});
