const API_BASE_URL = "https://misdosreynas.com";

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
    signal: options.signal,
  });

  if (response.status === 204) {
    return null;
  }

  let data = null;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => ({}));
  } else {
    const text = await response.text().catch(() => "");
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

  return request(`/api/productos/${query ? `?${query}` : ""}`, {
    signal: options.signal,
  });
}

export function obtenerProducto(id, options = {}) {
  return request(`/api/productos/${id}/`, {
    signal: options.signal,
  });
}

export function crearProducto(payload) {
  return request("/api/productos/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function actualizarProducto(id, payload) {
  return request(`/api/productos/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function eliminarProducto(id) {
  return request(`/api/productos/${id}/`, {
    method: "DELETE",
  });
}
