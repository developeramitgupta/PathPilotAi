export class PathPilotApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "PathPilotApiError";
  }
}

export async function requestPathPilot<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  let response: Response;
  try {
    response = await fetch(input, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new PathPilotApiError("PathPilot is offline or unreachable. Check your connection and try again.", 0);
  }

  const raw = await response.text();
  let payload: (T & { error?: string; requestId?: string }) | null = null;
  if (raw) {
    try {
      payload = JSON.parse(raw) as T & { error?: string; requestId?: string };
    } catch {
      if (response.ok) throw new PathPilotApiError("PathPilot returned an unreadable response. Please try again.", response.status);
    }
  }
  if (!response.ok) {
    throw new PathPilotApiError(
      payload?.error ?? "PathPilot could not complete that request.",
      response.status,
      payload?.requestId ?? response.headers.get("x-request-id") ?? undefined,
    );
  }
  if (!payload) throw new PathPilotApiError("PathPilot returned an empty response. Please try again.", response.status);
  return payload;
}
