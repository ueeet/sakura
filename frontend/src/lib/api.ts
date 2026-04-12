const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getTokens() {
  if (typeof window === "undefined") return { access: null, refresh: null };
  return {
    access: localStorage.getItem("accessToken"),
    refresh: localStorage.getItem("refreshToken"),
  };
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export function isAuthenticated() {
  return typeof window !== "undefined" && !!localStorage.getItem("accessToken");
}

async function refreshAccessToken(): Promise<boolean> {
  const { refresh } = getTokens();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch { return false; }
}

async function request<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
  const { access } = getTokens();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (access) headers["Authorization"] = `Bearer ${access}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request<T>(endpoint, options, false);
    clearTokens();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, data: unknown) => request<T>(url, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(url: string, data: unknown) => request<T>(url, { method: "PUT", body: JSON.stringify(data) }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),

  login: async (login: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      throw new Error(b.error || "Ошибка входа");
    }
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  upload: async (file: File) => {
    const { access } = getTokens();
    const formData = new FormData();
    formData.append("file", file);
    const headers: Record<string, string> = {};
    if (access) headers["Authorization"] = `Bearer ${access}`;
    const res = await fetch(`${API_URL}/upload`, { method: "POST", headers, body: formData });
    if (!res.ok) {
      // Пробрасываем нормальное сообщение с бэка вместо голого "Upload failed".
      // Особенно важно для LIMIT_FILE_SIZE — иначе юзер не поймёт что у него
      // просто слишком большой файл.
      let message = `Ошибка загрузки (${res.status})`;
      try {
        const body = await res.json();
        if (body?.error && typeof body.error === "string") message = body.error;
      } catch {}
      throw new Error(message);
    }
    return res.json() as Promise<{ url: string }>;
  },
};
