//public-site/lib/apiPublic.js
const API_BASE = "https://misdosreynas.com/api";

const CLIENTE_STORAGE_KEY = "cliente_session";
const GET_CACHE_TTL = 5 * 60 * 1000;
const CACHE_PREFIX = "public_api_cache_v2::";

const memoryCache = new Map();
const pendingRequests = new Map();

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

function buildCacheKey(url, token = "") {
  return `${CACHE_PREFIX}${token}::${url}`;
}

function getCachedValue(key) {
  const memoryItem = memoryCache.get(key);
  if (memoryItem) {
    if (memoryItem.expireAt >= Date.now()) {
      return memoryItem.data;
    }
    memoryCache.delete(key);
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const item = JSON.parse(raw);
    if (!item || item.expireAt < Date.now()) {
      localStorage.removeItem(key);
      return null;
    }

    memoryCache.set(key, item);
    return item.data;
  } catch {
    return null;
  }
}

function setCachedValue(key, data) {
  const item = {
    data,
    expireAt: Date.now() + GET_CACHE_TTL,
  };

  memoryCache.set(key, item);

  try {
    localStorage.setItem(key, JSON.stringify(item));
  } catch {
    // Si localStorage está lleno o bloqueado, al menos queda el cache en memoria.
  }
}

function clearGetCache() {
  memoryCache.clear();

  try {
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Sin romper la app.
  }
}

function normalizarListado(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function buildProductosPublicosPath(params = {}) {
  const query = new URLSearchParams();

  if (params.buscar) query.set("buscar", params.buscar);
  if (params.categoria) query.set("categoria", params.categoria);

  if (params.solo_disponibles !== undefined) {
    query.set("solo_disponibles", String(params.solo_disponibles));
  }

  query.set("page", String(params.page || 1));
  query.set("page_size", String(params.page_size || 24));

  return `/public/productos/${query.toString() ? `?${query.toString()}` : ""}`;
}

function buildDetalleProductoPath(productId) {
  return `/public/productos/${productId}/`;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => ({}));
  }

  const text = await response.text().catch(() => "");
  return text ? { detail: text } : {};
}

async function request(path, options = {}) {
  const token = getClienteToken();
  const method = String(options.method || "GET").toUpperCase();
  const url = `${API_BASE}${path}`;
  const usarCache = method === "GET" && options.cache !== false;

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    Accept: "application/json",
    ...(!isFormData && options.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const cacheKey = usarCache ? buildCacheKey(url, token) : "";

  if (usarCache) {
    const cached = getCachedValue(cacheKey);
    if (cached !== null) return cached;

    const pending = pendingRequests.get(cacheKey);
    if (pending) return pending;
  }

  const fetchPromise = (async () => {
    const response = await fetch(url, {
      method,
      headers,
      body: options.body,
      signal: options.signal,
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        data?.detail || data?.message || "Ocurrió un error en la petición",
      );
    }

    if (usarCache) {
      setCachedValue(cacheKey, data);
    } else if (method !== "GET") {
      clearGetCache();
    }

    return data;
  })();

  if (usarCache) {
    pendingRequests.set(cacheKey, fetchPromise);
  }

  try {
    return await fetchPromise;
  } finally {
    if (usarCache) {
      pendingRequests.delete(cacheKey);
    }
  }
}

export function leerProductosPublicosCache(params = {}) {
  const token = getClienteToken();
  const path = buildProductosPublicosPath(params);
  const url = `${API_BASE}${path}`;
  const cached = getCachedValue(buildCacheKey(url, token));
  return normalizarListado(cached);
}

export function leerDetalleProductoPublicoCache(productId) {
  const token = getClienteToken();
  const path = buildDetalleProductoPath(productId);
  const url = `${API_BASE}${path}`;
  return getCachedValue(buildCacheKey(url, token));
}

export async function obtenerProductosPublicos(params = {}, options = {}) {
  const data = await request(buildProductosPublicosPath(params), {
    signal: options.signal,
    cache: options.cache,
  });

  return normalizarListado(data);
}

export async function obtenerDetalleProductoPublico(productId, options = {}) {
  return request(buildDetalleProductoPath(productId), {
    signal: options.signal,
    cache: options.cache,
  });
}

export async function obtenerCategoriasPublicas(options = {}) {
  return request("/public/productos/categorias/", {
    signal: options.signal,
    cache: options.cache,
  });
}

export async function crearCheckoutMercadoPago(payload) {
  return request("/public/checkout/mercado-pago/", {
    method: "POST",
    body: JSON.stringify(payload),
    cache: false,
  });
}
