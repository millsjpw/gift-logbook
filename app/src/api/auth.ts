import { clearTokens, getRefreshToken, setTokens } from "./tokens";

export async function login(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}

export async function register(name: string, email: string, password: string) {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  return response.json();
}

export function isAuthenticated() {
  return !!localStorage.getItem("accessToken");
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error("Failed to refresh access token");
  }

  const data = await response.json();

  setTokens(data.accessToken, data.refreshToken);

  return data.accessToken;
}
