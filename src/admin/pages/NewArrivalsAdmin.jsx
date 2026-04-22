import { useEffect, useState } from "react";
import {
    actualizarProducto,
    crearProducto,
    obtenerProductos,
} from "../lib/productosAdminApi";

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

const initialForm = {
    titulo: "",
    sku: "",
    descripcion: "",
    precio: "",
    categoria: "Vestidos",
    estado: "Activo",
};

export default function NewArrivalsAdmin() {
    const [form, setForm] = useState(initialForm);
    const [imagenesBase64, setImagenesBase64] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [lanzamientos, setLanzamientos] = useState([]);

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

        try {
            setGuardando(true);
            setMensaje("");

            const payload = {
                titulo: form.titulo.trim(),
                sku: form.sku.trim(),
                descripcion: form.descripcion.trim(),
                precio: Number(form.precio),
                categoria: form.categoria.trim(),
                estado: form.estado,
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

    const publicarEnCatalogo = async (producto) => {
        try {
            await actualizarProducto(producto.id, {
                es_new_arrival: false,
                permite_compra: true,
            });

            setMensaje(`"${producto.titulo}" ya fue publicado en el catálogo.`);
            await cargarLanzamientos();
        } catch (error) {
            console.error(error);
            setMensaje(error.message || "No se pudo publicar el producto.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-zinc-900">
                    Administrador de New Arrivals
                </h1>
                <p className="mt-2 text-sm text-zinc-500">
                    Aquí subes próximos lanzamientos. Estos productos se mostrarán en la web,
                    pero no se podrán comprar hasta que los publiques al catálogo normal.
                </p>
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
                                    Categoría
                                </label>

                                <select
                                    name="categoria"
                                    value={form.categoria}
                                    onChange={manejarChange}
                                    className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-zinc-900"
                                >
                                    <option value="Vestidos">Vestidos</option>
                                    <option value="Conjuntos">Conjuntos</option>
                                    <option value="Blusas">Blusas</option>
                                    <option value="Jeans">Jeans</option>
                                    <option value="Accesorios">Accesorios</option>
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
                                                producto.imagenes?.[0]?.imagen ||
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

                                            <div className="mt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => publicarEnCatalogo(producto)}
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
        </div>
    );
}