import { useMemo, useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import { Plus, Trash2 } from "lucide-react";

function isoToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function money(n) {
  return `$${Number(n || 0).toLocaleString()}`;
}

function StockAlert({ msg }) {
  if (!msg) return null;

  return (
    <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
      {msg}
    </div>
  );
}

export default function NewSaleModal({
  open,
  onClose,
  productos = [],
  mode = "create",
  initialSale = null,
  onCreate,
  onUpdate,
  getStockFor,
}) {
  const isEdit = mode === "edit";

  const productMap = useMemo(() => {
    const mapa = new Map();
    (productos || []).forEach((p) => mapa.set(String(p.id), p));
    return mapa;
  }, [productos]);

  const getFirstProductId = () => {
    return productos?.[0]?.id ? String(productos[0].id) : "";
  };

  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState(isoToday());
  const [metodoPago, setMetodoPago] = useState("MERCADO_PAGO");
  const [estado, setEstado] = useState("PENDIENTE");
  const [items, setItems] = useState([{ productId: getFirstProductId(), qty: 1 }]);

  const mustValidateStock = estado === "PAGADA";

  useEffect(() => {
    if (!open) return;

    if (isEdit && initialSale) {
      setCliente(initialSale.cliente || "");
      setFecha(initialSale.fecha_venta || isoToday());
      setMetodoPago(initialSale.metodo_pago || "MERCADO_PAGO");
      setEstado(initialSale.estado || "PENDIENTE");

      const safeItems =
        Array.isArray(initialSale.detalles) && initialSale.detalles.length > 0
          ? initialSale.detalles.map((it) => ({
            productId: String(it.producto?.id || it.producto_id || ""),
            qty: Number(it.cantidad || 1),
          }))
          : [{ productId: getFirstProductId(), qty: 1 }];

      setItems(safeItems);
    } else {
      setCliente("");
      setFecha(isoToday());
      setMetodoPago("MERCADO_PAGO");
      setEstado("PENDIENTE");
      setItems([{ productId: getFirstProductId(), qty: 1 }]);
    }
  }, [open, isEdit, initialSale, productos]);

  const total = useMemo(() => {
    return items.reduce((acc, it) => {
      const p = productMap.get(String(it.productId));
      const price = Number(p?.precio || 0);
      return acc + price * (Number(it.qty) || 0);
    }, 0);
  }, [items, productMap]);

  const addItem = () => {
    setItems((prev) => [...prev, { productId: getFirstProductId(), qty: 1 }]);
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, patch) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    );
  };

  const stockIssues = useMemo(() => {
    if (!mustValidateStock) return [];

    const issues = [];
    const counts = new Map();

    for (const it of items) {
      const pid = String(it.productId);
      const qty = Number(it.qty || 0);

      if (!pid || qty <= 0) continue;

      counts.set(pid, (counts.get(pid) || 0) + qty);
    }

    for (const [pid, need] of counts.entries()) {
      const p = productMap.get(pid);

      const baseStock =
        typeof getStockFor === "function"
          ? Number(getStockFor(pid) || 0)
          : Number(p?.stock_disponible || 0);

      if (baseStock === 0) {
        issues.push(`"${p?.titulo || pid}" está sin stock.`);
        continue;
      }

      if (need > baseStock) {
        issues.push(
          `Stock insuficiente para "${p?.titulo || pid}". Solo quedan ${baseStock}.`
        );
      }
    }

    return issues;
  }, [items, productMap, getStockFor, mustValidateStock]);

  const canSave =
    cliente.trim().length >= 2 &&
    items.length > 0 &&
    total > 0 &&
    stockIssues.length === 0 &&
    items.every((it) => it.productId && Number(it.qty) > 0);

  const handleSave = () => {
    if (!canSave) return;

    const payload = {
      cliente: cliente.trim(),
      fecha_venta: fecha,
      estado,
      metodo_pago: metodoPago,
      detalles: items.map((it) => ({
        producto_id: Number(it.productId),
        cantidad: Number(it.qty) || 0,
      })),
    };

    if (isEdit && initialSale?.id) {
      onUpdate?.(initialSale.id, payload);
      onClose?.();
      return;
    }

    onCreate?.(payload);
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Editar venta ${initialSale?.folio || ""}` : "Nueva venta"}
      subtitle="Venta real conectada al backend"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            <span className="text-zinc-500">Total:</span>{" "}
            <span className="font-semibold">{money(total)}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-white active:scale-[0.98] transition"
            >
              Cancelar
            </button>

            <button
              onClick={handleSave}
              disabled={!canSave}
              className={[
                "rounded-xl px-4 py-2 text-sm transition",
                canSave
                  ? "bg-zinc-900 text-white hover:opacity-95 active:scale-[0.98]"
                  : "bg-zinc-300 text-zinc-600 cursor-not-allowed",
              ].join(" ")}
            >
              {isEdit ? "Guardar cambios" : "Guardar venta"}
            </button>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-zinc-700">Cliente</span>
          <input
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="Ej: Ana García"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-700">Fecha</span>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-700">Método de pago</span>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="MERCADO_PAGO">Mercado Pago</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="TARJETA">Tarjeta</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-700">Estado</span>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="PENDIENTE">Pendiente</option>
            <option value="PAGADA">Pagada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>

          {!mustValidateStock && (
            <div className="mt-2 text-[11px] text-zinc-500">
              Este estado no descuenta inventario.
            </div>
          )}
        </label>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Productos</div>
            <div className="text-xs text-zinc-500">
              {mustValidateStock
                ? "Valida stock disponible"
                : "No descuenta stock todavía"}
            </div>
          </div>

          <button
            onClick={addItem}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-zinc-50 active:scale-[0.98] transition"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>

        {stockIssues.length > 0 && (
          <div className="mt-3">
            {stockIssues.map((m, i) => (
              <StockAlert key={i} msg={m} />
            ))}
          </div>
        )}

        <div className="mt-3 space-y-3">
          {items.map((it, idx) => {
            const p = productMap.get(String(it.productId));
            const price = Number(p?.precio || 0);
            const subtotal = price * (Number(it.qty) || 0);

            const stockBase =
              typeof getStockFor === "function"
                ? Number(getStockFor(String(it.productId)) || 0)
                : Number(p?.stock_disponible || 0);

            return (
              <div key={idx} className="rounded-2xl border p-3">
                <div className="grid gap-3 md:grid-cols-12 items-end">
                  <label className="block md:col-span-7">
                    <span className="text-xs font-medium text-zinc-700">Producto</span>
                    <select
                      value={it.productId}
                      onChange={(e) =>
                        updateItem(idx, { productId: e.target.value })
                      }
                      className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                    >
                      {(productos || []).map((producto) => (
                        <option key={producto.id} value={String(producto.id)}>
                          {producto.titulo} · {money(producto.precio)} · stock:{" "}
                          {producto.stock_disponible ?? 0}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block md:col-span-2">
                    <span className="text-xs font-medium text-zinc-700">Cantidad</span>
                    <input
                      type="number"
                      min={1}
                      value={it.qty}
                      onChange={(e) =>
                        updateItem(idx, { qty: Number(e.target.value) })
                      }
                      className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                    <div className="mt-2 text-[11px] text-zinc-500">
                      Stock disponible:{" "}
                      <span className="font-medium">{stockBase}</span>
                    </div>
                  </label>

                  <div className="md:col-span-2">
                    <div className="text-xs text-zinc-500">Subtotal</div>
                    <div className="mt-2 font-semibold">{money(subtotal)}</div>
                  </div>

                  <div className="md:col-span-1 flex justify-end">
                    <button
                      onClick={() => removeItem(idx)}
                      type="button"
                      className="rounded-xl border p-2 hover:bg-zinc-50 active:scale-[0.98] transition"
                      title="Eliminar"
                      disabled={items.length === 1}
                    >
                      <Trash2 size={16} className="text-zinc-700" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                  <Badge variant="success">Precio</Badge>
                  <span>{money(price)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}