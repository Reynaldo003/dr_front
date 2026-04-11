import { getAdminToken } from "./adminAuthApi";
const API_BASE = "https://misdosreynas.com/api";

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
      // ignorar si no viene json
    }

    throw new Error(mensaje);
  }

  if (respuesta.status === 204) return null;

  return respuesta.json();
}

export function obtenerProductos(params = {}) {
  const search = new URLSearchParams();

  if (params.buscar) search.set("buscar", params.buscar);
  if (params.categoria) search.set("categoria", params.categoria);
  if (params.estado) search.set("estado", params.estado);
  if (params.tipo) search.set("tipo", params.tipo);

  const qs = search.toString();
  return request(`/productos/${qs ? `?${qs}` : ""}`);
}

export function obtenerProducto(id) {
  return request(`/productos/${id}/`);
}

export function crearProducto(payload) {
  return request("/productos/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function actualizarProducto(id, payload) {
  return request(`/productos/${id}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function actualizarProductoParcial(id, payload) {
  return request(`/productos/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function eliminarProducto(id) {
  return request(`/productos/${id}/`, {
    method: "DELETE",
  });
}
