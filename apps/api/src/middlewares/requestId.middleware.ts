import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";


export const genReqId = (req: Request, res: Response, next: NextFunction) => {
  const reqId = randomUUID();
  req.requestId = reqId;

  res.setHeader("X-Request-Id", reqId);
  next();
};
