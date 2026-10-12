import healthzRoute from "../modules/health/healthz.route.js";
import type { Route } from "./routes.types.js";

export const PublicRoutes:Route[] = [healthzRoute];
export const AuthenticatedRoutes:Route[] = []