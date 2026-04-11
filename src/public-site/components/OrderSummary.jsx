function money(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

export default function OrderSummary({ order }) {
  if (!order) return null;

  return (
    <div className="rounded-3xl border bg-white p-5 text-left shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-black/60">Pedido</p>
          <p className="text-lg font-extrabold">{order.orderNumber || order.folio}</p>
          <p className="mt-1 text-xs text-black/60">
            Estatus: <b>{order.status || order.estado}</b>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-black/60">Total</p>
          <p className="text-lg font-extrabold">{money(order.total)}</p>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <p className="text-sm font-bold">Productos</p>

        <div className="mt-3 space-y-3">
          {(order.items || order.detalles || []).map((it, idx) => (
            <div key={`${it.id}-${idx}`} className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border bg-black/5">
                {it.image || it.producto?.imagen_principal ? (
                  <img
                    src={it.image || it.producto?.imagen_principal}
                    alt={it.name || it.producto?.titulo}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-black/40">IMG</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {it.name || it.producto?.titulo}
                </p>
                <p className="text-xs text-black/60">
                  {it.variant
                    ? `${it.variant} · `
                    : [it.color, it.talla].filter(Boolean).join(" / ")
                      ? `${[it.color, it.talla].filter(Boolean).join(" / ")} · `
                      : ""}
                  Cantidad: <b>{it.qty || it.cantidad}</b>
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold">
                  {money(it.price || it.precio_unitario)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-2 border-t pt-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-black/60">Subtotal</span>
          <span className="font-semibold">{money(order.subtotal)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-black/60">
            Envío {order.tipo_envio ? `(${order.tipo_envio})` : ""}
          </span>
          <span className="font-semibold">
            {Number(order.costo_envio || 0) > 0 ? money(order.costo_envio) : "Gratis"}
          </span>
        </div>

        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-black/60">Total</span>
          <span className="text-base font-extrabold">{money(order.total)}</span>
        </div>
      </div>
    </div>
  );
}