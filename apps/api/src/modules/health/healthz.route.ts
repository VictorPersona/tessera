import { Router, type NextFunction, type Request, type Response } from "express";
import { Route } from "../../routes/routes.types.js";
import { ResponseEnvelope, responseHanlder } from "../../utils/response.js";

const router =  Router();

router.get("/",(req:Request,res:Response,next:NextFunction)=>{
    try {
        const response =new ResponseEnvelope({success:{statusCode:200,data:{message:"Tessera is working fine",response:null}}})
        res.status(response.responseObj.).json(response)
    } catch (error) {
       
        next(error)
    }
})

export default new Route("/healthz",router);