import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerCategoriasPublicas } from "../lib/apiPublic";
import { categories as categoriasLocales } from "../data/categories";

function ArrowBtn({ dir, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Anterior" : "Siguiente"}
      className={[
        "inline-flex h-11 w-11 items-center justify-center rounded-full",
        "border border-black/10 bg-white/80 backdrop-blur-md",
        "text-black shadow-sm transition-all duration-300",
        "hover:bg-white hover:shadow-md",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
        "disabled:cursor-not-allowed disabled:opacity-35",
      ].join(" ")}
    >
      <span className="text-xl leading-none">{dir === "left" ? "←" : "→"}</span>
      <span className="sr-only">{dir === "left" ? "Anterior" : "Siguiente"}</span>
    </button>
  );
}

function normalizarTexto(texto = "") {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

function resolverImagenCategoria(item) {
  return (
    item?.image ||
    item?.imagen ||
    item?.imagen_url ||
    item?.foto ||
    item?.banner ||
    item?.portada ||
    item?.miniatura ||
    item?.thumbnail ||
    null
  );
}

function adaptarCategoriasLocales(items = []) {
  return items.map((item) => ({
    id: item.id,
    title: item.name,
    to: item.href,
    image: item.image,
    slug: item.slug,
  }));
}

function buscarCategoriaLocal(itemBackend) {
  const claveBackend = normalizarTexto(itemBackend?.slug || itemBackend?.nombre);

  return categoriasLocales.find((itemLocal) => {
    const claveLocal = normalizarTexto(itemLocal?.slug || itemLocal?.name);
    return claveLocal === claveBackend;
  });
}

function CategoryCard({ title, image, to }) {
  return (
    <Link
      to={to || "#"}
      className={[
        "group relative block overflow-hidden rounded-[28px]",
        "bg-neutral-200 shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
        "transition-all duration-500",
        "hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.14)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
      ].join(" ")}
    >
      <div className="relative h-[420px] overflow-hidden sm:h-[500px] lg:h-[560px]">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 via-neutral-100 to-white" />
            <div className="absolute inset-0 opacity-70 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.08),transparent_60%)]" />
            <div className="absolute inset-0 opacity-60 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/5" />
        <div className="absolute inset-0 bg-black/10 transition duration-500 group-hover:bg-black/20" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="flex items-end justify-between gap-3">
            <h3 className="text-[34px] font-extrabold leading-none tracking-tight text-white drop-shadow-md sm:text-[42px] md:text-[46px]">
              {title}
            </h3>

            <span
              className={[
                "mb-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                "border border-white/30 bg-white/15 text-white backdrop-blur-md",
                "transition-all duration-300 group-hover:bg-white group-hover:text-black",
              ].join(" ")}
            >
              ↗
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CategoryStrip({
  title = "Compra por categoría",
  subtitle = "Explora colecciones seleccionadas para ti.",
}) {
  const trackRef = useRef(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });
  const [items, setItems] = useState(() => adaptarCategoriasLocales(categoriasLocales));

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const updateCanScroll = () => {
    const el = trackRef.current;
    if (!el) return;

    setCanScroll({
      left: el.scrollLeft > 2,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    });
  };

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const data = await obtenerCategoriasPublicas();
        if (!activo) return;

        const categoriasBackend = (Array.isArray(data) ? data : []).map((item) => {
          const categoriaLocal = buscarCategoriaLocal(item);
          const slug =
            item?.slug ||
            categoriaLocal?.slug ||
            normalizarTexto(item?.nombre || categoriaLocal?.name || "");

          return {
            id: item?.id ?? item?.slug ?? item?.nombre ?? slug,
            title: item?.nombre || categoriaLocal?.name || "Categoría",
            to: item?.slug
              ? `/catalogo/${item.slug}`
              : categoriaLocal?.href || (slug ? `/catalogo/${slug}` : "#"),
            image: resolverImagenCategoria(item) || categoriaLocal?.image || null,
          };
        });

        if (categoriasBackend.length > 0) {
          setItems(categoriasBackend);
        } else {
          setItems(adaptarCategoriasLocales(categoriasLocales));
        }
      } catch (error) {
        setItems(adaptarCategoriasLocales(categoriasLocales));
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    updateCanScroll();

    const el = trackRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateCanScroll, { passive: true });
    window.addEventListener("resize", updateCanScroll);

    return () => {
      el.removeEventListener("scroll", updateCanScroll);
      window.removeEventListener("resize", updateCanScroll);
    };
  }, [safeItems.length]);

  const scrollByCards = (dir) => {
    const el = trackRef.current;
    if (!el) return;

    const step = Math.max(320, Math.floor(el.clientWidth * 0.88));
    el.scrollBy({
      left: dir === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="shop-categories"
      className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-20"
    >
      <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl lg:text-5xl">
            {title}
          </h2>

          {subtitle ? (
            <p className="mt-2 text-sm text-black/60 sm:text-base">{subtitle}</p>
          ) : null}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <ArrowBtn
            dir="left"
            onClick={() => scrollByCards("left")}
            disabled={!canScroll.left}
          />
          <ArrowBtn
            dir="right"
            onClick={() => scrollByCards("right")}
            disabled={!canScroll.right}
          />
        </div>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          className={[
            "flex gap-4 overflow-x-auto pb-3 sm:gap-5 lg:gap-6",
            "snap-x snap-mandatory scroll-smooth",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          ].join(" ")}
        >
          {safeItems.map((item) => (
            <div
              key={item.id ?? item.title}
              className={[
                "snap-start shrink-0",
                "w-[82%] sm:w-[48%] lg:w-[31%] xl:w-[28%]",
              ].join(" ")}
            >
              <CategoryCard title={item.title} image={item.image} to={item.to} />
            </div>
          ))}
        </div>

        {canScroll.left ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent" />
        ) : null}

        {canScroll.right ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent" />
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 sm:hidden">
        <ArrowBtn
          dir="left"
          onClick={() => scrollByCards("left")}
          disabled={!canScroll.left}
        />
        <ArrowBtn
          dir="right"
          onClick={() => scrollByCards("right")}
          disabled={!canScroll.right}
        />
      </div>
    </section>
  );
}