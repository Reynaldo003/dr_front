// src/public-site/pages/checkout/CheckoutPending.jsx
import { Link, useLocation } from "react-router-dom";

export default function CheckoutPending() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const status = params.get("status") || "pending";
  const paymentId = params.get("payment_id") || "";
  const externalReference = params.get("external_reference") || "";
  const preferenceId = params.get("preference_id") || "";

  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-700">
          Pago pendiente
        </h1>

        <p className="mt-3 text-yellow-800/90">
          Tu pago aún está en proceso o pendiente de confirmación. Cuando Mercado Pago lo confirme,
          el backend actualizará la venta.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white border p-4">
            <div className="text-sm text-gray-500">Estado</div>
            <div className="mt-1 font-semibold">{status}</div>
          </div>

          <div className="rounded-2xl bg-white border p-4">
            <div className="text-sm text-gray-500">Payment ID</div>
            <div className="mt-1 font-semibold break-all">
              {paymentId || "No disponible"}
            </div>
          </div>

          <div className="rounded-2xl bg-white border p-4">
            <div className="text-sm text-gray-500">Referencia externa</div>
            <div className="mt-1 font-semibold break-all">
              {externalReference || "No disponible"}
            </div>
          </div>

          <div className="rounded-2xl bg-white border p-4">
            <div className="text-sm text-gray-500">Preference ID</div>
            <div className="mt-1 font-semibold break-all">
              {preferenceId || "No disponible"}
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
            to="/checkout"
            className="h-11 px-5 rounded-full border inline-flex items-center justify-center font-semibold hover:bg-gray-50"
          >
            Volver al checkout
          </Link>
        </div>
      </div>
    </main>
  );
}