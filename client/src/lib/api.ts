const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export type ApiRequestOptions = RequestInit & { skipAuth?: boolean };

export function getToken() {
  return window.localStorage.getItem("travora_token");
}

export function getStoredUser<T = unknown>(): T | null {
  const raw = window.localStorage.getItem("travora_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { skipAuth, headers, ...requestOptions } = options;
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (response.status === 401) {
    window.localStorage.removeItem("travora_token");
    window.localStorage.removeItem("travora_user");
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (response.status === 403) throw new Error("You do not have permission to perform this action.");
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Something went wrong. Please try again.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function login(credentials: { username: string; password: string }) {
  return apiRequest<{ token: string; user: unknown }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    skipAuth: true,
  });
}

export function logout() {
  window.localStorage.removeItem("travora_token");
  window.localStorage.removeItem("travora_user");
}

export const travelRequestsApi = {
  list: () => apiRequest("/api/travel-requests"),
  get: (id: string) => apiRequest(`/api/travel-requests/${id}`),
  create: (payload: unknown) => apiRequest("/api/travel-requests", { method: "POST", body: JSON.stringify(payload) }),
  cancel: (id: string) => apiRequest(`/api/travel-requests/${id}/cancel`, { method: "POST" }),
};

export const approvalsApi = {
  pending: () => apiRequest("/api/approvals/pending"),
  approve: (id: string) => apiRequest(`/api/approvals/${id}/approve`, { method: "POST" }),
  reject: (id: string, reason?: string) => apiRequest(`/api/approvals/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),
};

export const reportsApi = {
  summary: () => apiRequest("/api/reports/summary"),
};

export const API_CONFIG = { baseUrl: API_BASE_URL };
