import { json, request, type Application, type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import { AuthenticatedRoutes, PublicRoutes } from "./routes.data.js";
import { authenticate } from "../utils/authenticate.js";
import { resolveTenant } from "../utils/resolveTenant.js";

export const registerMiddlewares = (app:Application)=>{
app.use(helmet());
app.use(json());
for(const route of PublicRoutes){
    app.use(route.path,route.router)
}
app.use(authenticate);
app.use(resolveTenant);
for(const route of AuthenticatedRoutes){
    app.use(route.path,route.router);
}

app.use((req:Request,res:Response,next:NextFunction)=>{
    try {
        res.status(404).json(`${req.path} doesn't exist`)
    } catch (error) {
        next(error)
    }
})
app.use((err:any,req:Request,res:Response,next:NextFunction)=>{
    res.status(err.statusCode||500).send("Response Handler Expected to be used here")
})
}