import { z } from "zod";

const int = (min: number, max?: number) => {
  const n = z.coerce.number().int().min(min);
  return max === undefined ? n : n.max(max);
};

export const configSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: int(1, 65535).default(3000),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace"])
      .default("info"),

    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
    DATABASE_POOL_MAX: int(1).default(10),
    DATABASE_APP_NAME: z.string().min(1).optional(),

    S3_ENDPOINT: z.url().optional(),
    S3_REGION: z.string().min(1).default("us-east-1"),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
    S3_BUCKET: z.string().min(1).default("tessera-documents"),
    S3_FORCE_PATH_STYLE: z.stringbool().default(false),

    SHUTDOWN_TIMEOUT_MS: int(1000, 60000).default(8000),
    READINESS_DB_TIMEOUT_MS: int(100, 5000).default(1000),

    OTEL_EXPORTER_OTLP_ENDPOINT: z.url().optional(),
  })
  .superRefine((cfg, ctx) => {
    if (cfg.NODE_ENV === "production" && cfg.SHUTDOWN_TIMEOUT_MS >= 10000) {
      ctx.addIssue({
        code: "custom",
        path: ["SHUTDOWN_TIMEOUT_MS"],
        message:
          "must be < 10000 in production: Docker's default stop grace period is 10 s, after which it SIGKILLs the process and every in-flight request is lost",
      });
    }
  });

export type Config = Readonly<z.infer<typeof configSchema>>;

export const SECRET_KEYS: ReadonlySet<string> = new Set([
  "DATABASE_URL",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
]);
