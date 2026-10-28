import { Router } from "express";
import healthzRoute from "../modules/health/healthz.route.js";
import type { Route } from "./routes.types.js";
import { authenticate } from "../utils/authenticate.js";
import { resolveTenant } from "../utils/resolveTenant.js";
import documentsRoutes from "../modules/documentsAndJobs/documents.routes.js";

export const PublicRoutes: Route[] = [healthzRoute];
export const AuthenticatedRoutes: Route[] = [documentsRoutes];

export const AuthRouter: Router = Router();
AuthRouter.use(authenticate);
AuthRouter.use(resolveTenant);
for (const route of AuthenticatedRoutes) {
  AuthRouter.use(route.path, route.router);
}
