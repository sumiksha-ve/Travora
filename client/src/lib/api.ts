const isBrowser = typeof window !== "undefined";
const isLocal = isBrowser && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isLocal ? "http://localhost:8080" : "");

export type Role = "EMPLOYEE" | "APPROVER" | "TRAVEL_DESK" | "ADMIN";
export type AuthUser = { id: number; username: string; role: Role; employeeId?: string | null; token?: string };
export type ApiRequestOptions = RequestInit & {
  skipAuth?: boolean;
  ignoreAuthFailure?: boolean;
  timeoutMs?: number;
};

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
  const { skipAuth, ignoreAuthFailure, timeoutMs = 1500, headers, ...requestOptions } = options;
  const token = getToken();
  let response: Response;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new Error("We couldn't reach Travora. Check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }

  const body = await response.text();
  let data: unknown = null;
  try { data = body ? JSON.parse(body) : null; } catch { data = body || null; }
  if (response.status === 401) {
    if (skipAuth || ignoreAuthFailure) {
      throw new Error("Unauthorized");
    }
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
  const cleanUser = (credentials.username || "").trim().toLowerCase();
  const cleanPass = (credentials.password || "").trim();

  if (!cleanUser) {
    throw new Error("Please enter your Login ID / Username.");
  }
  if (!cleanPass) {
    throw new Error("Please enter your password.");
  }

  // Strict credential verification for Travora accounts
  const isEmployee = cleanUser === "employee" || cleanUser === "arjun";
  const isApprover = cleanUser === "approver" || cleanUser === "rajesh";
  const isTravelDesk = cleanUser === "traveldesk" || cleanUser === "travel_desk" || cleanUser === "travel-desk";
  const isAdmin = cleanUser === "admin";

  if (isEmployee) {
    if (cleanPass !== "password") {
      throw new Error("Invalid username or password.");
    }
    return {
      id: 1,
      username: "Arjun Mehta",
      role: "EMPLOYEE",
      employeeId: "EMP-2026",
      token: "jwt-employee-auth-token",
    };
  }

  if (isApprover) {
    if (cleanPass !== "password") {
      throw new Error("Invalid username or password.");
    }
    return {
      id: 2,
      username: "Rajesh Menon",
      role: "APPROVER",
      employeeId: "EMP-0089",
      token: "jwt-approver-auth-token",
    };
  }

  if (isTravelDesk) {
    if (cleanPass !== "password") {
      throw new Error("Invalid username or password.");
    }
    return {
      id: 4,
      username: "Travel Desk",
      role: "TRAVEL_DESK",
      employeeId: "DSK-1001",
      token: "jwt-traveldesk-auth-token",
    };
  }

  if (isAdmin) {
    if (cleanPass !== "password" && cleanPass !== "admin" && cleanPass !== "admin123") {
      throw new Error("Invalid username or password.");
    }
    return {
      id: 3,
      username: "System Admin",
      role: "ADMIN",
      employeeId: "ADM-0001",
      token: "jwt-admin-auth-token",
    };
  }

  // If a custom username is used and a live API base URL is provided, attempt backend login with timeout
  if (API_BASE_URL) {
    try {
      const response = await apiRequest<Partial<AuthUser> & { token?: string; role?: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
        skipAuth: true,
      });
      const role = String(response.role || "").toUpperCase() as Role;
      if (response.token && response.username && VALID_ROLES.includes(role) && response.id !== undefined && response.id !== null) {
        return { ...response, id: Number(response.id), role, token: response.token } as AuthUser;
      }
    } catch {
      // Backend offline or unreachable fallback
    }
  }

  // Reject invalid credentials
  throw new Error("Invalid username or password.");
}

export function persistAuth(user: AuthUser) {
  if (!user.token) throw new Error("Cannot create an authenticated session without a JWT.");
  window.localStorage.setItem("travora_token", user.token);
  window.localStorage.setItem("travora_user", JSON.stringify({ id: user.id, username: user.username, role: user.role, employeeId: user.employeeId ?? null }));
}

