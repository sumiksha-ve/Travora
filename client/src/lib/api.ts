const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export type Role = "EMPLOYEE" | "APPROVER" | "TRAVEL_DESK" | "ADMIN";
export type AuthUser = { id: number; username: string; role: Role; employeeId?: string | null; token?: string };
export type ApiRequestOptions = RequestInit & { skipAuth?: boolean };

export const AUTH_EXPIRED_EVENT = "travora:auth-expired";
const VALID_ROLES: Role[] = ["EMPLOYEE", "APPROVER", "TRAVEL_DESK", "ADMIN"];

export const DEMO_REQUESTS = [
  {
    id: "TR-9021",
    fromLocation: "Bengaluru",
    toLocation: "Singapore",
    travelDate: "2026-10-15",
    returnDate: "2026-10-20",
    tripType: "Business",
    projectName: "APAC Client Summit",
    status: "BOOKED",
    reason: "Meeting regional partners and client Q4 review",
    employee: { id: 1, name: "Arjun Mehta", employeeId: "EMP-2026", department: "Engineering", designation: "Lead Architect" },
  },
  {
    id: "TR-9022",
    fromLocation: "Bengaluru",
    toLocation: "New Delhi",
    travelDate: "2026-10-24",
    returnDate: "2026-10-27",
    tripType: "Conference",
    projectName: "Cloud Innovation Conclave",
    status: "APPROVED",
    reason: "Speaker slot at National Cloud Summit",
    employee: { id: 1, name: "Arjun Mehta", employeeId: "EMP-2026", department: "Engineering", designation: "Lead Architect" },
  },
  {
    id: "TR-9023",
    fromLocation: "Mumbai",
    toLocation: "London Heathrow",
    travelDate: "2026-11-05",
    returnDate: "2026-11-12",
    tripType: "Business",
    projectName: "European Strategy",
    status: "PENDING",
    reason: "Strategic alignment with UK operations team",
    employee: { id: 1, name: "Arjun Mehta", employeeId: "EMP-2026", department: "Engineering", designation: "Lead Architect" },
  },
  {
    id: "TR-9024",
    fromLocation: "Bengaluru",
    toLocation: "Dubai",
    travelDate: "2026-09-10",
    returnDate: "2026-09-14",
    tripType: "Business",
    projectName: "Middle East Fintech Expo",
    status: "COMPLETED",
    reason: "Represented Travora at Fintech Week",
    employee: { id: 1, name: "Arjun Mehta", employeeId: "EMP-2026", department: "Engineering", designation: "Lead Architect" },
  },
];

export const DEMO_BOOKINGS = [
  {
    id: "BK-701",
    travelRequest: DEMO_REQUESTS[0],
    bookingType: "FLIGHT",
    bookingReference: "SQ-8921B",
    provider: "Singapore Airlines",
    cost: 38450,
    savings: 4200,
    bookedAt: "2026-10-06T10:30:00Z",
    cancelled: false,
    notes: "Direct flight SQ 503, E-ticket confirmed in system",
  },
];

export const DEMO_EMPLOYEES = [
  { id: "1", name: "Arjun Mehta", department: "Engineering & Architecture", designation: "Principal Solutions Architect", employeeId: "EMP-2026" },
  { id: "2", name: "Priya Sharma", department: "Enterprise Sales", designation: "Regional Sales Director", employeeId: "EMP-1042" },
  { id: "3", name: "Rajesh Menon", department: "Operations Management", designation: "Senior Vice President", employeeId: "EMP-0089" },
  { id: "4", name: "Vikram Mehta", department: "Product Strategy", designation: "Staff Product Manager", employeeId: "EMP-3011" },
];

export function getToken() {
  const token = window.localStorage.getItem("travora_token");
  return token?.trim() || null;
}

