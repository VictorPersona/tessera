import { configSchema, SECRET_KEYS, type Config } from "./schema.js";

export type ParseResult =
  { ok: true; config: Config } | { ok: false; errors: string[] };

export const parseConfig = (
  env: Record<string, string | undefined>,
): ParseResult => {
  const cleaned = Object.fromEntries(
    Object.entries(env).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );

  const result = configSchema.safeParse(cleaned);
  if (result.success) {
    return { ok: true, config: result.data };
  }

  const errors = result.error.issues.map((issue) => {
    const key = issue.path.join(".");
    if (issue.code === "invalid_type" && !(key in cleaned))
      return `${key}: required`;
    if (SECRET_KEYS.has(key)) return `${key}: invalid value (hidden)`;
    return `${key}: ${issue.message}`;
  });
  return { ok: false, errors };
};
