import { getAdminToken } from "./adminAuthApi";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

function getAuthHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const respuesta = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!respuesta.ok) {
    let mensaje = "Error al comunicarse con el servidor.";

    try {
      const data = await respuesta.json();
      mensaje = data.detail || JSON.stringify(data);
    } catch {
      // ignorar
    }

    throw new Error(mensaje);
  }

  if (respuesta.status === 204) return null;
  return respuesta.json();
}

export function obtenerVentas(params = {}) {
  const search = new URLSearchParams();

  if (params.q) search.set("q", params.q);
  if (params.estado) search.set("estado", params.estado);

  const qs = search.toString();
  return request(`/ventas/${qs ? `?${qs}` : ""}`);
}

export function crearVenta(payload) {
  return request("/ventas/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function actualizarVenta(id, payload) {
  return request(`/ventas/${id}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function actualizarVentaParcial(id, payload) {
  return request(`/ventas/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function eliminarVenta(id) {
  return request(`/ventas/${id}/`, {
    method: "DELETE",
  });
}

export function crearPreferenciaMercadoPago(id) {
  return request(`/ventas/${id}/crear_preferencia/`, {
    method: "POST",
  });
}
