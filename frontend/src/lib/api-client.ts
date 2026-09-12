const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api").replace(/\/$/, "");

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 90000,
  maxRetries: number = 2
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const isMutation = options.method && ["POST", "PUT", "PATCH", "DELETE"].includes(options.method.toUpperCase());
  const isAuthRequired = Boolean(token);

  if ((isMutation || isAuthRequired) && !headers.has("Cache-Control")) {
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    headers.set("Pragma", "no-cache");
  }

  // Normalize path to prevent /api/api
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (API_BASE_URL.endsWith("/api") && cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = cleanEndpoint.replace(/^\/api/, "");
  }

  const url = `${API_BASE_URL}${cleanEndpoint}`;
  const requestCache: RequestCache = options.cache || (isMutation || isAuthRequired ? "no-store" : "default");

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        cache: requestCache,
        ...options,
        headers,
        signal: options.signal || controller.signal,
      });

      if (!response.ok) {
        let errorMessage = "An unexpected error occurred";
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = response.statusText || `Request failed with status ${response.status}`;
        }

        // Retry 502/503/504 cold-start errors if attempts remain
        if ((response.status === 502 || response.status === 503 || response.status === 504) && attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
          continue;
        }

        throw new Error(errorMessage);
      }

      return response.json();
    } catch (err: unknown) {
      if (attempt < maxRetries && err instanceof Error) {
        const isNetworkErr =
          err.name === "AbortError" ||
          err.message.includes("Failed to fetch") ||
          err.message.includes("NetworkError") ||
          err.message.includes("timeout") ||
          err.message.includes("Load failed");

        if (isNetworkErr) {
          await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
          continue;
        }
      }

      if (err instanceof Error) {
        if (err.name === "AbortError" || err.message.toLowerCase().includes("abort") || err.message.toLowerCase().includes("timeout")) {
          throw new Error("Request timed out or connection was interrupted. Please try again.");
        }
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error("Unable to connect to the server after multiple attempts.");
}

export function getExportUrl(type: 'applications' | 'payments', params?: Record<string, string>): string {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const query = new URLSearchParams(params || {});
  if (token) {
    query.set("token", token);
  }
  return `${API_BASE_URL}/admin/export/${type}?${query.toString()}`;
}

export function getImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const cleanBase = API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
}

