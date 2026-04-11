import { Link } from "react-router-dom";
import HelpPage from "./HelpPage";
import BackButton from "../../components/BackButton";

const TELEFONO_VISIBLE = "271 208 07 28";
const TELEFONO_WHATSAPP = "522712080728";
const CORREO = "reynasmisdos@gmail.com";

const LINK_WHATSAPP = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(
  "Hola, necesito ayuda con una duda sobre mi compra.",
)}`;

const LINK_CORREO = `mailto:${CORREO}?subject=${encodeURIComponent(
  "Duda sobre mi compra",
)}`;

const FAQS = [
  {
    pregunta: "¿Cómo compro?",
    respuesta: (
      <p className="leading-7 text-gray-700">
        Selecciona tu producto, elige talla o variante disponible, agrégalo al
        carrito y finaliza tu compra en checkout con tus datos de envío y pago.
      </p>
    ),
  },
  {
    pregunta: "¿Hacen envíos a todo México?",
    respuesta: (
      <p className="leading-7 text-gray-700">
        Sí, realizamos envíos a toda la República Mexicana. Trabajamos con
        paqueterías como <span className="font-semibold text-black">FedEx</span>,{" "}
        <span className="font-semibold text-black">Estafeta</span> y{" "}
        <span className="font-semibold text-black">DHL</span>, dependiendo de la
        cobertura y disponibilidad.
      </p>
    ),
  },
  {
    pregunta: "¿Cuáles son los tipos de envío y sus costos?",
    respuesta: (
      <div className="space-y-3 text-gray-700">
        <p className="leading-7">
          <span className="font-semibold text-black">Envío estándar nacional:</span>{" "}
          2 a 7 días hábiles, tarifa de <span className="font-semibold text-black">$150.00 MXN</span>.
        </p>
        <p className="leading-7">
          <span className="font-semibold text-black">Envío nacional express:</span>{" "}
          2 a 4 días hábiles, tarifa de <span className="font-semibold text-black">$250.00 MXN</span>.
        </p>
        <p className="leading-7">
          <span className="font-semibold text-black">Envío día siguiente nacional:</span>{" "}
          24 a 48 horas hábiles, tarifa de{" "}
          <span className="font-semibold text-black">$399.00 MXN</span>.
        </p>
      </div>
    ),
  },
  {
    pregunta: "¿Hay una hora límite para enviar el mismo día?",
    respuesta: (
      <p className="leading-7 text-gray-700">
        Sí. Para los envíos <span className="font-semibold text-black">express</span> y{" "}
        <span className="font-semibold text-black">día siguiente</span>, la hora
        máxima para que tu paquete pueda salir el mismo día es a la{" "}
        <span className="font-semibold text-black">1:00 pm</span>, de lunes a jueves.
      </p>
    ),
  },
  {
    pregunta: "¿Puedo cambiar mi talla?",
    respuesta: (
      <p className="leading-7 text-gray-700">
        Sí, siempre que la prenda esté sin uso, con etiquetas y en su empaque
        original. Puedes revisar la política completa en{" "}
        <Link
          to="/help/returns"
          className="font-semibold text-black underline underline-offset-4"
        >
          Cambios y devoluciones
        </Link>
        .
      </p>
    ),
  },
  {
    pregunta: "¿Hacen devoluciones de dinero?",
    respuesta: (
      <p className="leading-7 text-gray-700">
        No hacemos devoluciones de dinero. Únicamente realizamos cambios por
        talla o por otro artículo de igual o mayor precio, pagando la
        diferencia en caso de ser necesario.
      </p>
    ),
  },
  {
    pregunta: "¿Los productos en descuento tienen cambio o devolución?",
    respuesta: (
      <p className="leading-7 text-gray-700">
        Los productos adquiridos con descuentos mayores al{" "}
        <span className="font-semibold text-black">30%</span> se consideran{" "}
        <span className="font-semibold text-black">venta final</span>, por lo
        que no aplican cambios ni devoluciones.
      </p>
    ),
  },
  {
    pregunta: "¿Cómo hago un cambio si mi pedido es foráneo?",
    respuesta: (
      <div className="space-y-3 text-gray-700">
        <p className="leading-7">
          Debes solicitarlo por{" "}
          <a
            href={LINK_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-black underline underline-offset-4"
          >
            WhatsApp
          </a>{" "}
          o por{" "}
          <a
            href={LINK_CORREO}
            className="font-semibold text-black underline underline-offset-4"
          >
            correo electrónico
          </a>{" "}
          indicando tu número de pedido.
        </p>
        <p className="leading-7">
          Los costos de envío por cambios o devoluciones corren por cuenta del
          cliente, y la prenda debe enviarse con la información necesaria para
          identificar correctamente el pedido.
        </p>
      </div>
    ),
  },
  {
    pregunta: "¿Qué necesito para solicitar factura?",
    respuesta: (
      <div className="space-y-3 text-gray-700">
        <p className="leading-7">
          Necesitas proporcionar:
        </p>
        <ul className="space-y-2">
          {["RFC", "Razón social", "Uso de CFDI", "Correo", "Número de pedido"].map(
            (item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-black" />
                <span>{item}</span>
              </li>
            ),
          )}
        </ul>
        <p className="leading-7">
          Puedes revisar esa sección en{" "}
          <Link
            to="/help/billing"
            className="font-semibold text-black underline underline-offset-4"
          >
            Facturación
          </Link>
          .
        </p>
      </div>
    ),
  },
  {
    pregunta: "¿Cuánto tarda la factura?",
    respuesta: (
      <p className="leading-7 text-gray-700">
        Normalmente enviamos la factura en un plazo de{" "}
        <span className="font-semibold text-black">24 a 48 horas hábiles</span>.
      </p>
    ),
  },
  {
    pregunta: "¿Cómo puedo contactarlos?",
    respuesta: (
      <p className="leading-7 text-gray-700">
        Puedes escribirnos por{" "}
        <a
          href={LINK_WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-black underline underline-offset-4"
        >
          WhatsApp al {TELEFONO_VISIBLE}
        </a>{" "}
        o por{" "}
        <a
          href={LINK_CORREO}
          className="font-semibold text-black underline underline-offset-4"
        >
          correo a {CORREO}
        </a>
        .
      </p>
    ),
  },
];

export default function HelpFAQ() {
  return (
    <HelpPage
      title="Preguntas frecuentes"
      lead="Respuestas rápidas a las dudas más comunes sobre compras, envíos, cambios, devoluciones y facturación."
    >
      <section>
        <BackButton className="mb-6 text-sm underline hover:opacity-70" />

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold md:text-3xl">
            Preguntas frecuentes
          </h2>

          <p className="mt-4 text-gray-700">
            Aquí encontrarás respuestas rápidas para resolver las dudas más
            comunes de nuestros clientes.
          </p>
        </div>
      </section>

      <section className="grid gap-4">
        {FAQS.map((item, index) => (
          <details
            key={index}
            className="group rounded-3xl border border-black/10 bg-white p-6 shadow-sm"
          >
            <summary className="cursor-pointer list-none pr-8 text-lg font-extrabold text-black marker:hidden md:text-xl">
              <div className="flex items-start justify-between gap-4">
                <span>{item.pregunta}</span>
                <span className="mt-1 text-xl leading-none transition group-open:rotate-45">
                  +
                </span>
              </div>
            </summary>

            <div className="mt-4 border-t border-black/10 pt-4">
              {item.respuesta}
            </div>
          </details>
        ))}
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-extrabold md:text-3xl">
          ¿No encontraste tu respuesta?
        </h2>

        <p className="mt-4 text-gray-700">
          Contáctanos directamente y con gusto te ayudamos.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={LINK_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            WhatsApp
          </a>

          <a
            href={LINK_CORREO}
            className="inline-flex items-center rounded-full border border-black/15 px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-50"
          >
            Correo electrónico
          </a>
        </div>
      </section>
    </HelpPage>
  );
}