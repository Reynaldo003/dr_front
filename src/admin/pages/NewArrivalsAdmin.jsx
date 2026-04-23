import { useEffect, useMemo, useState } from "react";
import { Check, Palette, Plus, Trash2, Upload, X } from "lucide-react";
import {
    actualizarProducto,
    crearProducto,
    obtenerProductos,
} from "../lib/productosAdminApi";

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

const initialForm = {
    titulo: "",
    sku: "",
    descripcion: "",
    precio: "",
    categoria: "Vestidos",
    estado: "Activo",
};

function uid() {
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function clampInt(v) {
    const n = Number(v);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.floor(n));
}

function unique(values) {
    return [...new Set(values.filter(Boolean))];
}

function leerArchivoComoBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function formatearPrecio(valor) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
    }).format(Number(valor || 0));
}

function normalizarListadoRespuesta(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
}

function Swatch({ hex }) {
    return (
        <span
            className="inline-block h-4 w-4 rounded-full border"
            style={{ backgroundColor: hex }}
        />
    );
}

function PublishArrivalModal({
    open,
    producto,
    onClose,
    onSubmit,
    saving = false,
}) {
    const [categoria, setCategoria] = useState("Vestidos");
    const [descripcion, setDescripcion] = useState("");
    const [precio, setPrecio] = useState(0);
    const [heroUrl, setHeroUrl] = useState("");
    const [gallery, setGallery] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState(["Unitalla"]);
    const [stockMap, setStockMap] = useState({});
    const [customColorName, setCustomColorName] = useState("");
    const [customColorHex, setCustomColorHex] = useState("#111827");
    const [colorsCatalog, setColorsCatalog] = useState(DEFAULT_COLORS);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !producto) return;

        setCategoria(producto?.categoria || "Vestidos");
        setDescripcion(producto?.descripcion || "");
        setPrecio(Number(producto?.precio || 0));
        setHeroUrl(producto?.imagen_principal || "");
        setGallery([]);
        setSelectedColors([]);
        setSelectedSizes(["Unitalla"]);
        setStockMap({});
        setCustomColorName("");
        setCustomColorHex("#111827");
        setColorsCatalog(DEFAULT_COLORS);
        setError("");
    }, [open, producto]);

    const totalStock = useMemo(() => {
        return Object.values(stockMap).reduce((acc, value) => acc + Number(value || 0), 0);
    }, [stockMap]);

    if (!open || !producto) return null;

    function toggleColor(colorName) {
        setSelectedColors((prev) => {
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
            [key]: clampInt(value),
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
        setSelectedColors((prev) => [...prev, cleanName]);
        setCustomColorName("");
        setCustomColorHex("#111827");
    }

    async function handleHeroFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const base64 = await leerArchivoComoBase64(file);
            setHeroUrl(base64);
        } catch (error) {
            console.error(error);
            alert("No se pudo leer la imagen principal.");
        } finally {
            e.target.value = "";
        }
    }

    async function handleGalleryFilesChange(e) {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        try {
            const newItems = await Promise.all(
                files.map(async (file) => ({
                    id: uid(),
                    url: await leerArchivoComoBase64(file),
                    name: file.name,
                }))
            );

            setGallery((prev) => [...prev, ...newItems]);
        } catch (error) {
            console.error(error);
            alert("No se pudieron leer las imágenes del carrusel.");
        } finally {
            e.target.value = "";
        }
    }

    function removeGallery(id) {
        setGallery((prev) => prev.filter((item) => item.id !== id));
    }

    async function handleSubmit() {
        if (saving) return;

        if (!categoria.trim()) {
            setError("La categoría es obligatoria.");
            return;
        }

        if (Number(precio || 0) <= 0) {
            setError("El precio debe ser mayor a 0.");
            return;
        }

        if (!heroUrl.trim()) {
            setError("La imagen principal es obligatoria.");
            return;
        }

        if (selectedColors.length === 0) {
            setError("Debes seleccionar al menos un color.");
            return;
        }

        if (selectedSizes.length === 0) {
            setError("Debes seleccionar al menos una talla.");
            return;
        }

        if (totalStock <= 0) {
            setError("El stock total debe ser mayor a 0.");
            return;
        }

        const variantes = [];
        selectedColors.forEach((color) => {
            selectedSizes.forEach((talla) => {
                variantes.push({
                    color,
                    talla,
                    stock: Number(stockMap[`${color}__${talla}`] || 0),
                });
            });
        });

        const payload = {
            es_new_arrival: false,
            permite_compra: true,
            estado: "Activo",
            categoria: categoria.trim(),
            descripcion: descripcion.trim(),
            precio: Number(precio),
            imagen_principal: heroUrl.trim(),
            imagenes: gallery.length
                ? gallery.map((item, index) => ({
                    imagen: item.url,
                    orden: index + 1,
                }))
                : undefined,
            variantes,
        };

        setError("");
        await onSubmit?.(payload);
    }

    return (
        <div className="fixed inset-0 z-[70]">
            <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            <div className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6">
                <div className="flex h-[100dvh] w-full flex-col overflow-hidden border bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:max-w-6xl sm:rounded-3xl">
                    <div className="flex items-start justify-between gap-3 border-b px-4 py-4 sm:px-6">
                        <div className="min-w-0">
                            <h2 className="truncate text-lg font-semibold sm:text-xl">
                                Publicar en catálogo
                            </h2>
                            <p className="text-xs text-zinc-500 sm:text-sm">
                                {producto.titulo} · completa variantes, stock e imágenes
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
                        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                            <div className="space-y-4">
                                <section className="rounded-2xl border p-4">
                                    <h3 className="text-sm font-semibold">Datos para venta</h3>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <label className="block">
                                            <span className="text-xs font-medium text-zinc-700">Categoría</span>
                                            <select
                                                value={categoria}
                                                onChange={(e) => setCategoria(e.target.value)}
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
                                            <span className="text-xs font-medium text-zinc-700">Precio</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={precio}
                                                onChange={(e) => setPrecio(e.target.value)}
                                                className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                                            />
                                        </label>

                                        <label className="block sm:col-span-2">
                                            <span className="text-xs font-medium text-zinc-700">Descripción</span>
                                            <textarea
                                                rows={4}
                                                value={descripcion}
                                                onChange={(e) => setDescripcion(e.target.value)}
                                                className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                                            />
                                        </label>
                                    </div>
                                </section>

                                <section className="rounded-2xl border p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-semibold">Imágenes</div>
                                        <div className="text-xs text-zinc-500">
                                            Puedes conservar la principal actual o reemplazarla
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                        <div className="rounded-2xl border p-4">
                                            <div className="text-sm font-medium">Imagen principal</div>

                                            <div className="mt-3 aspect-square overflow-hidden rounded-2xl border bg-zinc-100">
                                                {heroUrl ? (
                                                    <img
                                                        src={heroUrl}
                                                        alt="Principal"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="grid h-full w-full place-items-center text-sm text-zinc-500">
                                                        Sin imagen
                                                    </div>
                                                )}
                                            </div>

                                            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white hover:opacity-95">
                                                <Upload size={16} />
                                                Subir principal
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleHeroFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>

                                        <div className="rounded-2xl border p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-medium">Carrusel</div>
                                                <div className="text-xs text-zinc-500">{gallery.length} imágenes nuevas</div>
                                            </div>

                                            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50">
                                                <Plus size={16} />
                                                Agregar imágenes
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleGalleryFilesChange}
                                                    className="hidden"
                                                />
                                            </label>

                                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                {gallery.map((item) => (
                                                    <div key={item.id} className="rounded-2xl border p-2">
                                                        <div className="aspect-square overflow-hidden rounded-xl bg-zinc-100">
                                                            <img
                                                                src={item.url}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeGallery(item.id)}
                                                            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs hover:bg-zinc-50"
                                                        >
                                                            <Trash2 size={14} />
                                                            Quitar
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {gallery.length === 0 ? (
                                                <div className="mt-3 rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-500">
                                                    Si no agregas nuevas imágenes, se conservarán las actuales del producto.
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4 rounded-2xl border p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-semibold">Variantes + Stock</div>
                                            <div className="text-xs text-zinc-500">
                                                Selecciona colores y tallas para publicarlo a venta.
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
                                                    {selectedColors.length} seleccionados
                                                </span>
                                            </div>

                                            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                {colorsCatalog.map((color) => {
                                                    const active = selectedColors.includes(color.name);

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
                                                {DEFAULT_SIZES.map((size) => {
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
                                                    {selectedColors.map((colorName) => {
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
                                            {selectedColors.map((colorName) => {
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
                                            alt={producto.titulo}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="grid h-full w-full place-items-center text-sm text-zinc-500">
                                            Sin imagen
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="font-semibold">{producto.titulo}</div>
                                    <div className="text-zinc-500">SKU: {producto.sku}</div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-500">Precio</span>
                                        <span className="font-semibold">{formatearPrecio(precio)}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-500">Categoría</span>
                                        <span className="font-semibold">{categoria}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-500">Variantes</span>
                                        <span className="font-semibold">
                                            {selectedColors.length} colores · {selectedSizes.length} tallas
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-500">Stock total</span>
                                        <span className="font-semibold">{totalStock}</span>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:justify-end sm:px-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Publicando..." : "Publicar en catálogo"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function NewArrivalsAdmin() {
    const [form, setForm] = useState(initialForm);
    const [imagenesBase64, setImagenesBase64] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [lanzamientos, setLanzamientos] = useState([]);

    const [openPublish, setOpenPublish] = useState(false);
    const [publishSaving, setPublishSaving] = useState(false);
    const [selectedLaunch, setSelectedLaunch] = useState(null);

    const cargarLanzamientos = async () => {
        try {
            setCargando(true);
            setMensaje("");

            const data = await obtenerProductos({
                tipo: "new-arrivals",
                page: 1,
                page_size: 100,
            });

            setLanzamientos(normalizarListadoRespuesta(data));
        } catch (error) {
            console.error(error);
            setLanzamientos([]);
            setMensaje(error.message || "No se pudieron cargar los lanzamientos.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarLanzamientos();
    }, []);

    const cantidadLanzamientos = useMemo(() => lanzamientos.length, [lanzamientos]);

    const manejarChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const manejarImagenes = async (e) => {
        const files = Array.from(e.target.files || []);

        if (!files.length) {
            setImagenesBase64([]);
            return;
        }

        try {
            const imagenes = await Promise.all(files.map(leerArchivoComoBase64));
            setImagenesBase64(imagenes);
        } catch (error) {
            console.error(error);
            alert("No se pudieron leer las imágenes seleccionadas.");
        }
    };

    const guardarLanzamiento = async (e) => {
        e.preventDefault();

        if (!form.titulo.trim()) {
            alert("El título es obligatorio.");
            return;
        }

        if (!form.sku.trim()) {
            alert("El SKU es obligatorio.");
            return;
        }

        if (!form.precio) {
            alert("Debes capturar el precio de referencia.");
            return;
        }

        if (imagenesBase64.length === 0) {
            alert("Debes agregar al menos una imagen.");
            return;
        }

        try {
            setGuardando(true);
            setMensaje("");

            const payload = {
                titulo: form.titulo.trim(),
                sku: form.sku.trim(),
                descripcion: form.descripcion.trim(),
                precio: Number(form.precio),
                categoria: form.categoria.trim(),
                estado: "Activo",
                imagen_principal: imagenesBase64[0] || "",
                imagenes: imagenesBase64.slice(1).map((imagen, index) => ({
                    imagen,
                    orden: index + 1,
                })),
                variantes: [],
                es_new_arrival: true,
                permite_compra: false,
                precio_rebaja: null,
            };

            await crearProducto(payload);

            setMensaje("New arrival creado correctamente.");
            setForm(initialForm);
            setImagenesBase64([]);
            await cargarLanzamientos();
        } catch (error) {
            console.error(error);
            setMensaje(error.message || "No se pudo guardar el lanzamiento.");
        } finally {
            setGuardando(false);
        }
    };

    async function handlePublish(payload) {
        if (!selectedLaunch?.id) return;

        try {
            setPublishSaving(true);
            setMensaje("");

            await actualizarProducto(selectedLaunch.id, payload);

            setMensaje(`"${selectedLaunch.titulo}" ya fue publicado en el catálogo.`);
            setOpenPublish(false);
            setSelectedLaunch(null);
            await cargarLanzamientos();
        } catch (error) {
            console.error(error);
            setMensaje(error.message || "No se pudo publicar el producto.");
        } finally {
            setPublishSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-zinc-900">
                    Administrador de New Arrivals
                </h1>
                <p className="mt-2 text-sm text-zinc-500">
                    Aquí subes próximos lanzamientos. Se muestran en la web, pero no se
                    podrán comprar hasta publicarlos al catálogo completo.
                </p>

                <div className="mt-4 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
                    {cantidadLanzamientos} lanzamiento{cantidadLanzamientos === 1 ? "" : "s"} activo{cantidadLanzamientos === 1 ? "" : "s"}
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <section className="rounded-3xl border bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-zinc-900">
                        Nuevo lanzamiento
                    </h2>

                    <form className="mt-5 space-y-4" onSubmit={guardarLanzamiento}>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-700">
                                Título
                            </label>
                            <input
                                type="text"
                                name="titulo"
                                value={form.titulo}
                                onChange={manejarChange}
                                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-zinc-900"
                                placeholder="Ejemplo: Vestido Primavera Rosa"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-700">
                                    SKU
                                </label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={form.sku}
                                    onChange={manejarChange}
                                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-zinc-900"
                                    placeholder="SKU-NEW-001"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-700">
                                    Categoría de referencia
                                </label>

                                <select
                                    name="categoria"
                                    value={form.categoria}
                                    onChange={manejarChange}
                                    className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-zinc-900"
                                >
                                    {PRODUCT_CATEGORIES.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-700">
                                Precio de referencia
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                name="precio"
                                value={form.precio}
                                onChange={manejarChange}
                                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-zinc-900"
                                placeholder="1499.99"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-700">
                                Descripción
                            </label>
                            <textarea
                                name="descripcion"
                                value={form.descripcion}
                                onChange={manejarChange}
                                rows={5}
                                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-zinc-900"
                                placeholder="Describe el lanzamiento..."
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-700">
                                Imágenes
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={manejarImagenes}
                                className="w-full rounded-xl border px-4 py-3"
                            />
                            <p className="mt-2 text-xs text-zinc-500">
                                La primera imagen será la principal.
                            </p>
                        </div>

                        {imagenesBase64.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                {imagenesBase64.map((imagen, index) => (
                                    <img
                                        key={index}
                                        src={imagen}
                                        alt={`Preview ${index + 1}`}
                                        className="h-32 w-full rounded-2xl border object-cover"
                                    />
                                ))}
                            </div>
                        ) : null}

                        {mensaje ? (
                            <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
                                {mensaje}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={guardando}
                            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
                        >
                            {guardando ? "Guardando..." : "Guardar new arrival"}
                        </button>
                    </form>
                </section>

                <section className="rounded-3xl border bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-zinc-900">
                        Lanzamientos actuales
                    </h2>

                    {cargando ? (
                        <div className="mt-4 rounded-2xl border border-dashed p-6 text-sm text-zinc-500">
                            Cargando lanzamientos...
                        </div>
                    ) : lanzamientos.length === 0 ? (
                        <div className="mt-4 rounded-2xl border border-dashed p-6 text-sm text-zinc-500">
                            Aún no hay productos en new arrivals.
                        </div>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {lanzamientos.map((producto) => (
                                <div key={producto.id} className="rounded-2xl border p-4">
                                    <div className="flex flex-col gap-4 md:flex-row">
                                        <img
                                            src={
                                                producto.imagen_principal ||
                                                "https://placehold.co/300x300?text=Producto"
                                            }
                                            alt={producto.titulo}
                                            className="h-28 w-28 rounded-2xl border object-cover"
                                        />

                                        <div className="flex-1">
                                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <h3 className="text-base font-semibold text-zinc-900">
                                                        {producto.titulo}
                                                    </h3>
                                                    <p className="text-sm text-zinc-500">
                                                        SKU: {producto.sku} · {producto.categoria || "Sin categoría"}
                                                    </p>
                                                </div>

                                                <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                                    Próximo lanzamiento
                                                </span>
                                            </div>

                                            <div className="mt-3 text-sm text-zinc-600">
                                                Precio de referencia: {formatearPrecio(producto.precio)}
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedLaunch(producto);
                                                        setOpenPublish(true);
                                                    }}
                                                    className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                                                >
                                                    Publicar en catálogo
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <PublishArrivalModal
                open={openPublish}
                producto={selectedLaunch}
                onClose={() => {
                    if (publishSaving) return;
                    setOpenPublish(false);
                    setSelectedLaunch(null);
                }}
                onSubmit={handlePublish}
                saving={publishSaving}
            />
        </div>
    );
}