// dr_front/src/public-site/lib/comentariosApi.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  const tieneBody = options.body !== undefined && options.body !== null;
  if (tieneBody) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { detail: text } : null;
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      "Ocurrió un error al conectar con el servidor.";
    throw new Error(message);
  }

  return data;
}

export async function obtenerComentariosPublicos({ productId } = {}) {
  const params = new URLSearchParams();

  if (productId !== undefined && productId !== null && productId !== "") {
    params.set("productId", String(productId));
  }

  const query = params.toString();
  return request(`/api/comentarios/${query ? `?${query}` : ""}`);
}

export async function crearComentarioPublico(payload) {
  return request("/api/comentarios/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function obtenerComentariosAdmin({
  estado = "TODOS",
  q = "",
  productId,
} = {}) {
  const params = new URLSearchParams();

  if (estado && estado !== "TODOS") {
    params.set("estado", estado);
  }

  if (q.trim()) {
    params.set("q", q.trim());
  }

  if (productId !== undefined && productId !== null && productId !== "") {
    params.set("productId", String(productId));
  }

  const query = params.toString();
  return request(`/api/comentarios/admin/${query ? `?${query}` : ""}`);
}

export async function aprobarComentario(id) {
  return request(`/api/comentarios/admin/${id}/aprobar/`, {
    method: "POST",
  });
}

export async function rechazarComentario(id) {
  return request(`/api/comentarios/admin/${id}/rechazar/`, {
    method: "POST",
  });
}
