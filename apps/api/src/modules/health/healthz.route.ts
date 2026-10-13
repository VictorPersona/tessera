import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { Route } from "../../routes/routes.types.js";

const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = {
      success: {
        statusCode: 200,
        data: { message: "Tessera is working fine" },
      },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default new Route("/healthz", router);
