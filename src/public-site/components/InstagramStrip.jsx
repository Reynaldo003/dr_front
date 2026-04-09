// src/components/InstagramStrip.jsx
import { useEffect, useMemo, useRef, useState } from "react";

function formatK(n) {
  if (n == null) return "";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".0", "") + "K";
  return String(n);
}

function getYoutubeVideoId(url) {
  if (!url) return "";

  try {
    const parsed = new URL(url);

    if (parsed.pathname.includes("/shorts/")) {
      const parts = parsed.pathname.split("/shorts/");
      return parts[1]?.split("/")[0]?.split("?")[0] || "";
    }

    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v") || "";
    }

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "").split("?")[0] || "";
    }

    return "";
  } catch {
    return "";
  }
}

function getYoutubeThumbnail(url) {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return "";
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function getYoutubeEmbedUrl(url) {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return "";
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
}

function ArrowBtn({ dir, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Anterior" : "Siguiente"}
      className={[
        "inline-flex h-11 w-11 items-center justify-center rounded-full",
        "border border-black/10 bg-white/85 backdrop-blur-md",
        "text-black shadow-sm transition-all duration-300",
        "hover:bg-white hover:shadow-md",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
        "disabled:cursor-not-allowed disabled:opacity-35",
      ].join(" ")}
    >
      <span className="text-xl leading-none">{dir === "left" ? "←" : "→"}</span>
    </button>
  );
}

function ShortsModal({ item, open, onClose }) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !item) return null;

  const embedUrl = getYoutubeEmbedUrl(item.href);

  return (
    <div className="fixed inset-0 z-[999]">
      {/* Fondo */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Contenedor centrado */}
      <div className="relative z-10 flex h-full w-full items-center justify-center p-2 sm:p-4 lg:p-6">
        <div
          className={[
            "relative w-full overflow-hidden rounded-[24px] bg-white",
            "shadow-[0_25px_80px_rgba(0,0,0,0.35)]",
            "max-h-[92vh] max-w-6xl",
            "flex flex-col",
          ].join(" ")}
        >
          {/* Header sticky */}
          <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-black/10 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="min-w-0">
              <h4 className="truncate text-base font-extrabold tracking-tight text-black sm:text-xl">
                {item.title || "YouTube Short"}
              </h4>
              <p className="truncate text-xs text-black/55 sm:text-sm">
                {item.subtitle || "Reproduciendo en la página"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:bg-gray-50"
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </div>

          {/* Cuerpo scrollable */}
          <div className="overflow-y-auto">
            <div className="grid lg:grid-cols-[minmax(320px,420px)_1fr]">
              {/* Player */}
              <div className="bg-black px-3 py-4 sm:px-6 sm:py-5">
                <div className="mx-auto aspect-[9/16] w-full max-w-[380px] overflow-hidden rounded-[22px] bg-black shadow-2xl">
                  {embedUrl ? (
                    <iframe
                      className="h-full w-full"
                      src={embedUrl}
                      title={item.title || "YouTube Short"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-white/80">
                      No se pudo cargar el video.
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col justify-between bg-white p-4 sm:p-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold tracking-wide text-white">
                      SHORT
                    </span>
                    <span className="rounded-full border border-black/10 bg-gray-50 px-3 py-1 text-xs font-semibold tracking-wide text-black">
                      YOUTUBE
                    </span>
                  </div>

                  <h5 className="mt-4 text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
                    {item.title || "Nuevo short"}
                  </h5>

                  <p className="mt-3 text-sm leading-6 text-black/65 sm:text-base">
                    {item.description ||
                      item.subtitle ||
                      "Descubre más detalles de este contenido y mira el short completo directamente desde la página."}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-black/70">
                    {item.views != null ? (
                      <span className="rounded-full border border-black/10 bg-gray-50 px-3 py-2">
                        👁 {formatK(item.views)} vistas
                      </span>
                    ) : null}

                    {item.likes != null ? (
                      <span className="rounded-full border border-black/10 bg-gray-50 px-3 py-2">
                        ❤ {formatK(item.likes)} likes
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-8">
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Ver en YouTube →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShortCard({ item, onOpen }) {
  const thumbnail = item.thumbnail || getYoutubeThumbnail(item.href);

  return (
    <button
      type="button"
      onClick={() => onOpen?.(item)}
      className="group block w-full shrink-0 text-left focus:outline-none"
    >
      <div
        className={[
          "relative overflow-hidden rounded-[28px]",
          "bg-neutral-200 shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
          "transition-all duration-500",
          "hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.14)]",
          "focus-visible:ring-2 focus-visible:ring-black/20",
        ].join(" ")}
      >
        <div className="relative h-[420px] overflow-hidden sm:h-[500px]">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={item.title || "YouTube Short"}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-neutral-200 to-neutral-300" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/5" />
          <div className="absolute inset-0 bg-black/10 transition duration-500 group-hover:bg-black/20" />

          <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
            <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold tracking-wide text-black shadow">
              SHORT
            </span>

            <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-black shadow">
              YOUTUBE
            </span>
          </div>

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white/92 text-black shadow-lg transition duration-300 group-hover:scale-105">
              ▶
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h4 className="truncate text-[22px] font-extrabold leading-none tracking-tight text-white drop-shadow sm:text-[26px]">
                  {item.title || "Nuevo short"}
                </h4>

                <p className="mt-2 truncate text-sm text-white/90 sm:text-base">
                  {item.subtitle || "Reproducir short"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 text-xs text-white/95">
                {item.views != null ? (
                  <span className="rounded-full bg-black/30 px-2.5 py-1 backdrop-blur">
                    👁 {formatK(item.views)}
                  </span>
                ) : null}

                {item.likes != null ? (
                  <span className="rounded-full bg-black/30 px-2.5 py-1 backdrop-blur">
                    ❤ {formatK(item.likes)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function InstagramStrip() {
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const trackRef = useRef(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const items = useMemo(
    () => [
      {
        title: "Invitación",
        subtitle: "Mira este look en video",
        href: "https://youtube.com/shorts/Xb9Hoo8c0AY?feature=share",
        views: 12400,
        likes: 820,
        description:
          "Conoce este short y descubre un adelanto de la esencia de Mis Dos Reynas.",
      },
      {
        title: "Por qué Mis Dos Reynas",
        subtitle: "Inspiración para tu próximo look",
        href: "https://youtube.com/shorts/O-t9OIm17es?feature=share",
        views: 9800,
        likes: 540,
        description:
          "Te contamos un poco más sobre la boutique y el estilo que queremos transmitir.",
      },
      {
        title: "Lanzamiento de página web",
        subtitle: "Nuevo drop disponible",
        href: "https://youtube.com/shorts/2SV-h48UQOc",
        views: 20100,
        likes: 1330,
        description:
          "Celebramos el lanzamiento de la página con un short especial para la comunidad.",
      },
      {
        title: "Boutique Mis Dos Reynas",
        subtitle: "Disponible ya",
        href: "https://youtube.com/shorts/nKot1Z78I74",
        views: 8700,
        likes: 410,
        description:
          "Descubre más de la colección y el estilo visual de la boutique.",
      },
      {
        title: "Boutique Mis Dos Reynas II",
        subtitle: "Disponible ya",
        href: "https://youtube.com/shorts/elNPpLAtXoo?feature=share",
        views: 8700,
        likes: 410,
        description:
          "Otro vistazo al estilo y esencia de la boutique en formato short.",
      },
    ],
    []
  );

  useEffect(() => {
    const updateCanScroll = () => {
      const el = trackRef.current;
      if (!el) return;

      setCanScroll({
        left: el.scrollLeft > 2,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
      });
    };

    updateCanScroll();

    const el = trackRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateCanScroll, { passive: true });
    window.addEventListener("resize", updateCanScroll);

    return () => {
      el.removeEventListener("scroll", updateCanScroll);
      window.removeEventListener("resize", updateCanScroll);
    };
  }, [items.length]);

  const scrollByCards = (dir) => {
    const el = trackRef.current;
    if (!el) return;

    const step = Math.max(320, Math.floor(el.clientWidth * 0.88));
    el.scrollBy({
      left: dir === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  const handleOpen = (item) => {
    setSelected(item);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <>
      <section className="mx-auto max-w-[1600px] px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <h3 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl lg:text-5xl">
              Shorts de la boutique
            </h3>

            <p className="mt-2 max-w-2xl text-sm text-black/60 sm:text-base">
              Mira nuestros videos más recientes sin salir de la página.
            </p>
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
            {items.map((item, index) => (
              <div
                key={index}
                className="w-[82%] shrink-0 snap-start sm:w-[48%] lg:w-[31%] xl:w-[24%]"
              >
                <ShortCard item={item} onOpen={handleOpen} />
              </div>
            ))}
          </div>

          {canScroll.left && (
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent" />
          )}

          {canScroll.right && (
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent" />
          )}
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

      <ShortsModal item={selected} open={open} onClose={handleClose} />
    </>
  );
}