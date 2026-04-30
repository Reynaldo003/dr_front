import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  leerDetalleProductoPublicoCache,
  leerProductosPublicosCache,
  obtenerDetalleProductoPublico,
  obtenerProductosPublicos,
  precargarDetalleProductoPublico,
} from "../lib/apiPublic";
import {
  adaptarProductoBackend,
  adaptarProductoListadoBackend,
} from "../lib/productAdapters";
import ProductGrid from "./ProductGrid";

const loadProductModal = () => import("./ProductModal");
const ProductModal = lazy(loadProductModal);

const PAGE_SIZE = 24;
const PRODUCTO_QUERY_PARAM = "producto";

function ejecutarCuandoIdle(fn, delayFallback = 250) {
  if (typeof window === "undefined") {
    fn();
    return () => { };
  }

  let cancelado = false;

  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(
      () => {
        if (!cancelado) fn();
      },
      { timeout: 1200 },
    );

    return () => {
      cancelado = true;
      window.cancelIdleCallback(id);
    };
  }

  const timeoutId = window.setTimeout(() => {
    if (!cancelado) fn();
  }, delayFallback);

  return () => {
    cancelado = true;
    window.clearTimeout(timeoutId);
  };
}

function ejecutarDespuesDePintar(fn) {
  if (
    typeof window !== "undefined" &&
    typeof window.requestAnimationFrame === "function"
  ) {
    window.requestAnimationFrame(() => fn());
    return;
  }

  setTimeout(fn, 0);
}

function esNavegador() {
  return typeof window !== "undefined";
}

function leerProductoIdDesdeUrl() {
  if (!esNavegador()) return "";

  const params = new URLSearchParams(window.location.search);
  return params.get(PRODUCTO_QUERY_PARAM) || "";
}

function construirUrlProducto(productId) {
  if (!esNavegador()) return "";

  const url = new URL(window.location.href);
  url.searchParams.set(PRODUCTO_QUERY_PARAM, String(productId));
  return url.toString();
}

function escribirProductoEnUrl(productId) {
  if (!esNavegador() || !productId) return;

  const url = new URL(window.location.href);
  url.searchParams.set(PRODUCTO_QUERY_PARAM, String(productId));

  window.history.pushState({}, "", url.toString());
}

function limpiarProductoDeUrl() {
  if (!esNavegador()) return;

  const url = new URL(window.location.href);
  url.searchParams.delete(PRODUCTO_QUERY_PARAM);

  window.history.pushState({}, "", url.toString());
}

async function copiarTexto(texto) {
  if (!esNavegador() || !texto) return false;

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(texto);
    return true;
  }

  const inputTemporal = document.createElement("textarea");
  inputTemporal.value = texto;
  inputTemporal.setAttribute("readonly", "");
  inputTemporal.style.position = "fixed";
  inputTemporal.style.opacity = "0";

  document.body.appendChild(inputTemporal);
  inputTemporal.select();

  const copiado = document.execCommand("copy");
  document.body.removeChild(inputTemporal);

  return copiado;
}

function construirProductoTemporal(productId) {
  return {
    id: productId,
    productId,
    name: "Producto",
    title: "Producto",
    description: "",
    price: 0,
    images: [],
    colors: [],
    sizes: [],
    variantStockMap: {},
  };
}

