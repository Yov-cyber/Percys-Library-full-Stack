export class AppError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

/** Client-facing HTTP status from AppError or legacy `{ statusCode }` throws. */
export function resolveClientStatusCode(err: unknown): number | undefined {
  if (err instanceof AppError) return err.statusCode;
  const statusCode = Number((err as Error & { statusCode?: number })?.statusCode);
  if (statusCode >= 400 && statusCode < 600) return statusCode;
  return undefined;
}
