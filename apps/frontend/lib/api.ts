const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.code || `HTTP_${response.status}`,
      data?.message || "An error occurred",
      data?.details
    );
  }

  return data?.data ?? data;
}

export async function getVehicles(params?: Record<string, string | number | boolean>) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
  }
  const qs = query.toString();
  return api.get(`/vehicles${qs ? `?${qs}` : ""}`);
}

export const api = {
  get: (url: string, options?: RequestInit) =>
    fetchWithAuth(url, { ...options, method: "GET" }),

  post: (url: string, body: unknown, options?: RequestInit) =>
    fetchWithAuth(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  patch: (url: string, body: unknown, options?: RequestInit) =>
    fetchWithAuth(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (url: string, options?: RequestInit) =>
    fetchWithAuth(url, { ...options, method: "DELETE" }),
};
