// src/components/Stores.jsx
export default function Stores() {
  const store = {
    city: "Córdoba, Veracruz",
    addressLine: "C10 1312, Centro, 94500, Córdoba, Ver. Méx.",
    phoneDisplay: "271 208 0728",
    phoneRaw: "5212712080728",
    mapsShareUrl: "https://maps.app.goo.gl/PpYr1LfsCFK3L9paA",
    mapLat: "18.8967167",
    mapLng: "-96.9392413",
    hours: [
      { label: "Lunes - sabado", value: "10:00 am – 7:00 pm" }
    ],
  };

  const mapsUrl = store.mapsShareUrl;
  const whatsappUrl = `https://wa.me/${store.phoneRaw}?text=Hola,%20quiero%20informaci%C3%B3n%20sobre%20la%20tienda`;
  const mapEmbedUrl = `https://www.google.com/maps?q=${store.mapLat},${store.mapLng}&z=17&output=embed`;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 py-14 md:py-20">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs tracking-[0.22em] font-semibold text-gray-500 uppercase">
            Showroom
          </p>

          <h2 className="mt-3 text-4xl md:text-6xl font-extrabold tracking-tight text-black">
            Visítanos
          </h2>

          <p className="mt-4 text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Dirección, horario y contacto. Si necesitas ayuda para llegar, escríbenos y te guiamos.
          </p>
        </div>

        {/* Content */}
        <div className="mt-10 md:mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
          {/* Info Card */}
          <div className="rounded-3xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-xs font-bold tracking-[0.18em] text-gray-500 uppercase">
                  Ubicación
                </div>

                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-black">
                  {store.city}
                </div>
              </div>

              <div className="shrink-0 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700">
                Atención en tienda
              </div>
            </div>

            {/* Address */}
            <div className="mt-7">
              <div className="flex items-start gap-3">
                <span className="mt-[2px] inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200">
                  📍
                </span>

                <div className="flex-1">
                  <div className="text-sm font-bold text-black">Dirección</div>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm text-gray-700 underline decoration-gray-300 underline-offset-4 hover:text-black"
                  >
                    {store.addressLine}
                  </a>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="mt-7">
              <div className="flex items-start gap-3">
                <span className="mt-[2px] inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200">
                  🕒
                </span>

                <div className="flex-1">
                  <div className="text-sm font-bold text-black">Horario</div>

                  <div className="mt-2 space-y-2">
                    {store.hours.map((h) => (
                      <div
                        key={h.label}
                        className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2 last:border-b-0 last:pb-0"
                      >
                        <div className="text-sm text-gray-600">{h.label}</div>
                        <div className="text-sm font-semibold text-black">
                          {h.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="mt-7">
              <div className="flex items-start gap-3">
                <span className="mt-[2px] inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200">
                  📞
                </span>

                <div className="flex-1">
                  <div className="text-sm font-bold text-black">Teléfono</div>

                  <a
                    href={`tel:${store.phoneDisplay.replace(/\s/g, "")}`}
                    className="mt-1 inline-block text-sm text-gray-700 underline decoration-gray-300 underline-offset-4 hover:text-black"
                  >
                    {store.phoneDisplay}
                  </a>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="h-12 rounded-2xl border border-black bg-black text-white font-semibold text-sm flex items-center justify-center hover:opacity-90 transition"
              >
                Cómo llegar
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="h-12 rounded-2xl border border-gray-200 bg-white text-black font-semibold text-sm flex items-center justify-center hover:bg-gray-50 transition"
              >
                WhatsApp
              </a>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              *Si vienes por una prenda específica, te recomendamos preguntar disponibilidad antes.
            </p>
          </div>

          {/* Map */}
          <div className="rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] min-h-[360px]">
            <iframe
              title="Mapa - Mis Dos Reynas"
              className="w-full h-full min-h-[360px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapEmbedUrl}
            />
          </div>
        </div>
      </div>
    </section>
  );
}