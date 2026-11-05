import { config as loadDotenv } from "dotenv";
import { parseConfig } from "./parseConfig.js";
import type { Config } from "./schema.js";


loadDotenv({ quiet: true });

const result = parseConfig(process.env);

if (!result.ok) {
  console.error("Invalid configuration, refusing to start:");
  for (const line of result.errors) console.error(`  ${line}`);
  process.exit(1);
}

const deepFreeze = <T>(obj: T): Readonly<T> => {
  for (const value of Object.values(obj as object)) {
    if (value !== null && typeof value === "object") deepFreeze(value);
  }
  return Object.freeze(obj);
};

export const config: Config = deepFreeze(result.config);
export type { Config } from "./schema.js";
