import HelpPage from "./HelpPage";
import BackButton from "../../components/BackButton";

export default function HelpContact() {
  return (
    <HelpPage
      title="Contacto"
      lead="Escríbenos y te respondemos lo antes posible."
    >
      <section>
        <BackButton className="mb-6 text-sm underline hover:opacity-70" />
        <h2 className="text-2xl md:text-3xl font-extrabold">Canales</h2>
        <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-2">
          <li>WhatsApp: (pon aquí tu número)</li>
          <li>Correo: (pon aquí tu correo)</li>
          <li>Horario: Lun–Vie 10:00 a 18:00</li>
        </ul>
      </section>
    </HelpPage>
  );
}
