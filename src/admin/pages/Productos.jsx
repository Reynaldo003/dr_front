import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import NewProductModal from "../components/products/NewProductModal";
import ProductViewModal from "../components/products/ProductViewModal";
import ProductEditModal from "../components/products/ProductEditModal";
import {
  obtenerProducto,
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../lib/productosAdminApi";

const PAGE_SIZE = 30;

function useEsMobile() {
  const [esMobile, setEsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    function onResize() {
      setEsMobile(window.innerWidth < 768);
    }

    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return esMobile;
}

function stockBadge(stock) {
  const s = Number(stock || 0);

  if (s <= 0) return <Badge variant="danger">Sin stock</Badge>;
  if (s <= 5) return <Badge variant="warning">Bajo</Badge>;
  return <Badge variant="neutral">OK</Badge>;
}

function statusBadge(status) {
  return status === "Activo" ? (
    <Badge variant="success">Activo</Badge>
  ) : (
    <Badge variant="danger">Inactivo</Badge>
  );
}

function toUiProduct(producto) {
  const variantes = Array.isArray(producto?.variantes) ? producto.variantes : [];
  const imagenes = Array.isArray(producto?.imagenes) ? producto.imagenes : [];

  const colors = [...new Set(variantes.map((item) => item.color).filter(Boolean))];
  const sizes = [...new Set(variantes.map((item) => item.talla).filter(Boolean))];

  const stockMap = variantes.reduce((acc, item) => {
    acc[`${item.color}__${item.talla}`] = Number(item.stock || 0);
    return acc;
  }, {});

  return {
    apiId: producto.id,
    id: producto.codigo || String(producto.id),
    title: producto.titulo || "",
    sku: producto.sku || "",
    cost: Number(producto.costo || 0),
    price: Number(producto.precio || 0),
    salePrice:
      producto.precio_rebaja !== null && producto.precio_rebaja !== undefined
        ? Number(producto.precio_rebaja)
        : null,
    status: producto.estado || "Activo",
    category: producto.categoria || "",
    description: producto.descripcion || "",
    stockTotal: Number(producto.stock_total || 0),
    heroUrl: producto.imagen_principal || "",
    gallery: imagenes.map((img) => ({
      id: img.id,
      url: img.imagen,
      name: `Imagen ${img.orden ?? 0}`,
    })),
    variants: {
      colors,
      sizes,
      stockMap,
      totalStock: Number(producto.stock_total || 0),
      totalColors: colors.length,
      totalSizes: sizes.length,
    },
  };
}

function toApiPayload(ui) {
  const colors = ui?.variants?.colors || [];
  const sizes = ui?.variants?.sizes || [];
  const stockMap = ui?.variants?.stockMap || {};
  const variantes = [];

  colors.forEach((color) => {
    sizes.forEach((talla) => {
      variantes.push({
        color,
        talla,
        stock: Number(stockMap[`${color}__${talla}`] || 0),
      });
    });
  });

  return {
    titulo: ui.title?.trim() || "",
    sku: ui.sku?.trim() || "",
    descripcion: ui.description?.trim() || "",
    costo: Number(ui.cost || 0),
    precio: Number(ui.price || 0),
    precio_rebaja:
      ui.salePrice === null || ui.salePrice === "" || ui.salePrice === undefined
        ? null
        : Number(ui.salePrice || 0),
    categoria: ui.category || "",
    estado: ui.status || "Activo",
    imagen_principal: ui.heroUrl || "",
    imagenes: (ui.gallery || [])
      .filter((item) => item?.url)
      .map((item, index) => ({
        imagen: item.url,
        orden: index + 1,
      })),
    variantes,
  };
}

export default function Productos() {
  const esMobile = useEsMobile();

  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    count: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    pages: 1,
    hasPrevious: false,
    hasNext: false,
  });

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  const [openNew, setOpenNew] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const detalleCacheRef = useRef(new Map());
  const detalleAbortRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQ(q.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ]);

  const aplicarRespuestaListado = useCallback((data, paginaActual) => {
    const results = Array.isArray(data?.results) ? data.results : [];

    setProducts(results.map(toUiProduct));
    setPageInfo({
      count: Number(data?.count || 0),
      page: Number(data?.page || paginaActual),
      pageSize: Number(data?.page_size || PAGE_SIZE),
      pages: Number(data?.pages || 1),
      hasPrevious: Boolean(data?.has_previous),
      hasNext: Boolean(data?.has_next),
    });
  }, []);

  const recargarPaginaActual = useCallback(
    async (paginaActual = page) => {
      setLoading(true);
      setError("");

      try {
        const data = await obtenerProductos({
          buscar: debouncedQ,
          page: paginaActual,
          page_size: PAGE_SIZE,
        });

        aplicarRespuestaListado(data, paginaActual);
      } catch (err) {
        console.error(err);
        setError(err?.message || "No se pudieron cargar los productos.");
      } finally {
        setLoading(false);
      }
    },
    [aplicarRespuestaListado, debouncedQ, page],
  );

  useEffect(() => {
    const controller = new AbortController();
    let activo = true;

    async function cargar() {
      setLoading(true);
      setError("");

      try {
        const data = await obtenerProductos(
          {
            buscar: debouncedQ,
            page,
            page_size: PAGE_SIZE,
          },
          { signal: controller.signal },
        );

        if (!activo) return;

        aplicarRespuestaListado(data, page);
      } catch (err) {
        if (!activo || err?.name === "AbortError") return;
        console.error(err);
        setError(err?.message || "No se pudieron cargar los productos.");
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    }

    cargar();

    return () => {
      activo = false;
      controller.abort();
    };
  }, [aplicarRespuestaListado, debouncedQ, page]);

  useEffect(() => {
    return () => {
      if (detalleAbortRef.current) {
        detalleAbortRef.current.abort();
      }
    };
  }, []);

  async function cargarDetalleProducto(productoBase) {
    if (!productoBase?.apiId) return;

    const apiId = productoBase.apiId;
    const cacheado = detalleCacheRef.current.get(apiId);

    if (cacheado) {
      setSelected(cacheado);
      return;
    }

    if (detalleAbortRef.current) {
      detalleAbortRef.current.abort();
    }

    const controller = new AbortController();
    detalleAbortRef.current = controller;
    setCargandoDetalle(true);

    try {
      const data = await obtenerProducto(apiId, { signal: controller.signal });

      if (detalleAbortRef.current !== controller) return;

      const productoCompleto = toUiProduct(data);
      detalleCacheRef.current.set(apiId, productoCompleto);

      setSelected((prev) => {
        if (!prev || prev.apiId !== apiId) return prev;
        return productoCompleto;
      });
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error(err);
      alert(err.message || "No se pudo cargar el detalle del producto.");
    } finally {
      if (detalleAbortRef.current === controller) {
        detalleAbortRef.current = null;
        setCargandoDetalle(false);
      }
    }
  }

  function handleOpenView(producto) {
    setSelected(producto);
    setOpenEdit(false);
    setOpenView(true);
    cargarDetalleProducto(producto);
  }

  function handleOpenEdit(producto) {
    setSelected(producto);
    setOpenView(false);
    setOpenEdit(true);
    cargarDetalleProducto(producto);
  }

  function handleCloseView() {
    setOpenView(false);
    setCargandoDetalle(false);
  }

  function handleCloseEdit() {
    setOpenEdit(false);
    setCargandoDetalle(false);
  }

  async function handleCreate(payload) {
    try {
      setGuardando(true);

      const stockTotal =
        payload?.variants?.totalStock ??
        Object.values(payload?.variants?.stockMap ?? {}).reduce(
          (acc, value) => acc + Number(value || 0),
          0,
        );

      const ui = {
        title: payload.title,
        sku: payload.sku,
        cost: Number(payload.cost || 0),
        price: Number(payload.price || 0),
        salePrice:
          payload.salePrice === null || payload.salePrice === undefined
            ? null
            : Number(payload.salePrice || 0),
        category: payload.category || "",
        status: payload.status || "Activo",
        heroUrl: payload.heroUrl || "",
        gallery: payload.gallery || [],
        description: payload.description || "",
        variants: payload.variants || { colors: [], sizes: [], stockMap: {} },
        stockTotal,
      };

      const creado = await crearProducto(toApiPayload(ui));
      const productoCreado = toUiProduct(creado);
      detalleCacheRef.current.set(productoCreado.apiId, productoCreado);

      setOpenNew(false);

      if (page !== 1) {
        setPage(1);
      } else {
        await recargarPaginaActual(1);
      }
    } finally {
      setGuardando(false);
    }
  }

  async function handleUpdate(updatedUi) {
    try {
      setGuardando(true);

      const actualizado = await actualizarProducto(
        updatedUi.apiId,
        toApiPayload(updatedUi),
      );

      const productoUi = toUiProduct(actualizado);
      detalleCacheRef.current.set(productoUi.apiId, productoUi);

      setProducts((prev) =>
        prev.map((item) => (item.apiId === productoUi.apiId ? productoUi : item)),
      );

      setSelected(productoUi);
      setOpenEdit(false);
    } finally {
      setGuardando(false);
    }
  }

  async function handleDelete(producto) {
    const ok = window.confirm(
      `¿Seguro que quieres eliminar el producto "${producto.title}"?`,
    );
    if (!ok) return;

    try {
      await eliminarProducto(producto.apiId);
      detalleCacheRef.current.delete(producto.apiId);

      const soloHabiaUno = products.length === 1;
      const habiaPaginaAnterior = page > 1;

      if (soloHabiaUno && habiaPaginaAnterior) {
        setPage((prev) => prev - 1);
      } else {
        await recargarPaginaActual(page);
      }

      if (selected?.apiId === producto.apiId) {
        setSelected(null);
        setOpenView(false);
        setOpenEdit(false);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "No se pudo eliminar el producto.");
    }
  }

  const totalMostrado = useMemo(() => products.length, [products]);

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-sm text-zinc-500">Inventario de productos</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={18}
            />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              className="w-full rounded-xl border bg-white py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="Buscar por SKU, ID o nombre"
            />
          </div>

          <button
            type="button"
            onClick={() => setOpenNew(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white transition hover:opacity-95 active:scale-[0.98] sm:w-auto"
          >
            <Plus size={16} />
            Nuevo producto
          </button>
        </div>
      </div>

      <Card title="Inventario">
        {loading ? (
          <div className="rounded-2xl border bg-white p-6 text-sm text-zinc-600">
            Cargando productos...
          </div>
        ) : error ? (
          <div className="rounded-2xl border bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border bg-zinc-50 p-6 text-sm text-zinc-600">
            No hay productos con ese filtro.
          </div>
        ) : esMobile ? (
          <div className="space-y-3">
            {products.map((producto) => (
              <div key={producto.apiId} className="rounded-2xl border bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 flex-none overflow-hidden rounded-2xl border bg-zinc-100">
                    {producto.heroUrl ? (
                      <img
                        src={producto.heroUrl}
                        alt={producto.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-xs text-zinc-500">
                        Sin foto
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{producto.title}</div>
                        <div className="truncate text-xs text-zinc-500">
                          {producto.id} · SKU: {producto.sku}
                        </div>
                        <div className="mt-1 truncate text-[11px] text-zinc-500">
                          {producto.variants?.totalColors ?? 0} colores ·{" "}
                          {producto.variants?.totalSizes ?? 0} tallas
                        </div>
                      </div>

                      {statusBadge(producto.status)}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-zinc-500">Precio</div>
                        <div className="font-semibold">
                          ${Number(producto.price).toLocaleString()}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-zinc-500">Stock</div>
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-semibold">{producto.stockTotal}</span>
                          {stockBadge(producto.stockTotal)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenView(producto)}
                        className="rounded-xl border px-4 py-2 text-sm transition hover:bg-zinc-50 active:scale-[0.98]"
                      >
                        Ver
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(producto)}
                        className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white transition hover:opacity-95 active:scale-[0.98]"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(producto)}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 active:scale-[0.98]"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-auto rounded-2xl border">
            <table className="min-w-[1080px] w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  {["ID", "Producto", "Stock", "Precio", "Estado", "Acciones"].map(
                    (head) => (
                      <th
                        key={head}
                        className="px-4 py-3 text-left font-semibold text-zinc-700"
                      >
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="bg-white">
                {products.map((producto) => (
                  <tr
                    key={producto.apiId}
                    className="border-t transition-colors hover:bg-zinc-50"
                  >
                    <td className="px-4 py-3">{producto.id}</td>

                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-12 w-12 flex-none overflow-hidden rounded-xl border bg-zinc-100">
                          {producto.heroUrl ? (
                            <img
                              src={producto.heroUrl}
                              alt={producto.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-[10px] text-zinc-500">
                              Sin
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="truncate font-semibold">{producto.title}</div>
                          <div className="truncate text-xs text-zinc-500">
                            SKU: {producto.sku}
                          </div>
                          <div className="truncate text-[11px] text-zinc-500">
                            {producto.variants?.totalColors ?? 0} colores ·{" "}
                            {producto.variants?.totalSizes ?? 0} tallas
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{producto.stockTotal}</span>
                        {stockBadge(producto.stockTotal)}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold">
                        ${Number(producto.price).toLocaleString()}
                      </div>

                      {producto.salePrice !== null ? (
                        <div className="text-xs text-zinc-500">
                          Rebaja: ${Number(producto.salePrice).toLocaleString()}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-4 py-3">{statusBadge(producto.status)}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenView(producto)}
                          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition hover:bg-zinc-50 active:scale-[0.98]"
                        >
                          <Eye size={14} />
                          Ver
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(producto)}
                          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2 text-xs text-white transition hover:opacity-95 active:scale-[0.98]"
                        >
                          <Pencil size={14} />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(producto)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs text-red-600 transition hover:bg-red-50 active:scale-[0.98]"
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span>Total general: {pageInfo.count}</span>
            <span>Mostrando: {totalMostrado}</span>
            <span>
              Página {pageInfo.page} de {pageInfo.pages}
            </span>
            {cargandoDetalle ? <span>Cargando detalle...</span> : null}
            {guardando ? <span>Guardando cambios...</span> : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!pageInfo.hasPrevious || loading}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>

            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!pageInfo.hasNext || loading}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Card>

      <NewProductModal
        open={openNew}
        saving={guardando}
        onClose={() => setOpenNew(false)}
        onSave={handleCreate}
      />

      <ProductViewModal
        open={openView}
        product={selected}
        loading={cargandoDetalle}
        onClose={handleCloseView}
        onEdit={() => {
          setOpenView(false);
          setOpenEdit(true);
        }}
      />

      <ProductEditModal
        open={openEdit}
        product={selected}
        loading={cargandoDetalle}
        saving={guardando}
        onClose={handleCloseEdit}
        onSave={handleUpdate}
      />
    </div>
  );
}