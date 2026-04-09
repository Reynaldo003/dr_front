const API_BASE = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/+$/, "");

const ADMIN_STORAGE_KEY = "admin_session";

export function getAdminSession() {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAdminToken() {
  return getAdminSession()?.token || "";
}

export function guardarAdminSession(data) {
  const session = {
    token: data?.token || "",
    user: data?.user || null,
  };

  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function limpiarAdminSession() {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
}

async function request(path, options = {}) {
  const token = getAdminToken();

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || "Ocurrió un error en la petición.");
  }

  return data;
}

export async function loginAdmin(payload) {
  const data = await request("/admin/auth/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  guardarAdminSession(data);
  return data;
}

export async function obtenerAdminActual() {
  return request("/admin/auth/me/");
}

export async function logoutAdminRequest() {
  try {
    await request("/admin/auth/logout/", {
      method: "POST",
    });
  } catch {
    // aunque falle el backend, limpiamos la sesión local
  } finally {
    limpiarAdminSession();
  }
}
