// src/pages/help/HelpReturns.jsx
import BackButton from "../../components/BackButton";

const TELEFONO_VISIBLE = "271 208 07 28";
const TELEFONO_WHATSAPP = "522712080728";
const CORREO = "reynasmisdos@gmail.com";

const MENSAJE_WHATSAPP =
  "Hola, necesito ayuda con un cambio o devolución de mi pedido.";
const ASUNTO_CORREO = "Solicitud de cambio o devolución";
const CUERPO_CORREO =
  "Hola, necesito apoyo con un cambio o devolución.\n\nNúmero de pedido:\nNombre:\nDetalle de la solicitud:\n";

const LINK_WHATSAPP = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(
  MENSAJE_WHATSAPP,
)}`;

const LINK_CORREO = `mailto:${CORREO}?subject=${encodeURIComponent(
  ASUNTO_CORREO,
)}&body=${encodeURIComponent(CUERPO_CORREO)}`;

const politicasCambio = [
  "No hacemos devoluciones de dinero; únicamente hacemos cambios de talla o por otro artículo de igual o de mayor precio, pagando la diferencia en caso de ser necesario.",
  "La prenda debe estar sin uso, con etiquetas y en su empaque original.",
  "Puedes traer la prenda a nuestra sucursal.",
  "Al momento de entregar o enviar tus prendas, es indispensable llevar o incluir la hoja de pedido para poder identificar tu pedido.",
];

const ventaFinal = [
  "Los productos adquiridos con descuentos mayores al 30% se consideran venta final.",
  "Por esta razón, no aplican cambios ni devoluciones en este tipo de productos.",
  "Te recomendamos revisar cuidadosamente talla, detalles del producto y descripción antes de finalizar tu compra.",
];

const pedidosForaneos = [
  "Los cambios en pedidos foráneos deben solicitarse por WhatsApp o por correo electrónico indicando tu número de pedido.",
  "Los costos de envío por cambios o devoluciones corren por cuenta del cliente.",
  "Puedes enviar las prendas por paquetería; el cliente elige y paga la paquetería de su elección.",
  "Una vez recibida la prenda, será inspeccionada para validar que cumpla con las condiciones del cambio o devolución aplicable.",
  "En caso de proceder, el seguimiento se realizará conforme a la política vigente de la tienda.",
];

export default function HelpReturns() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14">
      <BackButton className="mb-6 text-sm underline hover:opacity-70" />

      <header className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          Cambios y devoluciones
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700">
          ¿No te quedó o no te gustó? Aquí puedes consultar nuestras políticas,
          condiciones e instrucciones para solicitar un cambio o recibir apoyo
          con tu pedido.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={LINK_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            WhatsApp: {TELEFONO_VISIBLE}
          </a>

          <a
            href={LINK_CORREO}
            className="inline-flex items-center rounded-full border border-black/15 px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-50"
          >
            Correo: {CORREO}
          </a>
        </div>
      </header>

      <div className="mt-8 grid gap-6">
        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold">Políticas de cambios</h2>

          <ul className="mt-5 space-y-4 text-gray-700">
            {politicasCambio.map((texto, index) => (
              <li key={index} className="flex gap-3 leading-7">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-black" />
                <span>{texto}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold">Productos con descuento</h2>

          <ul className="mt-5 space-y-4 text-gray-700">
            {ventaFinal.map((texto, index) => (
              <li key={index} className="flex gap-3 leading-7">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-black" />
                <span>{texto}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold">¿Cómo hacer un cambio?</h2>

          <ol className="mt-5 space-y-4 text-gray-700">
            <li className="flex gap-4 leading-7">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                1
              </span>
              <span>
                Escríbenos por{" "}
                <a
                  href={LINK_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-black underline underline-offset-4 hover:opacity-70"
                >
                  WhatsApp
                </a>{" "}
                al{" "}
                <a
                  href={LINK_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-black underline underline-offset-4 hover:opacity-70"
                >
                  {TELEFONO_VISIBLE}
                </a>{" "}
                o por{" "}
                <a
                  href={LINK_CORREO}
                  className="font-semibold text-black underline underline-offset-4 hover:opacity-70"
                >
                  correo electrónico
                </a>{" "}
                a{" "}
                <a
                  href={LINK_CORREO}
                  className="font-semibold text-black underline underline-offset-4 hover:opacity-70"
                >
                  {CORREO}
                </a>{" "}
                indicando tu número de pedido y el motivo del cambio.
              </span>
            </li>

            <li className="flex gap-4 leading-7">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                2
              </span>
              <span>
                Te indicaremos el siguiente paso: entrega en sucursal o envío de
                la prenda, según corresponda a tu caso. En caso de que aplique cambio presencial, puedes traer la prenda a nuestra Sucursal: San Jose.
              </span>
            </li>

            <li className="flex gap-4 leading-7">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                3
              </span>
              <span>
                Recuerda incluir la hoja de pedido o la información necesaria
                para identificar correctamente tu compra.
              </span>
            </li>

            <li className="flex gap-4 leading-7">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                4
              </span>
              <span>
                Una vez recibida la prenda, revisaremos su estado y te
                confirmaremos si procede el cambio conforme a nuestras
                políticas.
              </span>
            </li>
          </ol>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold">Cambios en pedidos foráneos</h2>

          <ul className="mt-5 space-y-4 text-gray-700">
            {pedidosForaneos.map((texto, index) => (
              <li key={index} className="flex gap-3 leading-7">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-black" />
                <span>{texto}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
            <span className="font-semibold text-black">Importante:</span> no se
            realizan devoluciones de dinero. Cuando aplique una solución
            distinta al cambio físico de la prenda, esta se atenderá conforme a
            la política vigente de la tienda.
          </div>
        </section>
      </div>
    </section>
  );
}