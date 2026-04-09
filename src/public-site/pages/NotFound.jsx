import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-4xl font-extrabold">Página no encontrada</h1>
      <p className="mt-3 text-black/60">
        La ruta no existe o fue movida.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-full border px-5 py-3 text-sm hover:bg-gray-50"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
