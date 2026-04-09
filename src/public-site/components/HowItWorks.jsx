export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="rounded-[28px] border border-black/10 bg-[#f8f8f8] p-6 sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/50">
          Cómo funciona
        </p>

        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
          Comprar en Mis Dos Reynas es muy fácil
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65 sm:text-base">
          Explora nuestras categorías, elige tus prendas favoritas y realiza tu pedido
          de forma rápida y sencilla.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="text-2xl font-extrabold text-black">01</div>
            <h3 className="mt-3 text-xl font-bold text-black">Explora</h3>
            <p className="mt-2 text-sm leading-6 text-black/65">
              Revisa categorías, nuevas llegadas, looks y videos para descubrir piezas
              que te gusten.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="text-2xl font-extrabold text-black">02</div>
            <h3 className="mt-3 text-xl font-bold text-black">Elige</h3>
            <p className="mt-2 text-sm leading-6 text-black/65">
              Abre el producto, revisa precio, detalles y disponibilidad antes de hacer
              tu pedido.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="text-2xl font-extrabold text-black">03</div>
            <h3 className="mt-3 text-xl font-bold text-black">Compra</h3>
            <p className="mt-2 text-sm leading-6 text-black/65">
              Finaliza tu compra o contáctanos por WhatsApp para atención rápida,
              dudas y seguimiento.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <a
            href="https://wa.me/522712080728"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Pedir por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}