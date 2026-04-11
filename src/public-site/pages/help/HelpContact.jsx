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
          <li>WhatsApp: 271-208-07-28</li>
          <li>Correo: reynasmisdos@gmail.com</li>
          <li>Horario: Lun–Sab 10:00 a 19:00</li>
        </ul>
      </section>
    </HelpPage>
  );
}
