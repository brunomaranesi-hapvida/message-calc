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

// Channels
export async function getChannels() {
  const res = await apiFetch("/channels");
  if (!res.ok) throw new Error("Failed to fetch channels");
  return res.json();
}

export async function createChannel(data: { name: string; code: string }) {
  const res = await apiFetch("/channels", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create channel");
  return res.json();
}

export async function updateChannel(id: string, data: { name: string; code: string; is_active: boolean }) {
  const res = await apiFetch(`/channels/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update channel");
  return res.json();
}

export async function deleteChannel(id: string) {
  const res = await apiFetch(`/channels/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete channel");
}

// Providers
export async function getProviders() {
  const res = await apiFetch("/providers");
  if (!res.ok) throw new Error("Failed to fetch providers");
  return res.json();
}

export async function createProvider(data: { name: string }) {
  const res = await apiFetch("/providers", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create provider");
  return res.json();
}

export async function updateProvider(id: string, data: { name: string; is_active: boolean }) {
  const res = await apiFetch(`/providers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update provider");
  return res.json();
}

export async function deleteProvider(id: string) {
  const res = await apiFetch(`/providers/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete provider");
}

// Pricing
export async function getPrices() {
  const res = await apiFetch("/provider-channel-prices");
  if (!res.ok) throw new Error("Failed to fetch prices");
  return res.json();
}

export async function createPrice(data: { provider_id: string; channel_id: string; price: number; valid_from: string; valid_to?: string }) {
  const res = await apiFetch("/provider-channel-prices", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create price");
  return res.json();
}

export async function updatePrice(id: string, data: { provider_id: string; channel_id: string; price: number; valid_from: string; valid_to?: string }) {
  const res = await apiFetch(`/provider-channel-prices/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update price");
  return res.json();
}

// Default provider config
export async function getDefaultConfig() {
  const res = await apiFetch("/default-provider-config");
  if (!res.ok) throw new Error("Failed to fetch default config");
  return res.json();
}

export async function setDefaultConfig(data: { channel_id: string; provider_id: string }) {
  const res = await apiFetch("/default-provider-config", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to set default config");
  return res.json();
}

// Calculator defaults (singleton)
export async function getCalculatorDefaults() {
  const res = await apiFetch("/calculator-defaults");
  if (!res.ok) throw new Error("Failed to fetch calculator defaults");
  return res.json();
}

export async function updateCalculatorDefaults(data: {
  default_people_reached: number;
  default_start_month: number;
  default_opt_in_rate: number;
  default_whatsapp_delivery_rate: number;
  default_sms_delivery_rate: number;
}) {
  const res = await apiFetch("/calculator-defaults", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update calculator defaults");
  return res.json();
}
