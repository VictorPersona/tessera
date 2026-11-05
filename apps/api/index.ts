import { config } from "dotenv";

config();
const appModule = await import("./app.js");

await appModule.StartServer();
