// src/public-site/pages/checkout/CheckoutFailure.jsx
import { Link, useLocation } from "react-router-dom";

export default function CheckoutFailure() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const status = params.get("status") || "rejected";
  const paymentId = params.get("payment_id") || "";
  const externalReference = params.get("external_reference") || "";
  const preferenceId = params.get("preference_id") || "";

  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-red-700">
          Pago no completado
        </h1>

        <p className="mt-3 text-red-800/90">
          El pago fue rechazado, cancelado o no se completó. Puedes volver a intentarlo.
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
            to="/checkout"
            className="h-11 px-5 rounded-full bg-black text-white inline-flex items-center justify-center font-semibold hover:opacity-90"
          >
            Intentar de nuevo
          </Link>

          <Link
            to="/"
            className="h-11 px-5 rounded-full border inline-flex items-center justify-center font-semibold hover:bg-gray-50"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}