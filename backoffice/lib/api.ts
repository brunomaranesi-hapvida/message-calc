import { getToken, setToken, clearToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function apiLogin(
  email: string,
  password: string
): Promise<string> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Invalid credentials");
  }

  const data = await res.json();
  const token = data.token;
  setToken(token);
  return token;
}

export async function apiFetch(path: string, options?: RequestInit) {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return res;
}

export async function getJourneys() {
  const res = await apiFetch("/journeys");
  if (!res.ok) throw new Error("Failed to fetch journeys");
  return res.json();
}

export async function getJourney(code: string) {
  const res = await apiFetch(`/journeys/${code}`);
  if (!res.ok) throw new Error("Failed to fetch journey");
  return res.json();
}

export async function deleteJourney(code: string) {
  const res = await apiFetch(`/journeys/${code}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete journey");
  return res;
}

export async function approveJourney(code: string, approvedBy: string) {
  const res = await apiFetch(`/journeys/${code}/approve`, {
    method: "POST",
    body: JSON.stringify({ approved_by: approvedBy }),
  });
  if (!res.ok) throw new Error("Failed to approve journey");
  return res.json();
}

export async function rejectJourney(code: string, rejectedBy: string) {
  const res = await apiFetch(`/journeys/${code}/reject`, {
    method: "POST",
    body: JSON.stringify({ approved_by: rejectedBy }),
  });
  if (!res.ok) throw new Error("Failed to reject journey");
  return res.json();
}
