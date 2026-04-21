import { memo, useCallback, useEffect, useRef, useState } from "react";

const PRICE_FORMATTER = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const ArrowBtn = memo(function ArrowBtn({ dir, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Anterior" : "Siguiente"}
      className={[
        "inline-flex h-11 w-11 items-center justify-center rounded-full",
        "border border-black/10 bg-white/80 text-black shadow-sm backdrop-blur-md transition-all duration-300",
        "hover:bg-white hover:shadow-md",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
        "disabled:cursor-not-allowed disabled:opacity-35",
      ].join(" ")}
    >
      <span className="text-xl leading-none">{dir === "left" ? "←" : "→"}</span>
      <span className="sr-only">{dir === "left" ? "Anterior" : "Siguiente"}</span>
    </button>
  );
});

function formatPrice(value) {
  return PRICE_FORMATTER.format(Number(value) || 0);
}

const ProductCard = memo(function ProductCard({ product, onOpen, priority = false }) {
  const image = product?.images?.[0] || product?.image || "";

  const handleClick = useCallback(() => {
    onOpen?.(product);
  }, [onOpen, product]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "group relative block w-full overflow-hidden rounded-[28px] text-left",
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
            alt={product?.name || product?.title || "Producto"}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "low"}
            decoding="async"
            sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 31vw, (min-width: 640px) 48vw, 82vw"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-neutral-200 via-neutral-100 to-white" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5" />
        <div className="absolute inset-0 bg-black/10 transition duration-500 group-hover:bg-black/20" />

        {product?.badge ? (
          <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold tracking-wide text-black shadow-sm backdrop-blur">
            {product.badge}
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-[24px] font-extrabold leading-none tracking-tight text-white drop-shadow-md sm:text-[28px] md:text-[32px]">
                {product?.name || product?.title || "Producto"}
              </h3>

              <p className="mt-2 text-base font-semibold text-white/95 drop-shadow sm:text-lg">
                {formatPrice(product?.price)}
              </p>
            </div>

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
    </button>
  );
});

export default memo(function ProductGrid({
  items = [],
  onOpen,
  title = "Nueva colección",
  subtitle = "Explora piezas seleccionadas para ti.",
}) {
  const trackRef = useRef(null);
  const rafRef = useRef(0);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const safeItems = Array.isArray(items) ? items : [];

  const updateCanScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const nextState = {
      left: el.scrollLeft > 2,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    };

    setCanScroll((prev) => {
      if (prev.left === nextState.left && prev.right === nextState.right) {
        return prev;
      }
      return nextState;
    });
  }, []);

  const scheduleUpdateCanScroll = useCallback(() => {
    if (rafRef.current) return;

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = 0;
      updateCanScroll();
    });
  }, [updateCanScroll]);

  useEffect(() => {
    updateCanScroll();

    const el = trackRef.current;
    if (!el) return;

    el.addEventListener("scroll", scheduleUpdateCanScroll, { passive: true });
    window.addEventListener("resize", scheduleUpdateCanScroll);

    return () => {
      el.removeEventListener("scroll", scheduleUpdateCanScroll);
      window.removeEventListener("resize", scheduleUpdateCanScroll);

      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [safeItems.length, scheduleUpdateCanScroll, updateCanScroll]);

  const scrollByCards = useCallback((dir) => {
    const el = trackRef.current;
    if (!el) return;

    const step = Math.max(320, Math.floor(el.clientWidth * 0.88));
    el.scrollBy({
      left: dir === "left" ? -step : step,
      behavior: "smooth",
    });
  }, []);

  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20">
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

      {safeItems.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/60">
          No hay productos disponibles por el momento.
        </div>
      ) : (
        <>
          <div className="relative">
            <div
              ref={trackRef}
              className={[
                "flex gap-4 overflow-x-auto pb-3 sm:gap-5 lg:gap-6",
                "snap-x snap-mandatory scroll-smooth",
                "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              ].join(" ")}
            >
              {safeItems.map((product, index) => (
                <div
                  key={product?.id ?? `${product?.name}-${index}`}
                  className={[
                    "snap-start shrink-0",
                    "w-[82%] sm:w-[48%] lg:w-[31%] xl:w-[28%]",
                  ].join(" ")}
                >
                  <ProductCard
                    product={product}
                    onOpen={onOpen}
                    priority={index < 2}
                  />
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
        </>
      )}
    </section>
  );
});