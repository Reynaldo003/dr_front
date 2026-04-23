import { useEffect, useMemo, useState } from "react";
import { obtenerRebajas } from "../../lib/productosPublicApi";
import { useCart } from "../../context/cart";

function formatearPrecio(valor) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
    }).format(Number(valor || 0));
}

function obtenerImagen(producto) {
    return (
        producto.imagen_principal ||
        producto.imagenes?.[0]?.imagen ||
        "https://placehold.co/600x700?text=Rebaja"
    );
}

export default function RebajasPage() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const cart = useCart?.();
    const addToCart =
        cart?.addItem || cart?.agregarItem || cart?.addToCart || null;

    useEffect(() => {
        const cargar = async () => {
            try {
                setCargando(true);
                setError("");

                const data = await obtenerRebajas({}, { cache: false });
                setProductos(data || []);
            } catch (err) {
                console.error(err);
                setError(err.message || "No se pudieron cargar las rebajas.");
            } finally {
                setCargando(false);
            }
        };

        cargar();
    }, []);

    const hayProductos = useMemo(() => productos.length > 0, [productos]);

    const agregarAlCarrito = (producto) => {
        if (typeof addToCart !== "function") {
            alert("No se encontró la función del carrito. Revisa tu contexto useCart.");
            return;
        }

        addToCart({
            ...producto,
            precio: Number(producto.precio || 0),
            precio_original: Number(producto.precio_original || producto.precio || 0),
            imagen: obtenerImagen(producto),
            imagen_principal: obtenerImagen(producto),
        });
    };

    return (
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <section className="rounded-[32px] bg-zinc-900 px-6 py-10 text-white sm:px-8">
                <div className="max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                        Boutique
                    </p>
                    <h1 className="mt-3 text-3xl font-bold sm:text-5xl">
                        Rebajas
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                        Descubre productos seleccionados con descuento real.
                    </p>
                </div>
            </section>

            {cargando ? (
                <div className="mt-8 rounded-3xl border border-dashed p-8 text-sm text-zinc-500">
                    Cargando rebajas...
                </div>
            ) : error ? (
                <div className="mt-8 rounded-3xl bg-red-50 p-6 text-sm text-red-700">
                    {error}
                </div>
            ) : !hayProductos ? (
                <div className="mt-8 rounded-3xl border border-dashed p-8 text-sm text-zinc-500">
                    Por ahora no hay productos en rebaja.
                </div>
            ) : (
                <section className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {productos.map((producto) => (
                        <article
                            key={producto.id}
                            className="group overflow-hidden rounded-[28px] border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="relative">
                                <img
                                    src={obtenerImagen(producto)}
                                    alt={producto.titulo}
                                    className="h-[380px] w-full object-cover"
                                />

                                <div className="absolute left-4 top-4 inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow">
                                    -{producto.porcentaje_descuento}% OFF
                                </div>
                            </div>

                            <div className="space-y-4 p-5">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                                        {producto.categoria || "Boutique"}
                                    </p>
                                    <h2 className="mt-2 text-lg font-semibold text-zinc-900">
                                        {producto.titulo}
                                    </h2>
                                </div>

                                <div className="flex items-end gap-3">
                                    <span className="text-sm text-zinc-400 line-through">
                                        {formatearPrecio(producto.precio_original)}
                                    </span>
                                    <span className="text-2xl font-bold text-red-600">
                                        {formatearPrecio(producto.precio)}
                                    </span>
                                </div>

                                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                    Ahorras{" "}
                                    {formatearPrecio(
                                        Number(producto.precio_original || 0) - Number(producto.precio || 0)
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => agregarAlCarrito(producto)}
                                    disabled={!producto.permite_compra || Number(producto.stock_disponible || 0) <= 0}
                                    className="w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                                >
                                    {Number(producto.stock_disponible || 0) > 0
                                        ? "Agregar al carrito"
                                        : "Agotado"}
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}