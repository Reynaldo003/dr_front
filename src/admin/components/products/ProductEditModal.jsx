import { useEffect, useMemo, useState } from "react";
import { Trash2, X } from "lucide-react";

const PRODUCT_CATEGORIES = [
  "Vestidos",
  "Sets",
  "Blusas",
  "Pantalones",
  "Shorts",
  "Chamarras",
  "Faldas",
  "Sacos",
  "Accesorios",
];

function limpiarNumero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
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
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(0);
  const [price, setPrice] = useState(0);
  const [salePrice, setSalePrice] = useState("");
  const [status, setStatus] = useState("Activo");
  const [heroUrl, setHeroUrl] = useState("");

  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [stockMap, setStockMap] = useState({});

  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !product) return;

    setTitle(product.title || "");
    setSku(product.sku || "");
    setCategory(product.category || "Vestidos");
    setDescription(product.description || "");
    setCost(Number(product.cost || 0));
    setPrice(Number(product.price || 0));
    setSalePrice(
      product.salePrice !== null &&
        product.salePrice !== undefined &&
        product.salePrice !== ""
        ? String(product.salePrice)
        : "",
    );
    setStatus(product.status || "Activo");
    setHeroUrl(product.heroUrl || "");
    setColors(Array.isArray(product.variants?.colors) ? product.variants.colors : []);
    setSizes(Array.isArray(product.variants?.sizes) ? product.variants.sizes : []);
    setStockMap(product.variants?.stockMap || {});
    setError("");
  }, [open, product]);

  const totalStock = useMemo(() => {
    return Object.values(stockMap).reduce(
      (acc, value) => acc + Number(value || 0),
      0,
    );
  }, [stockMap]);

  if (!open || !product) return null;

  function setVariantStock(color, size, value) {
    const key = `${color}__${size}`;
    setStockMap((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.floor(Number(value || 0))),
    }));
  }

  function removeColor(color) {
    setColors((prev) => prev.filter((item) => item !== color));
    setStockMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`${color}__`)) {
          delete next[key];
        }
      });
      return next;
    });
  }

  function removeSize(size) {
    setSizes((prev) => prev.filter((item) => item !== size));
    setStockMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key.endsWith(`__${size}`)) {
          delete next[key];
        }
      });
      return next;
    });
  }

  function handleAddColor() {
    const value = newColor.trim();
    if (!value) return;
    if (colors.includes(value)) return;

    setColors((prev) => [...prev, value]);
    setNewColor("");
  }

  function handleAddSize() {
    const value = newSize.trim();
    if (!value) return;
    if (sizes.includes(value)) return;

    setSizes((prev) => [...prev, value]);
    setNewSize("");
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    if (!sku.trim()) {
      setError("El SKU es obligatorio.");
      return;
    }

    if (colors.length === 0) {
      setError("Debes dejar al menos un color.");
      return;
    }

    if (sizes.length === 0) {
      setError("Debes dejar al menos una talla.");
      return;
    }

    if (totalStock <= 0) {
      setError("El stock total debe ser mayor a 0.");
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
        colors,
        sizes,
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
        <div className="flex h-[100dvh] w-full flex-col overflow-hidden border bg-white shadow-2xl animate-fadeUp sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-3xl">
          <div className="flex items-start justify-between gap-3 border-b px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold sm:text-xl">
                Editar producto
              </h2>
              <p className="text-xs text-zinc-500 sm:text-sm">
                {product.id} · actualiza datos, precios y variantes
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

          {loading ? (
            <div className="mx-4 mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 sm:mx-6">
              Cargando detalle del producto...
            </div>
          ) : null}

          {error ? (
            <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
              {error}
            </div>
          ) : null}

          <div className="flex-1 overflow-auto px-4 py-5 sm:px-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
              <div className="space-y-4">
                <section className="rounded-2xl border p-4">
                  <h3 className="text-sm font-semibold">Datos generales</h3>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="text-xs font-medium text-zinc-700">Título</span>
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
                      <span className="text-xs font-medium text-zinc-700">Categoría</span>
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
                      <span className="text-xs font-medium text-zinc-700">Costo</span>
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
                      <span className="text-xs font-medium text-zinc-700">Precio</span>
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
                      <span className="text-xs font-medium text-zinc-700">Estado</span>
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

                <section className="rounded-2xl border p-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold">Colores</h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {colors.map((color) => (
                          <span
                            key={color}
                            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs"
                          >
                            {color}
                            <button
                              type="button"
                              onClick={() => removeColor(color)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <input
                          value={newColor}
                          onChange={(event) => setNewColor(event.target.value)}
                          placeholder="Nuevo color"
                          className="flex-1 rounded-xl border px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddColor}
                          className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold">Tallas</h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {sizes.map((size) => (
                          <span
                            key={size}
                            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs"
                          >
                            {size}
                            <button type="button" onClick={() => removeSize(size)}>
                              <Trash2 size={13} />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <input
                          value={newSize}
                          onChange={(event) => setNewSize(event.target.value)}
                          placeholder="Nueva talla"
                          className="flex-1 rounded-xl border px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddSize}
                          className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Stock por variante</h3>
                    <div className="text-sm text-zinc-500">Total: {totalStock}</div>
                  </div>

                  <div className="mt-4 hidden overflow-auto rounded-2xl border md:block">
                    <table className="min-w-full text-sm">
                      <thead className="bg-zinc-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-zinc-700">
                            Color
                          </th>
                          {sizes.map((size) => (
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
                        {colors.map((color) => (
                          <tr key={color} className="border-t">
                            <td className="px-4 py-3 font-medium">{color}</td>
                            {sizes.map((size) => (
                              <td key={size} className="px-4 py-3">
                                <input
                                  type="number"
                                  min="0"
                                  value={stockMap[`${color}__${size}`] ?? 0}
                                  onChange={(event) =>
                                    setVariantStock(color, size, event.target.value)
                                  }
                                  className="w-24 rounded-xl border px-3 py-2 text-sm"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 space-y-3 md:hidden">
                    {colors.map((color) => (
                      <div key={color} className="rounded-2xl border p-4">
                        <div className="font-semibold">{color}</div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {sizes.map((size) => (
                            <label key={size} className="rounded-xl border p-3">
                              <div className="text-xs text-zinc-500">{size}</div>
                              <input
                                type="number"
                                min="0"
                                value={stockMap[`${color}__${size}`] ?? 0}
                                onChange={(event) =>
                                  setVariantStock(color, size, event.target.value)
                                }
                                className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="h-fit rounded-2xl border p-4">
                <div className="text-sm font-semibold">Resumen</div>

                <div className="mt-3 aspect-square overflow-hidden rounded-2xl border bg-zinc-100">
                  {heroUrl ? (
                    <img
                      src={heroUrl}
                      alt={title}
                      className="h-full w-full object-cover"
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
                    <span className="text-zinc-500">Stock total</span>
                    <span className="font-semibold">{totalStock}</span>
                  </div>
                </div>
              </aside>
            </div>
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
              disabled={!title.trim() || totalStock === 0 || saving}
              className={[
                "rounded-xl px-4 py-2 text-sm",
                title.trim() && totalStock > 0 && !saving
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