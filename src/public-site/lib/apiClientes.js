const API_BASE = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/+$/, "");

const CLIENTE_STORAGE_KEY = "cliente_session";

export function getClienteSession() {
  try {
    const raw = localStorage.getItem(CLIENTE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getClienteToken() {
  const session = getClienteSession();
  return session?.token || "";
}

export function guardarClienteSession(data) {
  const session = {
    token: data?.token || "",
    cliente: data?.cliente || null,
  };

  localStorage.setItem(CLIENTE_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function limpiarClienteSession() {
  localStorage.removeItem(CLIENTE_STORAGE_KEY);
}

async function request(path, options = {}) {
  const token = getClienteToken();

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || "Ocurrió un error en la petición");
  }

  return data;
}

export async function registrarCliente(payload) {
  const data = await request("/clientes/auth/registro/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  guardarClienteSession(data);
  return data;
}

export async function loginCliente(payload) {
  const data = await request("/clientes/auth/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  guardarClienteSession(data);
  return data;
}

export async function logoutClienteRequest() {
  try {
    await request("/clientes/auth/logout/", {
      method: "POST",
    });
  } catch {
    // si falla el backend, igual limpiamos la sesión local
  } finally {
    limpiarClienteSession();
  }
}

export async function obtenerClienteActual() {
  return request("/clientes/me/");
}

export async function actualizarClienteActual(payload) {
  return request("/clientes/me/", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function obtenerMisDirecciones() {
  return request("/clientes/direcciones/");
}

export async function crearDireccion(payload) {
  return request("/clientes/direcciones/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function actualizarDireccion(id, payload) {
  return request(`/clientes/direcciones/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function eliminarDireccion(id) {
  const response = await fetch(`${API_BASE}/clientes/direcciones/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getClienteToken()}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "No se pudo eliminar la dirección");
  }

  return true;
}

export async function obtenerMisPedidos() {
  return request("/clientes/mis-pedidos/");
}

export async function obtenerMiPedido(id) {
  return request(`/clientes/mis-pedidos/${id}/`);
}
