import {
    json,
    type Application,
    type NextFunction,
    type Request,
    type Response
} from "express";
import helmet from "helmet";
import type { ErrorConfig } from "../utils/response.js";
import {
    AuthRouter,
    PublicRoutes
} from "./routes.data.js";

export const registerMiddlewares = (app: Application) => {
  app.use(helmet());
  app.use(json());
  for (const route of PublicRoutes) {
    app.use(route.path, route.router);
  }

  app.use("/v1", AuthRouter);

  app.use((req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(404).json(`${req.path} doesn't exist`);
    } catch (error) {
      next(error);
    }
  });
  app.use(
    (err: ErrorConfig, req: Request, res: Response, next: NextFunction) => {
      res
        .status(err.statusCode || 500)
        .json(err.errorMsg || "Internal Server Error");
    },
  );
};
