// dr_front/src/public-site/lib/productosPublicApi.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

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
    throw new Error(
      data?.detail || data?.message || "No se pudo obtener la información.",
    );
  }

  return data;
}

export function obtenerRebajas() {
  return request("/api/public/productos/rebajas/");
}

export function obtenerNewArrivals() {
  return request("/api/public/productos/new-arrivals/");
}
