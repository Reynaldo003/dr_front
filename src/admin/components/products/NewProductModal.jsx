import {
  X,
  Plus,
  Image as ImgIcon,
  Trash2,
  Check,
  Palette,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { optimizarArchivoImagen } from "../../utils/imageOptimizer";

const DEFAULT_COLORS = [
  { name: "Negro", hex: "#111827" },
  { name: "Blanco", hex: "#F9FAFB" },
  { name: "Gris", hex: "#9CA3AF" },
  { name: "Beige", hex: "#D6C7B2" },
  { name: "Café", hex: "#7C4A2D" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Rojo", hex: "#EF4444" },
  { name: "Vino", hex: "#7F1D1D" },
  { name: "Rosa", hex: "#EC4899" },
  { name: "Fucsia", hex: "#C026D3" },
  { name: "Morado", hex: "#7C3AED" },
  { name: "Azul", hex: "#3B82F6" },
  { name: "Marino", hex: "#1E3A8A" },
  { name: "Verde", hex: "#22C55E" },
  { name: "Olivo", hex: "#4D7C0F" },
  { name: "Mostaza", hex: "#EAB308" },
  { name: "Naranja", hex: "#F97316" },
  { name: "Amarillo", hex: "#FACC15" },
];

const PRODUCT_CATEGORIES = [
  "Vestidos",
  "Sets",
  "Blusas",
  "Pantalones",
  "Shorts",
  "Chamarras",
  "Faldas",
  "Sacos",
  "Blazers",
  "Palazzos",
  "Chalecos",
  "Tops",
  "Accesorios",
];

const DEFAULT_SIZES = [
  "XS",
  "S",
  "SM",
  "M",
  "ML",
  "L",
  "LX",
  "XL",
  "XXL",
  "Unitalla",
];

const MAX_GALLERY_IMAGES = 10;
const MAX_FILE_MB = 12;

function uid() {
  return `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

function clampInt(v) {
  const n = Number(v);

  if (Number.isNaN(n)) return 0;

  return Math.max(0, Math.floor(n));
}

function limpiarTexto(valor) {
  return String(valor || "").trim();
}

function Swatch({ hex }) {
  return (
    <span
      className="inline-block h-4 w-4 rounded-full border"
      style={{ backgroundColor: hex }}
    />
  );
}

function StepPill({ active, done, children }) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
        active
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "bg-white text-zinc-700",
      ].join(" ")}
    >
      {done ? (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700">
          <Check size={12} />
        </span>
      ) : (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
          •
        </span>
      )}

      {children}
    </div>
  );
}

function validarArchivoImagen(file) {
  if (!file) return "";

  const tipo = String(file.type || "").toLowerCase();

  if (tipo && !tipo.startsWith("image/")) {
    return `${file.name} no es una imagen válida.`;
  }

  const sizeMb = file.size / 1024 / 1024;

  if (sizeMb > MAX_FILE_MB) {
    return `${file.name} pesa más de ${MAX_FILE_MB} MB.`;
  }

  return "";
}

export default function NewProductModal({
  open,
  onClose,
  onSave,
  saving = false,
}) {
  const [step, setStep] = useState(1);

  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState(399);
  const [category, setCategory] = useState("Vestidos");
  const [status, setStatus] = useState("Activo");

  const [heroUrl, setHeroUrl] = useState("");
  const [gallery, setGallery] = useState([]);

  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [selectedColorIds, setSelectedColorIds] = useState(() =>
    DEFAULT_COLORS.slice(0, 2).map((c) => c.name),
  );

  const [selectedSizes, setSelectedSizes] = useState(["S", "M", "L"]);
  const [stockMap, setStockMap] = useState({});

  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#111827");

  const [processingImages, setProcessingImages] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");

  const totalStock = useMemo(() => {
    return Object.values(stockMap).reduce((acc, v) => acc + clampInt(v), 0);
  }, [stockMap]);

  const galleryPreview = useMemo(() => {
    const arr = [];

    if (heroUrl) {
      arr.push({
        id: "hero",
        url: heroUrl,
      });
    }

    gallery.forEach((item) => arr.push(item));

    return arr;
  }, [heroUrl, gallery]);

  const canStep2 =
    limpiarTexto(title).length >= 2 &&
    limpiarTexto(sku).length >= 2 &&
    Number(price) > 0;

  const canStep3 = heroUrl.trim().length > 5 || gallery.length > 0;

  const puedeGuardar =
    canStep2 &&
    canStep3 &&
    totalStock > 0 &&
    !saving &&
    !processingImages;

  function resetForm() {
    setStep(1);
    setTitle("");
    setSku("");
    setPrice(399);
    setCategory("Vestidos");
    setStatus("Activo");
    setHeroUrl("");
    setGallery([]);
    setColors(DEFAULT_COLORS);
    setSelectedColorIds(DEFAULT_COLORS.slice(0, 2).map((c) => c.name));
    setSelectedSizes(["S", "M", "L"]);
    setStockMap({});
    setCustomColorName("");
    setCustomColorHex("#111827");
    setProcessingImages(false);
    setErrorFormulario("");
  }

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  async function procesarImagen(file) {
    const error = validarArchivoImagen(file);

    if (error) {
      throw new Error(error);
    }

    return optimizarArchivoImagen(file, {
      maxWidth: 1400,
      maxHeight: 1400,
      quality: 0.82,
    });
  }

  async function handleHeroFileChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    setProcessingImages(true);
    setErrorFormulario("");

    try {
      const optimizada = await procesarImagen(file);
      setHeroUrl(optimizada);
    } catch (error) {
      console.error(error);
      setErrorFormulario(error.message || "No se pudo procesar la imagen principal.");
    } finally {
      setProcessingImages(false);
      e.target.value = "";
    }
  }

  async function handleGalleryFilesChange(e) {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const disponibles = Math.max(0, MAX_GALLERY_IMAGES - gallery.length);
    const filesProcesar = files.slice(0, disponibles);

    if (filesProcesar.length === 0) {
      setErrorFormulario(`Máximo puedes agregar ${MAX_GALLERY_IMAGES} imágenes.`);
      e.target.value = "";
      return;
    }

    setProcessingImages(true);
    setErrorFormulario("");

    try {
      const newItems = await Promise.all(
        filesProcesar.map(async (file) => {
          const optimizada = await procesarImagen(file);

          return {
            id: uid(),
            name: file.name,
            url: optimizada,
          };
        }),
      );

      setGallery((prev) => [...prev, ...newItems]);

      if (!heroUrl && newItems[0]) {
        setHeroUrl(newItems[0].url);
      }

      if (files.length > filesProcesar.length) {
        setErrorFormulario(
          `Solo se agregaron ${filesProcesar.length} imágenes. El máximo es ${MAX_GALLERY_IMAGES}.`,
        );
      }
    } catch (error) {
      console.error(error);
      setErrorFormulario(error.message || "No se pudieron procesar las imágenes.");
    } finally {
      setProcessingImages(false);
      e.target.value = "";
    }
  }

  function removeGallery(id) {
    setGallery((prev) => prev.filter((g) => g.id !== id));
  }

  function makeHeroFromGallery(item) {
    setHeroUrl(item.url);
  }

  function clearHero() {
    setHeroUrl("");
  }

  function toggleColor(name) {
    setSelectedColorIds((prev) => {
      const exists = prev.includes(name);
      const next = exists ? prev.filter((x) => x !== name) : [...prev, name];

      if (exists) {
        setStockMap((m) => {
          const copy = { ...m };

          Object.keys(copy).forEach((k) => {
            if (k.startsWith(`${name}__`)) {
              delete copy[k];
            }
          });

          return copy;
        });
      }

      return next;
    });
  }

  function toggleSize(sz) {
    setSelectedSizes((prev) => {
      const exists = prev.includes(sz);
      const next = exists ? prev.filter((x) => x !== sz) : [...prev, sz];

      if (exists) {
        setStockMap((m) => {
          const copy = { ...m };

          Object.keys(copy).forEach((k) => {
            if (k.endsWith(`__${sz}`)) {
              delete copy[k];
            }
          });

          return copy;
        });
      }

      return next;
    });
  }

  function setStock(colorName, size, value) {
    const key = `${colorName}__${size}`;

    setStockMap((prev) => ({
      ...prev,
      [key]: clampInt(value),
    }));
  }

  function stockOf(colorName, size) {
    return stockMap[`${colorName}__${size}`] ?? 0;
  }

  function addCustomColor(name, hex) {
    const cleanName = limpiarTexto(name);
    const cleanHex = limpiarTexto(hex);

    if (!cleanName || !cleanHex) return;

    setColors((prev) => {
      const exists = prev.some(
        (c) => c.name.toLowerCase() === cleanName.toLowerCase(),
      );

      if (exists) return prev;

      return [...prev, { name: cleanName, hex: cleanHex }];
    });

    setSelectedColorIds((prev) => {
      if (prev.includes(cleanName)) return prev;

      return [...prev, cleanName];
    });
  }

  function validarFormulario() {
    if (limpiarTexto(title).length < 2) {
      return "Captura un título válido.";
    }

    if (limpiarTexto(sku).length < 2) {
      return "Captura un SKU válido.";
    }

    if (Number(price) <= 0) {
      return "Captura un precio válido.";
    }

    if (!heroUrl && gallery.length === 0) {
      return "Agrega al menos una imagen.";
    }

    if (selectedColorIds.length === 0) {
      return "Selecciona al menos un color.";
    }

    if (selectedSizes.length === 0) {
      return "Selecciona al menos una talla.";
    }

    if (totalStock <= 0) {
      return "El stock total debe ser mayor a 0.";
    }

    return "";
  }

  async function handleSave() {
    if (saving || processingImages) return;

    const error = validarFormulario();

    if (error) {
      setErrorFormulario(error);
      return;
    }

    const payload = {
      title: limpiarTexto(title),
      sku: limpiarTexto(sku),
      price: Number(price),
      category,
      status,
      heroUrl: heroUrl || gallery[0]?.url || "",
      gallery,
      variants: {
        colors: selectedColorIds,
        sizes: selectedSizes,
        stockMap,
        totalStock,
      },
    };

    try {
      setErrorFormulario("");
      await onSave?.(payload);
      resetForm();
    } catch (error) {
      console.error(error);
      setErrorFormulario(error.message || "No se pudo guardar el producto.");
    }
  }

  function resetAndClose() {
    if (saving || processingImages) return;

    resetForm();
    onClose?.();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 animate-fadeIn bg-black/40"
        onClick={resetAndClose}
        aria-label="Cerrar"
      />

      <div className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6">
        <div className="flex h-[100vh] w-full flex-col overflow-hidden border bg-white shadow-2xl animate-fadeUp sm:h-auto sm:max-h-[88vh] sm:max-w-5xl sm:rounded-3xl">
          <div className="flex items-start justify-between gap-3 border-b px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold sm:text-xl">
                Nuevo producto
              </h2>
              <p className="text-xs text-zinc-500 sm:text-sm">
                Alta completa · imagen principal + carrusel · variantes con stock
              </p>
            </div>

            <button
              type="button"
              onClick={resetAndClose}
              className="inline-flex items-center justify-center rounded-xl border px-3 py-2 hover:bg-zinc-50"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 border-b px-4 py-3 sm:px-6">
            <button type="button" onClick={() => setStep(1)}>
              <StepPill active={step === 1} done={canStep2}>
                Datos
              </StepPill>
            </button>

            <button
              type="button"
              onClick={() => canStep2 && setStep(2)}
              disabled={!canStep2}
            >
              <StepPill active={step === 2} done={canStep3}>
                Imágenes
              </StepPill>
            </button>

            <button
              type="button"
              onClick={() => canStep3 && setStep(3)}
              disabled={!canStep3}
            >
              <StepPill active={step === 3} done={totalStock > 0}>
                Variantes
              </StepPill>
            </button>
          </div>

          {errorFormulario ? (
            <div className="border-b bg-red-50 px-4 py-3 text-sm text-red-700 sm:px-6">
              {errorFormulario}
            </div>
          ) : null}

          {processingImages ? (
            <div className="border-b bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:px-6">
              Procesando imágenes. No cierres el modal todavía.
            </div>
          ) : null}

          <div className="flex-1 overflow-auto">
            <div className="grid gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                {step === 1 ? (
                  <section className="rounded-2xl border p-4 sm:p-5">
                    <div className="text-sm font-semibold">Datos base</div>
                    <div className="text-xs text-zinc-500">
                      Título, SKU, precio, categoría y estado.
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="text-xs font-medium text-zinc-700">
                          Título
                        </span>
                        <input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                          placeholder="Ej. Vestido satín"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-medium text-zinc-700">
                          SKU
                        </span>
                        <input
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                          placeholder="Ej. VS-001"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-medium text-zinc-700">
                          Precio
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-medium text-zinc-700">
                          Categoría
                        </span>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                        >
                          {PRODUCT_CATEGORIES.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-xs font-medium text-zinc-700">
                          Estado
                        </span>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                        >
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                        </select>
                      </label>

                      <div className="mt-2 flex flex-col gap-2 sm:col-span-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          disabled={!canStep2}
                          className={[
                            "rounded-xl px-4 py-2 text-sm",
                            canStep2
                              ? "bg-zinc-900 text-white hover:opacity-95"
                              : "cursor-not-allowed bg-zinc-200 text-zinc-500",
                          ].join(" ")}
                        >
                          Continuar a imágenes
                        </button>

                        <button
                          type="button"
                          onClick={resetAndClose}
                          className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </section>
                ) : null}

                {step === 2 ? (
                  <section className="space-y-4 rounded-2xl border p-4 sm:p-5">
                    <div>
                      <div className="text-sm font-semibold">Imágenes</div>
                      <div className="text-xs text-zinc-500">
                        Define una imagen principal y agrega imágenes al carrusel.
                      </div>
                    </div>

                    <div className="rounded-2xl border p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">
                          Imagen principal
                        </div>
                        <span className="text-xs text-zinc-500">Hero</span>
                      </div>

                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white hover:opacity-95">
                          <Upload size={16} />
                          Subir imagen principal
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroFileChange}
                            className="sr-only"
                          />
                        </label>

                        {heroUrl ? (
                          <button
                            type="button"
                            onClick={clearHero}
                            className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
                          >
                            Quitar principal
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">
                          Carrusel
                        </div>
                        <span className="text-xs text-zinc-500">
                          {gallery.length}/{MAX_GALLERY_IMAGES} imágenes
                        </span>
                      </div>

                      <div className="mt-3">
                        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50">
                          <Plus size={16} />
                          Agregar imágenes al carrusel
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleGalleryFilesChange}
                            className="sr-only"
                          />
                        </label>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {gallery.map((g) => (
                          <div key={g.id} className="rounded-2xl border p-2">
                            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-zinc-100">
                              {g.url ? (
                                <img
                                  src={g.url}
                                  alt={g.name || ""}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ImgIcon className="text-zinc-400" />
                              )}
                            </div>

                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() => makeHeroFromGallery(g)}
                                className="flex-1 rounded-xl bg-zinc-900 py-1.5 text-xs text-white hover:opacity-95"
                              >
                                Principal
                              </button>

                              <button
                                type="button"
                                onClick={() => removeGallery(g.id)}
                                className="rounded-xl border px-2 py-1.5 text-xs hover:bg-zinc-50"
                                aria-label="Quitar"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {gallery.length === 0 ? (
                        <div className="mt-3 rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-600">
                          Aún no agregas imágenes al carrusel.
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
                      >
                        Atrás
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        disabled={!canStep3 || processingImages}
                        className={[
                          "rounded-xl px-4 py-2 text-sm",
                          canStep3 && !processingImages
                            ? "bg-zinc-900 text-white hover:opacity-95"
                            : "cursor-not-allowed bg-zinc-200 text-zinc-500",
                        ].join(" ")}
                      >
                        Continuar a variantes
                      </button>
                    </div>
                  </section>
                ) : null}

                {step === 3 ? (
                  <section className="space-y-4 rounded-2xl border p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">
                          Variantes + Stock
                        </div>
                        <div className="text-xs text-zinc-500">
                          Selecciona colores y tallas. Luego asigna stock por combinación.
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-zinc-500">Stock total</div>
                        <div className="text-lg font-semibold">{totalStock}</div>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold">Colores</div>
                          <span className="text-xs text-zinc-500">
                            {selectedColorIds.length} seleccionados
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {colors.map((c) => {
                            const active = selectedColorIds.includes(c.name);

                            return (
                              <button
                                key={c.name}
                                type="button"
                                onClick={() => toggleColor(c.name)}
                                className={[
                                  "flex items-center justify-between rounded-xl border px-3 py-2 text-xs",
                                  active
                                    ? "border-zinc-900 bg-zinc-900 text-white"
                                    : "bg-white hover:bg-zinc-50",
                                ].join(" ")}
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <Swatch hex={c.hex} />
                                  <span className="truncate">{c.name}</span>
                                </span>

                                {active ? <Check size={14} /> : null}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-4 rounded-xl border bg-zinc-50 p-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                            <Palette size={14} /> Agregar color
                          </div>

                          <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                            <input
                              value={customColorName}
                              onChange={(e) => setCustomColorName(e.target.value)}
                              className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                              placeholder="Nombre"
                            />

                            <input
                              type="color"
                              value={customColorHex}
                              onChange={(e) => setCustomColorHex(e.target.value)}
                              className="h-10 w-12 rounded-xl border bg-white"
                              aria-label="Hex"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              addCustomColor(customColorName, customColorHex);
                              setCustomColorName("");
                            }}
                            className="mt-2 w-full rounded-xl border px-3 py-2 text-sm hover:bg-white"
                          >
                            Agregar color
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold">Tallas</div>
                          <span className="text-xs text-zinc-500">
                            {selectedSizes.length} seleccionadas
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {DEFAULT_SIZES.map((sz) => {
                            const active = selectedSizes.includes(sz);

                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => toggleSize(sz)}
                                className={[
                                  "rounded-xl border px-3 py-2 text-xs",
                                  active
                                    ? "border-zinc-900 bg-zinc-900 text-white"
                                    : "bg-white hover:bg-zinc-50",
                                ].join(" ")}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>

                        <p className="mt-3 text-[12px] text-zinc-500">
                          Tip: si vendes Unitalla, puedes dejar solo esa seleccionada.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">
                          Stock por variante
                        </div>
                        <span className="text-xs text-zinc-500">
                          color × talla
                        </span>
                      </div>

                      <div className="mt-3 hidden overflow-auto rounded-2xl border md:block">
                        <table className="min-w-full text-sm">
                          <thead className="bg-zinc-50">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-zinc-700">
                                Color
                              </th>

                              {selectedSizes.map((sz) => (
                                <th
                                  key={sz}
                                  className="px-4 py-3 text-left font-semibold text-zinc-700"
                                >
                                  {sz}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody className="bg-white">
                            {selectedColorIds.map((colorName) => {
                              const color = colors.find((c) => c.name === colorName);

                              return (
                                <tr key={colorName} className="border-t">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <Swatch hex={color?.hex || "#111827"} />
                                      <span className="font-medium">{colorName}</span>
                                    </div>
                                  </td>

                                  {selectedSizes.map((sz) => (
                                    <td key={sz} className="px-4 py-3">
                                      <input
                                        type="number"
                                        min={0}
                                        value={stockOf(colorName, sz)}
                                        onChange={(e) =>
                                          setStock(colorName, sz, e.target.value)
                                        }
                                        className="w-24 rounded-xl border px-3 py-2 text-sm"
                                      />
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="space-y-3 md:hidden">
                        {selectedColorIds.map((colorName) => {
                          const color = colors.find((c) => c.name === colorName);
                          const sumColor = selectedSizes.reduce(
                            (acc, sz) => acc + stockOf(colorName, sz),
                            0,
                          );

                          return (
                            <div key={colorName} className="rounded-2xl border bg-white p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Swatch hex={color?.hex || "#111827"} />
                                    <div className="font-semibold">{colorName}</div>
                                  </div>

                                  <div className="text-xs text-zinc-500">
                                    Total color: {sumColor}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-2">
                                {selectedSizes.map((sz) => (
                                  <label key={sz} className="rounded-xl border p-3">
                                    <div className="text-xs font-semibold text-zinc-700">
                                      {sz}
                                    </div>

                                    <input
                                      type="number"
                                      min={0}
                                      value={stockOf(colorName, sz)}
                                      onChange={(e) =>
                                        setStock(colorName, sz, e.target.value)
                                      }
                                      className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                                    />
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}

                        {selectedColorIds.length === 0 ? (
                          <div className="rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-600">
                            Selecciona al menos un color.
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
                      >
                        Atrás
                      </button>

                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={!puedeGuardar}
                        className={[
                          "rounded-xl px-4 py-2 text-sm",
                          puedeGuardar
                            ? "bg-zinc-900 text-white hover:opacity-95"
                            : "cursor-not-allowed bg-zinc-200 text-zinc-500",
                        ].join(" ")}
                      >
                        {saving ? "Guardando..." : "Guardar producto"}
                      </button>
                    </div>
                  </section>
                ) : null}
              </div>

              <aside className="sticky top-4 h-fit rounded-2xl border p-4 sm:p-5">
                <div className="text-sm font-semibold">Preview</div>
                <div className="text-xs text-zinc-500">Así se verá</div>

                <div className="mt-3 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-zinc-100">
                  {heroUrl ? (
                    <img
                      src={heroUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-400">
                      <ImgIcon />
                      <span className="text-xs">Sin imagen principal</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex gap-2 overflow-auto pb-1">
                  {galleryPreview.slice(0, 10).map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setHeroUrl(img.url)}
                      className={[
                        "h-14 w-14 flex-none overflow-hidden rounded-xl border bg-zinc-100",
                        img.url === heroUrl ? "ring-2 ring-zinc-900" : "",
                      ].join(" ")}
                      aria-label="Seleccionar"
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border bg-zinc-50 p-3 text-sm">
                  <div className="truncate font-semibold">
                    {title || "Producto"}
                  </div>

                  <div className="text-xs text-zinc-500">
                    SKU: {sku || "—"}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-zinc-600">Precio</span>
                    <span className="font-semibold">
                      ${Number(price || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-zinc-600">Variantes</span>
                    <span className="font-semibold">
                      {selectedColorIds.length} colores · {selectedSizes.length} tallas
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-zinc-600">Stock total</span>
                    <span className="font-semibold">{totalStock}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1 && !canStep2) {
                        setErrorFormulario("Captura título, SKU y precio para continuar.");
                        return;
                      }

                      if (step === 2 && !canStep3) {
                        setErrorFormulario("Agrega al menos una imagen para continuar.");
                        return;
                      }

                      setErrorFormulario("");
                      setStep((s) => Math.min(3, s + 1));
                    }}
                    disabled={processingImages}
                    className={[
                      "rounded-xl px-4 py-2 text-sm text-white",
                      processingImages
                        ? "cursor-not-allowed bg-zinc-400"
                        : "bg-zinc-900 hover:opacity-95",
                    ].join(" ")}
                  >
                    Continuar
                  </button>
                </div>
              </aside>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="text-xs text-zinc-600">
              {category} · ${Number(price || 0).toLocaleString()} ·{" "}
              {selectedColorIds.length} colores · {selectedSizes.length} tallas ·{" "}
              {totalStock} stock
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetAndClose}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!puedeGuardar}
                className={[
                  "rounded-xl px-4 py-2 text-sm",
                  puedeGuardar
                    ? "bg-zinc-900 text-white hover:opacity-95"
                    : "cursor-not-allowed bg-zinc-200 text-zinc-500",
                ].join(" ")}
              >
                {saving ? "Guardando..." : "Guardar producto"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}