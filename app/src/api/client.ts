type ApiError = {
  error: string;
};

const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Not authenticated");
  }

  if (!res.ok) {
    const errorData: ApiError = await res.json();
    throw new Error(errorData.error || "API request failed");
  }

  if (res.status === 204) return null;

  return res.json();
}
