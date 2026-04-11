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
  });

  if (response.status === 204) {
    return null;
  }

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

export function obtenerProductos({ buscar = "", tipo = "" } = {}) {
  const params = new URLSearchParams();

  if (buscar) params.set("buscar", buscar);
  if (tipo) params.set("tipo", tipo);

  const query = params.toString();
  return request(`/api/productos/${query ? `?${query}` : ""}`);
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