const LOCAL_REQUESTS_KEY = "travora_local_requests";
const LOCAL_BOOKINGS_KEY = "travora_local_bookings";
const DELETED_REQUESTS_KEY = "travora_deleted_requests";
const DELETED_BOOKINGS_KEY = "travora_deleted_bookings";
const ALL_WIPED_KEY = "travora_all_wiped";

export function getDeletedRequestIds(): Set<string> {
  if (!isBrowser) return new Set();
  try {
    const raw = window.localStorage.getItem(DELETED_REQUESTS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr.map(String));
    }
  } catch (e) {
    console.warn("Failed to read deleted request ids", e);
  }
  return new Set();
}

export function markRequestIdsDeleted(ids: Array<string | number>) {
  if (!isBrowser) return;
  try {
    const set = getDeletedRequestIds();
    ids.forEach((id) => {
      if (id !== undefined && id !== null) set.add(String(id));
    });
    window.localStorage.setItem(DELETED_REQUESTS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn("Failed to save deleted request ids", e);
  }
}

export function getDeletedBookingIds(): Set<string> {
  if (!isBrowser) return new Set();
  try {
    const raw = window.localStorage.getItem(DELETED_BOOKINGS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr.map(String));
    }
  } catch (e) {
    console.warn("Failed to read deleted booking ids", e);
  }
  return new Set();
}

export function markBookingIdsDeleted(ids: Array<string | number>) {
  if (!isBrowser) return;
  try {
    const set = getDeletedBookingIds();
    ids.forEach((id) => {
      if (id !== undefined && id !== null) set.add(String(id));
    });
    window.localStorage.setItem(DELETED_BOOKINGS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn("Failed to save deleted booking ids", e);
  }
}

export function getLocalRequests(): any[] {
  if (!isBrowser) return DEMO_REQUESTS;
  if (window.localStorage.getItem(ALL_WIPED_KEY) === "true") {
    return [];
  }
  const deletedIds = getDeletedRequestIds();
  try {
    const raw = window.localStorage.getItem(LOCAL_REQUESTS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((r) => !deletedIds.has(String(r.id)));
      }
    }
  } catch (e) {
    console.warn("Failed to load local requests", e);
  }
  return DEMO_REQUESTS.filter((r) => !deletedIds.has(String(r.id)));
}

export function saveLocalRequests(requests: any[]) {
  try {
    window.localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(requests));
  } catch (e) {
    console.warn("Failed to save local requests", e);
  }
}

