import HelpPage from "./HelpPage";
import BackButton from "../../components/BackButton";

const ENVIOS = [
  {
    id: "estandar",
    nombre: "Envío estándar nacional",
    tiempo: "2 a 7 días hábiles",
    tarifa: "$150.00 MXN",
    nota: "Ideal para compras con entrega regular dentro de la República Mexicana.",
  },
  {
    id: "express",
    nombre: "Envío nacional express",
    tiempo: "2 a 4 días hábiles",
    tarifa: "$250.00 MXN",
    nota: "La hora máxima para que tu paquete pueda ser enviado el mismo día es la 1:00 pm. Disponible de lunes a jueves.",
  },
  {
    id: "siguiente",
    nombre: "Envío día siguiente nacional",
    tiempo: "24 a 48 horas hábiles",
    tarifa: "$399.00 MXN",
    nota: "La hora máxima para que tu paquete pueda ser enviado el mismo día es la 1:00 pm. Disponible de lunes a jueves.",
  },
];

export default function HelpShipping() {
  return (
    <HelpPage
      title="Costos y tiempos de envío"
      lead="Aquí encontrarás la información sobre cobertura, tiempos estimados y tarifas de envío dentro de México."
    >
      <section>
        <BackButton className="mb-6 text-sm underline hover:opacity-70" />

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold md:text-3xl">
            Envíos y tarifas
          </h2>

          <p className="mt-4 leading-7 text-gray-700">
            Realizamos envíos a toda la República Mexicana. Trabajamos con
            paqueterías confiables como <span className="font-semibold">FedEx</span>,{" "}
            <span className="font-semibold">Estafeta</span> y{" "}
            <span className="font-semibold">DHL</span>, según disponibilidad y
            cobertura.
          </p>
        </div>
      </section>

      <section className="grid gap-4">
        {ENVIOS.map((envio) => (
          <article
            key={envio.id}
            className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-2xl font-extrabold md:text-3xl">
              {envio.nombre}
            </h2>

            <div className="mt-5 grid gap-3 text-gray-700">
              <p className="leading-7">
                <span className="font-semibold text-black">Tiempo estimado:</span>{" "}
                {envio.tiempo}
              </p>

              <p className="leading-7">
                <span className="font-semibold text-black">Tarifa:</span>{" "}
                {envio.tarifa}
              </p>

              <p className="leading-7">{envio.nota}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-extrabold md:text-3xl">
          Tiempos estimados
        </h2>

        <ul className="mt-4 space-y-3 text-gray-700">
          <li className="flex gap-3 leading-7">
            <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-black" />
            <span>Procesamiento del pedido: 1 a 2 días hábiles.</span>
          </li>

          <li className="flex gap-3 leading-7">
            <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-black" />
            <span>
              Los tiempos de entrega comienzan a contar una vez confirmado y
              procesado el pedido.
            </span>
          </li>

          <li className="flex gap-3 leading-7">
            <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-black" />
            <span>
              En temporadas altas, promociones o días festivos, los tiempos
              pueden variar ligeramente.
            </span>
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-extrabold md:text-3xl">Cobertura</h2>

        <p className="mt-4 leading-7 text-gray-700">
          Realizamos envíos dentro de México. Si tu zona no aparece disponible
          durante el checkout, contáctanos para revisar opciones de entrega.
        </p>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-extrabold md:text-3xl">Importante</h2>

        <ul className="mt-4 space-y-3 text-gray-700">
          <li className="flex gap-3 leading-7">
            <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-black" />
            <span>
              La hora máxima para salida el mismo día en envíos express y día
              siguiente es a la <span className="font-semibold text-black">1:00 pm</span>.
            </span>
          </li>

          <li className="flex gap-3 leading-7">
            <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-black" />
            <span>
              Las tarifas publicadas aplican a envíos nacionales conforme al
              tipo de servicio seleccionado.
            </span>
          </li>

          <li className="flex gap-3 leading-7">
            <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-black" />
            <span>
              El tipo de paquetería puede variar entre FedEx, Estafeta o DHL,
              según la mejor opción disponible para tu envío.
            </span>
          </li>
        </ul>
      </section>
    </HelpPage>
  );
}