export default function NewCollection({
  onAddToCart,
  categoria = "",
  categoriaKey = "",
}) {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");

  const detalleAbortRef = useRef(null);

  const params = useMemo(
    () => ({
      ...(categoria ? { categoria } : {}),
      solo_disponibles: true,
      page: 1,
      page_size: PAGE_SIZE,
    }),
    [categoria],
  );

  useEffect(() => {
    if (detalleAbortRef.current) {
      detalleAbortRef.current.abort();
      detalleAbortRef.current = null;
    }

    setOpen(false);
    setSelected(null);
    setCargandoDetalle(false);
    setErrorDetalle("");
  }, [categoriaKey, categoria]);

  useEffect(() => {
    let activo = true;
    const controller = new AbortController();

    const cacheApi = leerProductosPublicosCache(params);
    const itemsDesdeCache = Array.isArray(cacheApi)
      ? cacheApi.map(adaptarProductoListadoBackend)
      : [];

    if (itemsDesdeCache.length > 0) {
      setItems(itemsDesdeCache);
      setCargando(false);
      setError("");
    } else {
      setCargando(true);
      setError("");
    }

    async function cargar() {
      try {
        const data = await obtenerProductosPublicos(params, {
          signal: controller.signal,
          cache: true,
        });

        if (!activo) return;

        const adaptados = (Array.isArray(data) ? data : []).map(
          adaptarProductoListadoBackend,
        );

        setItems(adaptados);
        setError("");
      } catch (err) {
        if (!activo || err?.name === "AbortError") return;
        setError(err.message || "No se pudieron cargar los productos");
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargar();

    return () => {
      activo = false;
      controller.abort();
    };
  }, [params]);

  useEffect(() => {
    return () => {
      if (detalleAbortRef.current) {
        detalleAbortRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (!items.length) return;

    const cancelar = ejecutarCuandoIdle(() => {
      loadProductModal().catch(() => { });

      items.slice(0, 2).forEach((item) => {
        if (item?.id) {
          precargarDetalleProductoPublico(item.id, { cache: true });
        }
      });
    }, 350);

    return cancelar;
  }, [items]);

  const titulo = useMemo(() => {
    if (!categoria) return "Nueva colección";
    return categoria;
  }, [categoria]);

  const subtitulo = useMemo(() => {
    if (!categoria) return "Explora piezas seleccionadas para ti.";
    return "Descubre piezas disponibles en esta categoría.";
  }, [categoria]);

  const cargarDetalleProducto = useCallback((productoBase) => {
    if (!productoBase?.id) return;

    setSelected(productoBase);
    setOpen(true);
    setErrorDetalle("");
    loadProductModal().catch(() => { });

    const detalleCache = leerDetalleProductoPublicoCache(productoBase.id);

    if (detalleCache) {
      setSelected(adaptarProductoBackend(detalleCache));
      setCargandoDetalle(false);
      return;
    }

    setCargandoDetalle(true);

    if (detalleAbortRef.current) {
      detalleAbortRef.current.abort();
    }

    const controller = new AbortController();
    detalleAbortRef.current = controller;

    ejecutarDespuesDePintar(async () => {
      try {
        const data = await obtenerDetalleProductoPublico(productoBase.id, {
          signal: controller.signal,
          cache: true,
        });

        if (detalleAbortRef.current !== controller) return;

        setSelected(adaptarProductoBackend(data));
      } catch (err) {
        if (err?.name === "AbortError") return;

        setErrorDetalle(
          err.message || "No se pudo cargar el detalle del producto",
        );
      } finally {
        if (detalleAbortRef.current === controller) {
          detalleAbortRef.current = null;
          setCargandoDetalle(false);
        }
      }
    });
  }, []);

  const handlePrefetch = useCallback((product) => {
    if (!product?.id) return;

    loadProductModal().catch(() => { });
    precargarDetalleProductoPublico(product.id, { cache: true });
  }, []);

  const handleOpen = useCallback(
    (product) => {
      if (!product?.id) return;

      escribirProductoEnUrl(product.id);
      cargarDetalleProducto(product);
    },
    [cargarDetalleProducto],
  );

  const abrirProductoDesdeUrl = useCallback(() => {
    const productId = leerProductoIdDesdeUrl();

    if (!productId) return;

    if (open && String(selected?.id) === String(productId)) return;

    const productoEnListado = items.find(
      (item) => String(item?.id) === String(productId),
    );

    cargarDetalleProducto(productoEnListado || construirProductoTemporal(productId));
  }, [cargarDetalleProducto, items, open, selected?.id]);

  useEffect(() => {
    abrirProductoDesdeUrl();
  }, [abrirProductoDesdeUrl]);

  useEffect(() => {
    if (!esNavegador()) return undefined;

    const handlePopState = () => {
      const productId = leerProductoIdDesdeUrl();

      if (!productId) {
        setOpen(false);
        setCargandoDetalle(false);
        setErrorDetalle("");
        window.setTimeout(() => setSelected(null), 180);
        return;
      }

      abrirProductoDesdeUrl();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [abrirProductoDesdeUrl]);

  const handleClose = useCallback((options = {}) => {
    const debeLimpiarUrl = options?.limpiarUrl !== false;

    if (detalleAbortRef.current) {
      detalleAbortRef.current.abort();
      detalleAbortRef.current = null;
    }

    if (debeLimpiarUrl) {
      limpiarProductoDeUrl();
    }

    setOpen(false);
    setCargandoDetalle(false);
    setErrorDetalle("");

    window.setTimeout(() => setSelected(null), 180);
  }, []);

  const handleShare = useCallback(async (product) => {
    if (!product?.id) return false;

    const url = construirUrlProducto(product.id);
    const title = product?.name || product?.title || "Producto";
    const text = `Mira este producto: ${title}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        });

        return true;
      }

      return await copiarTexto(url);
    } catch (error) {
      if (error?.name === "AbortError") return false;

      try {
        return await copiarTexto(url);
      } catch {
        return false;
      }
    }
  }, []);

  if (cargando && !items.length) {
    return (
      <section className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20">
        <div className="text-sm text-gray-500">Cargando productos...</div>
      </section>
    );
  }

  if (error && !items.length) {
    return (
      <section className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      </section>
    );
  }

  return (
    <>
      <ProductGrid
        items={items}
        onOpen={handleOpen}
        onPrefetch={handlePrefetch}
        onShare={handleShare}
        title={titulo}
        subtitle={subtitulo}
      />

      {selected ? (
        <Suspense fallback={null}>
          <ProductModal
            product={selected}
            open={open}
            onClose={handleClose}
            onAddToCart={onAddToCart}
            onShare={handleShare}
            loading={cargandoDetalle}
            error={errorDetalle}
          />
        </Suspense>
      ) : null}
    </>
  );
}