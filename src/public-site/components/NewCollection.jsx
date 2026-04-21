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
} from "../lib/apiPublic";
import {
  adaptarProductoBackend,
  adaptarProductoListadoBackend,
} from "../lib/productAdapters";
import ProductGrid from "./ProductGrid";

const ProductModal = lazy(() => import("./ProductModal"));

const PAGE_SIZE = 24;

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

  const titulo = useMemo(() => {
    if (!categoria) return "Nueva colección";
    return categoria;
  }, [categoria]);

  const subtitulo = useMemo(() => {
    if (!categoria) return "Explora piezas seleccionadas para ti.";
    return "Descubre piezas disponibles en esta categoría.";
  }, [categoria]);

  const handleOpen = useCallback(async (product) => {
    setSelected(product);
    setOpen(true);
    setErrorDetalle("");

    const detalleCache = leerDetalleProductoPublicoCache(product.id);
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

    try {
      const data = await obtenerDetalleProductoPublico(product.id, {
        signal: controller.signal,
        cache: true,
      });

      if (detalleAbortRef.current !== controller) return;

      setSelected(adaptarProductoBackend(data));
    } catch (err) {
      if (err?.name === "AbortError") return;
      setErrorDetalle(err.message || "No se pudo cargar el detalle del producto");
    } finally {
      if (detalleAbortRef.current === controller) {
        detalleAbortRef.current = null;
        setCargandoDetalle(false);
      }
    }
  }, []);

  const handleClose = useCallback(() => {
    if (detalleAbortRef.current) {
      detalleAbortRef.current.abort();
      detalleAbortRef.current = null;
    }

    setOpen(false);
    setCargandoDetalle(false);
    setErrorDetalle("");

    window.setTimeout(() => setSelected(null), 200);
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
            loading={cargandoDetalle}
            error={errorDetalle}
          />
        </Suspense>
      ) : null}
    </>
  );
}