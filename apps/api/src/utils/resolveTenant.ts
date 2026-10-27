import type { NextFunction, Request, Response } from "express";

export const resolveTenant = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    req.tenantId = "StubTenantID";
    next();
  } catch (error) {
    next(error);
  }
};