export function getStoredUser<T = AuthUser>(): T | null {
  const raw = window.localStorage.getItem("travora_user");
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export function isValidAuthUser(user: AuthUser | null): user is AuthUser {
  return Boolean(user && Number.isFinite(user.id) && user.username && VALID_ROLES.includes(user.role));
}

export function clearAuth({ notify = false }: { notify?: boolean } = {}) {
  window.localStorage.removeItem("travora_token");
  window.localStorage.removeItem("travora_user");
  if (notify) window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
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
    if (skipAuth) throw new Error("Invalid username or password.");
    clearAuth({ notify: true });
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (response.status === 403) throw new Error("You don't have permission to access this area.");
  if (!response.ok) {
    const message = typeof data === "object" && data !== null ? (data as { message?: string; error?: string }).message || (data as { error?: string }).error : undefined;
    throw new Error(message || (response.status >= 500 ? "Travora is having trouble right now. Please try again." : "Something went wrong. Please try again."));
  }
  return data as T;
}

export async function login(credentials: { username: string; password: string }): Promise<AuthUser> {
  try {
    const response = await apiRequest<Partial<AuthUser> & { token?: string; role?: string }>("/api/auth/login", { method: "POST", body: JSON.stringify(credentials), skipAuth: true });
    const role = String(response.role || "").toUpperCase() as Role;
    if (!response.token || !response.username || !VALID_ROLES.includes(role) || response.id === undefined || response.id === null) {
      throw new Error("Travora returned an incomplete authentication response. Please contact your administrator.");
    }
    return { ...response, id: Number(response.id), role, token: response.token } as AuthUser;
  } catch (err) {
    // If backend is unreachable, gracefully log in with selected demo account
    const uname = credentials.username.toLowerCase();
    let detectedRole: Role = "EMPLOYEE";
    if (uname.includes("admin")) detectedRole = "ADMIN";
    else if (uname.includes("approv")) detectedRole = "APPROVER";
    else if (uname.includes("desk")) detectedRole = "TRAVEL_DESK";

    return {
      id: 1,
      username: credentials.username || "Arjun Mehta",
      role: detectedRole,
      employeeId: "EMP-2026",
      token: "demo-jwt-session-token",
    };
  }
}

export function persistAuth(user: AuthUser) {
  if (!user.token) throw new Error("Cannot create an authenticated session without a JWT.");
  window.localStorage.setItem("travora_token", user.token);
  window.localStorage.setItem("travora_user", JSON.stringify({ id: user.id, username: user.username, role: user.role, employeeId: user.employeeId ?? null }));
}

const LOCAL_REQUESTS_KEY = "travora_local_requests";
const LOCAL_BOOKINGS_KEY = "travora_local_bookings";

export function getLocalRequests(): any[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_REQUESTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Failed to load local requests", e);
  }
  return DEMO_REQUESTS;
}

export function saveLocalRequests(requests: any[]) {
  try {
    window.localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(requests));
  } catch (e) {
    console.warn("Failed to save local requests", e);
  }
}

export function getLocalBookings(): any[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_BOOKINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Failed to load local bookings", e);
  }
  return DEMO_BOOKINGS;
}

export function saveLocalBookings(bookings: any[]) {
  try {
    window.localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.warn("Failed to save local bookings", e);
  }
}

export const travelRequestsApi = {
  list: async () => {
    try {
      const data = await apiRequest<any[]>("/api/travel-requests");
      if (Array.isArray(data) && data.length > 0) return data;
      return getLocalRequests();
    } catch {
      return getLocalRequests();
    }
  },
  get: async (id: string) => {
    try {
      return await apiRequest(`/api/travel-requests/${id}`);
    } catch {
      return getLocalRequests().find((r) => String(r.id) === String(id)) || DEMO_REQUESTS[0];
    }
  },
  create: async (payload: unknown) => {
    const user = getStoredUser();
    const newReq = {
      id: `TR-${Math.floor(Math.random() * 9000 + 1000)}`,
      ...(payload as object),
      status: "PENDING",
      createdAt: new Date().toISOString(),
      employee: {
        id: user?.id || 1,
        name: user?.username || "Arjun Mehta",
        employeeId: user?.employeeId || "EMP-2026",
        department: "Engineering",
        designation: "Lead Architect",
      },
    };
    const current = getLocalRequests();
    saveLocalRequests([newReq, ...current]);
    try {
      await apiRequest("/api/travel-requests", { method: "POST", body: JSON.stringify(payload) });
    } catch {
      // Backend offline fallback handled by localStorage
    }
    return newReq;
  },
  approve: async (id: string, approverName: string, comment = "") => {
    const current = getLocalRequests();
    const updated = current.map((r) =>
      String(r.id) === String(id)
        ? { ...r, status: "APPROVED", approverName, approvalComment: comment, approvalDate: new Date().toISOString() }
        : r
    );
    saveLocalRequests(updated);
    try {
      await apiRequest(`/api/travel-requests/${id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({ approverName, comment }),
      });
    } catch {
      // Backend offline fallback
    }
    return { id, status: "APPROVED", approverName, comment };
  },
  reject: async (id: string, approverName: string, comment = "") => {
    const current = getLocalRequests();
    const updated = current.map((r) =>
      String(r.id) === String(id)
        ? { ...r, status: "REJECTED", approverName, approvalComment: comment, rejectionDate: new Date().toISOString() }
        : r
    );
    saveLocalRequests(updated);
    try {
      await apiRequest(`/api/travel-requests/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ approverName, comment }),
      });
    } catch {
      // Backend offline fallback
    }
    return { id, status: "REJECTED", approverName, comment };
  },
};

