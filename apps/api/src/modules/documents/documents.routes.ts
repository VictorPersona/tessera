import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { Route } from "../../routes/routes.types.js";
import documentsRepository from "./documents.repository.js";
const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  const documents: any[] = [];
  res.status(200).json(documents);

  next();
});

export default new Route("/documents", router);
