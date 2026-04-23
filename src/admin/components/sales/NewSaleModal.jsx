import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

function money(n) {
  return `$${Number(n || 0).toLocaleString("es-MX")}`;
}

function normalizarTexto(valor) {
  return String(valor || "").trim().toLowerCase();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizarProducto(producto) {
  const variantesRaw = Array.isArray(producto?.variantes)
    ? producto.variantes
    : Array.isArray(producto?.variants)
      ? producto.variants
      : [];

  return {
    id: Number(producto?.id || 0),
    titulo: producto?.titulo || producto?.title || "Producto",
    sku: producto?.sku || "",
    precio: Number(producto?.precio ?? producto?.price ?? 0),
    imagen:
      producto?.imagen_principal ||
      producto?.heroUrl ||
      producto?.image ||
      "",
    variantes: variantesRaw.map((item) => ({
      id: item?.id,
      color: item?.color || "",
      talla: item?.talla || "",
      stock: Number(item?.stock || 0),
    })),
  };
}

function crearDetalleVacio(productos) {
  const producto = productos[0] || null;
  const primeraVariante = producto?.variantes?.[0] || null;

  return {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    producto_id: producto?.id || "",
    color: primeraVariante?.color || "",
    talla: primeraVariante?.talla || "",
    cantidad: 1,
  };
}

function buildInitialState(productos, sale) {
  if (!sale) {
    return {
      cliente: "",
      cliente_email: "",
      cliente_telefono: "",
      direccion_linea1: "",
      direccion_linea2: "",
      ciudad: "",
      estado_direccion: "",
      codigo_postal: "",
      referencias_envio: "",
      tipo_envio: "ESTANDAR",
      costo_envio: 0,
      fecha_venta: new Date().toISOString().slice(0, 10),
      estado: "PENDIENTE",
      estado_envio: "PENDIENTE",
      metodo_pago: "MERCADO_PAGO",
      detalles: [crearDetalleVacio(productos)],
    };
  }

  const detalles = Array.isArray(sale?.detalles) ? sale.detalles : [];

  return {
    cliente: sale?.cliente || "",
    cliente_email: sale?.cliente_email || "",
    cliente_telefono: sale?.cliente_telefono || "",
    direccion_linea1: sale?.direccion_linea1 || "",
    direccion_linea2: sale?.direccion_linea2 || "",
    ciudad: sale?.ciudad || "",
    estado_direccion: sale?.estado_direccion || "",
    codigo_postal: sale?.codigo_postal || "",
    referencias_envio: sale?.referencias_envio || "",
    tipo_envio: sale?.tipo_envio || "ESTANDAR",
    costo_envio: Number(sale?.costo_envio || 0),
    fecha_venta: sale?.fecha_venta || new Date().toISOString().slice(0, 10),
    estado: sale?.estado || "PENDIENTE",
    estado_envio: sale?.estado_envio || "PENDIENTE",
    metodo_pago: sale?.metodo_pago || "MERCADO_PAGO",
    detalles:
      detalles.length > 0
        ? detalles.map((item, index) => ({
          id: `${Date.now()}_${index}_${Math.random().toString(16).slice(2)}`,
          producto_id: Number(item?.producto?.id || item?.producto_id || ""),
          color: item?.color || "",
          talla: item?.talla || "",
          cantidad: Number(item?.cantidad || 1),
        }))
        : [crearDetalleVacio(productos)],
  };
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
  const productosNormalizados = useMemo(() => {
    return (Array.isArray(productos) ? productos : [])
      .map(normalizarProducto)
      .filter((item) => item.id);
  }, [productos]);

  const [form, setForm] = useState(() => buildInitialState(productosNormalizados, null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialState(productosNormalizados, initialSale));
    setSaving(false);
    setError("");
  }, [open, initialSale, productosNormalizados]);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function getProducto(productoId) {
    return productosNormalizados.find((item) => String(item.id) === String(productoId)) || null;
  }

  function getColoresDisponibles(productoId) {
    const producto = getProducto(productoId);
    if (!producto) return [];
    return unique(producto.variantes.map((item) => item.color));
  }

  function getTallasDisponibles(productoId, color) {
    const producto = getProducto(productoId);
    if (!producto) return [];

    return unique(
      producto.variantes
        .filter((item) => normalizarTexto(item.color) === normalizarTexto(color))
        .map((item) => item.talla)
    );
  }

  function getStockVariante(productoId, color, talla) {
    if (!productoId || !color || !talla) return 0;

    if (typeof getStockFor === "function") {
      return Number(getStockFor(productoId, color, talla) || 0);
    }

    const producto = getProducto(productoId);
    const variante = producto?.variantes?.find(
      (item) =>
        normalizarTexto(item.color) === normalizarTexto(color) &&
        normalizarTexto(item.talla) === normalizarTexto(talla)
    );

    return Number(variante?.stock || 0);
  }

  function replaceDetalle(detalleId, patch) {
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.map((item) =>
        item.id === detalleId ? { ...item, ...patch } : item
      ),
    }));
  }

  function handleProductoChange(detalleId, productoId) {
    const colores = getColoresDisponibles(productoId);
    const primerColor = colores[0] || "";
    const tallas = getTallasDisponibles(productoId, primerColor);
    const primeraTalla = tallas[0] || "";

    replaceDetalle(detalleId, {
      producto_id: productoId,
      color: primerColor,
      talla: primeraTalla,
      cantidad: 1,
    });
  }

  function handleColorChange(detalleId, productoId, color) {
    const tallas = getTallasDisponibles(productoId, color);
    replaceDetalle(detalleId, {
      color,
      talla: tallas[0] || "",
      cantidad: 1,
    });
  }

  function handleTallaChange(detalleId, talla) {
    replaceDetalle(detalleId, { talla, cantidad: 1 });
  }

  function handleCantidadChange(detalleId, cantidad) {
    replaceDetalle(detalleId, {
      cantidad: Math.max(1, Math.floor(Number(cantidad || 1))),
    });
  }

  function addDetalle() {
    setForm((prev) => ({
      ...prev,
      detalles: [...prev.detalles, crearDetalleVacio(productosNormalizados)],
    }));
  }

  function removeDetalle(detalleId) {
    setForm((prev) => {
      const next = prev.detalles.filter((item) => item.id !== detalleId);
      return {
        ...prev,
        detalles: next.length ? next : [crearDetalleVacio(productosNormalizados)],
      };
    });
  }

  const subtotal = useMemo(() => {
    return form.detalles.reduce((acc, item) => {
      const producto = getProducto(item.producto_id);
      return acc + Number(producto?.precio || 0) * Number(item.cantidad || 0);
    }, 0);
  }, [form.detalles, productosNormalizados]);

  const total = useMemo(() => {
    return subtotal + Number(form.costo_envio || 0);
  }, [subtotal, form.costo_envio]);

  async function handleSubmit() {
    if (saving) return;

    const detallesLimpios = form.detalles.map((item) => ({
      producto_id: Number(item.producto_id || 0),
      color: String(item.color || "").trim(),
      talla: String(item.talla || "").trim(),
      cantidad: Number(item.cantidad || 0),
    }));

    if (!String(form.cliente || "").trim()) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }

    if (!String(form.fecha_venta || "").trim()) {
      setError("La fecha de venta es obligatoria.");
      return;
    }

    if (!detallesLimpios.length) {
      setError("Debes agregar al menos un producto.");
      return;
    }

    for (const item of detallesLimpios) {
      if (!item.producto_id) {
        setError("Debes seleccionar un producto en todos los renglones.");
        return;
      }

      if (!item.color || !item.talla) {
        setError("Debes seleccionar color y talla en todos los productos.");
        return;
      }

      if (item.cantidad <= 0) {
        setError("Todas las cantidades deben ser mayores a cero.");
        return;
      }
    }

    const payload = {
      cliente: String(form.cliente || "").trim(),
      cliente_email: String(form.cliente_email || "").trim(),
      cliente_telefono: String(form.cliente_telefono || "").trim(),
      direccion_linea1: String(form.direccion_linea1 || "").trim(),
      direccion_linea2: String(form.direccion_linea2 || "").trim(),
      ciudad: String(form.ciudad || "").trim(),
      estado_direccion: String(form.estado_direccion || "").trim(),
      codigo_postal: String(form.codigo_postal || "").trim(),
      referencias_envio: String(form.referencias_envio || "").trim(),
      tipo_envio: form.tipo_envio,
      costo_envio: Number(form.costo_envio || 0),
      fecha_venta: form.fecha_venta,
      estado: form.estado,
      estado_envio: form.estado_envio,
      metodo_pago: form.metodo_pago,
      detalles: detallesLimpios,
    };

    try {
      setSaving(true);
      setError("");

      if (mode === "edit" && initialSale?.id) {
        await onUpdate?.(initialSale.id, payload);
      } else {
        await onCreate?.(payload);
      }
    } catch (err) {
      setError(err?.message || "No se pudo guardar la venta.");
      setSaving(false);
      return;
    }

    setSaving(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 animate-fadeIn"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6">
        <div className="flex h-[100dvh] w-full flex-col overflow-hidden border bg-white shadow-2xl animate-fadeUp sm:h-auto sm:max-h-[92vh] sm:max-w-6xl sm:rounded-3xl">
          <div className="flex items-start justify-between gap-3 border-b px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold sm:text-xl">
                {mode === "edit" ? "Editar venta" : "Nueva venta"}
              </h2>
              <p className="text-xs text-zinc-500 sm:text-sm">
                Selecciona producto y la variante disponible por color y talla
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-3 py-2 hover:bg-zinc-50"
            >
              <X size={18} />
            </button>
          </div>

          {error ? (
            <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
              {error}
            </div>
          ) : null}

          <div className="flex-1 overflow-auto px-4 py-5 sm:px-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
              <div className="space-y-4">
                <section className="rounded-2xl border p-4">
                  <h3 className="text-sm font-semibold">Cliente y envío</h3>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">Cliente</span>
                      <input
                        value={form.cliente}
                        onChange={(e) => setField("cliente", e.target.value)}
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">Correo</span>
                      <input
                        value={form.cliente_email}
                        onChange={(e) => setField("cliente_email", e.target.value)}
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">Teléfono</span>
                      <input
                        value={form.cliente_telefono}
                        onChange={(e) => setField("cliente_telefono", e.target.value)}
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">Fecha de venta</span>
                      <input
                        type="date"
                        value={form.fecha_venta}
                        onChange={(e) => setField("fecha_venta", e.target.value)}
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="text-xs font-medium text-zinc-700">Dirección</span>
                      <input
                        value={form.direccion_linea1}
                        onChange={(e) => setField("direccion_linea1", e.target.value)}
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="text-xs font-medium text-zinc-700">Dirección 2</span>
                      <input
                        value={form.direccion_linea2}
                        onChange={(e) => setField("direccion_linea2", e.target.value)}
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">Ciudad</span>
                      <input
                        value={form.ciudad}
                        onChange={(e) => setField("ciudad", e.target.value)}
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">Estado</span>
                      <input
                        value={form.estado_direccion}
                        onChange={(e) => setField("estado_direccion", e.target.value)}
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">Código postal</span>
                      <input
                        value={form.codigo_postal}
                        onChange={(e) => setField("codigo_postal", e.target.value)}
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">Método de pago</span>
                      <select
                        value={form.metodo_pago}
                        onChange={(e) => setField("metodo_pago", e.target.value)}
                        className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm"
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
                        value={form.estado}
                        onChange={(e) => setField("estado", e.target.value)}
                        className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="PAGADA">Pagada</option>
                        <option value="CANCELADA">Cancelada</option>
                        <option value="REEMBOLSADA">Reembolsada</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">Estado envío</span>
                      <select
                        value={form.estado_envio}
                        onChange={(e) => setField("estado_envio", e.target.value)}
                        className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                      >
                        <option value="PENDIENTE">Pendiente de envío</option>
                        <option value="EN_PROCESO">En proceso de envío</option>
                        <option value="ENVIADO">Enviado</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">Tipo de envío</span>
                      <select
                        value={form.tipo_envio}
                        onChange={(e) => setField("tipo_envio", e.target.value)}
                        className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                      >
                        <option value="ESTANDAR">Envío estándar nacional</option>
                        <option value="EXPRESS">Envío nacional express</option>
                        <option value="SIGUIENTE">Envío día siguiente nacional</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-zinc-700">Costo de envío</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.costo_envio}
                        onChange={(e) => setField("costo_envio", e.target.value)}
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="text-xs font-medium text-zinc-700">Referencias envío</span>
                      <textarea
                        rows={3}
                        value={form.referencias_envio}
                        onChange={(e) => setField("referencias_envio", e.target.value)}
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                </section>

                <section className="rounded-2xl border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">Productos</h3>
                      <p className="text-xs text-zinc-500">
                        Las tallas y colores cambian según el producto elegido
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addDetalle}
                      className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
                    >
                      <Plus size={16} />
                      Agregar
                    </button>
                  </div>

                  <div className="mt-4 space-y-4">
                    {form.detalles.map((detalle) => {
                      const producto = getProducto(detalle.producto_id);
                      const colores = getColoresDisponibles(detalle.producto_id);
                      const tallas = getTallasDisponibles(detalle.producto_id, detalle.color);
                      const stockActual = getStockVariante(
                        detalle.producto_id,
                        detalle.color,
                        detalle.talla
                      );
                      const subtotalLinea =
                        Number(producto?.precio || 0) * Number(detalle.cantidad || 0);

                      return (
                        <div key={detalle.id} className="rounded-2xl border p-4">
                          <div className="grid gap-3 md:grid-cols-[1.4fr_0.7fr_0.7fr_0.6fr_0.5fr_auto]">
                            <label className="block">
                              <span className="text-xs font-medium text-zinc-700">Producto</span>
                              <select
                                value={detalle.producto_id}
                                onChange={(e) => handleProductoChange(detalle.id, e.target.value)}
                                className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                              >
                                {productosNormalizados.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.titulo} · {money(item.precio)}
                                  </option>
                                ))}
                              </select>

                              <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">
                                  Precio {money(producto?.precio || 0)}
                                </span>
                              </div>
                            </label>

                            <label className="block">
                              <span className="text-xs font-medium text-zinc-700">Color</span>
                              <select
                                value={detalle.color}
                                onChange={(e) =>
                                  handleColorChange(
                                    detalle.id,
                                    detalle.producto_id,
                                    e.target.value
                                  )
                                }
                                className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                              >
                                {colores.length === 0 ? (
                                  <option value="">Sin variantes</option>
                                ) : (
                                  colores.map((item) => (
                                    <option key={item} value={item}>
                                      {item}
                                    </option>
                                  ))
                                )}
                              </select>
                            </label>

                            <label className="block">
                              <span className="text-xs font-medium text-zinc-700">Talla</span>
                              <select
                                value={detalle.talla}
                                onChange={(e) => handleTallaChange(detalle.id, e.target.value)}
                                className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                              >
                                {tallas.length === 0 ? (
                                  <option value="">Sin tallas</option>
                                ) : (
                                  tallas.map((item) => (
                                    <option key={item} value={item}>
                                      {item}
                                    </option>
                                  ))
                                )}
                              </select>

                              <div className="mt-2 text-xs text-zinc-500">
                                Stock variante: {stockActual}
                              </div>
                            </label>

                            <label className="block">
                              <span className="text-xs font-medium text-zinc-700">Cantidad</span>
                              <input
                                type="number"
                                min="1"
                                value={detalle.cantidad}
                                onChange={(e) =>
                                  handleCantidadChange(detalle.id, e.target.value)
                                }
                                className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                              />
                            </label>

                            <div className="flex flex-col justify-end">
                              <div className="text-xs text-zinc-500">Subtotal</div>
                              <div className="text-2xl font-semibold">
                                {money(subtotalLinea)}
                              </div>
                            </div>

                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => removeDetalle(detalle.id)}
                                className="rounded-xl border px-3 py-3 text-zinc-600 hover:bg-zinc-50"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              <aside className="h-fit rounded-2xl border p-4">
                <div className="text-sm font-semibold">Resumen</div>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Productos</span>
                    <span className="font-semibold">{form.detalles.length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-semibold">{money(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Envío</span>
                    <span className="font-semibold">{money(form.costo_envio)}</span>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3 text-base">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">{money(total)}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-zinc-50 p-4 text-xs text-zinc-600">
                  Si la venta queda en <b>PAGADA</b>, el backend validará stock real de
                  cada variante.
                </div>
              </aside>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Guardando..." : mode === "edit" ? "Guardar cambios" : "Guardar venta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}