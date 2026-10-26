import express from "express";
import { registerMiddlewares } from "./src/routes/routes.js";
export const StartServer = async () => {
  try {
    const app = express();
    registerMiddlewares(app);
    app.listen(process.env.PORT, () => {
      console.log(`Server started at PORT: ${process.env.PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.nextTick(() => process.exit(1));
  }
};
