export function ok<T>(data: T, status = 200): Response {
  return Response.json(
    {
      success: true,
      data,
    },
    { status },
  );
}

export function fail(message: string, status = 400, details?: unknown): Response {
  return Response.json(
    {
      success: false,
      error: message,
      details,
    },
    { status },
  );
}

export function isValidationError(error: unknown): error is { flatten: () => unknown } {
  return Boolean(
    error &&
      typeof error === "object" &&
      "flatten" in error &&
      typeof (error as { flatten: unknown }).flatten === "function",
  );
}
