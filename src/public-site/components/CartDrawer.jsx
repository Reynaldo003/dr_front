import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import { useAuth } from "../../auth/AuthContext";

export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const { items, count, total, removeItem, setQty, clear } = useCart();
  const { isClienteAuthenticated } = useAuth();

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const money = (n) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(Number(n || 0));

  const handleContinue = () => {
    if (items.length === 0) return;

    onClose?.();

    if (!isClienteAuthenticated) {
      navigate(`/account/access?next=${encodeURIComponent("/checkout")}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    navigate("/checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div
        className={[
          "fixed inset-0 z-[90] bg-black/40 backdrop-blur-[1px] transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
      />

      <aside
        className={[
          "fixed right-0 top-0 z-[100] h-full w-[92vw] max-w-md bg-white shadow-2xl transition-transform",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <div className="text-lg font-semibold">Carrito</div>
            <div className="text-sm text-gray-500">{count} artículo(s)</div>
          </div>

          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-gray-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="h-[calc(100%-180px)] space-y-4 overflow-auto p-5">
          {items.length === 0 ? (
            <div className="text-gray-600">Tu carrito está vacío. Agrega algo 👀</div>
          ) : (
            items.map((it) => {
              const maxStock = Number(it.maxStock || 99);
              const llegoMaximo = Number(it.qty || 0) >= maxStock;

              return (
                <div key={it.key} className="flex gap-3 rounded-2xl border p-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {it.image ? (
                      <img
                        src={it.image}
                        alt={it.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="flex-1">
                    <div className="font-medium leading-tight">{it.name}</div>

                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <span
                        className="inline-flex items-center gap-2 rounded-full border px-2 py-1"
                        title={it.colorName}
                      >
                        <span
                          className="h-3 w-3 rounded-full border"
                          style={{ backgroundColor: it.colorHex }}
                        />
                        {it.colorName}
                      </span>

                      <span className="rounded-full border px-2 py-1">
                        Talla {it.size}
                      </span>
                    </div>

                    {Number.isFinite(maxStock) && maxStock < 999 ? (
                      <div className="mt-1 text-xs text-gray-500">
                        Disponible para esta variante: {maxStock}
                      </div>
                    ) : null}

                    <div className="mt-2 flex items-center justify-between">
                      <div className="font-semibold">{money(it.price * it.qty)}</div>

                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center overflow-hidden rounded-full border">
                          <button
                            className="h-9 w-10 hover:bg-gray-50"
                            onClick={() => setQty(it.key, it.qty - 1)}
                            aria-label="Restar"
                          >
                            −
                          </button>

                          <div className="grid h-9 w-10 place-items-center text-sm font-medium">
                            {it.qty}
                          </div>

                          <button
                            className="h-9 w-10 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => setQty(it.key, it.qty + 1)}
                            aria-label="Sumar"
                            disabled={llegoMaximo}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(it.key)}
                          className="h-9 rounded-full border px-3 text-sm hover:bg-gray-50"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t p-5">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium">{money(total)}</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={clear}
              disabled={items.length === 0}
              className="h-11 rounded-full border hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              Vaciar
            </button>

            <button
              onClick={handleContinue}
              disabled={items.length === 0}
              className="h-11 rounded-full bg-black text-white hover:bg-black/90 disabled:opacity-50"
            >
              Continuar
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Si no has iniciado sesión, primero te pediremos crear o abrir tu cuenta.
          </p>
        </div>
      </aside>
    </>
  );
}