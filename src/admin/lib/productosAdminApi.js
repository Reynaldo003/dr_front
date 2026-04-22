import { getAdminToken } from "../services/adminAuthApi";

const API_BASE_URL = "https://misdosreynas.com/api";
const CACHE_PREFIXES = [
  "public_api_cache_v2::",
  "public_shop_lists_cache_v2::",
];

function clearPublicCaches() {
  try {
    CACHE_PREFIXES.forEach((prefix) => {
      for (let i = localStorage.length - 1; i >= 0; i -= 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      }
    });
  } catch {
    // No romper la app.
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => ({}));
  }

  const text = await response.text().catch(() => "");
  return text ? { detail: text } : null;
}

async function request(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const token = getAdminToken();
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isFormData && options.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    headers,
    signal: options.signal,
  });

  if (response.status === 204) {
    if (method !== "GET") {
      clearPublicCaches();
    }
    return null;
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        "Ocurrió un error al conectar con el servidor.",
    );
  }

  if (method !== "GET") {
    clearPublicCaches();
  }

  return data;
}

export function obtenerProductos(
  {
    buscar = "",
    tipo = "",
    categoria = "",
    estado = "",
    page = 1,
    page_size = 40,
  } = {},
  options = {},
) {
  const params = new URLSearchParams();

  if (buscar) params.set("buscar", buscar);
  if (tipo) params.set("tipo", tipo);
  if (categoria) params.set("categoria", categoria);
  if (estado) params.set("estado", estado);

  params.set("page", String(page));
  params.set("page_size", String(page_size));

  const query = params.toString();

  return request(`/productos/${query ? `?${query}` : ""}`, {
    signal: options.signal,
  });
}

export function obtenerProducto(id, options = {}) {
  return request(`/productos/${id}/`, {
    signal: options.signal,
  });
}

export function crearProducto(payload) {
  return request("/productos/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function actualizarProducto(id, payload) {
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
