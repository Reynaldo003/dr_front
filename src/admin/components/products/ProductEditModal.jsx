import { useEffect, useMemo, useState } from "react";
import { Check, Palette, X } from "lucide-react";

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
  "Sueteres y Chamarras",
  "Faldas",
  "Sacos",
  "Accesorios",
  "Blazers",
  "Palazzos",
  "Chalecos",
  "Tops",
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

function limpiarNumero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function Swatch({ hex }) {
  return (
    <span
      className="inline-block h-4 w-4 rounded-full border"
      style={{ backgroundColor: hex }}
    />
  );
}

function obtenerVariantesNormalizadas(product) {
  if (Array.isArray(product?.variantes)) {
    return product.variantes.map((item) => ({
      color: item?.color || "",
      talla: item?.talla || "",
      stock: Number(item?.stock || 0),
    }));
  }

  const colors = Array.isArray(product?.variants?.colors) ? product.variants.colors : [];
  const sizes = Array.isArray(product?.variants?.sizes) ? product.variants.sizes : [];
  const stockMap = product?.variants?.stockMap || {};

  const variantes = [];

  colors.forEach((color) => {
    sizes.forEach((talla) => {
      variantes.push({
        color,
        talla,
        stock: Number(stockMap[`${color}__${talla}`] || 0),
      });
    });
  });

  return variantes;
}

function crearEstadoInicial(product) {
  const variantes = obtenerVariantesNormalizadas(product);
  const selectedColorIds = unique(variantes.map((item) => item.color));
  const selectedSizes = unique(variantes.map((item) => item.talla));

  const stockMap = {};
  variantes.forEach((item) => {
    stockMap[`${item.color}__${item.talla}`] = Number(item.stock || 0);
  });

  const colorsCatalog = [
    ...DEFAULT_COLORS,
    ...selectedColorIds
      .filter((name) => !DEFAULT_COLORS.some((item) => item.name === name))
      .map((name) => ({ name, hex: "#111827" })),
  ];

  const sizesCatalog = unique([...DEFAULT_SIZES, ...selectedSizes]);

  return {
    title: product?.title || product?.titulo || "",
    sku: product?.sku || "",
    category: product?.category || product?.categoria || "Vestidos",
    description: product?.description || product?.descripcion || "",
    cost: Number(product?.cost ?? product?.costo ?? 0),
    price: Number(product?.price ?? product?.precio ?? 0),
    salePrice:
      product?.salePrice !== null &&
        product?.salePrice !== undefined &&
        product?.salePrice !== ""
        ? String(product.salePrice)
        : product?.precio_rebaja !== null &&
          product?.precio_rebaja !== undefined &&
          product?.precio_rebaja !== ""
          ? String(product.precio_rebaja)
          : "",
    status: product?.status || product?.estado || "Activo",
    heroUrl: product?.heroUrl || product?.imagen_principal || "",
    selectedColorIds,
    selectedSizes,
    stockMap,
    colorsCatalog,
    sizesCatalog,
    customColorName: "",
    customColorHex: "#111827",
    error: "",
  };
}

