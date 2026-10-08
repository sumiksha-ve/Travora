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

export type EmployeeAccount = {
  id: number;
  employeeNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName: string;
  fullName: string;
  workEmail: string;
  department: string;
  designation: string;
};

export const REGISTERED_EMPLOYEES: EmployeeAccount[] = [
  {
    id: 101,
    employeeNumber: "AGR0001",
    firstName: "Suresh Babu",
    lastName: "Dangeti",
    displayName: "Suresh Babu Dangeti",
    fullName: "Suresh Babu Dangeti",
    workEmail: "suresh@agrpetro.com",
    department: "Petroleum Operations",
    designation: "Executive",
  },
  {
    id: 102,
    employeeNumber: "AGR0003",
    firstName: "Ganesh",
    lastName: "Kakarla",
    displayName: "Ganesh Kakarla",
    fullName: "Ganesh Kakarla",
    workEmail: "site.er4@agrpetro.com",
    department: "Site Operations",
    designation: "Site Engineer",
  },
  {
    id: 103,
    employeeNumber: "AGR0007",
    firstName: "Anil",
    lastName: "Kukreja",
    displayName: "Anil Kukreja",
    fullName: "Anil Kukreja",
    workEmail: "anil.kukreja@agrpetro.com",
    department: "Operations",
    designation: "Manager",
  },
  {
    id: 104,
    employeeNumber: "AGR0009",
    firstName: "Ramana",
    lastName: "M",
    displayName: "Ramana M",
    fullName: "Ramana M",
    workEmail: "sureshbabu506@gmail.com",
    department: "Operations",
    designation: "Operations Executive",
  },
  {
    id: 105,
    employeeNumber: "MISPL0001",
    firstName: "Umamaheswari",
    lastName: "Yandapalli",
    displayName: "Umamaheswari Yandapalli",
    fullName: "Umamaheswari Yandapalli",
    workEmail: "umamaheswari@gmail.com",
    department: "Corporate Management",
    designation: "Director",
  },
  {
    id: 106,
    employeeNumber: "MISPL0002",
    firstName: "Kalyan",
    middleName: "Swaroop",
    lastName: "Yandapalli",
    displayName: "YKS",
    fullName: "Kalyan Swaroop Yandapalli",
    workEmail: "yks@mahathiinfra.com",
    department: "Executive Management",
    designation: "Managing Director",
  },
  {
    id: 107,
    employeeNumber: "MISPL0003",
    firstName: "Himani",
    lastName: "Agarwal",
    displayName: "Himani Agarwal",
    fullName: "Himani Agarwal",
    workEmail: "himani.ag@mahathiinfra.com",
    department: "Finance & Accounts",
    designation: "Finance Manager",
  },
  {
    id: 108,
    employeeNumber: "MISPL0007",
    firstName: "Sirisha",
    lastName: "Vegaraju",
    displayName: "Sirisha Vegaraju",
    fullName: "Sirisha Vegaraju",
    workEmail: "sirisha@mahathiinfra.com",
    department: "Administration",
    designation: "Executive Admin",
  },
  {
    id: 109,
    employeeNumber: "MISPL0014",
    firstName: "Vijaya Kumar",
    lastName: "Bgam",
    displayName: "Bagam Vijaya Kumar",
    fullName: "Vijaya Kumar Bgam",
    workEmail: "kumar.bv@mahathiinfra.com",
    department: "Project Engineering",
    designation: "Senior Project Engineer",
  },
  {
    id: 110,
    employeeNumber: "MISPL0016",
    firstName: "P",
    lastName: "Satheesh",
    displayName: "P Satheesh",
    fullName: "P Satheesh",
    workEmail: "satheesh@mahathiinfra.com",
    department: "Field Engineering",
    designation: "Project Lead",
  },
  {
    id: 111,
    employeeNumber: "MISPL0020",
    firstName: "Satya",
    middleName: "Prasad",
    lastName: "B",
    displayName: "B Satya Prasad",
    fullName: "Satya Prasad B",
    workEmail: "satya.prasad@mahathiinfra.com",
    department: "Procurement",
    designation: "Procurement Manager",
  },
  {
    id: 112,
    employeeNumber: "MISPL0027",
    firstName: "M Murali",
    middleName: "Dhara",
    lastName: "Reddy",
    displayName: "M Murali Dhara Reddy",
    fullName: "M Murali Dhara Reddy",
    workEmail: "murali.reddy@mahathiinfra.com",
    department: "Infrastructure Planning",
    designation: "General Manager",
  },
  {
    id: 113,
    employeeNumber: "MISPL0130",
    firstName: "Deena",
    middleName: "Raju",
    lastName: "Karra",
    displayName: "Deena Raju Karra",
    fullName: "Deena Raju Karra",
    workEmail: "deenaraju@mahathiinfra.com",
    department: "Commercial & Contracts",
    designation: "Commercial Manager",
  },
  {
    id: 114,
    employeeNumber: "MISPL0164",
    firstName: "D Vasantha",
    lastName: "Lakshmi",
    displayName: "D Vasantha Lakshmi",
    fullName: "D Vasantha Lakshmi",
    workEmail: "hr@mahathiinfra.com",
    department: "Human Resources",
    designation: "HR Head",
  },
  {
    id: 115,
    employeeNumber: "MISPL0275",
    firstName: "Sulamangalam",
    middleName: "Dinesh",
    lastName: "Kumar",
    displayName: "S Dinesh Kumar",
    fullName: "Sulamangalam Dinesh Kumar",
    workEmail: "dinesh.s@mahathiinfra.com",
    department: "Quality Assurance",
    designation: "QA/QC Lead",
  },
  {
    id: 116,
    employeeNumber: "MISPL0333",
    firstName: "Mohan",
    lastName: "Jagatha",
    displayName: "Mohan Jagatha",
    fullName: "Mohan Jagatha",
    workEmail: "mohan.j@mahathiinfra.com",
    department: "Logistics & Supply",
    designation: "Supply Chain Executive",
  },
  {
    id: 117,
    employeeNumber: "MISPL0372",
    firstName: "Vidyasagar",
    lastName: "Gorantala",
    displayName: "G Vidyasagar",
    fullName: "Vidyasagar Gorantala",
    workEmail: "vidyasagar.g@mahathiinfra.com",
    department: "Civil & Structural",
    designation: "Structural Engineer",
  },
  {
    id: 118,
    employeeNumber: "MISPL0387",
    firstName: "Thenmozhi",
    lastName: "S",
    displayName: "Thenmozhi",
    fullName: "Thenmozhi S",
    workEmail: "thenmozhi@mahathiinfra.com",
    department: "Design & Drafting",
    designation: "Senior Design Engineer",
  },
  {
    id: 119,
    employeeNumber: "MISPL0402",
    firstName: "G Yathish",
    middleName: "Sai Krishna",
    lastName: "Posi",
    displayName: "G Yathish Posi Sai Krishna",
    fullName: "G Yathish Sai Krishna Posi",
    workEmail: "yathish.g@mahathiinfra.com",
    department: "Instrumentation",
    designation: "Instrumentation Engineer",
  },
  {
    id: 120,
    employeeNumber: "MISPL0409",
    firstName: "Ravi",
    middleName: "Raghavendra Durga Prasad",
    lastName: "K",
    displayName: "K Ravi Raghavendra Durga Prasad",
    fullName: "Ravi Raghavendra Durga Prasad K",
    workEmail: "prasad@mahathiinfra.com",
    department: "Electrical & Instrumentation",
    designation: "Project Manager",
  },
  {
    id: 121,
    employeeNumber: "MISPL0415",
    firstName: "Kranthi",
    lastName: "Bharkam",
    displayName: "Kranthi Bharkam",
    fullName: "Kranthi Bharkam",
    workEmail: "kranthi.b@mahathiinfra.com",
    department: "Mechanical Systems",
    designation: "Mechanical Engineer",
  },
  {
    id: 122,
    employeeNumber: "MISPL0423",
    firstName: "Rammohan",
    lastName: "Gubbala",
    displayName: "Rammohan Gubbala",
    fullName: "Rammohan Gubbala",
    workEmail: "g.rammohan@mahathiinfra.com",
    department: "Safety & HSE",
    designation: "HSE Officer",
  },
  {
    id: 123,
    employeeNumber: "MISPL0429",
    firstName: "Uppu",
    lastName: "Durga Rao",
    displayName: "Uppu Durga Rao",
    fullName: "Uppu Durga Rao",
    workEmail: "durgarao@mahathiinfra.com",
    department: "Piping Engineering",
    designation: "Piping Lead",
  },
  {
    id: 124,
    employeeNumber: "MISPL0430",
    firstName: "Malaya",
    lastName: "Kumar",
    displayName: "Malaya Kumar",
    fullName: "Malaya Kumar",
    workEmail: "malayakumar@mahathiinfra.com",
    department: "Planning & Controls",
    designation: "Planning Engineer",
  },
  {
    id: 125,
    employeeNumber: "MISPL0440",
    firstName: "Dileep Kumar",
    lastName: "Gode",
    displayName: "Dileep Kumar Gode",
    fullName: "Dileep Kumar Gode",
    workEmail: "dileep.g@mahathiinfra.com",
    department: "Maintenance & Reliability",
    designation: "Site Supervisor",
  },
  {
    id: 126,
    employeeNumber: "MISPL0466",
    firstName: "Panthangi",
    lastName: "Shashidhar",
    displayName: "Panthangi Shashidhar",
    fullName: "Panthangi Shashidhar",
    workEmail: "shashidhar@mahathiinfra.com",
    department: "Operations Coordination",
    designation: "Operations Lead",
  },
  {
    id: 127,
    employeeNumber: "MISPL0485",
    firstName: "Sumanth Krishna",
    lastName: "Gaddam",
    displayName: "Sumanth Krishna Gaddam",
    fullName: "Sumanth Krishna Gaddam",
    workEmail: "g.sumanthkrishna@mahathiinfra.com",
    department: "Technology & Systems",
    designation: "Systems Engineer",
  },
];

