export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

const BASE_URL = import.meta.env.VITE_API_URL;

export async function login(email: string, password: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const response = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  return response.json();
}

export async function getMe(): Promise<User | null> {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function logout(): Promise<void> {
  await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}
