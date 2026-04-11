import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "../context/cart";
import Reviews from "./Reviews";

function buildVariantKey(color = "", talla = "") {
  return `${String(color).trim()}__${String(talla).trim()}`;
}

export default function ProductModal({ open, product, onClose, onAddToCart }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);

  const startX = useRef(null);
  const { addItem } = useCart();

  const images = useMemo(() => product?.images ?? [], [product]);
  const colors = useMemo(() => product?.colors ?? [], [product]);
  const sizes = useMemo(() => product?.sizes ?? [], [product]);
  const variantStockMap = useMemo(() => product?.variantStockMap ?? {}, [product]);

  const getStock = (color, size) => {
    return Number(variantStockMap[buildVariantKey(color, size)] || 0);
  };

  const colorStockMap = useMemo(() => {
    const result = {};

    colors.forEach((color) => {
      result[color.name] = sizes.reduce((acc, size) => {
        return acc + getStock(color.name, size);
      }, 0);
    });

    return result;
  }, [colors, sizes, variantStockMap]);

  const selectedVariantStock = useMemo(() => {
    if (!selectedColor || !selectedSize) return 0;
    return getStock(selectedColor, selectedSize);
  }, [selectedColor, selectedSize, variantStockMap]);

  useEffect(() => {
    if (!open || !product) return;

    setImgIndex(0);
    setZoom(false);
    setQty(1);

    const primerColorDisponible =
      colors.find((c) => Number(colorStockMap[c.name] || 0) > 0)?.name || null;

    setSelectedColor(primerColorDisponible);

    if (primerColorDisponible) {
      const primeraTallaDisponible =
        sizes.find((size) => getStock(primerColorDisponible, size) > 0) || null;
      setSelectedSize(primeraTallaDisponible);
    } else {
      setSelectedSize(null);
    }
  }, [open, product, colors, sizes, colorStockMap]);

  useEffect(() => {
    if (!open || !selectedColor) return;

    const tallaSigueDisponible = selectedSize
      ? getStock(selectedColor, selectedSize) > 0
      : false;

    if (tallaSigueDisponible) return;

    const primeraTallaDisponible =
      sizes.find((size) => getStock(selectedColor, size) > 0) || null;

    setSelectedSize(primeraTallaDisponible);
    setQty(1);
  }, [open, selectedColor, selectedSize, sizes, variantStockMap]);

  useEffect(() => {
    if (!open) return;

    if (selectedVariantStock <= 0) {
      setQty(1);
      return;
    }

    if (qty > selectedVariantStock) {
      setQty(selectedVariantStock);
    }
  }, [open, qty, selectedVariantStock]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, imgIndex, images.length, onClose]);

  if (!open || !product) return null;

  const next = () => {
    if (!images.length) return;
    setZoom(false);
    setImgIndex((i) => (i + 1) % images.length);
  };

  const prev = () => {
    if (!images.length) return;
    setZoom(false);
    setImgIndex((i) => (i - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e) => {
    startX.current = e.touches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    if (startX.current == null || endX == null) return;

    const delta = endX - startX.current;
    if (Math.abs(delta) < 40) return;

    if (delta < 0) next();
    else prev();
  };

  const fmt = (n) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(Number(n || 0));

  const currentImage = images[imgIndex];
  const puedeAgregar =
    Boolean(selectedColor) &&
    Boolean(selectedSize) &&
    Number(selectedVariantStock || 0) > 0;

  return (
    <div className="fixed inset-0 z-[999]">
      <button
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Cerrar"
      />

      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-5">
        <div
          className="max-h-[92vh] w-[min(1100px,96vw)] overflow-hidden rounded-3xl bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
            <h3 className="text-base font-semibold sm:text-lg">{product.name}</h3>

            <button
              onClick={onClose}
              className="rounded-full p-2 transition hover:bg-gray-100"
              aria-label="Cerrar"
              title="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="grid h-[calc(92vh-64px)] grid-cols-1 lg:grid-cols-2">
            <div className="overflow-y-auto border-b p-4 sm:p-5 lg:border-b-0 lg:border-r">
              <div
                className="relative overflow-hidden rounded-2xl border bg-gray-100"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="h-[38vh] sm:h-[46vh] md:h-[54vh] lg:h-[62vh]">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={product.name}
                      className={[
                        "h-full w-full select-none object-contain transition-transform duration-200",
                        zoom ? "scale-110 cursor-zoom-out" : "cursor-zoom-in",
                      ].join(" ")}
                      draggable={false}
                      onClick={() => setZoom((z) => !z)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
                    >
                      ‹
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {images.map((src, idx) => (
                    <button
                      key={src + idx}
                      onClick={() => {
                        setZoom(false);
                        setImgIndex(idx);
                      }}
                      className={[
                        "shrink-0 rounded-xl overflow-hidden border",
                        idx === imgIndex ? "border-black" : "border-transparent",
                      ].join(" ")}
                    >
                      <img
                        src={src}
                        alt={`${product.name} ${idx + 1}`}
                        className="h-16 w-16 object-cover"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-y-auto p-4 sm:p-6">
              <div className="flex items-center gap-3">
                {product.badge ? (
                  <span className="inline-flex items-center rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                    {product.badge}
                  </span>
                ) : null}

                <div className="text-2xl font-extrabold">{fmt(product.price)}</div>
              </div>

              <p className="mt-2 text-gray-600">{product.description}</p>

              <div className="mt-6">
                <div className="text-sm font-semibold">Color</div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {colors.map((c) => {
                    const active = selectedColor === c.name;
                    const sinStockColor = Number(colorStockMap[c.name] || 0) <= 0;

                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          if (sinStockColor) return;
                          setSelectedColor(c.name);
                        }}
                        disabled={sinStockColor}
                        className={[
                          "flex items-center gap-2 rounded-full border px-4 py-2 text-sm",
                          active ? "border-black" : "border-gray-200",
                          sinStockColor ? "cursor-not-allowed opacity-40" : "",
                        ].join(" ")}
                      >
                        <span
                          className="h-4 w-4 rounded-full border"
                          style={{ background: c.hex }}
                        />
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm font-semibold">Talla</div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const active = selectedSize === s;
                    const stock = selectedColor ? getStock(selectedColor, s) : 0;
                    const agotada = stock <= 0;

                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          if (agotada) return;
                          setSelectedSize(s);
                        }}
                        disabled={agotada}
                        className={[
                          "h-11 w-16 rounded-full border text-sm font-semibold",
                          active
                            ? "border-black bg-black text-white"
                            : "border-gray-200 bg-white",
                          agotada ? "cursor-not-allowed opacity-40 line-through" : "",
                        ].join(" ")}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  {selectedVariantStock > 0
                    ? `Disponibles: ${selectedVariantStock}`
                    : "Talla agotada"}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex w-fit items-center overflow-hidden rounded-full border border-gray-200">
                  <button
                    className="h-11 w-12 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={!puedeAgregar}
                  >
                    –
                  </button>

                  <div className="flex h-11 w-14 items-center justify-center font-semibold">
                    {qty}
                  </div>

                  <button
                    className="h-11 w-12 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() =>
                      setQty((q) => Math.min(selectedVariantStock, q + 1))
                    }
                    disabled={!puedeAgregar || qty >= selectedVariantStock}
                  >
                    +
                  </button>
                </div>

                <button
                  className="h-12 flex-1 rounded-full bg-black font-bold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!puedeAgregar}
                  onClick={() => {
                    if (!puedeAgregar) return;

                    const colorObj =
                      colors.find((c) => c.name === selectedColor) ?? null;

                    addItem({
                      productId: product.id,
                      product,
                      qty,
                      color: colorObj,
                      size: selectedSize,
                      maxStock: selectedVariantStock,
                    });

                    onAddToCart?.();
                    onClose?.();
                  }}
                >
                  {puedeAgregar ? "AGREGAR A CARRITO" : "NO DISPONIBLE"}
                </button>
              </div>

              <div className="mt-8 border-t pt-6">
                <Reviews productId={product.id} productName={product.name} compact />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}