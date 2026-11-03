import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/response.js";
import { ConflictError, RetryError, PrivilegeError, ConnectionError } from "../../../../packages/db/postgres.classes.js";



type ErrClass = new (...args: never[]) => Error;

type ErrEntry = {
  errClass: ErrClass;
  status: number;
  code: string;
  message: string;
  log: boolean;
};

const classToErr: ErrEntry[] = [
  {
    errClass: ConflictError,
    status: 409,
    code: "CONFLICT",
    message: "This already exists.",
    log: false,
  },
  {
    errClass: RetryError,
    status: 503,
    code: "TRY_AGAIN",
    message: "Temporary failure, please retry.",
    log: false,
  },
  {
    errClass: PrivilegeError,
    status: 500,
    code: "INTERNAL",
    message: "Something went wrong",
    log: true,
  },
  {
    errClass: ConnectionError,
    status: 503,
    code: "SERVICE_UNAVAILABLE",
    message: "Service temporarily unavailable, please retry.",
    log: true,
  },
];

const findErrEntry = (err: unknown) =>
  classToErr.find((entry) => err instanceof entry.errClass);

const errMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const requestId = req.requestId;
  const entry = findErrEntry(err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        requestId,
      },
    });
  } else if (entry) {
    if (entry.log) console.error(`requestId=${requestId}`, err);
    res.status(entry.status).json({
      error: { code: entry.code, message: entry.message, requestId },
    });
  } else {
    console.error(`requestId=${requestId}`, err);
    res.status(500).json({
      error: { code: "INTERNAL", message: "Something went wrong", requestId },
    });
  }
};

export default errMiddleware;
