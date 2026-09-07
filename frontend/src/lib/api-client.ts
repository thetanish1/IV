const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api").replace(/\/$/, "");

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (err: unknown) {
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

