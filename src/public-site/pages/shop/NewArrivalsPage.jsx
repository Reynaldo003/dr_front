// dr_front/src/public-site/pages/shop/NewArrivalsPage.jsx
import { useEffect, useState } from "react";
import { obtenerNewArrivals } from "../../lib/productosPublicApi";

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
        "https://placehold.co/600x700?text=New+Arrival"
    );
}

export default function NewArrivalsPage() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargar = async () => {
            try {
                setCargando(true);
                const data = await obtenerNewArrivals();
                setProductos(data || []);
            } catch (err) {
                console.error(err);
                setError(err.message || "No se pudieron cargar los lanzamientos.");
            } finally {
                setCargando(false);
            }
        };

        cargar();
    }, []);

    return (
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <section className="rounded-[32px] bg-amber-50 px-6 py-10 sm:px-8">
                <div className="max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
                        Próximos lanzamientos
                    </p>
                    <h1 className="mt-3 text-3xl font-bold text-zinc-900 sm:text-5xl">
                        New Arrivals
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
                        Conoce antes que nadie las próximas prendas de la colección. Estos
                        artículos todavía no están habilitados para compra.
                    </p>
                </div>
            </section>

            {cargando ? (
                <div className="mt-8 rounded-3xl border border-dashed p-8 text-sm text-zinc-500">
                    Cargando lanzamientos...
                </div>
            ) : error ? (
                <div className="mt-8 rounded-3xl bg-red-50 p-6 text-sm text-red-700">
                    {error}
                </div>
            ) : productos.length === 0 ? (
                <div className="mt-8 rounded-3xl border border-dashed p-8 text-sm text-zinc-500">
                    Aún no hay productos en new arrivals.
                </div>
            ) : (
                <section className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {productos.map((producto) => (
                        <article
                            key={producto.id}
                            className="overflow-hidden rounded-[28px] border bg-white shadow-sm"
                        >
                            <div className="relative">
                                <img
                                    src={obtenerImagen(producto)}
                                    alt={producto.titulo}
                                    className="h-[380px] w-full object-cover"
                                />

                                <div className="absolute left-4 top-4 inline-flex rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow">
                                    Próximamente
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

                                {producto.descripcion && (
                                    <p className="text-sm leading-6 text-zinc-600 line-clamp-3">
                                        {producto.descripcion}
                                    </p>
                                )}

                                <div className="text-lg font-bold text-zinc-900">
                                    {formatearPrecio(producto.precio)}
                                </div>

                                <button
                                    type="button"
                                    disabled
                                    className="w-full cursor-not-allowed rounded-2xl bg-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-600"
                                >
                                    Próximamente
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}