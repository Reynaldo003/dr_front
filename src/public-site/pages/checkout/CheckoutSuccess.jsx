// src/public-site/pages/checkout/CheckoutSuccess.jsx
import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../context/cart";

function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function CheckoutSuccess() {
  const params = useQueryParams();
  const { clear } = useCart();

  const collectionStatus = params.get("collection_status") || "";
  const paymentId = params.get("payment_id") || "";
  const status = params.get("status") || "";
  const externalReference = params.get("external_reference") || "";
  const preferenceId = params.get("preference_id") || "";
  const merchantOrderId = params.get("merchant_order_id") || "";

  useEffect(() => {
    const key = `mp_checkout_cleared_${paymentId || externalReference || "ok"}`;
    const yaLimpio = sessionStorage.getItem(key);

    if (!yaLimpio) {
      clear();
      sessionStorage.setItem(key, "true");
    }
  }, [clear, paymentId, externalReference]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-green-700">
          Pago aprobado
        </h1>

        <p className="mt-3 text-green-800/90">
          Tu pago fue procesado correctamente. En breve se reflejará en tu pedido.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white border p-4">
            <div className="text-sm text-gray-500">Estado</div>
            <div className="mt-1 font-semibold">
              {collectionStatus || status || "approved"}
            </div>
          </div>

          <div className="rounded-2xl bg-white border p-4">
            <div className="text-sm text-gray-500">Referencia externa</div>
            <div className="mt-1 font-semibold break-all">
              {externalReference || "No disponible"}
            </div>
          </div>

          <div className="rounded-2xl bg-white border p-4">
            <div className="text-sm text-gray-500">Payment ID</div>
            <div className="mt-1 font-semibold break-all">
              {paymentId || "No disponible"}
            </div>
          </div>

          <div className="rounded-2xl bg-white border p-4">
            <div className="text-sm text-gray-500">Preference ID</div>
            <div className="mt-1 font-semibold break-all">
              {preferenceId || "No disponible"}
            </div>
          </div>

          <div className="rounded-2xl bg-white border p-4 sm:col-span-2">
            <div className="text-sm text-gray-500">Merchant Order ID</div>
            <div className="mt-1 font-semibold break-all">
              {merchantOrderId || "No disponible"}
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="h-11 px-5 rounded-full bg-black text-white inline-flex items-center justify-center font-semibold hover:opacity-90"
          >
            Volver al inicio
          </Link>

          <Link
            to="/account/orders"
            className="h-11 px-5 rounded-full border inline-flex items-center justify-center font-semibold hover:bg-gray-50"
          >
            Ver mis pedidos
          </Link>
        </div>
      </div>
    </main>
  );
}