function SkeletonBox({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-zinc-100 ${className}`} />;
}

export default function ProductEditModal({
  open,
  product,
  onClose,
  onSave,
  loading = false,
  saving = false,
}) {
  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Vestidos");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(0);
  const [price, setPrice] = useState(0);
  const [salePrice, setSalePrice] = useState("");
  const [status, setStatus] = useState("Activo");
  const [heroUrl, setHeroUrl] = useState("");

  const [selectedColorIds, setSelectedColorIds] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [colorsCatalog, setColorsCatalog] = useState(DEFAULT_COLORS);
  const [sizesCatalog, setSizesCatalog] = useState(DEFAULT_SIZES);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#111827");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !product || loading) return;

    const estado = crearEstadoInicial(product);

    setTitle(estado.title);
    setSku(estado.sku);
    setCategory(estado.category);
    setDescription(estado.description);
    setCost(estado.cost);
    setPrice(estado.price);
    setSalePrice(estado.salePrice);
    setStatus(estado.status);
    setHeroUrl(estado.heroUrl);
    setSelectedColorIds(estado.selectedColorIds);
    setSelectedSizes(estado.selectedSizes);
    setStockMap(estado.stockMap);
    setColorsCatalog(estado.colorsCatalog);
    setSizesCatalog(estado.sizesCatalog);
    setCustomColorName("");
    setCustomColorHex("#111827");
    setError("");
  }, [open, product, loading]);

  const totalStock = useMemo(() => {
    return Object.values(stockMap).reduce(
      (acc, value) => acc + Number(value || 0),
      0,
    );
  }, [stockMap]);

  if (!open || !product) return null;

  function toggleColor(colorName) {
    setSelectedColorIds((prev) => {
      const exists = prev.includes(colorName);

      if (exists) {
        setStockMap((current) => {
          const next = { ...current };
          Object.keys(next).forEach((key) => {
            if (key.startsWith(`${colorName}__`)) {
              delete next[key];
            }
          });
          return next;
        });
        return prev.filter((item) => item !== colorName);
      }

      return [...prev, colorName];
    });
  }

  function toggleSize(size) {
    setSelectedSizes((prev) => {
      const exists = prev.includes(size);

      if (exists) {
        setStockMap((current) => {
          const next = { ...current };
          Object.keys(next).forEach((key) => {
            if (key.endsWith(`__${size}`)) {
              delete next[key];
            }
          });
          return next;
        });
        return prev.filter((item) => item !== size);
      }

      return [...prev, size];
    });
  }

  function setVariantStock(color, size, value) {
    const key = `${color}__${size}`;
    setStockMap((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.floor(Number(value || 0))),
    }));
  }

  function stockOf(color, size) {
    return Number(stockMap[`${color}__${size}`] || 0);
  }

  function addCustomColor() {
    const cleanName = String(customColorName || "").trim();
    const cleanHex = String(customColorHex || "").trim();

    if (!cleanName || !cleanHex) return;

    const exists = colorsCatalog.some(
      (item) => item.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (exists) return;

    setColorsCatalog((prev) => [...prev, { name: cleanName, hex: cleanHex }]);
    setSelectedColorIds((prev) => [...prev, cleanName]);
    setCustomColorName("");
    setCustomColorHex("#111827");
  }

  async function handleSave() {
    if (loading || saving) return;

    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    if (!sku.trim()) {
      setError("El SKU es obligatorio.");
      return;
    }

    if (selectedColorIds.length === 0) {
      setError("Debes dejar al menos un color.");
      return;
    }

    if (selectedSizes.length === 0) {
      setError("Debes dejar al menos una talla.");
      return;
    }

    if (salePrice !== "" && Number(salePrice) >= Number(price)) {
      setError("El precio de rebaja debe ser menor al precio normal.");
      return;
    }

    setError("");

    const updated = {
      ...product,
      title: title.trim(),
      sku: sku.trim(),
      category: category.trim(),
      description: description.trim(),
      cost: limpiarNumero(cost),
      price: limpiarNumero(price),
      salePrice: salePrice === "" ? null : limpiarNumero(salePrice),
      status,
      heroUrl: heroUrl.trim(),
      variants: {
        colors: selectedColorIds,
        sizes: selectedSizes,
        stockMap,
        totalStock,
      },
    };

    try {
      await onSave?.(updated);
    } catch (err) {
      setError(err?.message || "No se pudo actualizar el producto.");
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 animate-fadeIn bg-black/40"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6">
        <div className="flex h-[100dvh] w-full flex-col overflow-hidden border bg-white shadow-2xl animate-fadeUp sm:h-auto sm:max-h-[90vh] sm:max-w-6xl sm:rounded-3xl">
          <div className="flex items-start justify-between gap-3 border-b px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold sm:text-xl">
                Editar producto
              </h2>
              <p className="text-xs text-zinc-500 sm:text-sm">
                {product?.codigo || product?.id} · actualiza datos, variantes y stock
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-3 py-2 hover:bg-zinc-50"
            >
              <X size={18} />
            </button>
          </div>

          {error ? (
            <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
              {error}
            </div>
          ) : null}

          <div className="flex-1 overflow-auto px-4 py-5 sm:px-6">
            {loading ? (
              <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
                <div className="space-y-4">
                  <section className="rounded-2xl border p-4">
                    <h3 className="text-sm font-semibold">Datos generales</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <SkeletonBox className="h-11 w-full sm:col-span-2" />
                      <SkeletonBox className="h-11 w-full" />
                      <SkeletonBox className="h-11 w-full" />
                      <SkeletonBox className="h-11 w-full" />
                      <SkeletonBox className="h-11 w-full" />
                      <SkeletonBox className="h-11 w-full" />
                      <SkeletonBox className="h-11 w-full" />
                      <SkeletonBox className="h-28 w-full sm:col-span-2" />
                      <SkeletonBox className="h-11 w-full sm:col-span-2" />
                    </div>
                  </section>

                  <section className="rounded-2xl border p-4">
                    <SkeletonBox className="h-56 w-full" />
                  </section>
                </div>

                <aside className="h-fit rounded-2xl border p-4">
                  <div className="text-sm font-semibold">Resumen</div>
                  <SkeletonBox className="mt-3 aspect-square w-full" />
                </aside>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
                <div className="space-y-4">
                  <section className="rounded-2xl border p-4">
                    <h3 className="text-sm font-semibold">Datos generales</h3>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="text-xs font-medium text-zinc-700">
                          Título
                        </span>
                        <input
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-medium text-zinc-700">SKU</span>
                        <input
                          value={sku}
                          onChange={(event) => setSku(event.target.value)}
                          className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-medium text-zinc-700">
                          Categoría
                        </span>
                        <select
                          value={category}
                          onChange={(event) => setCategory(event.target.value)}
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
                          Costo
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={cost}
                          onChange={(event) => setCost(event.target.value)}
                          className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
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
                          onChange={(event) => setPrice(event.target.value)}
                          className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-medium text-zinc-700">
                          Precio rebaja
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={salePrice}
                          onChange={(event) => setSalePrice(event.target.value)}
                          placeholder="Opcional"
                          className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-medium text-zinc-700">
                          Estado
                        </span>
                        <select
                          value={status}
                          onChange={(event) => setStatus(event.target.value)}
                          className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                        >
                          <option>Activo</option>
                          <option>Inactivo</option>
                        </select>
                      </label>

                      <label className="block sm:col-span-2">
                        <span className="text-xs font-medium text-zinc-700">
                          Descripción
                        </span>
                        <textarea
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                          rows={4}
                          className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                      </label>

                      <label className="block sm:col-span-2">
                        <span className="text-xs font-medium text-zinc-700">
                          Imagen principal (URL o base64)
                        </span>
                        <input
                          value={heroUrl}
                          onChange={(event) => setHeroUrl(event.target.value)}
                          className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                      </label>
                    </div>
                  </section>

                  <section className="space-y-4 rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">Variantes + Stock</div>
                        <div className="text-xs text-zinc-500">
                          Usa el mismo patrón del alta nueva: selecciona colores y tallas.
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
                          {colorsCatalog.map((color) => {
                            const active = selectedColorIds.includes(color.name);
                            return (
                              <button
                                key={color.name}
                                type="button"
                                onClick={() => toggleColor(color.name)}
                                className={[
                                  "flex items-center justify-between rounded-xl border px-3 py-2 text-xs",
                                  active
                                    ? "border-zinc-900 bg-zinc-900 text-white"
                                    : "bg-white hover:bg-zinc-50",
                                ].join(" ")}
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <Swatch hex={color.hex} />
                                  <span className="truncate">{color.name}</span>
                                </span>
                                {active ? <Check size={14} /> : null}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-4 rounded-xl border bg-zinc-50 p-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                            <Palette size={14} />
                            Agregar color personalizado
                          </div>

                          <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                            <input
                              value={customColorName}
                              onChange={(e) => setCustomColorName(e.target.value)}
                              className="rounded-xl border px-3 py-2 text-sm"
                              placeholder="Nombre del color"
                            />
                            <input
                              type="color"
                              value={customColorHex}
                              onChange={(e) => setCustomColorHex(e.target.value)}
                              className="h-10 w-12 rounded-xl border bg-white"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={addCustomColor}
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
                          {sizesCatalog.map((size) => {
                            const active = selectedSizes.includes(size);
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => toggleSize(size)}
                                className={[
                                  "rounded-xl border px-3 py-2 text-xs",
                                  active
                                    ? "border-zinc-900 bg-zinc-900 text-white"
                                    : "bg-white hover:bg-zinc-50",
                                ].join(" ")}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Stock por variante</div>
                        <span className="text-xs text-zinc-500">color × talla</span>
                      </div>

                      <div className="mt-3 hidden overflow-auto rounded-2xl border md:block">
                        <table className="min-w-full text-sm">
                          <thead className="bg-zinc-50">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-zinc-700">
                                Color
                              </th>
                              {selectedSizes.map((size) => (
                                <th
                                  key={size}
                                  className="px-4 py-3 text-left font-semibold text-zinc-700"
                                >
                                  {size}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody className="bg-white">
                            {selectedColorIds.map((colorName) => {
                              const color = colorsCatalog.find((item) => item.name === colorName);
                              return (
                                <tr key={colorName} className="border-t">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <Swatch hex={color?.hex || "#111827"} />
                                      <span className="font-medium">{colorName}</span>
                                    </div>
                                  </td>

                                  {selectedSizes.map((size) => (
                                    <td key={size} className="px-4 py-3">
                                      <input
                                        type="number"
                                        min="0"
                                        value={stockOf(colorName, size)}
                                        onChange={(e) =>
                                          setVariantStock(colorName, size, e.target.value)
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

                      <div className="mt-3 space-y-3 md:hidden">
                        {selectedColorIds.map((colorName) => {
                          const color = colorsCatalog.find((item) => item.name === colorName);
                          return (
                            <div key={colorName} className="rounded-2xl border bg-white p-4">
                              <div className="flex items-center gap-2">
                                <Swatch hex={color?.hex || "#111827"} />
                                <div className="font-semibold">{colorName}</div>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-2">
                                {selectedSizes.map((size) => (
                                  <label key={size} className="rounded-xl border p-3">
                                    <div className="text-xs text-zinc-500">{size}</div>
                                    <input
                                      type="number"
                                      min="0"
                                      value={stockOf(colorName, size)}
                                      onChange={(e) =>
                                        setVariantStock(colorName, size, e.target.value)
                                      }
                                      className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                                    />
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                </div>

                <aside className="h-fit rounded-2xl border p-4">
                  <div className="text-sm font-semibold">Resumen</div>

                  <div className="mt-3 aspect-square overflow-hidden rounded-2xl border bg-zinc-100">
                    {heroUrl ? (
                      <img
                        src={heroUrl}
                        alt={title || "Producto"}
                        className="h-full w-full object-cover"
                        decoding="async"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-sm text-zinc-500">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="font-semibold">{title || "Producto"}</div>
                    <div className="text-zinc-500">SKU: {sku || "—"}</div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Costo</span>
                      <span className="font-semibold">
                        ${limpiarNumero(cost).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Precio</span>
                      <span className="font-semibold">
                        ${limpiarNumero(price).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Rebaja</span>
                      <span className="font-semibold">
                        {salePrice === ""
                          ? "—"
                          : `$${limpiarNumero(salePrice).toLocaleString()}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Categoría</span>
                      <span className="font-semibold">{category || "—"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Variantes</span>
                      <span className="font-semibold">
                        {selectedColorIds.length} colores · {selectedSizes.length} tallas
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Stock total</span>
                      <span className="font-semibold">{totalStock}</span>
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end gap-2 border-t px-4 py-3 sm:flex-row sm:px-6">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading || !title.trim() || saving}
              className={[
                "rounded-xl px-4 py-2 text-sm",
                !loading && title.trim() && totalStock > 0 && !saving
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
  );
}