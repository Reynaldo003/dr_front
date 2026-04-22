import { getAdminToken } from "./adminAuthApi";

const API_BASE = "https://misdosreynas.com/api";

function getAuthHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function construirUrl(endpoint) {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }
  return `${API_BASE}${endpoint}`;
}

function extraerMensajeError(
  data,
  fallback = "Error al comunicarse con el servidor.",
) {
  if (!data) return fallback;

  if (typeof data === "string") {
    return data;
  }

  if (Array.isArray(data)) {
    return (
      data
        .map((item) => extraerMensajeError(item, ""))
        .filter(Boolean)
        .join(" | ") || fallback
    );
  }

  if (typeof data === "object") {
    if (typeof data.detail === "string" && data.detail.trim()) {
      return data.detail;
    }

    const partes = Object.entries(data)
      .map(([clave, valor]) => {
        const mensaje = extraerMensajeError(valor, "");
        return mensaje ? `${clave}: ${mensaje}` : "";
      })
      .filter(Boolean);

    return partes.join(" | ") || fallback;
  }

  return fallback;
}

function esRespuestaPaginada(data) {
  return Boolean(
    data && typeof data === "object" && Array.isArray(data.results),
  );
}

async function request(endpoint, options = {}) {
  const tieneBody = options.body !== undefined && options.body !== null;
  const esFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  if (tieneBody && !esFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const respuesta = await fetch(construirUrl(endpoint), {
    ...options,
    headers,
  });

  if (respuesta.status === 204) {
    return null;
  }

  const contentType = respuesta.headers.get("content-type") || "";
  let data = null;

  try {
    if (contentType.includes("application/json")) {
      data = await respuesta.json();
    } else {
      const texto = await respuesta.text();
      data = texto ? { detail: texto } : null;
    }
  } catch {
    data = null;
  }

  if (!respuesta.ok) {
    throw new Error(extraerMensajeError(data));
  }

  return data;
}

function construirQuery(params = {}) {
  const search = new URLSearchParams();

  if (params.q) search.set("q", params.q);
  if (params.estado && params.estado !== "TODOS")
    search.set("estado", params.estado);
  if (params.page_size) search.set("page_size", String(params.page_size));

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function obtenerVentas(params = {}) {
  let endpoint = `/ventas/${construirQuery({ ...params, page_size: 100 })}`;
  const ventas = [];
  let vueltas = 0;

  while (endpoint && vueltas < 50) {
    const data = await request(endpoint);

    if (Array.isArray(data)) {
      return data;
    }

    if (esRespuestaPaginada(data)) {
      ventas.push(...data.results);
      endpoint = data.next || null;
      vueltas += 1;
      continue;
    }

    return [];
  }

  return ventas;
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
