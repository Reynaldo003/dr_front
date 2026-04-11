// src/pages/HelpTrack.jsx
import BackButton from "../../components/BackButton";

const NEGOCIO = "Mis Dos Reynas";
const SUCURSAL = "San Jose";
const TITULAR = "Teresa de Jesús Martínez Tepepa";
const DOMICILIO = "CALLE 10 ENTRE AV 3, SAN JOSE #312 CÓRDOBA VER. 94560";

export default function HelpTrack() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14">
      <BackButton className="mb-6 text-sm underline hover:opacity-70" />

      <header className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/60">
          {NEGOCIO}
        </p>

        <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
          Aviso de privacidad
        </h1>

        <p className="mt-4 text-base leading-7 text-gray-700">
          En cumplimiento con las disposiciones aplicables en materia de
          protección de datos personales, se informa a los usuarios, clientes y
          público en general el presente aviso de privacidad respecto del
          tratamiento de sus datos personales.
        </p>
      </header>

      <div className="mt-8 grid gap-6">
        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold">1. Responsable de los datos personales</h2>

          <p className="mt-4 leading-7 text-gray-700">
            La responsable del tratamiento de los datos personales es{" "}
            <span className="font-semibold text-black">{TITULAR}</span>, titular
            de la sucursal{" "}
            <span className="font-semibold text-black">{SUCURSAL}</span> de{" "}
            <span className="font-semibold text-black">{NEGOCIO}</span>.
          </p>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold">2. Domicilio</h2>

          <p className="mt-4 leading-7 text-gray-700">
            Para efectos del presente aviso de privacidad, el domicilio de la
            responsable es:
          </p>

          <div className="mt-4 rounded-2xl bg-gray-50 p-4">
            <p className="font-semibold text-black">{DOMICILIO}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold">3. Datos personales que se pueden recabar</h2>

          <p className="mt-4 leading-7 text-gray-700">
            Para brindar atención, ventas, seguimiento de pedidos, cambios,
            devoluciones, facturación y demás servicios relacionados con la
            actividad comercial del establecimiento, se podrán recabar de manera
            directa datos personales como:
          </p>

          <ul className="mt-5 space-y-3 text-gray-700">
            {[
              "Nombre completo.",
              "Número telefónico.",
              "Correo electrónico.",
              "Domicilio de envío o facturación.",
              "Datos del pedido o compra realizada.",
              "Información necesaria para atención al cliente y seguimiento postventa.",
            ].map((texto, index) => (
              <li key={index} className="flex gap-3 leading-7">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-black" />
                <span>{texto}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 leading-7 text-gray-700">
            No se recaban datos personales sensibles salvo que resulte
            estrictamente necesario para alguna gestión específica y con la
            debida atención.
          </p>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold">4. Finalidades del tratamiento</h2>

          <p className="mt-4 leading-7 text-gray-700">
            Los datos personales recabados serán utilizados para las siguientes
            finalidades primarias:
          </p>

          <ul className="mt-5 space-y-3 text-gray-700">
            {[
              "Procesar compras y pedidos.",
              "Dar seguimiento a entregas, cambios y devoluciones.",
              "Contactar al cliente para aclaraciones relacionadas con su compra.",
              "Brindar atención al cliente y soporte.",
              "Emitir comprobantes o facturación cuando corresponda.",
              "Mantener control interno de ventas y operaciones comerciales.",
            ].map((texto, index) => (
              <li key={index} className="flex gap-3 leading-7">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-black" />
                <span>{texto}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 leading-7 text-gray-700">
            De manera adicional, los datos podrían utilizarse para fines de
            contacto comercial, promociones, seguimiento de satisfacción o
            información sobre productos, siempre que ello resulte acorde con la
            relación comercial existente.
          </p>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold">5. Protección y resguardo de la información</h2>

          <p className="mt-4 leading-7 text-gray-700">
            La responsable adopta medidas razonables de seguridad
            administrativas, técnicas y físicas para procurar la protección de
            los datos personales contra daño, pérdida, alteración, destrucción o
            uso no autorizado.
          </p>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold">6. Transferencia de datos</h2>

          <p className="mt-4 leading-7 text-gray-700">
            Los datos personales no serán compartidos con terceros ajenos, salvo
            cuando sea necesario para cumplir obligaciones derivadas de la
            relación comercial, por ejemplo con servicios de paquetería,
            plataformas de pago, facturación o cuando exista requerimiento legal
            de autoridad competente.
          </p>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold">7. Derechos de acceso, rectificación, cancelación y oposición</h2>

          <p className="mt-4 leading-7 text-gray-700">
            La persona titular de los datos personales podrá solicitar el acceso,
            rectificación, cancelación u oposición respecto de sus datos, así
            como manifestar dudas sobre su tratamiento, acudiendo directamente al
            domicilio de la sucursal:
          </p>

          <div className="mt-4 rounded-2xl bg-gray-50 p-4">
            <p className="font-semibold text-black">{SUCURSAL}</p>
            <p className="mt-1 text-gray-700">{DOMICILIO}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold">8. Cambios al aviso de privacidad</h2>

          <p className="mt-4 leading-7 text-gray-700">
            El presente aviso de privacidad puede ser modificado o actualizado en
            cualquier momento para reflejar cambios en prácticas internas,
            disposiciones legales o necesidades operativas del negocio. Cualquier
            modificación se pondrá a disposición de los usuarios por los medios
            que la responsable considere adecuados.
          </p>
        </section>
      </div>
    </section>
  );
}