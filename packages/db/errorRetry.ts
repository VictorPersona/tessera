import { ConnectionError, RetryError } from "./postgres.classes.js";
import { checkIfCONNError } from "./postgres.errormapping.js";

const retryableClasses = [RetryError, ConnectionError];

export const shouldRetry = (err: unknown): boolean => {
  const isRetryClass = retryableClasses.some((entry) => err instanceof entry);
  const isConnErr = checkIfCONNError(err);
  return isRetryClass || isConnErr;
};
