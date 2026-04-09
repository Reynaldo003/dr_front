import HelpPage from "./HelpPage";
import BackButton from "../../components/BackButton";

export default function HelpShipping() {
  return (
    <HelpPage
      title="Costos y tiempos de envío"
      lead="Aquí encontrarás la información sobre tiempos estimados, costos y cobertura de envíos."
    >
      <section>
        <BackButton className="mb-6 text-sm underline hover:opacity-70" />
        <h2 className="text-2xl md:text-3xl font-extrabold">Tiempos estimados</h2>
        <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-2">
          <li>Procesamiento: 1–2 días hábiles.</li>
          <li>Envío estándar: 2–5 días hábiles (según zona).</li>
          <li>En temporadas altas puede variar ligeramente.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl md:text-3xl font-extrabold">Costos</h2>
        <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-2">
          <li>El costo se calcula en checkout según tu CP.</li>
          <li>Promociones de envío gratis se mostrarán automáticamente.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl md:text-3xl font-extrabold">Cobertura</h2>
        <p className="mt-4 text-gray-700">
          Realizamos envíos dentro de México. Si tu zona no aparece en checkout, contáctanos y lo revisamos.
        </p>
      </section>
    </HelpPage>
  );
}
