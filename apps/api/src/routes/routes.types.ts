import type { Router } from "express";

export class Route{
    private static registeredPaths:string[] = [];
    constructor(
        public path:string,
        public router:Router
    ){
        if(!path.startsWith('/'))throw `${path} should start with '/'.`
        if(Route.registeredPaths.find(p=>p===path))throw `${path} is already registered`;
        Route.registeredPaths.push(path);
    }
}

export type Routes = Route[];