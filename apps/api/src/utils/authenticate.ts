import type { NextFunction, Request, Response } from "express";

export const authenticate  = (req:Request,res:Response,next:NextFunction)=>{
try {
    
    console.log("Authenticate middleware called")
    next();
} catch (error) {
    next(error)
}
}