export const DEMO_EMPLOYEES = [
  ...REGISTERED_EMPLOYEES.map((emp) => ({
    id: String(emp.id),
    name: emp.fullName,
    displayName: emp.displayName,
    department: emp.department,
    designation: emp.designation,
    employeeId: emp.employeeNumber,
    email: emp.workEmail,
  })),
  { id: "1", name: "Arjun Mehta", department: "Engineering & Architecture", designation: "Principal Solutions Architect", employeeId: "EMP-2026", email: "arjun@travora.com" },
  { id: "2", name: "Priya Sharma", department: "Enterprise Sales", designation: "Regional Sales Director", employeeId: "EMP-1042", email: "priya@travora.com" },
  { id: "3", name: "Rajesh Menon", department: "Operations Management", designation: "Senior Vice President", employeeId: "EMP-0089", email: "rajesh@travora.com" },
  { id: "4", name: "Vikram Mehta", department: "Product Strategy", designation: "Staff Product Manager", employeeId: "EMP-3011", email: "vikram@travora.com" },
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
  const rawUser = (credentials.username || "").trim();
  const rawPass = (credentials.password || "").trim();

  if (!rawUser) {
    throw new Error("Please enter your Login ID / Employee Number.");
  }
  if (!rawPass) {
    throw new Error("Please enter your password.");
  }

  const userLower = rawUser.toLowerCase();
  const passLower = rawPass.toLowerCase();

  // 1. Travel Desk login: Employee ID "123456" and password "mahathi"
  const isTravelDesk =
    rawUser === "123456" ||
    userLower === "traveldesk" ||
    userLower === "travel_desk" ||
    userLower === "travel-desk";

  if (isTravelDesk) {
    const validDeskPass =
      rawPass === "mahathi" ||
      (rawUser !== "123456" && (rawPass === "password" || rawPass === "mahathi"));
    if (!validDeskPass) {
      throw new Error("Invalid username or password.");
    }
    return {
      id: 4,
      username: "Travel Desk",
      role: "TRAVEL_DESK",
      employeeId: "123456",
      token: "jwt-traveldesk-auth-token",
    };
  }

  // 2. Approver login: Employee ID "654321" and password "mahathi1"
  const isApprover =
    rawUser === "654321" ||
    userLower === "approver" ||
    userLower === "rajesh";

  if (isApprover) {
    const validApproverPass =
      rawPass === "mahathi1" ||
      (rawUser !== "654321" && (rawPass === "password" || rawPass === "mahathi1"));
    if (!validApproverPass) {
      throw new Error("Invalid username or password.");
    }
    return {
      id: 2,
      username: "Approver",
      role: "APPROVER",
      employeeId: "654321",
      token: "jwt-approver-auth-token",
    };
  }

  // 3. Admin login:
  if (userLower === "admin") {
    if (rawPass !== "password" && rawPass !== "admin" && rawPass !== "admin123") {
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

  // 4. Registered Employees from image:
  // Login ID = Employee Number (e.g. AGR0001, MISPL0001)
  // Password = Employee Number (same as login ID, case-insensitive)
  const matchedEmployee = REGISTERED_EMPLOYEES.find(
    (emp) => emp.employeeNumber.toLowerCase() === userLower
  );

  if (matchedEmployee) {
    if (passLower !== matchedEmployee.employeeNumber.toLowerCase()) {
      throw new Error("Invalid username or password.");
    }
    return {
      id: matchedEmployee.id,
      username: matchedEmployee.fullName,
      role: "EMPLOYEE",
      employeeId: matchedEmployee.employeeNumber,
      token: `jwt-emp-${matchedEmployee.employeeNumber.toLowerCase()}-token`,
    };
  }

  // Legacy demo employee accounts fallback
  if (userLower === "employee" || userLower === "arjun" || userLower === "emp-2026") {
    if (rawPass !== "password" && userLower !== passLower) {
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

  // If a custom username is used and a live API base URL is provided, attempt backend login with timeout
  if (API_BASE_URL) {
    try {
      const response = await apiRequest<Partial<AuthUser> & { token?: string; role?: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
        skipAuth: true,
        timeoutMs: 1200,
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
  // Migrate any legacy global data to this user's namespace
  _migrateGlobalDataToUser();
}

/**
 * One-time migration: if old global (non-namespaced) localStorage keys exist,
 * copy that data into the current user's namespace and remove the old keys.
 * This prevents data loss for users who had data before the isolation fix.
 */
function _migrateGlobalDataToUser() {
  if (!isBrowser) return;
  const LEGACY_KEYS = [
    "travora_local_requests",
    "travora_local_bookings",
    "travora_deleted_requests",
    "travora_deleted_bookings",
    "travora_all_wiped",
  ];
  const hasMigrated = window.localStorage.getItem("travora_migration_done");
  if (hasMigrated) return;

  for (const key of LEGACY_KEYS) {
    const val = window.localStorage.getItem(key);
    if (val !== null) {
      const nsKey = userKey(key);
      // Only migrate if the user doesn't already have data under the new key
      if (window.localStorage.getItem(nsKey) === null) {
        window.localStorage.setItem(nsKey, val);
      }
      window.localStorage.removeItem(key);
    }
  }
  window.localStorage.setItem("travora_migration_done", "true");
}

/**
 * ─── USER-NAMESPACED localStorage ───
 *
 * Every localStorage key is prefixed with the currently authenticated
 * user's employeeId (or numeric id as fallback) so that each user has
 * a completely isolated data store.  If no user is logged in the keys
 * fall back to a shared "__anon__" namespace – but that should never
 * happen because the UI gates all data access behind authentication.
 */

function _userPrefix(): string {
  const user = getStoredUser();
  if (user?.employeeId) return user.employeeId;
  if (user?.id) return String(user.id);
  return "__anon__";
}

function userKey(base: string): string {
  return `${base}_${_userPrefix()}`;
}

/* Demo data is only shown to the user whose employee ID matches the
   hardcoded employee inside DEMO_REQUESTS (EMP-2026 / Arjun Mehta).
   All other users start with an empty slate. */
function _demoRequestsForCurrentUser(): any[] {
  const user = getStoredUser();
  if (!user) return [];
  // Only the legacy demo employee sees demo requests
  if (user.employeeId === "EMP-2026" || user.id === 1) return DEMO_REQUESTS;
  return [];
}
function _demoBookingsForCurrentUser(): any[] {
  const user = getStoredUser();
  if (!user) return [];
  if (user.employeeId === "EMP-2026" || user.id === 1) return DEMO_BOOKINGS;
  return [];
}

export function getDeletedRequestIds(): Set<string> {
  if (!isBrowser) return new Set();
  try {
    const raw = window.localStorage.getItem(userKey("travora_deleted_requests"));
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
    window.localStorage.setItem(userKey("travora_deleted_requests"), JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn("Failed to save deleted request ids", e);
  }
}

export function getDeletedBookingIds(): Set<string> {
  if (!isBrowser) return new Set();
  try {
    const raw = window.localStorage.getItem(userKey("travora_deleted_bookings"));
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
    window.localStorage.setItem(userKey("travora_deleted_bookings"), JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn("Failed to save deleted booking ids", e);
  }
}

export function getLocalRequests(): any[] {
  if (!isBrowser) return [];
  if (window.localStorage.getItem(userKey("travora_all_wiped")) === "true") {
    return [];
  }
  const deletedIds = getDeletedRequestIds();
  try {
    const raw = window.localStorage.getItem(userKey("travora_local_requests"));
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((r) => !deletedIds.has(String(r.id)));
      }
    }
  } catch (e) {
    console.warn("Failed to load local requests", e);
  }
  return _demoRequestsForCurrentUser().filter((r) => !deletedIds.has(String(r.id)));
}

export function saveLocalRequests(requests: any[]) {
  try {
    window.localStorage.setItem(userKey("travora_local_requests"), JSON.stringify(requests));
  } catch (e) {
    console.warn("Failed to save local requests", e);
  }
}

export function getLocalBookings(): any[] {
  if (!isBrowser) return [];
  if (window.localStorage.getItem(userKey("travora_all_wiped")) === "true") {
    return [];
  }
  const deletedReqIds = getDeletedRequestIds();
  const deletedBookingIds = getDeletedBookingIds();
  try {
    const raw = window.localStorage.getItem(userKey("travora_local_bookings"));
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
  return _demoBookingsForCurrentUser().filter(
    (b) => !deletedBookingIds.has(String(b.id)) && !deletedReqIds.has(String(b.travelRequest?.id))
  );
}

export function saveLocalBookings(bookings: any[]) {
  try {
    window.localStorage.setItem(userKey("travora_local_bookings"), JSON.stringify(bookings));
  } catch (e) {
    console.warn("Failed to save local bookings", e);
  }
}

export const travelRequestsApi = {
  list: async () => {
    if (isBrowser && window.localStorage.getItem(userKey("travora_all_wiped")) === "true") {
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
      window.localStorage.removeItem(userKey("travora_all_wiped"));
    }
    const user = getStoredUser();
    const regEmp = REGISTERED_EMPLOYEES.find(
      (e) => e.employeeNumber === user?.employeeId
    );
    const newReq = {
      id: `TR-${Math.floor(Math.random() * 9000 + 1000)}`,
      ...(payload as object),
      status: "PENDING",
      createdAt: new Date().toISOString(),
      employee: {
        id: user?.id || 1,
        name: regEmp?.fullName || user?.username || "Unknown Employee",
        employeeId: user?.employeeId || "UNKNOWN",
        department: regEmp?.department || "General",
        designation: regEmp?.designation || "Employee",
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
      window.localStorage.setItem(userKey("travora_all_wiped"), "true");
    }
    const currentReqs = getLocalRequests();
    const currentBookings = getLocalBookings();
    markRequestIdsDeleted(currentReqs.map((r) => r.id));
    markBookingIdsDeleted(currentBookings.map((b) => b.id));
    markRequestIdsDeleted(_demoRequestsForCurrentUser().map((r) => r.id));
    markBookingIdsDeleted(_demoBookingsForCurrentUser().map((b) => b.id));

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
      window.localStorage.removeItem(userKey("travora_all_wiped"));
      window.localStorage.removeItem(userKey("travora_deleted_requests"));
      window.localStorage.removeItem(userKey("travora_deleted_bookings"));
    }
    saveLocalRequests(_demoRequestsForCurrentUser());
    saveLocalBookings(_demoBookingsForCurrentUser());
    return { success: true };
  },
};

export const bookingsApi = {
  list: async () => {
    if (isBrowser && window.localStorage.getItem(userKey("travora_all_wiped")) === "true") {
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
      window.localStorage.removeItem(userKey("travora_all_wiped"));
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
