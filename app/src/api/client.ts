import { getAccessToken, clearTokens } from "./tokens";
import { refreshAccessToken } from "./auth";

type ApiError = {
  error: string;
};

const BASE_URL = import.meta.env.VITE_API_URL;

async function request(
  path: string,
  token?: string | null,
  options: RequestInit = {},
) {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  let accessToken = getAccessToken();

  let res = await request(path, accessToken, options);

  if (res.status === 401) {
    try {
      accessToken = await refreshAccessToken();
      res = await request(path, accessToken, options);
    } catch (err) {
      clearTokens();
      window.location.href = "/login";
      throw err;
    }
  }

  if (!res.ok) {
    const errorData: ApiError = await res.json();
    throw new Error(errorData.error || "API request failed");
  }

  if (res.status === 204) return null;

  return res.json();
}
