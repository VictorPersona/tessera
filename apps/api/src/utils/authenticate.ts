import type { NextFunction, Request, Response } from "express";
import { AppError } from "./response.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1]?.toString();
    if (!token) {
      throw new AppError(
        401,
        "UNAUTHENTICATED",
        "Authentication Token not available. Please login",
      );
    }
    req.user = { token };
    next();
  } catch (error) {
    next(error);
  }
};
