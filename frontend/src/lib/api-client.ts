const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api").replace(/\/$/, "");

export async function apiRequest<T>(
 endpoint: string,
 options: RequestInit = {}
): Promise<T> {
 const token = typeof window !=="undefined"? localStorage.getItem("token") : null;
 const headers = new Headers(options.headers || {});

 if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
 headers.set("Content-Type","application/json");
 }

 if (token && !headers.has("Authorization")) {
 headers.set("Authorization", `Bearer ${token}`);
 }

 const response = await fetch(`${API_BASE_URL}${endpoint}`, {
 ...options,
 headers,
 });

 if (!response.ok) {
 let errorMessage ="An unexpected error occurred";
 try {
 const errorData = await response.json();
 errorMessage = errorData.detail || errorMessage;
 } catch {
 errorMessage = response.statusText;
 }
 throw new Error(errorMessage);
 }

 return response.json();
}

export function getExportUrl(type: 'applications' | 'payments', params?: Record<string, string>): string {
 const token = typeof window !=="undefined"? localStorage.getItem("token") :"";
 const query = new URLSearchParams(params || {});
 if (token) {
 query.set("token", token);
 }
 return `${API_BASE_URL}/admin/export/${type}?${query.toString()}`;
}
