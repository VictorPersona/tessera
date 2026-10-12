import { Router, type NextFunction, type Request, type Response } from "express";
import { Route } from "../../routes/routes.types.js";
import { responseHanlder } from "../../utils/response.js";

const router =  Router();

router.get("/",(req:Request,res:Response,next:NextFunction)=>{
    try {
        const response:responseHanlder =new responseHanlder({statusCode:200,responseObj:{message:"Tessera is working fine",response:null}})
        res.status(response.statusCode).json(response)
    } catch (error) {
       
        next(error)
    }
})

export default new Route("/healthz",router);