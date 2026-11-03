import {
  json,
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";

import { AuthRouter, PublicRoutes } from "./routes.data.js";
import { AppError } from "../utils/response.js";
import { genReqId } from "../middlewares/requestId.middleware.js";
import errMiddleware from "../middlewares/error.middleware.js";

export const registerMiddlewares = (app: Application) => {
  app.use(genReqId);
  app.use(helmet());
  app.use(json());
  for (const route of PublicRoutes) {
    app.use(route.path, route.router);
  }

  app.use("/v1", AuthRouter);

  app.use((req: Request, res: Response, next: NextFunction) => {
    try {
      throw new AppError(404, "NOT_FOUND", "Request path doesn't exist");
    } catch (error) {
      next(error);
    }
  });
  app.use(errMiddleware);
};
