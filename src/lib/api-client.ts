import type { ApiEnvelope } from "@/lib/api-types";

function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return Boolean(
    value &&
      typeof value === "object" &&
      "success" in value &&
      typeof (value as { success: unknown }).success === "boolean",
  );
}

async function readJsonSafely(response: Response): Promise<unknown> {
  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return rawBody;
  }
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = await readJsonSafely(response);

  if (!response.ok) {
    if (isApiEnvelope(payload) && !payload.success) {
      throw new Error(payload.error ?? "Request failed.");
    }

    if (typeof payload === "string" && payload.trim()) {
      throw new Error(payload);
    }

    throw new Error(`Request failed with status ${response.status}.`);
  }

  if (!isApiEnvelope(payload)) {
    throw new Error("Invalid API response format.");
  }

  const envelope = payload as ApiEnvelope<T>;

  if (!envelope.success) {
    throw new Error(envelope.error ?? "Request failed.");
  }

  return envelope.data;
}

export async function apiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);
  return parseApiResponse<T>(response);
}