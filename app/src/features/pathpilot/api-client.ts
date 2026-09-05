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

type PathPilotRequestInit = RequestInit & {
  /** Keep an unavailable integration from leaving an action permanently pending. */
  timeoutMs?: number;
};

export async function requestPathPilot<T>(
  input: RequestInfo | URL,
  init?: PathPilotRequestInit,
) {
  const { timeoutMs = 15_000, signal: suppliedSignal, ...requestInit } = init ?? {};
  const controller = new AbortController();
  let didTimeOut = false;
  const abortFromCaller = () => controller.abort(suppliedSignal?.reason);
  if (suppliedSignal) {
    if (suppliedSignal.aborted) abortFromCaller();
    else suppliedSignal.addEventListener("abort", abortFromCaller, { once: true });
  }
  const timeout = window.setTimeout(() => {
    didTimeOut = true;
    controller.abort();
  }, timeoutMs);

  let response: Response;
  try {
    response = await fetch(input, {
      ...requestInit,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(requestInit.body ? { "Content-Type": "application/json" } : {}),
        ...requestInit.headers,
      },
    });
  } catch (error) {
    if (didTimeOut) {
      throw new PathPilotApiError("This is taking longer than expected. Your work has not been lost—please try again.", 408);
    }
    if (suppliedSignal?.aborted) throw error;
    throw new PathPilotApiError("PathPilot is offline or unreachable. Check your connection and try again.", 0);
  } finally {
    window.clearTimeout(timeout);
    suppliedSignal?.removeEventListener("abort", abortFromCaller);
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
