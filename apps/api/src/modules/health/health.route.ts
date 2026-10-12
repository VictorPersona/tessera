import { Router, type NextFunction, type Request, type Response } from "express";
import { Route } from "../../routes/routes.types.js";

const router =  Router();

router.get("/",(req:Request,res:Response,next:NextFunction)=>{
    try {
        res.send("tessera working fine")
    } catch (error) {
       console.error(error)
        next(error)
    }
})

export default new Route("/health",router);