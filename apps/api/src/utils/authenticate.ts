import type { NextFunction, Request, Response } from "express";
import { ErrorData, ResponseEnvelope } from "./response.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.header("Authorization")?.split(" ")[1]?.toString() 
    if (!token){
    throw new ResponseEnvelope({error:new ErrorData({statusCode:401,errorMsg:"Authentication Token not available. Please login"})});
    }
    next();
  } catch (error) {
    next(error);
  }
};
