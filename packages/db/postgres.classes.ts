export class ConflictError extends Error {
  constructor(
    public constraint: string,
    options?: { cause?: unknown },
  ) {
    super("Conflict Error", options);
  }
}

export class RetryError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Retry Error", options);
  }
}

export class PrivilegeError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Privilege Error", options);
  }
}
export class ConnectionError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Connection Error", options);
  }
}
