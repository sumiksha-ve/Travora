const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export type Role = "EMPLOYEE" | "APPROVER" | "TRAVEL_DESK" | "ADMIN";
export type AuthUser = { id: number; username: string; role: Role; employeeId?: string | null; token?: string };
export type ApiRequestOptions = RequestInit & { skipAuth?: boolean };

export function getToken() { return window.localStorage.getItem("travora_token"); }

export function getStoredUser<T = AuthUser>(): T | null {
  const raw = window.localStorage.getItem("travora_user");
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { skipAuth, headers, ...requestOptions } = options;
  const token = getToken();
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers: { "Content-Type": "application/json", ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    });
  } catch {
    throw new Error("We couldn't reach Travora. Check your connection and try again.");
  }
  const body = await response.text();
  let data: unknown = null;
  try { data = body ? JSON.parse(body) : null; } catch { data = body || null; }
  if (response.status === 401) {
    clearAuth();
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (response.status === 403) throw new Error("You don't have permission to access this area.");
  if (!response.ok) {
    const message = typeof data === "object" && data !== null ? (data as { message?: string; error?: string }).message || (data as { error?: string }).error : undefined;
    throw new Error(message || (response.status >= 500 ? "Travora is having trouble right now. Please try again." : "Something went wrong. Please try again."));
  }
  return data as T;
}

export async function login(credentials: { username: string; password: string }) {
  return apiRequest<AuthUser>("/api/auth/login", { method: "POST", body: JSON.stringify(credentials), skipAuth: true });
}

export function persistAuth(user: AuthUser) {
  window.localStorage.setItem("travora_token", user.token || "");
  window.localStorage.setItem("travora_user", JSON.stringify(user));
}

export function clearAuth() {
  window.localStorage.removeItem("travora_token");
  window.localStorage.removeItem("travora_user");
}

export const travelRequestsApi = {
  list: () => apiRequest("/api/travel-requests"),
  get: (id: string) => apiRequest(`/api/travel-requests/${id}`),
  create: (payload: unknown) => apiRequest("/api/travel-requests", { method: "POST", body: JSON.stringify(payload) }),
  approve: (id: string, approverName: string, comment = "") => apiRequest(`/api/travel-requests/${id}/approve`, { method: "PATCH", body: JSON.stringify({ approverName, comment }) }),
  reject: (id: string, approverName: string, comment = "") => apiRequest(`/api/travel-requests/${id}/reject`, { method: "PATCH", body: JSON.stringify({ approverName, comment }) }),
};

export const bookingsApi = {
  list: () => apiRequest("/api/bookings"),
  byTravelRequest: (id: string) => apiRequest(`/api/bookings/travel-request/${id}`),
  create: (payload: unknown) => apiRequest("/api/bookings", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: unknown) => apiRequest(`/api/bookings/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  cancel: (id: string, reason: string, cancellationCharge = 0) => apiRequest(`/api/bookings/${id}/cancel?reason=${encodeURIComponent(reason)}&cancellationCharge=${cancellationCharge}`, { method: "PUT" }),
};

export const employeesApi = { list: () => apiRequest("/api/employees"), getByEmployeeId: (id: string) => apiRequest(`/api/employees/employee-id/${encodeURIComponent(id)}`) };
export const dashboardApi = { summary: () => apiRequest("/api/dashboard/summary") };
export const API_CONFIG = { baseUrl: API_BASE_URL };
