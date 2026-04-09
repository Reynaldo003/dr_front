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

  return respuesta.json();
}

export function obtenerClientesAdmin(params = {}) {
  const search = new URLSearchParams();

  if (params.q) search.set("q", params.q);

  return request(
    `/admin/clientes/${search.toString() ? `?${search.toString()}` : ""}`,
  );
}