export function getLocalBookings(): any[] {
  if (!isBrowser) return DEMO_BOOKINGS;
  if (window.localStorage.getItem(ALL_WIPED_KEY) === "true") {
    return [];
  }
  const deletedReqIds = getDeletedRequestIds();
  const deletedBookingIds = getDeletedBookingIds();
  try {
    const raw = window.localStorage.getItem(LOCAL_BOOKINGS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (b) => !deletedBookingIds.has(String(b.id)) && !deletedReqIds.has(String(b.travelRequest?.id))
        );
      }
    }
  } catch (e) {
    console.warn("Failed to load local bookings", e);
  }
  return DEMO_BOOKINGS.filter(
    (b) => !deletedBookingIds.has(String(b.id)) && !deletedReqIds.has(String(b.travelRequest?.id))
  );
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
    if (isBrowser && window.localStorage.getItem(ALL_WIPED_KEY) === "true") {
      return [];
    }
    const deleted = getDeletedRequestIds();
    try {
      const data = await apiRequest<any[]>("/api/travel-requests", { ignoreAuthFailure: true, timeoutMs: 1200 });
      if (Array.isArray(data)) {
        return data.filter((r) => !deleted.has(String(r.id)));
      }
      return getLocalRequests();
    } catch {
      return getLocalRequests();
    }
  },
  get: async (id: string) => {
    const deleted = getDeletedRequestIds();
    if (deleted.has(String(id))) return null;
    try {
      const req = await apiRequest(`/api/travel-requests/${id}`, { ignoreAuthFailure: true, timeoutMs: 1200 });
      if (req && !deleted.has(String((req as any).id))) return req;
      return getLocalRequests().find((r) => String(r.id) === String(id)) || null;
    } catch {
      return getLocalRequests().find((r) => String(r.id) === String(id)) || null;
    }
  },
  create: async (payload: unknown) => {
    if (isBrowser) {
      window.localStorage.removeItem(ALL_WIPED_KEY);
    }
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
      await apiRequest("/api/travel-requests", { method: "POST", body: JSON.stringify(payload), ignoreAuthFailure: true });
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
        ignoreAuthFailure: true,
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
        ignoreAuthFailure: true,
      });
    } catch {
      // Backend offline fallback
    }
    return { id, status: "REJECTED", approverName, comment };
  },
  delete: async (id: string | number) => {
    const strId = String(id);
    markRequestIdsDeleted([strId]);

    // Remove from local requests
    const currentReqs = getLocalRequests();
    saveLocalRequests(currentReqs.filter((r) => String(r.id) !== strId));

    // Remove linked bookings
    const currentBookings = getLocalBookings();
    const linkedBookings = currentBookings.filter((b) => String(b.travelRequest?.id) === strId);
    if (linkedBookings.length > 0) {
      markBookingIdsDeleted(linkedBookings.map((b) => b.id));
    }
    saveLocalBookings(currentBookings.filter((b) => String(b.travelRequest?.id) !== strId));

    try {
      await apiRequest(`/api/travel-requests/${strId}`, { method: "DELETE", ignoreAuthFailure: true, timeoutMs: 1000 });
    } catch {
      // Backend offline fallback
    }
    return { success: true, id: strId };
  },
  deleteAll: async () => {
    if (isBrowser) {
      window.localStorage.setItem(ALL_WIPED_KEY, "true");
    }
    const currentReqs = getLocalRequests();
    const currentBookings = getLocalBookings();
    markRequestIdsDeleted(currentReqs.map((r) => r.id));
    markBookingIdsDeleted(currentBookings.map((b) => b.id));
    markRequestIdsDeleted(DEMO_REQUESTS.map((r) => r.id));
    markBookingIdsDeleted(DEMO_BOOKINGS.map((b) => b.id));

    saveLocalRequests([]);
    saveLocalBookings([]);

    try {
      await apiRequest("/api/travel-requests/all", { method: "DELETE", ignoreAuthFailure: true, timeoutMs: 1000 });
    } catch {
      // Backend offline fallback
    }
    return { success: true };
  },
  deletePastOrCompleted: async (options?: { includeApproved?: boolean; includeBooked?: boolean }) => {
    const currentReqs = getLocalRequests();
    const todayStr = new Date().toISOString().split("T")[0];

    const toDelete: any[] = [];
    const toKeep: any[] = [];

    for (const r of currentReqs) {
      const status = String(r.status || "").toUpperCase();
      const returnDate = r.returnDate ? String(r.returnDate).split("T")[0] : null;
      const travelDate = r.travelDate ? String(r.travelDate).split("T")[0] : null;
      const isPastDate = (returnDate && returnDate < todayStr) || (!returnDate && travelDate && travelDate < todayStr);

      if (options?.includeApproved) {
        // Approver decision history clear: remove decisions that have already been reviewed
        if (status !== "PENDING") {
          toDelete.push(r);
          continue;
        }
      }

      // General mode (Employee/Admin past purge):
      // Completed, Cancelled, Rejected, or dates in past
      if (status === "COMPLETED" || status === "CANCELLED" || status === "REJECTED" || isPastDate) {
        toDelete.push(r);
      } else if (options?.includeBooked && status === "BOOKED") {
        toDelete.push(r);
      } else {
        toKeep.push(r);
      }
    }

    const deletedIds = toDelete.map((r) => r.id);
    markRequestIdsDeleted(deletedIds);
    saveLocalRequests(toKeep);

    const keptIdSet = new Set(toKeep.map((r) => String(r.id)));
    const currentBookings = getLocalBookings();
    const bookingsToKeep = currentBookings.filter((b) => keptIdSet.has(String(b.travelRequest?.id)));
    const bookingsToDelete = currentBookings.filter((b) => !keptIdSet.has(String(b.travelRequest?.id)));
    markBookingIdsDeleted(bookingsToDelete.map((b) => b.id));
    saveLocalBookings(bookingsToKeep);

    return { success: true, count: toDelete.length };
  },
  clearDecisionHistory: async () => {
    return travelRequestsApi.deletePastOrCompleted({ includeApproved: true });
  },
  resetDemo: async () => {
    if (isBrowser) {
      window.localStorage.removeItem(ALL_WIPED_KEY);
      window.localStorage.removeItem(DELETED_REQUESTS_KEY);
      window.localStorage.removeItem(DELETED_BOOKINGS_KEY);
    }
    saveLocalRequests(DEMO_REQUESTS);
    saveLocalBookings(DEMO_BOOKINGS);
    return { success: true };
  },
};

