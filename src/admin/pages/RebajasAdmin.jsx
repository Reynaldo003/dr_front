// dr_front/src/admin/pages/RebajasAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import {
    actualizarProducto,
    obtenerProductos,
} from "../lib/productosAdminApi";

function formatearPrecio(valor) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
    }).format(Number(valor || 0));
}

function calcularPorcentaje(precioNormal, precioRebaja) {
    const normal = Number(precioNormal || 0);
    const rebaja = Number(precioRebaja || 0);

    if (!normal || !rebaja || rebaja >= normal) return 0;
    return Math.round(((normal - rebaja) / normal) * 100);
}

export default function RebajasAdmin() {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [seleccionadoId, setSeleccionadoId] = useState(null);
    const [nuevoPrecio, setNuevoPrecio] = useState("");
    const [mensaje, setMensaje] = useState("");

    const cargarProductos = async (texto = "") => {
        try {
            setCargando(true);
            const data = await obtenerProductos({ buscar: texto });
            const normales = (data || []).filter((item) => !item.es_new_arrival);

            setProductos(normales);

            if (normales.length > 0) {
                const existeSeleccionado = normales.some((p) => p.id === seleccionadoId);
                const primerId = existeSeleccionado ? seleccionadoId : normales[0].id;
                setSeleccionadoId(primerId);

                const seleccionadoActual = normales.find((p) => p.id === primerId);
                setNuevoPrecio(seleccionadoActual?.precio_rebaja || "");
            } else {
                setSeleccionadoId(null);
                setNuevoPrecio("");
            }
        } catch (error) {
            console.error(error);
            setMensaje(error.message || "No se pudieron cargar los productos.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    const productoSeleccionado = useMemo(() => {
        return productos.find((item) => item.id === seleccionadoId) || null;
    }, [productos, seleccionadoId]);

    useEffect(() => {
        if (productoSeleccionado) {
            setNuevoPrecio(productoSeleccionado.precio_rebaja || "");
        }
    }, [productoSeleccionado]);

    const guardarRebaja = async () => {
        if (!productoSeleccionado) return;

        const precioBase = Number(productoSeleccionado.precio || 0);
        const precioNuevo = Number(nuevoPrecio || 0);

        if (!precioNuevo || precioNuevo >= precioBase) {
            alert("El nuevo precio debe ser menor al precio original.");
            return;
        }

        try {
            setGuardando(true);
            setMensaje("");

            await actualizarProducto(productoSeleccionado.id, {
                precio_rebaja: precioNuevo,
            });

            setMensaje("Rebaja guardada correctamente.");
            await cargarProductos(busqueda);
        } catch (error) {
            console.error(error);
            setMensaje(error.message || "No se pudo guardar la rebaja.");
        } finally {
            setGuardando(false);
        }
    };

    const quitarRebaja = async () => {
        if (!productoSeleccionado) return;

        try {
            setGuardando(true);
            setMensaje("");

            await actualizarProducto(productoSeleccionado.id, {
                precio_rebaja: null,
            });

            setMensaje("Rebaja eliminada correctamente.");
            await cargarProductos(busqueda);
        } catch (error) {
            console.error(error);
            setMensaje(error.message || "No se pudo quitar la rebaja.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-zinc-900">Administrador de Rebajas</h1>
                <p className="mt-2 text-sm text-zinc-500">
                    Selecciona un producto existente, asigna un nuevo precio y se publicará
                    automáticamente en el apartado de rebajas de la tienda.
                </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-3xl border bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <h2 className="text-lg font-semibold text-zinc-900">
                            Productos registrados
                        </h2>

                        <form
                            className="flex gap-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                cargarProductos(busqueda);
                            }}
                        >
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar por título, SKU o categoría"
                                className="w-full rounded-xl border px-4 py-2 text-sm outline-none focus:border-zinc-900 md:w-80"
                            />
                            <button
                                type="submit"
                                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                            >
                                Buscar
                            </button>
                        </form>
                    </div>

                    {cargando ? (
                        <div className="rounded-2xl border border-dashed p-6 text-sm text-zinc-500">
                            Cargando productos...
                        </div>
                    ) : productos.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-6 text-sm text-zinc-500">
                            No se encontraron productos.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {productos.map((producto) => {
                                const activo = producto.id === seleccionadoId;

                                return (
                                    <button
                                        key={producto.id}
                                        type="button"
                                        onClick={() => setSeleccionadoId(producto.id)}
                                        className={[
                                            "w-full rounded-2xl border p-4 text-left transition",
                                            activo
                                                ? "border-zinc-900 bg-zinc-900 text-white"
                                                : "hover:border-zinc-300 hover:bg-zinc-50",
                                        ].join(" ")}
                                    >
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <div className="text-base font-semibold">{producto.titulo}</div>
                                                <div
                                                    className={[
                                                        "text-xs",
                                                        activo ? "text-zinc-200" : "text-zinc-500",
                                                    ].join(" ")}
                                                >
                                                    SKU: {producto.sku} · Categoría: {producto.categoria || "Sin categoría"}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-sm font-medium">
                                                    {formatearPrecio(producto.precio)}
                                                </div>

                                                {producto.en_rebaja && (
                                                    <div
                                                        className={[
                                                            "mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                                                            activo
                                                                ? "bg-white/15 text-white"
                                                                : "bg-red-100 text-red-700",
                                                        ].join(" ")}
                                                    >
                                                        En rebaja {producto.porcentaje_descuento}% OFF
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>

                <aside className="rounded-3xl border bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-zinc-900">Configurar rebaja</h2>

                    {!productoSeleccionado ? (
                        <div className="mt-4 rounded-2xl border border-dashed p-6 text-sm text-zinc-500">
                            Selecciona un producto para editar su precio de rebaja.
                        </div>
                    ) : (
                        <div className="mt-4 space-y-4">
                            <div className="rounded-2xl bg-zinc-50 p-4">
                                <div className="text-sm text-zinc-500">Producto</div>
                                <div className="mt-1 font-semibold text-zinc-900">
                                    {productoSeleccionado.titulo}
                                </div>
                                <div className="mt-1 text-sm text-zinc-500">
                                    Precio actual: {formatearPrecio(productoSeleccionado.precio)}
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-700">
                                    Nuevo precio para rebaja
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={nuevoPrecio}
                                    onChange={(e) => setNuevoPrecio(e.target.value)}
                                    className="w-full rounded-xl border px-4 py-3 outline-none focus:border-zinc-900"
                                    placeholder="Ejemplo: 799.99"
                                />
                            </div>

                            <div className="rounded-2xl border p-4">
                                <div className="text-sm text-zinc-500">Vista previa</div>

                                <div className="mt-3 flex items-end gap-3">
                                    <span className="text-sm text-zinc-400 line-through">
                                        {formatearPrecio(productoSeleccionado.precio)}
                                    </span>

                                    <span className="text-2xl font-bold text-red-600">
                                        {formatearPrecio(nuevoPrecio || productoSeleccionado.precio)}
                                    </span>
                                </div>

                                <div className="mt-2 text-sm font-medium text-red-600">
                                    {calcularPorcentaje(
                                        productoSeleccionado.precio,
                                        nuevoPrecio || productoSeleccionado.precio
                                    )}% de descuento
                                </div>
                            </div>

                            {mensaje && (
                                <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
                                    {mensaje}
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={guardarRebaja}
                                    disabled={guardando}
                                    className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
                                >
                                    {guardando ? "Guardando..." : "Guardar rebaja"}
                                </button>

                                <button
                                    type="button"
                                    onClick={quitarRebaja}
                                    disabled={guardando}
                                    className="rounded-xl border px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
                                >
                                    Quitar rebaja
                                </button>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}