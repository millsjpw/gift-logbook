import { getAccessToken, clearTokens } from "./tokens";
import { refreshAccessToken } from "./auth";

type ApiError = {
  error: string;
};

const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  let accessToken = getAccessToken();

  const makeRequest = (token?: string | null) =>
    fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

  let res = await makeRequest(accessToken);

  if (res.status === 401) {
    try {
      accessToken = await refreshAccessToken();
      res = await makeRequest(accessToken);
    } catch (error) {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Authentication failed. Please log in again.");
    }
  }

  if (!res.ok) {
    const errorData: ApiError = await res.json();
    throw new Error(errorData.error || "API request failed");
  }

  if (res.status === 204) return null;

  return res.json();
}