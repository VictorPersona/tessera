declare global {
  namespace Express {
    interface Request {
      user?: object;
      tenantId?: string;
    }
  }
}

export {};
