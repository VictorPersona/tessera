import type { NextFunction, Request, Response } from "express";

export const resolveTenant = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    req.tenantId = "deadbeef-dead-4bef-a555-deadbeefdead";
    next();
  } catch (error) {
    next(error);
  }
};
