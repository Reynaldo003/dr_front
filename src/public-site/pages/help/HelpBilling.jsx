import { useMemo, useState } from "react";
import HelpPage from "./HelpPage";
import BackButton from "../../components/BackButton";

const TELEFONO_VISIBLE = "271 208 07 28";
const TELEFONO_WHATSAPP = "522712080728";
const CORREO_FACTURACION = "reynasmisdos@gmail.com";

export default function HelpBilling() {
  const [form, setForm] = useState({
    rfc: "",
    razonSocial: "",
    usoCfdi: "",
    correo: "",
    pedido: "",
  });

  function actualizarCampo(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const datosCompletos = useMemo(() => {
    return (
      form.rfc.trim() &&
      form.razonSocial.trim() &&
      form.usoCfdi.trim() &&
      form.correo.trim() &&
      form.pedido.trim()
    );
  }, [form]);

  const mensajeWhatsApp = useMemo(() => {
    return encodeURIComponent(
      `Hola, solicito mi factura.\n\n` +
      `RFC: ${form.rfc || "-"}\n` +
      `Razón social: ${form.razonSocial || "-"}\n` +
      `Uso de CFDI: ${form.usoCfdi || "-"}\n` +
      `Correo: ${form.correo || "-"}\n` +
      `Número de pedido: ${form.pedido || "-"}`,
    );
  }, [form]);

  const asuntoCorreo = useMemo(() => {
    return encodeURIComponent(`Solicitud de factura - Pedido ${form.pedido || ""}`);
  }, [form.pedido]);

  const cuerpoCorreo = useMemo(() => {
    return encodeURIComponent(
      `Hola, solicito mi factura.\n\n` +
      `RFC: ${form.rfc || "-"}\n` +
      `Razón social: ${form.razonSocial || "-"}\n` +
      `Uso de CFDI: ${form.usoCfdi || "-"}\n` +
      `Correo: ${form.correo || "-"}\n` +
      `Número de pedido: ${form.pedido || "-"}\n`,
    );
  }, [form]);

  const whatsappLink = `https://wa.me/${TELEFONO_WHATSAPP}?text=${mensajeWhatsApp}`;
  const correoLink = `mailto:${CORREO_FACTURACION}?subject=${asuntoCorreo}&body=${cuerpoCorreo}`;

  return (
    <HelpPage
      title="Facturación"
      lead="Te ayudamos a solicitar tu factura de forma correcta."
    >
      <section>
        <BackButton className="mb-6 text-sm underline hover:opacity-70" />

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold md:text-3xl">Solicitar factura</h2>

          <p className="mt-4 text-gray-700">
            Completa los datos y envíalos por WhatsApp o correo electrónico.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-black">RFC</label>
              <input
                type="text"
                name="rfc"
                value={form.rfc}
                onChange={actualizarCampo}
                placeholder="Ej. XAXX010101000"
                className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black">
                Razón social
              </label>
              <input
                type="text"
                name="razonSocial"
                value={form.razonSocial}
                onChange={actualizarCampo}
                placeholder="Nombre o empresa"
                className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black">
                Uso de CFDI
              </label>
              <input
                type="text"
                name="usoCfdi"
                value={form.usoCfdi}
                onChange={actualizarCampo}
                placeholder="Ej. G03"
                className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-black">Correo</label>
              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={actualizarCampo}
                placeholder="tucorreo@gmail.com"
                className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-black">
                Número de pedido
              </label>
              <input
                type="text"
                name="pedido"
                value={form.pedido}
                onChange={actualizarCampo}
                placeholder="Ej. MDR-1700000000000"
                className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:ring-2 focus:ring-black/20"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white transition ${datosCompletos
                  ? "bg-black hover:bg-neutral-800"
                  : "pointer-events-none bg-black/40"
                }`}
            >
              Enviar por WhatsApp
            </a>

            <a
              href={correoLink}
              className={`inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-semibold transition ${datosCompletos
                  ? "border-black/15 text-black hover:bg-gray-50"
                  : "pointer-events-none border-black/10 text-black/40"
                }`}
            >
              Enviar por correo
            </a>
          </div>

          <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
            <p>
              También puedes contactarnos directamente por WhatsApp al{" "}
              <a
                href={`https://wa.me/${TELEFONO_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-black underline underline-offset-4"
              >
                {TELEFONO_VISIBLE}
              </a>{" "}
              o por correo en{" "}
              <a
                href={`mailto:${CORREO_FACTURACION}`}
                className="font-semibold text-black underline underline-offset-4"
              >
                {CORREO_FACTURACION}
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-extrabold md:text-3xl">Requisitos</h2>

        <ul className="mt-4 space-y-3 text-gray-700">
          {[
            "RFC",
            "Razón social",
            "Uso de CFDI",
            "Correo",
            "Número de pedido",
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-black" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-extrabold md:text-3xl">Tiempo de respuesta</h2>

        <p className="mt-4 text-gray-700">
          Normalmente enviamos la factura en 24 a 48 horas hábiles.
        </p>
      </section>
    </HelpPage>
  );
}