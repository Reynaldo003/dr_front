import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerMisPedidos } from "../../lib/apiClientes";

function fmtDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function money(n) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(n || 0));
}

function toDate(value) {
  if (!value) return null;
  return new Date(value);
}

function isLast6Months(value) {
  const d = toDate(value);
  if (!d) return true;

  const now = new Date();
  const six = new Date(now);
  six.setMonth(six.getMonth() - 6);

  return d >= six;
}

function StatusPill({ status }) {
  const s = String(status || "").toUpperCase();
  const map = {
    PAGADA: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDIENTE: "bg-amber-50 text-amber-700 border-amber-200",
    CANCELADA: "bg-red-50 text-red-700 border-red-200",
    REEMBOLSADA: "bg-blue-50 text-blue-700 border-blue-200",
  };
  const cls = map[s] || "bg-black/5 text-black/70 border-black/10";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {s ? s.replaceAll("_", " ") : "PEDIDO"}
    </span>
  );
}

function ShippingPill({ status }) {
  const s = String(status || "").toUpperCase();
  const map = {
    PENDIENTE: "bg-zinc-100 text-zinc-700 border-zinc-200",
    EN_PROCESO: "bg-amber-50 text-amber-700 border-amber-200",
    ENVIADO: "bg-blue-50 text-blue-700 border-blue-200",
  };
  const cls = map[s] || "bg-black/5 text-black/70 border-black/10";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {s ? `Envío: ${s.replaceAll("_", " ")}` : "Envío"}
    </span>
  );
}

export default function AccountOrders() {
  const nav = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [only6m, setOnly6m] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const data = await obtenerMisPedidos();
        if (alive) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
        if (alive) setOrders([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return orders
      .filter((o) => (only6m ? isLast6Months(o.fecha_creacion) : true))
      .filter((o) => {
        if (!query) return true;

        const folio = String(o.folio || "").toLowerCase();
        const status = String(o.estado || "").toLowerCase();
        const items = Array.isArray(o.detalles) ? o.detalles : [];
        const names = items
          .map((it) => it.producto_titulo || "")
          .join(" ")
          .toLowerCase();

        return (
          folio.includes(query) ||
          status.includes(query) ||
          names.includes(query)
        );
      });
  }, [orders, q, only6m]);

  return (
    <div className="max-w-3xl mx-auto p-4 text-left">
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => nav("/account")}
          className="w-10 h-10 rounded-full border hover:bg-black/5 transition flex items-center justify-center"
          aria-label="Volver"
          title="Volver"
        >
          ←
        </button>

        <div className="flex-1">
          <h1 className="text-xl font-extrabold">Mis compras</h1>
          <p className="text-sm text-black/60">Historial de pedidos, fechas y productos.</p>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOnly6m(false)}
              className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${!only6m ? "bg-black text-white" : "bg-white hover:bg-black/5"
                }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setOnly6m(true)}
              className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${only6m ? "bg-black text-white" : "bg-white hover:bg-black/5"
                }`}
            >
              Últimos 6 meses
            </button>
          </div>

          <div className="text-xs text-black/50">
            Busca por folio, estado o nombre del producto.
          </div>
        </div>

        <div className="mt-3 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40">⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por producto o folio..."
            className="w-full rounded-2xl border bg-white px-10 py-3 outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="rounded-3xl border bg-white p-5">
            <p className="font-semibold">Cargando...</p>
            <p className="text-sm text-black/60 mt-1">Consultando tus pedidos.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border bg-white p-5">
            <p className="font-semibold">No hay compras para mostrar.</p>
            <p className="text-sm text-black/60 mt-1">Cambia el filtro o intenta otra búsqueda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => {
              const items = Array.isArray(o.detalles) ? o.detalles : [];
              const isOpen = openId === o.id;

              return (
                <div
                  key={o.id}
                  className="rounded-3xl border bg-white p-4 shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 border overflow-hidden flex items-center justify-center shrink-0">
                      <span className="text-xs text-black/40">ORD</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                          <StatusPill status={o.estado} />
                          <ShippingPill status={o.estado_envio} />
                        </div>

                        <p className="text-xs text-black/50">
                          {fmtDate(o.fecha_creacion)}
                        </p>
                      </div>

                      <p className="mt-2 font-extrabold truncate">{o.folio}</p>
                      <p className="text-sm text-black/60 mt-1 truncate">
                        {items.length} producto(s) · Total:{" "}
                        <b className="text-black/80">{money(o.total)}</b>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenId((prev) => (prev === o.id ? null : o.id))}
                      className="rounded-full border px-4 py-2 text-sm font-semibold hover:bg-black/5 transition"
                    >
                      {isOpen ? "Ocultar productos" : "Ver productos"}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-4 rounded-2xl bg-black/5 border p-3">
                      <p className="text-sm font-bold mb-2">Productos</p>

                      {items.length === 0 ? (
                        <p className="text-sm text-black/60">
                          Este pedido no tiene productos registrados.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {items.map((it, idx) => {
                            const name = it.producto_titulo || "Producto";
                            const qty = Number(it.cantidad || 1);
                            const price = it.precio_unitario ?? 0;

                            return (
                              <div
                                key={`${it.id || name}-${idx}`}
                                className="flex items-center gap-3 rounded-2xl bg-white border p-3"
                              >
                                <div className="w-12 h-12 rounded-xl bg-black/5 border overflow-hidden flex items-center justify-center shrink-0">
                                  <span className="text-[10px] text-black/40">IMG</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate">{name}</p>
                                  <p className="text-xs text-black/60 mt-1">
                                    Cantidad: <b>{qty}</b>
                                    {it.talla ? ` · Talla ${it.talla}` : ""}
                                    {it.color ? ` · ${it.color}` : ""}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <p className="text-xs text-black/50">Precio</p>
                                  <p className="text-sm font-bold">{money(price)}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}