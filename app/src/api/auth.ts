import {
  clearTokens,
  getRefreshToken,
  setTokens,
  getAccessToken,
} from "./tokens";

const BASE_URL = import.meta.env.VITE_API_URL;

let authReady = false;

export function setAuthReady() {
  authReady = true;
}

export function isAuthReady() {
  return authReady;
}

export function isAuthenticated() {
  return !!getAccessToken();
}

export async function login(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const data = await response.json();

  setTokens(data.accessToken, data.refreshToken);

  return data;
}

export async function register(name: string, email: string, password: string) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  return response.json();
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
