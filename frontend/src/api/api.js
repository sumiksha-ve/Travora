const API_BASE_URL = "http://localhost:8080";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("travora_token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`
    );
  }

  return data;
}

export async function login(username, password) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
  });
}

export async function getTravelRequests() {
  return apiRequest("/api/travel-requests");
}

export async function createTravelRequest(requestData) {
  return apiRequest("/api/travel-requests", {
    method: "POST",
    body: JSON.stringify(requestData),
  });
}

export async function getTravelRequest(id) {
  return apiRequest(`/api/travel-requests/${id}`);
}

export function logout() {
  localStorage.removeItem("travora_token");
  localStorage.removeItem("travora_user");
}