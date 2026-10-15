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

export const registerMiddlewares = (app: Application) => {
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
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        error: {
          code: err.code,
          message: err.message,
        },
      });
    } else {
      res
        .status(500)
        .json({ error: { code: "INTERNAL", message: "Something went wrong" } });
        next();
    }
  });
};
