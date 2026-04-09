import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";

function Item({ icon, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group w-full text-left
        rounded-2xl border bg-white
        px-4 py-4
        shadow-[0_10px_30px_rgba(0,0,0,0.06)]
        hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)]
        transition
        flex items-center gap-4
      "
    >
      <div className="w-12 h-12 rounded-2xl border bg-black/5 flex items-center justify-center">
        <span className="text-xl">{icon}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-extrabold tracking-tight">{title}</p>
        <p className="text-sm text-black/60 mt-1 truncate">{subtitle}</p>
      </div>

      <div className="text-xl text-black/30 group-hover:translate-x-0.5 transition">›</div>
    </button>
  );
}

export default function AccountHome() {
  const nav = useNavigate();
  const { clienteUser, logoutCliente } = useAuth();

  const name = clienteUser?.nombre || "Mi cuenta";
  const email = clienteUser?.email || "";

  return (
    <div className="max-w-3xl mx-auto p-4 text-left">
      <div className="rounded-3xl overflow-hidden border bg-white shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
        <div className="px-6 py-6 bg-gradient-to-r from-black to-zinc-900 text-white">
          <p className="text-sm opacity-90">Mi cuenta</p>
          <p className="text-2xl font-extrabold leading-tight mt-1">{name}</p>
          <p className="text-sm opacity-90 mt-1">{email}</p>
        </div>

        <div className="p-5 space-y-4">
          <Item
            icon="📍"
            title="Direcciones"
            subtitle="Guarda tus direcciones para comprar más rápido"
            onClick={() => nav("/account/addresses")}
          />

          <Item
            icon="🛍️"
            title="Mis compras"
            subtitle="Historial de pedidos, fechas y productos"
            onClick={() => nav("/account/orders")}
          />

          <Item
            icon="💬"
            title="Contacto"
            subtitle="Soporte y atención"
            onClick={() => nav("/account/contact")}
          />

          <button
            type="button"
            onClick={async () => {
              await logoutCliente();
              nav("/");
            }}
            className="w-full rounded-2xl border px-4 py-4 text-left font-semibold text-red-600 hover:bg-red-50 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}