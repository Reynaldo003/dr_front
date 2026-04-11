import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Sheet from "../components/ui/Sheet";
import Modal from "../components/ui/Modal";
import NewSaleModal from "../components/sales/NewSaleModal";
import {
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  CreditCard,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { obtenerProductos } from "../services/productosApi";
import {
  obtenerVentas,
  crearVenta,
  actualizarVenta,
  eliminarVenta,
  crearPreferenciaMercadoPago,
} from "../services/ventasApi";

function estadoBadge(estado) {
  if (estado === "PAGADA") return <Badge variant="success">Pagada</Badge>;
  if (estado === "PENDIENTE") return <Badge variant="warning">Pendiente</Badge>;
  if (estado === "REEMBOLSADA") return <Badge variant="neutral">Reembolsada</Badge>;
  return <Badge variant="danger">Cancelada</Badge>;
}

function money(n) {
  return `$${Number(n || 0).toLocaleString()}`;
}

function normalizarTexto(valor) {
  return String(valor || "").trim().toLowerCase();
}

function SaleViewModal({ open, onClose, sale }) {
  if (!sale) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Venta ${sale.folio}`}
      subtitle="Detalle real"
      footer={
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-zinc-500">Total:</span>{" "}
            <span className="font-semibold">{money(sale.total)}</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-2 text-sm">
        <div className="rounded-xl border p-3">
          <div className="text-xs text-zinc-500">Cliente</div>
          <div className="font-medium">{sale.cliente || "-"}</div>
        </div>

        <div className="rounded-xl border p-3">
          <div className="text-xs text-zinc-500">Fecha</div>
          <div className="font-medium">{sale.fecha_venta || "-"}</div>
        </div>

        <div className="rounded-xl border p-3">
          <div className="text-xs text-zinc-500">Método de pago</div>
          <div className="font-medium">{sale.metodo_pago || "-"}</div>
        </div>

        <div className="rounded-xl border p-3">
          <div className="text-xs text-zinc-500">Estado</div>
          <div className="mt-1">{estadoBadge(sale.estado)}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm">
        <div className="rounded-xl border p-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Mail size={14} />
            Correo
          </div>
          <div className="mt-1 font-medium break-all">
            {sale.cliente_email || sale.cliente_usuario_resumen?.email || "-"}
          </div>
        </div>

        <div className="rounded-xl border p-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Phone size={14} />
            Teléfono
          </div>
          <div className="mt-1 font-medium">
            {sale.cliente_telefono || sale.cliente_usuario_resumen?.telefono || "-"}
          </div>
        </div>

        <div className="rounded-xl border p-3 md:col-span-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <MapPin size={14} />
            Dirección
          </div>

          <div className="mt-1 font-medium">
            {sale.direccion_linea1 || sale.cliente_direccion_resumen?.direccion_linea1 || "-"}
          </div>

          {sale.direccion_linea2 ? (
            <div className="text-zinc-600">{sale.direccion_linea2}</div>
          ) : null}

          <div className="text-zinc-600">
            {[sale.ciudad, sale.estado_direccion, sale.codigo_postal].filter(Boolean).join(", ") || "-"}
          </div>

          {sale.referencias_envio ? (
            <div className="text-xs text-zinc-500 mt-2">
              Referencias: {sale.referencias_envio}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold">Productos</div>

        <div className="mt-2 space-y-2">
          {(sale.detalles || []).map((it, idx) => {
            const qty = Number(it.cantidad || 0);
            const price = Number(it.precio_unitario || 0);

            return (
              <div
                key={idx}
                className="rounded-xl border p-3 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {it.producto?.titulo || "-"}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {qty} × {money(price)}
                    {it.color ? ` · ${it.color}` : ""}
                    {it.talla ? ` · Talla ${it.talla}` : ""}
                  </div>
                </div>

                <div className="font-semibold">{money(it.subtotal)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

export default function Ventas() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("TODOS");
  const [openFilters, setOpenFilters] = useState(false);

  const [openNew, setOpenNew] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    try {
      setLoading(true);
      setError("");

      const [productosData, ventasData] = await Promise.all([
        obtenerProductos(),
        obtenerVentas(),
      ]);

      setProducts(productosData || []);
      setSales(ventasData || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudieron cargar las ventas.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return (sales || []).filter((v) => {
      const okQuery =
        !query ||
        String(v.folio || "").toLowerCase().includes(query) ||
        String(v.cliente || "").toLowerCase().includes(query) ||
        String(v.cliente_email || "").toLowerCase().includes(query) ||
        String(v.cliente_telefono || "").toLowerCase().includes(query);

      const okEstado = estado === "TODOS" ? true : v.estado === estado;
      return okQuery && okEstado;
    });
  }, [sales, q, estado]);

  const getStockForEdit = (sale, productId, color, talla) => {
    const p = (products || []).find((x) => String(x.id) === String(productId));
    const variantes = Array.isArray(p?.variantes) ? p.variantes : [];

    const variante = variantes.find(
      (v) =>
        normalizarTexto(v.color) === normalizarTexto(color) &&
        normalizarTexto(v.talla) === normalizarTexto(talla),
    );

    const base = Number(variante?.stock || 0);

    if (!sale) return base;

    const extra = (sale.detalles || []).reduce((acc, it) => {
      const sameProduct =
        String(it.producto?.id || it.producto_id) === String(productId);
      const sameColor =
        normalizarTexto(it.color) === normalizarTexto(color);
      const sameTalla =
        normalizarTexto(it.talla) === normalizarTexto(talla);

      if (!sameProduct || !sameColor || !sameTalla) {
        return acc;
      }

      return acc + Number(it.cantidad || 0);
    }, 0);

    return base + extra;
  };

  async function refrescarProductos() {
    const productosActualizados = await obtenerProductos();
    setProducts(productosActualizados || []);
  }

  async function handleCreate(payload) {
    try {
      const creada = await crearVenta(payload);
      setSales((prev) => [creada, ...prev]);
      setOpenNew(false);

      if (creada.metodo_pago === "MERCADO_PAGO" && creada.estado !== "PAGADA") {
        const pref = await crearPreferenciaMercadoPago(creada.id);
        const initPoint = pref.init_point || pref.sandbox_init_point;

        if (initPoint) {
          window.open(initPoint, "_blank", "noopener,noreferrer");
        }
      }

      await refrescarProductos();
    } catch (err) {
      console.error(err);
      alert(err.message || "No se pudo crear la venta.");
    }
  }

  async function handleUpdate(saleId, payload) {
    try {
      const actualizada = await actualizarVenta(saleId, payload);

      setSales((prev) =>
        prev.map((item) => (item.id === actualizada.id ? actualizada : item))
      );

      await refrescarProductos();
      setSelected(actualizada);
      setOpenEdit(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "No se pudo actualizar la venta.");
    }
  }

  async function handleDelete(saleId) {
    const ok = window.confirm("¿Eliminar esta venta?");
    if (!ok) return;

    try {
      await eliminarVenta(saleId);
      setSales((prev) => prev.filter((item) => item.id !== saleId));
      await refrescarProductos();
    } catch (err) {
      console.error(err);
      alert(err.message || "No se pudo eliminar la venta.");
    }
  }

  async function handleCobrar(ventaId) {
    try {
      const pref = await crearPreferenciaMercadoPago(ventaId);
      const initPoint = pref.init_point || pref.sandbox_init_point;

      if (initPoint) {
        window.open(initPoint, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      alert(err.message || "No se pudo abrir el checkout.");
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ventas</h1>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={18}
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-72 rounded-xl border bg-white pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="Buscar por folio, cliente, correo o teléfono"
            />
          </div>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="rounded-xl border bg-white px-3 py-2 text-sm"
          >
            <option value="TODOS">Todos</option>
            <option value="PAGADA">Pagada</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="REEMBOLSADA">Reembolsada</option>
          </select>

          <button
            onClick={() => setOpenNew(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:opacity-95"
          >
            <Plus size={16} /> Nueva venta
          </button>
        </div>

        <div className="sm:hidden flex flex-col gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={18}
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border bg-white pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="Buscar venta"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setOpenFilters(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
            >
              <Filter size={16} /> Filtros
            </button>

            <button
              onClick={() => setOpenNew(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:opacity-95"
            >
              <Plus size={16} /> Nueva
            </button>
          </div>
        </div>
      </div>

      <Card title="Órdenes">
        {loading ? (
          <div className="rounded-2xl border bg-white p-6 text-sm text-zinc-600">
            Cargando ventas...
          </div>
        ) : error ? (
          <div className="rounded-2xl border bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-auto rounded-2xl border">
              <table className="min-w-full text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    {["Folio", "Fecha", "Cliente", "Contacto", "Total", "Estado", "Acciones"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 font-semibold text-zinc-700"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody className="bg-white">
                  {filtered.map((v) => (
                    <tr key={v.id} className="border-t hover:bg-zinc-50">
                      <td className="px-4 py-3 font-medium">{v.folio}</td>
                      <td className="px-4 py-3">{v.fecha_venta}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{v.cliente}</div>
                        {(v.ciudad || v.estado_direccion) ? (
                          <div className="text-xs text-zinc-500">
                            {[v.ciudad, v.estado_direccion].filter(Boolean).join(", ")}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <div>{v.cliente_email || "-"}</div>
                        <div className="text-xs text-zinc-500">{v.cliente_telefono || "-"}</div>
                      </td>
                      <td className="px-4 py-3 font-medium">{money(v.total)}</td>
                      <td className="px-4 py-3">{estadoBadge(v.estado)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              setSelected(v);
                              setOpenView(true);
                            }}
                            className="rounded-lg border px-3 py-1 text-xs hover:bg-zinc-50"
                          >
                            Ver
                          </button>

                          <button
                            onClick={() => {
                              setSelected(v);
                              setOpenEdit(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-xs hover:bg-zinc-50"
                          >
                            <Pencil size={14} />
                            Editar
                          </button>

                          {v.metodo_pago === "MERCADO_PAGO" &&
                            v.estado === "PENDIENTE" && (
                              <button
                                onClick={() => handleCobrar(v.id)}
                                className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-xs hover:bg-zinc-50"
                              >
                                <CreditCard size={14} />
                                Cobrar
                              </button>
                            )}

                          <button
                            onClick={() => handleDelete(v.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700 hover:opacity-90"
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-sm text-zinc-500" colSpan={7}>
                        No hay ventas con ese filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {filtered.map((v) => (
                <div key={v.id} className="rounded-2xl border bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold">{v.folio}</div>
                      <div className="text-xs text-zinc-500 truncate">
                        {v.fecha_venta} · {v.cliente}
                      </div>
                      {v.cliente_email ? (
                        <div className="text-xs text-zinc-500 truncate">{v.cliente_email}</div>
                      ) : null}
                    </div>

                    {estadoBadge(v.estado)}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-zinc-500">Total</div>
                      <div className="text-lg font-semibold">{money(v.total)}</div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelected(v);
                          setOpenView(true);
                        }}
                        className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
                      >
                        Ver
                      </button>

                      <button
                        onClick={() => {
                          setSelected(v);
                          setOpenEdit(true);
                        }}
                        className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
                      >
                        Editar
                      </button>
                    </div>
                  </div>

                  {v.metodo_pago === "MERCADO_PAGO" && v.estado === "PENDIENTE" && (
                    <button
                      onClick={() => handleCobrar(v.id)}
                      className="mt-3 w-full rounded-xl border py-2 text-sm hover:bg-zinc-50"
                    >
                      Cobrar con Mercado Pago
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(v.id)}
                    className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 py-2 text-sm text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="rounded-2xl border bg-zinc-50 p-4 text-sm text-zinc-600">
                  No hay ventas con ese filtro.
                </div>
              )}
            </div>
          </>
        )}
      </Card>

      <Sheet
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        title="Filtros"
        subtitle="Ajusta estado y aplica"
        footer={
          <button
            onClick={() => setOpenFilters(false)}
            className="w-full rounded-xl bg-zinc-900 text-white py-2 text-sm hover:opacity-95"
          >
            Aplicar
          </button>
        }
      >
        <label className="block">
          <span className="text-xs font-medium text-zinc-700">Estado</span>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm"
          >
            <option value="TODOS">Todos</option>
            <option value="PAGADA">Pagada</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="REEMBOLSADA">Reembolsada</option>
          </select>
        </label>
      </Sheet>

      <NewSaleModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        productos={products}
        mode="create"
        onCreate={handleCreate}
      />

      <SaleViewModal
        open={openView}
        onClose={() => setOpenView(false)}
        sale={selected}
      />

      <NewSaleModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        productos={products}
        mode="edit"
        initialSale={selected}
        onUpdate={handleUpdate}
        getStockFor={(pid, color, talla) =>
          getStockForEdit(selected, pid, color, talla)
        }
      />
    </div>
  );
}