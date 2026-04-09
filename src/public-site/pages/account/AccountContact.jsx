import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";

function CardAction({ href, onClick, external = false, title, subtitle, primary = false }) {
  const className = primary
    ? "rounded-2xl bg-black text-white px-4 py-4 font-semibold hover:opacity-90 transition flex items-center justify-between"
    : "rounded-2xl border px-4 py-4 font-semibold hover:bg-black/5 transition flex items-center justify-between";

  if (href) {
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className={className}
      >
        <div>
          <div>{title}</div>
          <div className={primary ? "text-xs text-white/70 mt-1" : "text-xs text-black/50 mt-1"}>
            {subtitle}
          </div>
        </div>
        <span>›</span>
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <div>
        <div>{title}</div>
        <div className={primary ? "text-xs text-white/70 mt-1" : "text-xs text-black/50 mt-1"}>
          {subtitle}
        </div>
      </div>
      <span>›</span>
    </button>
  );
}

export default function AccountContact() {
  const nav = useNavigate();
  const { clienteUser } = useAuth();

  const whatsappNumber = "522712080728";
  const email = "soporte@misdosreynas.com";

  const clienteNombre = clienteUser?.nombre || "Cliente";
  const clienteCorreo = clienteUser?.email || "";
  const clienteTelefono = clienteUser?.telefono || "";

  const whatsappLink = useMemo(() => {
    const mensaje = [
      "Hola, necesito ayuda con mi pedido.",
      "",
      `Nombre: ${clienteNombre}`,
      clienteCorreo ? `Correo: ${clienteCorreo}` : "",
      clienteTelefono ? `Teléfono: ${clienteTelefono}` : "",
      "",
      "Mi duda es:",
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
  }, [clienteNombre, clienteCorreo, clienteTelefono, whatsappNumber]);

  const mailtoLink = useMemo(() => {
    const subject = encodeURIComponent("Soporte de pedido");
    const body = encodeURIComponent(
      [
        "Hola, necesito ayuda con mi pedido.",
        "",
        `Nombre: ${clienteNombre}`,
        clienteCorreo ? `Correo: ${clienteCorreo}` : "",
        clienteTelefono ? `Teléfono: ${clienteTelefono}` : "",
        "",
        "Mi duda es:",
      ]
        .filter(Boolean)
        .join("\n"),
    );

    return `mailto:${email}?subject=${subject}&body=${body}`;
  }, [clienteNombre, clienteCorreo, clienteTelefono, email]);

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

        <div>
          <h1 className="text-xl font-extrabold">Contacto</h1>
          <p className="text-sm text-black/60">Soporte y atención para tu cuenta y tus pedidos.</p>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
        <p className="text-sm text-black/60">Canales rápidos</p>
        <p className="text-lg font-extrabold mt-1">¿En qué podemos ayudarte?</p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CardAction
            href={whatsappLink}
            external
            primary
            title="WhatsApp"
            subtitle="Atención rápida sobre pedidos, pagos y entregas"
          />

          <CardAction
            href={mailtoLink}
            title="Correo"
            subtitle="Envíanos tu duda con más detalle"
          />
        </div>

        <div className="mt-4 rounded-2xl bg-black/5 border p-4">
          <p className="text-sm font-semibold">Tus datos de contacto</p>

          <div className="mt-2 space-y-1 text-sm text-black/60">
            <p>
              <span className="font-medium text-black/80">Nombre:</span>{" "}
              {clienteNombre || "No disponible"}
            </p>

            <p>
              <span className="font-medium text-black/80">Correo:</span>{" "}
              {clienteCorreo || "No disponible"}
            </p>

            <p>
              <span className="font-medium text-black/80">Teléfono:</span>{" "}
              {clienteTelefono || "No disponible"}
            </p>
          </div>

          <p className="text-sm text-black/60 mt-3">
            Cuando abras WhatsApp o correo, estos datos ya se enviarán precargados para que soporte
            te atienda más rápido.
          </p>
        </div>

        <div className="mt-4 rounded-2xl bg-black/5 border p-4">
          <p className="text-sm font-semibold">Tip</p>
          <p className="text-sm text-black/60 mt-1">
            Si tu duda es sobre una compra, incluye tu <b>folio</b>, el <b>correo</b> con el que
            compraste y una breve descripción del problema.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => nav("/account/orders")}
            className="rounded-full border px-4 py-2 text-sm font-semibold hover:bg-black/5 transition"
          >
            Ver mis pedidos
          </button>

          <button
            type="button"
            onClick={() => nav("/help/tracking")}
            className="rounded-full border px-4 py-2 text-sm font-semibold hover:bg-black/5 transition"
          >
            Rastrear pedido
          </button>

          <button
            type="button"
            onClick={() => nav("/help/returns")}
            className="rounded-full border px-4 py-2 text-sm font-semibold hover:bg-black/5 transition"
          >
            Cambios y devoluciones
          </button>

          <button
            type="button"
            onClick={() => nav("/help/faq")}
            className="rounded-full border px-4 py-2 text-sm font-semibold hover:bg-black/5 transition"
          >
            Preguntas frecuentes
          </button>
        </div>
      </div>
    </div>
  );
}