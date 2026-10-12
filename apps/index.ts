import { config } from "dotenv";


config()
const appModule = await import("./api/app.js")

await appModule.StartServer()