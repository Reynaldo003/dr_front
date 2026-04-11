//src/public-site/lib/apiPublic.js
const API_BASE = "https://misdosreynas.com/api";

const CLIENTE_STORAGE_KEY = "cliente_session";

function getClienteToken() {
  try {
    const raw = localStorage.getItem(CLIENTE_STORAGE_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.token || "";
  } catch {
    return "";
  }
}

async function request(path, options = {}) {
  const token = getClienteToken();

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
    throw new Error(data.detail || "Ocurrió un error en la petición");
  }

  return data;
}

export async function obtenerProductosPublicos(params = {}) {
  const query = new URLSearchParams();

  if (params.buscar) query.set("buscar", params.buscar);
  if (params.categoria) query.set("categoria", params.categoria);
  if (params.solo_disponibles !== undefined) {
    query.set("solo_disponibles", String(params.solo_disponibles));
  }

  return request(
    `/public/productos/${query.toString() ? `?${query.toString()}` : ""}`,
  );
}

export async function obtenerCategoriasPublicas() {
  return request("/public/productos/categorias/");
}

export async function crearCheckoutMercadoPago(payload) {
  return request("/public/checkout/mercado-pago/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
