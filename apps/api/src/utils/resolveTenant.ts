import type { NextFunction, Request, Response } from "express";
import { ErrorData, ResponseEnvelope } from "./response.js";

export const resolveTenant = (req:Request,res:Response,next:NextFunction)=>{
try {
    if(!req.user.userId)throw new ResponseEnvelope({error:new ErrorData({statusCode:401,errorMsg:"No Authentication Token Provided. Please Login Again"})})
    console.log("Resolve Tenant middleware called")
    next()
} catch (error) {
    next(error)
}
}