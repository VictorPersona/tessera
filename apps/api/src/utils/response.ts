
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public message: string,
  ) {
    super(message);
  }
}
