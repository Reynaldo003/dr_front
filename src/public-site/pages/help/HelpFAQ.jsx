import HelpPage from "./HelpPage";
import BackButton from "../../components/BackButton";

export default function HelpFAQ() {
  return (
    <HelpPage
      title="Preguntas frecuentes"
      lead="Respuestas rápidas a las dudas más comunes."
    >
      <section>
        <BackButton className="mb-6 text-sm underline hover:opacity-70" />
        <h2 className="text-2xl md:text-3xl font-extrabold">¿Cómo compro?</h2>
        <p className="mt-4 text-gray-700">
          Selecciona tu producto, elige talla/color, agrega al carrito y finaliza en checkout.
        </p>
      </section>

      <section>
        <h2 className="text-2xl md:text-3xl font-extrabold">¿Puedo cambiar mi talla?</h2>
        <p className="mt-4 text-gray-700">
          Sí, revisa la sección de Cambios y devoluciones para conocer requisitos y pasos.
        </p>
      </section>
    </HelpPage>
  );
}
