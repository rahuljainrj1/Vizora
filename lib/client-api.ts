type ApiResult<T> = {
  data?: T;
  error?: string;
};

export async function apiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);
  const payload = (await response.json().catch(() => ({}))) as ApiResult<T>;

  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }

  if (!("data" in payload)) {
    throw new Error("Malformed API response");
  }

  return payload.data as T;
}
