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

function limpiarTexto(valor) {
  return String(valor || "").trim();
}

function numeroSeguro(valor, fallback = 0) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) return fallback;

  return numero;
}

function enteroSeguro(valor, fallback = 0) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) return fallback;

  return Math.max(0, Math.floor(numero));
}

function normalizarImagenesGaleria(gallery = [], heroUrl = "") {
  const usadas = new Set();
  const imagenPrincipal = limpiarTexto(heroUrl);

  if (imagenPrincipal) {
    usadas.add(imagenPrincipal);
  }

  return (Array.isArray(gallery) ? gallery : [])
    .map((item, index) => {
      const imagen = limpiarTexto(item?.imagen || item?.url || item);

      if (!imagen || usadas.has(imagen)) {
        return null;
      }

      usadas.add(imagen);

      return {
        imagen,
        orden: enteroSeguro(item?.orden, index + 1),
      };
    })
    .filter(Boolean);
}

function normalizarVariantesDesdeUi(variants = {}) {
  const colors = Array.isArray(variants.colors) ? variants.colors : [];
  const sizes = Array.isArray(variants.sizes) ? variants.sizes : [];
  const stockMap = variants.stockMap || {};

  const variantes = [];

  colors.forEach((color) => {
    sizes.forEach((talla) => {
      const stock = enteroSeguro(stockMap[`${color}__${talla}`], 0);

      variantes.push({
        color: limpiarTexto(color),
        talla: limpiarTexto(talla),
        stock,
      });
    });
  });

  return variantes.filter((item) => item.color && item.talla);
}

function normalizarVariantesBackend(variantes = []) {
  return (Array.isArray(variantes) ? variantes : [])
    .map((item) => ({
      color: limpiarTexto(item.color),
      talla: limpiarTexto(item.talla),
      stock: enteroSeguro(item.stock, 0),
    }))
    .filter((item) => item.color && item.talla);
}

function normalizarPayloadProducto(payload = {}) {
  const vieneEnFormatoBackend =
    "titulo" in payload ||
    "precio" in payload ||
    "imagen_principal" in payload ||
    Array.isArray(payload.variantes);

  if (vieneEnFormatoBackend) {
    const imagenPrincipal = limpiarTexto(payload.imagen_principal);

    return {
      titulo: limpiarTexto(payload.titulo),
      sku: limpiarTexto(payload.sku),
      descripcion: limpiarTexto(payload.descripcion),
      precio: numeroSeguro(payload.precio, 0),
      costo: numeroSeguro(payload.costo, 0),
      precio_rebaja:
        payload.precio_rebaja === null || payload.precio_rebaja === ""
          ? null
          : payload.precio_rebaja === undefined
            ? undefined
            : numeroSeguro(payload.precio_rebaja, 0),
      categoria: limpiarTexto(payload.categoria),
      estado: limpiarTexto(payload.estado || "Activo"),
      imagen_principal: imagenPrincipal,
      imagenes: normalizarImagenesGaleria(
        payload.imagenes || [],
        imagenPrincipal,
      ),
      variantes: normalizarVariantesBackend(payload.variantes || []),
      es_new_arrival: Boolean(payload.es_new_arrival || false),
    };
  }

  const imagenPrincipal = limpiarTexto(
    payload.heroUrl || payload.gallery?.[0]?.url || "",
  );

  return {
    titulo: limpiarTexto(payload.title),
    sku: limpiarTexto(payload.sku),
    descripcion: limpiarTexto(payload.description),
    precio: numeroSeguro(payload.price, 0),
    costo: numeroSeguro(payload.cost || payload.costo, 0),
    categoria: limpiarTexto(payload.category),
    estado: limpiarTexto(payload.status || "Activo"),
    imagen_principal: imagenPrincipal,
    imagenes: normalizarImagenesGaleria(payload.gallery || [], imagenPrincipal),
    variantes: normalizarVariantesDesdeUi(payload.variants || {}),
    es_new_arrival: Boolean(payload.es_new_arrival || false),
  };
}

function quitarUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  );
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
    cache: method === "GET" ? "no-store" : "default",
  });

  if (response.status === 204) {
    if (method !== "GET") {
      clearPublicCaches();
    }

    return null;
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const detalle =
      data?.detail ||
      data?.message ||
      Object.entries(data || {})
        .map(([key, value]) => {
          const texto = Array.isArray(value) ? value.join(", ") : String(value);
          return `${key}: ${texto}`;
        })
        .join(" | ") ||
      "Ocurrió un error al conectar con el servidor.";

    throw new Error(detalle);
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
  const payloadNormalizado = quitarUndefined(
    normalizarPayloadProducto(payload),
  );

  return request("/productos/", {
    method: "POST",
    body: JSON.stringify(payloadNormalizado),
  });
}

export function actualizarProducto(id, payload) {
  const payloadNormalizado = quitarUndefined(
    normalizarPayloadProducto(payload),
  );

  return request(`/productos/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payloadNormalizado),
  });
}

export function eliminarProducto(id) {
  return request(`/productos/${id}/`, {
    method: "DELETE",
  });
}
