// src/components/OrderSummary.jsx
function money(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

export default function OrderSummary({ order }) {
  if (!order) return null;

  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm text-left">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-black/60">Pedido</p>
          <p className="text-lg font-extrabold">{order.orderNumber}</p>
          <p className="text-xs text-black/60 mt-1">
            Estatus: <b>{order.status}</b>
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
          {(order.items || []).map((it, idx) => (
            <div key={`${it.id}-${idx}`} className="flex gap-3 items-center">
              <div className="w-14 h-14 rounded-2xl bg-black/5 border overflow-hidden flex items-center justify-center">
                {it.image ? (
                  <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-black/40">IMG</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{it.name}</p>
                <p className="text-xs text-black/60">
                  {it.variant ? `${it.variant} · ` : ""}Cantidad: <b>{it.qty}</b>
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold">{money(it.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}