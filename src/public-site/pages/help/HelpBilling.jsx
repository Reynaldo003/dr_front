import HelpPage from "./HelpPage";
import BackButton from "../../components/BackButton";

export default function HelpBilling() {
  return (
    <HelpPage
      title="Facturación"
      lead="Te ayudamos a solicitar tu factura de forma correcta."
    >
      <section>
        <BackButton className="mb-6 text-sm underline hover:opacity-70" />
        <h2 className="text-2xl md:text-3xl font-extrabold">Requisitos</h2>
        <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-2">
          <li>RFC</li>
          <li>Razón social</li>
          <li>Uso de CFDI</li>
          <li>Correo</li>
          <li>Número de pedido</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl md:text-3xl font-extrabold">Tiempo de respuesta</h2>
        <p className="mt-4 text-gray-700">
          Normalmente enviamos la factura en 24–48 horas hábiles.
        </p>
      </section>
    </HelpPage>
  );
}
