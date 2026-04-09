// src/pages/help/HelpReturns.jsx
import BackButton from "../../components/BackButton";

export default function HelpReturns() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-14">
         <BackButton className="mb-6 text-sm underline hover:opacity-70" />
      <h1 className="text-4xl md:text-5xl font-extrabold">Cambios y devoluciones</h1>
      <p className="mt-6 text-base text-gray-700">
        ¿No te quedó o no te gustó? Aquí están las políticas e instrucciones para hacer.
      </p>

      <h2 className="mt-12 text-2xl font-extrabold">Políticas de cambios</h2>
      <ul className="mt-4 list-disc pl-6 space-y-2 text-gray-700">
        <li>No hacemos devoluciones de dinero; únicamente cambios por talla o por otro artículo. (tu pagas tu guia)</li>
        <li>Si el artículo nuevo tiene mayor precio, se paga la diferencia.</li>
        <li>La prenda debe estar sin uso, con etiquetas y en su empaque original.</li>
      </ul>

      <h2 className="mt-12 text-2xl font-extrabold">¿Cómo hacer el cambio?</h2>
      <ol className="mt-4 list-decimal pl-6 space-y-2 text-gray-700">
        <li>Escríbenos por WhatsApp o correo con tu número de pedido.</li>
        <li>Te indicamos dirección/guía para retorno (si aplica).</li>
        <li>Al recibir la prenda, confirmamos y gestionamos el cambio.</li>
      </ol>
    </section>
  );
}
