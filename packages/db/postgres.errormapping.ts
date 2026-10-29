import { DatabaseError } from "pg";
import {
  ConflictError,
  ConnectionError,
  RetryError,
} from "./postgres.classes.js";

type PgErrorCode = "40001" | "40P01" | "42501";
type Errorclass = new (options?: { cause?: unknown }) => Error;
const PG_ERROR_CLASS_MAPPING = {
  "40001": RetryError,
  "40P01": RetryError,
  "42501": ConnectionError,
} satisfies Record<PgErrorCode, Errorclass>;

export const throwAppropriateError = (error: unknown) => {
  if (error instanceof DatabaseError && error.code) {
    if (error.code == "23505") {
      throw new ConflictError(error.constraint ?? "unknown", { cause: error });
    }

    const errorClass =
      PG_ERROR_CLASS_MAPPING[error.code as keyof typeof PG_ERROR_CLASS_MAPPING];

    if (errorClass) {
      throw new errorClass({ cause: error });
    }
  }

  throw error;
};