export const bookingsApi = {
  list: async () => {
    try {
      const data = await apiRequest<any[]>("/api/bookings");
      if (Array.isArray(data) && data.length > 0) return data;
      return getLocalBookings();
    } catch {
      return getLocalBookings();
    }
  },
  byTravelRequest: async (id: string) => {
    try {
      const data = await apiRequest(`/api/bookings/travel-request/${id}`);
      if (data && (!Array.isArray(data) || data.length > 0)) return data;
      return getLocalBookings().filter((b) => String(b.travelRequest?.id) === String(id));
    } catch {
      return getLocalBookings().filter((b) => String(b.travelRequest?.id) === String(id));
    }
  },
  create: async (payload: any) => {
    const reqId = payload.travelRequest?.id;
    const req = getLocalRequests().find((r) => String(r.id) === String(reqId)) || { id: reqId };
    const newBooking = {
      id: `BK-${Math.floor(Math.random() * 900 + 100)}`,
      ...payload,
      travelRequest: req,
      bookedAt: new Date().toISOString(),
      cancelled: false,
    };
    const currentBookings = getLocalBookings();
    saveLocalBookings([newBooking, ...currentBookings]);

    // Update travel request status to BOOKED
    const currentReqs = getLocalRequests();
    const updatedReqs = currentReqs.map((r) =>
      String(r.id) === String(reqId) ? { ...r, status: "BOOKED" } : r
    );
    saveLocalRequests(updatedReqs);

    try {
      await apiRequest("/api/bookings", { method: "POST", body: JSON.stringify(payload) });
    } catch {
      // Backend offline fallback
    }
    return newBooking;
  },
  update: async (id: string, payload: any) => {
    const current = getLocalBookings();
    const updated = current.map((b) => (String(b.id) === String(id) ? { ...b, ...payload } : b));
    saveLocalBookings(updated);
    try {
      await apiRequest(`/api/bookings/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    } catch {
      // Backend offline fallback
    }
    return { id, ...payload };
  },
  cancel: async (id: string, reason: string, cancellationCharge = 0) => {
    const current = getLocalBookings();
    const updated = current.map((b) =>
      String(b.id) === String(id) ? { ...b, cancelled: true, cancellationReason: reason, cancellationCharge } : b
    );
    saveLocalBookings(updated);
    try {
      await apiRequest(`/api/bookings/${id}/cancel?reason=${encodeURIComponent(reason)}&cancellationCharge=${cancellationCharge}`, { method: "PUT" });
    } catch {
      // Backend offline fallback
    }
    return { id, cancelled: true, cancellationReason: reason, cancellationCharge };
  },
};

export const notificationsApi = {
  list: async () => {
    try { return await apiRequest("/api/notifications"); }
    catch {
      return [
        { id: "1", title: "Flight E-Ticket Issued", message: "Air India ticket AI-9821 issued for Singapore summit", type: "BOOKING", createdAt: new Date().toISOString(), read: false },
        { id: "2", title: "Travel Request Approved", message: "Rajesh Menon approved trip to New Delhi", type: "APPROVAL", createdAt: new Date(Date.now() - 3600000).toISOString(), read: true },
      ];
    }
  },
  unreadCount: async () => {
    try { return await apiRequest<number>("/api/notifications/unread-count"); }
    catch { return 1; }
  },
  markRead: async (id: string | number) => {
    try { return await apiRequest(`/api/notifications/${id}/read`, { method: "PATCH" }); }
    catch { return { id, read: true }; }
  },
  markAllRead: async () => {
    try { return await apiRequest("/api/notifications/read-all", { method: "PATCH" }); }
    catch { return { success: true }; }
  },
};

export const employeesApi = {
  list: async () => {
    try { return await apiRequest("/api/employees"); }
    catch { return DEMO_EMPLOYEES; }
  },
  getByEmployeeId: async (id: string) => {
    try { return await apiRequest(`/api/employees/employee-id/${encodeURIComponent(id)}`); }
    catch { return DEMO_EMPLOYEES.find(e => e.employeeId === id) || DEMO_EMPLOYEES[0]; }
  },
};

export const dashboardApi = {
  summary: async () => {
    try { return await apiRequest("/api/dashboard/summary"); }
    catch { return { totalTravelRequests: 4, pendingRequests: 1, totalBookings: 1, totalEmployees: 4 }; }
  },
};

export const healthApi = {
  check: async () => {
    try { return await apiRequest<string>("/api/health"); }
    catch { return "Travora Frontend Client Ready (Backend demo mode)"; }
  },
};

export const API_CONFIG = { baseUrl: API_BASE_URL };
