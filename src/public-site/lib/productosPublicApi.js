const API_BASE_URL = "https://misdosreynas.com";
const GET_CACHE_TTL = 5 * 60 * 1000;
const CACHE_PREFIX = "public_shop_lists_cache_v2::";

const memoryCache = new Map();
const pendingRequests = new Map();

function buildCacheKey(url) {
  return `${CACHE_PREFIX}${url}`;
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
    // Sin romper la app.
  }
}

function normalizarListado(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
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
  const url = `${API_BASE_URL}${path}`;

  const {
    cache: cacheOption,
    signal,
    headers: extraHeaders,
    ...restOptions
  } = options;

  const disableAppCache = cacheOption === false;
  const fetchCacheMode =
    typeof cacheOption === "string" ? cacheOption : undefined;

  const useCache =
    method === "GET" &&
    !disableAppCache &&
    fetchCacheMode !== "no-store" &&
    fetchCacheMode !== "reload";

  const cacheKey = useCache ? buildCacheKey(url) : "";

  const headers = {
    Accept: "application/json",
    ...(extraHeaders || {}),
  };

  if (useCache) {
    const cached = getCachedValue(cacheKey);
    if (cached !== null) return cached;

    const pending = pendingRequests.get(cacheKey);
    if (pending) return pending;
  }

  const fetchPromise = (async () => {
    const fetchConfig = {
      ...restOptions,
      method,
      headers,
      signal,
    };

    if (fetchCacheMode) {
      fetchConfig.cache = fetchCacheMode;
    }

    const response = await fetch(url, fetchConfig);
    const data = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        data?.detail || data?.message || "No se pudo obtener la información.",
      );
    }

    if (useCache) {
      setCachedValue(cacheKey, data);
    }

    return data;
  })();

  if (useCache) {
    pendingRequests.set(cacheKey, fetchPromise);
  }

  try {
    return await fetchPromise;
  } finally {
    if (useCache) {
      pendingRequests.delete(cacheKey);
    }
  }
}

export async function obtenerRebajas(params = {}, options = {}) {
  const query = new URLSearchParams();

  if (params.buscar) query.set("buscar", params.buscar);
  if (params.categoria) query.set("categoria", params.categoria);
  if (params.solo_disponibles !== undefined) {
    query.set("solo_disponibles", String(params.solo_disponibles));
  }

  query.set("page", String(params.page || 1));
  query.set("page_size", String(params.page_size || 24));

  const data = await request(
    `/api/public/productos/rebajas/${query.toString() ? `?${query.toString()}` : ""}`,
    {
      signal: options.signal,
      cache: options.cache,
    },
  );

  return normalizarListado(data);
}

export async function obtenerNewArrivals(params = {}, options = {}) {
  const query = new URLSearchParams();

  if (params.buscar) query.set("buscar", params.buscar);
  if (params.categoria) query.set("categoria", params.categoria);

  query.set("page", String(params.page || 1));
  query.set("page_size", String(params.page_size || 24));

  const data = await request(
    `/api/public/productos/new-arrivals/${query.toString() ? `?${query.toString()}` : ""}`,
    {
      signal: options.signal,
      cache: options.cache,
    },
  );

  return normalizarListado(data);
}
