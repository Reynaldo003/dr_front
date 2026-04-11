import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import NewProductModal from "../components/products/NewProductModal";
import ProductViewModal from "../components/products/ProductViewModal";
import ProductEditModal from "../components/products/ProductEditModal";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  obtenerProducto,
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../lib/productosAdminApi";

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

function toUiProduct(p) {
  const variantes = Array.isArray(p.variantes) ? p.variantes : [];
  const imagenes = Array.isArray(p.imagenes) ? p.imagenes : [];

  const colors = [...new Set(variantes.map((v) => v.color).filter(Boolean))];
  const sizes = [...new Set(variantes.map((v) => v.talla).filter(Boolean))];

  const stockMap = variantes.reduce((acc, item) => {
    acc[`${item.color}__${item.talla}`] = Number(item.stock || 0);
    return acc;
  }, {});

  return {
    apiId: p.id,
    id: p.codigo || String(p.id),
    title: p.titulo || "",
    sku: p.sku || "—",
    cost: Number(p.costo || 0),
    price: Number(p.precio || 0),
    salePrice:
      p.precio_rebaja !== null && p.precio_rebaja !== undefined
        ? Number(p.precio_rebaja)
        : null,
    status: p.estado || "Activo",
    category: p.categoria || "",
    description: p.descripcion || "",
    stockTotal: Number(p.stock_total || 0),
    heroUrl: p.imagen_principal || "",
    gallery: imagenes.map((img) => ({
      id: img.id,
      url: img.imagen,
      name: `Imagen ${img.orden ?? 0}`,
    })),
    variants: {
      colors,
      sizes,
      stockMap,
      totalStock: Number(p.stock_total || 0),
      totalColors: Number(
        p.total_colores !== undefined ? p.total_colores : colors.length
      ),
      totalSizes: Number(
        p.total_tallas !== undefined ? p.total_tallas : sizes.length
      ),
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
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  const [openNew, setOpenNew] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {
    try {
      setLoading(true);
      setError("");
      const data = await obtenerProductos();
      setProducts((data || []).map(toUiProduct));
    } catch (err) {
      setError("No se pudieron cargar los productos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return products;

    return products.filter((p) => {
      return (
        String(p.id || "").toLowerCase().includes(query) ||
        String(p.title || "").toLowerCase().includes(query) ||
        String(p.sku || "").toLowerCase().includes(query)
      );
    });
  }, [products, q]);

  async function handleOpenView(p) {
    try {
      setCargandoDetalle(true);
      const data = await obtenerProducto(p.apiId);
      const productoUi = toUiProduct(data);
      setSelected(productoUi);
      setOpenView(true);
    } catch (err) {
      console.error(err);
      alert(err.message || "No se pudo cargar el detalle del producto.");
    } finally {
      setCargandoDetalle(false);
    }
  }

  async function handleOpenEdit(p) {
    try {
      setCargandoDetalle(true);
      const data = await obtenerProducto(p.apiId);
      const productoUi = toUiProduct(data);
      setSelected(productoUi);
      setOpenEdit(true);
    } catch (err) {
      console.error(err);
      alert(err.message || "No se pudo cargar el detalle del producto.");
    } finally {
      setCargandoDetalle(false);
    }
  }

  async function handleCreate(payload) {
    try {
      setGuardando(true);

      const stockTotal =
        payload?.variants?.totalStock ??
        Object.values(payload?.variants?.stockMap ?? {}).reduce(
          (a, b) => a + Number(b || 0),
          0,
        );

      const ui = {
        title: payload.title,
        sku: payload.sku || "—",
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
      const productoUi = toUiProduct(creado);

      setProducts((prev) => [productoUi, ...prev]);
      setOpenNew(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "No se pudo guardar el producto. Revisa SKU y datos de rebaja.");
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

      setProducts((prev) =>
        prev.map((item) => (item.apiId === productoUi.apiId ? productoUi : item)),
      );

      setSelected(productoUi);
      setOpenEdit(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "No se pudo actualizar el producto.");
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

      setProducts((prev) =>
        prev.filter((item) => item.apiId !== producto.apiId),
      );

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

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-sm text-zinc-500">Inventario de productos</p>
        </div>

        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={18}
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border bg-white pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="Buscar por SKU, ID o nombre"
            />
          </div>

          <button
            onClick={() => setOpenNew(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:opacity-95 active:scale-[0.98] transition"
          >
            <Plus size={16} /> Nuevo producto
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
        ) : (
          <>
            <div className="hidden md:block overflow-auto rounded-2xl border">
              <table className="min-w-[1080px] w-full text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    {["ID", "Producto", "Stock", "Precio", "Estado", "Acciones"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 font-semibold text-zinc-700"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>

                <tbody className="bg-white">
                  {filtered.map((p) => (
                    <tr
                      key={p.apiId}
                      className="border-t hover:bg-zinc-50 transition-colors"
                    >
                      <td className="px-4 py-3">{p.id}</td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-12 w-12 rounded-xl border bg-zinc-100 overflow-hidden flex-none">
                            {p.heroUrl ? (
                              <img
                                src={p.heroUrl}
                                alt={p.title}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-full w-full grid place-items-center text-[10px] text-zinc-500">
                                Sin
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-semibold truncate">{p.title}</div>
                            <div className="text-xs text-zinc-500 truncate">
                              SKU: {p.sku}
                            </div>
                            <div className="text-[11px] text-zinc-500 truncate">
                              {p.variants?.totalColors ?? 0} colores ·{" "}
                              {p.variants?.totalSizes ?? 0} tallas
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{p.stockTotal}</span>
                          {stockBadge(p.stockTotal)}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold">
                          ${Number(p.price).toLocaleString()}
                        </div>

                        {p.salePrice !== null ? (
                          <div className="text-xs text-zinc-500">
                            Rebaja: ${Number(p.salePrice).toLocaleString()}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-4 py-3">{statusBadge(p.status)}</td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenView(p)}
                            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs hover:bg-zinc-50 active:scale-[0.98] transition"
                          >
                            <Eye size={14} /> Ver
                          </button>

                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white px-3 py-2 text-xs hover:opacity-95 active:scale-[0.98] transition"
                          >
                            <Pencil size={14} /> Editar
                          </button>

                          <button
                            onClick={() => handleDelete(p)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50 active:scale-[0.98] transition"
                          >
                            <Trash2 size={14} /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-sm text-zinc-600"
                      >
                        No hay productos con ese filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {filtered.map((p) => (
                <div key={p.apiId} className="rounded-2xl border bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-16 w-16 rounded-2xl border bg-zinc-100 overflow-hidden flex-none">
                      {p.heroUrl ? (
                        <img
                          src={p.heroUrl}
                          alt={p.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-xs text-zinc-500">
                          Sin foto
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{p.title}</div>
                          <div className="text-xs text-zinc-500 truncate">
                            {p.id} · SKU: {p.sku}
                          </div>
                          <div className="text-[11px] text-zinc-500 truncate mt-1">
                            {p.variants?.totalColors ?? 0} colores ·{" "}
                            {p.variants?.totalSizes ?? 0} tallas
                          </div>
                        </div>
                        {statusBadge(p.status)}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-zinc-500">Precio</div>
                          <div className="font-semibold">
                            ${Number(p.price).toLocaleString()}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-zinc-500">Stock</div>
                          <div className="flex items-center gap-2 justify-end">
                            <span className="font-semibold">{p.stockTotal}</span>
                            {stockBadge(p.stockTotal)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleOpenView(p)}
                          className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50 active:scale-[0.98] transition"
                        >
                          Ver
                        </button>

                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:opacity-95 active:scale-[0.98] transition"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleDelete(p)}
                          className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 active:scale-[0.98] transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="rounded-2xl border bg-zinc-50 p-4 text-sm text-zinc-600">
                  No hay productos con ese filtro.
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-4 text-xs text-zinc-500 flex items-center justify-between gap-2">
          <div>Total: {filtered.length} productos</div>
          <div className="flex items-center gap-3">
            {cargandoDetalle ? <div>Cargando detalle...</div> : null}
            {guardando ? <div>Guardando cambios...</div> : null}
          </div>
        </div>
      </Card>

      <NewProductModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        onSave={async (payload) => {
          await handleCreate(payload);
        }}
      />

      <ProductViewModal
        open={openView}
        product={selected}
        onClose={() => setOpenView(false)}
        onEdit={() => {
          setOpenView(false);
          setOpenEdit(true);
        }}
      />

      <ProductEditModal
        open={openEdit}
        product={selected}
        onClose={() => setOpenEdit(false)}
        onSave={handleUpdate}
      />
    </div>
  );
}