import type { NextFunction, Request, Response } from "express";

export const resolveTenant = (req:Request,res:Response,next:NextFunction)=>{
try {
    console.log("Resolve Tenant middleware called")
    next()
} catch (error) {
    next(error)
}
}