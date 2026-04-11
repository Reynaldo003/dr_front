//src/public-site/components/CollectionTabs.jsx
import { useMemo, useState } from "react";
import { products } from "../data/products";

function Price({ value }) {
  const formatted = useMemo(() => value.toLocaleString("es-MX", { style: "currency", currency: "MXN" }), [value]);
  return <div className="mt-2 font-semibold">{formatted}</div>;
}

function ColorDots({ colors = [] }) {
  if (!Array.isArray(colors) || colors.length === 0) return null;

  return (
    <div className="absolute top-3 left-3 flex gap-2 z-10">
      {colors.map((c, i) => (
        <span
          key={i}
          className="w-2.5 h-2.5 rounded-full border border-white/60"
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

export default function CollectionTabs() {
  const [tab, setTab] = useState("Nueva colección");

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setTab("Nueva colección")}
            className={`text-3xl md:text-4xl font-extrabold ${tab === "Nueva colección" ? "text-black" : "text-gray-300"}`}
          >
            <span className="mr-3">●</span>Nueva colección
          </button>


        </div>

        <button className="rounded-full border px-8 py-3 text-sm font-semibold hover:bg-gray-50">
          VER TODO
        </button>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <article key={p.id} className="group">
            <div className="relative overflow-hidden rounded-2xl bg-gray-100">
              <img
                src={p.image}
                alt={p.title}
                className="h-[420px] w-full object-cover group-hover:scale-[1.02] transition"
              />
              <ColorDots colors={p.colors} />
              <span className="absolute bottom-3 right-3 rounded-full bg-black text-white text-xs px-3 py-1">
                {p.tag}
              </span>
            </div>

            <div className="mt-4 text-sm">{p.title}</div>
            <Price value={p.price} />
          </article>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-center gap-2">
        <span className="h-[2px] w-14 bg-black" />
        <span className="h-[2px] w-14 bg-gray-200" />
      </div>
    </section>
  );
}
