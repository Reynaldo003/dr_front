// src/pages/HelpTrack.jsx
import { useState } from "react";
import { buildCarrierTrackingUrl, getOrderForTracking } from "../../services/orders";

export default function HelpTrack() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOrder(null);

    try {
      setLoading(true);
      const res = await getOrderForTracking({ orderNumber, email });
      if (!res) {
        setError("No encontramos ese pedido con ese correo. Revisa el folio y el email.");
      } else {
        setOrder(res);
      }
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al consultar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  const fedexUrl = order
    ? buildCarrierTrackingUrl({ carrier: order.carrier, trackingNumber: order.trackingNumber })
    : null;

  return (
    <div className="max-w-2xl mx-auto p-4 text-left">
      <h1 className="text-2xl font-extrabold">Seguimiento de pedido</h1>
      <p className="mt-1 text-black/60 text-sm">
        Ingresa tu folio y el correo con el que compraste.
      </p>

      <form onSubmit={onSubmit} className="mt-4 rounded-3xl border p-4 bg-white shadow-sm">
        <label className="block text-sm font-semibold">Folio de pedido</label>
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Ej. MDR-1700000000000"
          className="mt-1 w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
        />

        <label className="block text-sm font-semibold mt-4">Correo</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@gmail.com"
          className="mt-1 w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-2xl bg-black text-white py-3 font-semibold disabled:opacity-60"
        >
          {loading ? "Buscando..." : "Ver seguimiento"}
        </button>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </form>

      {order && (
        <div className="mt-4 rounded-3xl border p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-black/60">Pedido</p>
              <p className="font-extrabold">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-black/60">Estatus</p>
              <p className="font-bold">{order.status}</p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl bg-black/5 p-3">
            <p className="text-sm">
              <b>Guía:</b>{" "}
              {order.trackingNumber ? order.trackingNumber : "Aún no asignada (preparando tu paquete)."}
            </p>
            <p className="text-xs text-black/60 mt-1">
              <b>Paquetería:</b> {order.carrier ? order.carrier.toUpperCase() : "—"}
            </p>
          </div>

          {fedexUrl && (
            <a
              href={fedexUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex w-full justify-center rounded-2xl border py-3 font-semibold hover:bg-black/5 transition"
            >
              Ver en FedEx
            </a>
          )}
        </div>
      )}
    </div>
  );
}