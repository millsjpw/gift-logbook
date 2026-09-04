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
    let message = `API request failed (${res.status})`;
    try {
      const errorData: ApiError = await res.json();
      message = errorData.error || message;
    } catch {
      // response body wasn't JSON (e.g. a proxy/HTML error page) — fall back to the status-based message
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;

  return res.json();
}
