import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { Route } from "../../routes/routes.types.js";
import documentsService from "./documents.service.js";
import { AppError } from "../../utils/response.js";

const router = Router();

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (typeof req.params.id != "string")
      throw new AppError(
        400,
        "BAD_REQUEST",
        "The provided ID must be a valid non-empty string.",
      );
    const documents = await documentsService.getDocument(req.params.id);
    res.status(200).json(documents);
  } catch (error) {
    next(error);
  }
});

export default new Route("/documents", router);