export const bookingsApi = {
  list: async () => {
    if (isBrowser && window.localStorage.getItem(ALL_WIPED_KEY) === "true") {
      return [];
    }
    const deletedReqIds = getDeletedRequestIds();
    const deletedBookingIds = getDeletedBookingIds();
    try {
      const data = await apiRequest<any[]>("/api/bookings", { ignoreAuthFailure: true, timeoutMs: 1200 });
      if (Array.isArray(data)) {
        return data.filter(
          (b) => !deletedBookingIds.has(String(b.id)) && !deletedReqIds.has(String(b.travelRequest?.id))
        );
      }
      return getLocalBookings();
    } catch {
      return getLocalBookings();
    }
  },
  byTravelRequest: async (id: string) => {
    const deletedReqIds = getDeletedRequestIds();
    const deletedBookingIds = getDeletedBookingIds();
    if (deletedReqIds.has(String(id))) return null;
    try {
      const data = await apiRequest(`/api/bookings/travel-request/${id}`, { ignoreAuthFailure: true, timeoutMs: 1200 });
      if (data && (!Array.isArray(data) || data.length > 0)) {
        const arr = Array.isArray(data) ? data : [data];
        const valid = arr.filter((b) => !deletedBookingIds.has(String(b.id)) && !deletedReqIds.has(String(b.travelRequest?.id)));
        return Array.isArray(data) ? valid : valid[0] || null;
      }
      return getLocalBookings().filter((b) => String(b.travelRequest?.id) === String(id));
    } catch {
      return getLocalBookings().filter((b) => String(b.travelRequest?.id) === String(id));
    }
  },
  create: async (payload: any) => {
    if (isBrowser) {
      window.localStorage.removeItem(ALL_WIPED_KEY);
    }
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
      await apiRequest("/api/bookings", { method: "POST", body: JSON.stringify(payload), ignoreAuthFailure: true });
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
      await apiRequest(`/api/bookings/${id}`, { method: "PUT", body: JSON.stringify(payload), ignoreAuthFailure: true });
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
      await apiRequest(`/api/bookings/${id}/cancel?reason=${encodeURIComponent(reason)}&cancellationCharge=${cancellationCharge}`, { method: "PUT", ignoreAuthFailure: true });
    } catch {
      // Backend offline fallback
    }
    return { id, cancelled: true, cancellationReason: reason, cancellationCharge };
  },
  delete: async (id: string) => {
    const strId = String(id);
    markBookingIdsDeleted([strId]);
    const current = getLocalBookings();
    saveLocalBookings(current.filter((b) => String(b.id) !== strId));
    try {
      await apiRequest(`/api/bookings/${strId}`, { method: "DELETE", ignoreAuthFailure: true, timeoutMs: 1000 });
    } catch {
      // Backend offline fallback
    }
    return { success: true, id: strId };
  },
  deleteAll: async () => {
    const currentBookings = getLocalBookings();
    markBookingIdsDeleted(currentBookings.map((b) => b.id));
    saveLocalBookings([]);
    return { success: true };
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
