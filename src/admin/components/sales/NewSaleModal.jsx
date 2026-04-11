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

function normalizarTexto(valor) {
  return String(valor || "").trim().toLowerCase();
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

  function getVariantesProducto(productId) {
    const producto = productMap.get(String(productId));
    return Array.isArray(producto?.variantes) ? producto.variantes : [];
  }

  function getFirstProductId() {
    return productos?.[0]?.id ? String(productos[0].id) : "";
  }

  function getFirstVariant(productId) {
    const variantes = getVariantesProducto(productId);
    const primera = variantes[0];

    return {
      color: primera?.color || "",
      talla: primera?.talla || "",
    };
  }

  function getDefaultItem() {
    const productId = getFirstProductId();
    const firstVariant = getFirstVariant(productId);

    return {
      productId,
      color: firstVariant.color,
      talla: firstVariant.talla,
      qty: 1,
    };
  }

  function getColoresProducto(productId) {
    const variantes = getVariantesProducto(productId);
    return [...new Set(variantes.map((v) => v.color).filter(Boolean))];
  }

  function getTallasProducto(productId, color) {
    const variantes = getVariantesProducto(productId);
    const colorNormalizado = normalizarTexto(color);

    return [
      ...new Set(
        variantes
          .filter((v) => normalizarTexto(v.color) === colorNormalizado)
          .map((v) => v.talla)
          .filter(Boolean),
      ),
    ];
  }

  function getStockVariante(productId, color, talla) {
    if (!productId || !color || !talla) return 0;

    if (typeof getStockFor === "function") {
      return Number(getStockFor(productId, color, talla) || 0);
    }

    const variantes = getVariantesProducto(productId);
    const encontrada = variantes.find(
      (v) =>
        normalizarTexto(v.color) === normalizarTexto(color) &&
        normalizarTexto(v.talla) === normalizarTexto(talla),
    );

    return Number(encontrada?.stock || 0);
  }

  const [cliente, setCliente] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");

  const [direccionLinea1, setDireccionLinea1] = useState("");
  const [direccionLinea2, setDireccionLinea2] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estadoDireccion, setEstadoDireccion] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [referenciasEnvio, setReferenciasEnvio] = useState("");

  const [fecha, setFecha] = useState(isoToday());
  const [metodoPago, setMetodoPago] = useState("MERCADO_PAGO");
  const [estado, setEstado] = useState("PENDIENTE");
  const [items, setItems] = useState([getDefaultItem()]);

  const mustValidateStock = estado === "PAGADA";

  useEffect(() => {
    if (!open) return;

    if (isEdit && initialSale) {
      setCliente(initialSale.cliente || "");
      setClienteEmail(initialSale.cliente_email || "");
      setClienteTelefono(initialSale.cliente_telefono || "");

      setDireccionLinea1(initialSale.direccion_linea1 || "");
      setDireccionLinea2(initialSale.direccion_linea2 || "");
      setCiudad(initialSale.ciudad || "");
      setEstadoDireccion(initialSale.estado_direccion || "");
      setCodigoPostal(initialSale.codigo_postal || "");
      setReferenciasEnvio(initialSale.referencias_envio || "");

      setFecha(initialSale.fecha_venta || isoToday());
      setMetodoPago(initialSale.metodo_pago || "MERCADO_PAGO");
      setEstado(initialSale.estado || "PENDIENTE");

      const safeItems =
        Array.isArray(initialSale.detalles) && initialSale.detalles.length > 0
          ? initialSale.detalles.map((it) => ({
            productId: String(it.producto?.id || it.producto_id || ""),
            color: it.color || "",
            talla: it.talla || "",
            qty: Number(it.cantidad || 1),
          }))
          : [getDefaultItem()];

      setItems(safeItems);
    } else {
      setCliente("");
      setClienteEmail("");
      setClienteTelefono("");
      setDireccionLinea1("");
      setDireccionLinea2("");
      setCiudad("");
      setEstadoDireccion("");
      setCodigoPostal("");
      setReferenciasEnvio("");
      setFecha(isoToday());
      setMetodoPago("MERCADO_PAGO");
      setEstado("PENDIENTE");
      setItems([getDefaultItem()]);
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
    setItems((prev) => [...prev, getDefaultItem()]);
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, patch) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    );
  };

  const handleProductChange = (idx, productId) => {
    const firstVariant = getFirstVariant(productId);

    updateItem(idx, {
      productId,
      color: firstVariant.color,
      talla: firstVariant.talla,
      qty: 1,
    });
  };

  const handleColorChange = (idx, productId, color) => {
    const tallas = getTallasProducto(productId, color);
    const talla = tallas[0] || "";

    updateItem(idx, {
      color,
      talla,
    });
  };

  const stockIssues = useMemo(() => {
    if (!mustValidateStock) return [];

    const issues = [];
    const counts = new Map();

    for (const it of items) {
      const pid = String(it.productId || "");
      const color = String(it.color || "");
      const talla = String(it.talla || "");
      const qty = Number(it.qty || 0);

      if (!pid || qty <= 0) continue;

      if (!color || !talla) {
        const p = productMap.get(pid);
        issues.push(`Debes seleccionar color y talla para "${p?.titulo || pid}".`);
        continue;
      }

      const key = `${pid}__${normalizarTexto(color)}__${normalizarTexto(talla)}`;
      counts.set(key, {
        productId: pid,
        color,
        talla,
        qty: (counts.get(key)?.qty || 0) + qty,
      });
    }

    for (const item of counts.values()) {
      const p = productMap.get(String(item.productId));
      const disponible = getStockVariante(
        item.productId,
        item.color,
        item.talla,
      );

      if (disponible <= 0) {
        issues.push(
          `"${p?.titulo || item.productId}" / ${item.color} / ${item.talla} está sin stock.`,
        );
        continue;
      }

      if (item.qty > disponible) {
        issues.push(
          `Stock insuficiente para "${p?.titulo || item.productId}" / ${item.color} / ${item.talla}. Solo quedan ${disponible}.`,
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
    items.every(
      (it) =>
        it.productId &&
        String(it.color || "").trim() &&
        String(it.talla || "").trim() &&
        Number(it.qty) > 0,
    );

  const handleSave = () => {
    if (!canSave) return;

    const payload = {
      cliente: cliente.trim(),
      cliente_email: clienteEmail.trim(),
      cliente_telefono: clienteTelefono.trim(),
      direccion_linea1: direccionLinea1.trim(),
      direccion_linea2: direccionLinea2.trim(),
      ciudad: ciudad.trim(),
      estado_direccion: estadoDireccion.trim(),
      codigo_postal: codigoPostal.trim(),
      referencias_envio: referenciasEnvio.trim(),
      fecha_venta: fecha,
      estado,
      metodo_pago: metodoPago,
      detalles: items.map((it) => ({
        producto_id: Number(it.productId),
        color: String(it.color || "").trim(),
        talla: String(it.talla || "").trim(),
        cantidad: Number(it.qty) || 0,
      })),
    };

    if (isEdit && initialSale?.id) {
      onUpdate?.(initialSale.id, payload);
      return;
    }

    onCreate?.(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Editar venta ${initialSale?.folio || ""}` : "Nueva venta"}
      subtitle="Venta conectada al backend"
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
          <span className="text-xs font-medium text-zinc-700">Correo</span>
          <input
            value={clienteEmail}
            onChange={(e) => setClienteEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="cliente@correo.com"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-700">Teléfono</span>
          <input
            value={clienteTelefono}
            onChange={(e) => setClienteTelefono(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="271..."
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

        <label className="block md:col-span-2">
          <span className="text-xs font-medium text-zinc-700">Dirección</span>
          <input
            value={direccionLinea1}
            onChange={(e) => setDireccionLinea1(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="Calle y número"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-xs font-medium text-zinc-700">Complemento dirección</span>
          <input
            value={direccionLinea2}
            onChange={(e) => setDireccionLinea2(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="Interior, colonia, complemento"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-700">Ciudad</span>
          <input
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-700">Estado dirección</span>
          <input
            value={estadoDireccion}
            onChange={(e) => setEstadoDireccion(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-700">Código postal</span>
          <input
            value={codigoPostal}
            onChange={(e) => setCodigoPostal(e.target.value)}
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

        <label className="block md:col-span-2">
          <span className="text-xs font-medium text-zinc-700">Referencias envío</span>
          <textarea
            value={referenciasEnvio}
            onChange={(e) => setReferenciasEnvio(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
          />
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
            <option value="REEMBOLSADA">Reembolsada</option>
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
                ? "Valida stock disponible por variante"
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

            const colores = getColoresProducto(it.productId);
            const tallas = getTallasProducto(it.productId, it.color);
            const stockVariante = getStockVariante(
              it.productId,
              it.color,
              it.talla,
            );

            return (
              <div key={idx} className="rounded-2xl border p-3">
                <div className="grid gap-3 md:grid-cols-12 items-end">
                  <label className="block md:col-span-4">
                    <span className="text-xs font-medium text-zinc-700">Producto</span>
                    <select
                      value={it.productId}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                    >
                      {(productos || []).map((producto) => (
                        <option key={producto.id} value={String(producto.id)}>
                          {producto.titulo} · {money(producto.precio)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block md:col-span-2">
                    <span className="text-xs font-medium text-zinc-700">Color</span>
                    <select
                      value={it.color}
                      onChange={(e) =>
                        handleColorChange(idx, it.productId, e.target.value)
                      }
                      className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                    >
                      {colores.length > 0 ? (
                        colores.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))
                      ) : (
                        <option value="">Sin variantes</option>
                      )}
                    </select>
                  </label>

                  <label className="block md:col-span-2">
                    <span className="text-xs font-medium text-zinc-700">Talla</span>
                    <select
                      value={it.talla}
                      onChange={(e) => updateItem(idx, { talla: e.target.value })}
                      className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                    >
                      {tallas.length > 0 ? (
                        tallas.map((talla) => (
                          <option key={talla} value={talla}>
                            {talla}
                          </option>
                        ))
                      ) : (
                        <option value="">Sin tallas</option>
                      )}
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
                      Stock variante:{" "}
                      <span className="font-medium">{stockVariante}</span>
                    </div>
                  </label>

                  <div className="md:col-span-1">
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

                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
                  <Badge variant="success">Precio</Badge>
                  <span>{money(price)}</span>
                  {it.color ? <span>· {it.color}</span> : null}
                  {it.talla ? <span>· Talla {it.talla}</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}