import { config } from "dotenv";


config()
const appModule = await import("./app.js") // CHANGED: file moved from apps/ into apps/api/

await appModule.StartServer()