declare global {
  namespace Express {
    interface Request {
      user?: object;
      tenantId?: string;
      requestId: string;
    }
  }
}

export {};
