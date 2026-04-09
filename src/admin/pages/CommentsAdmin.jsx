import { useEffect, useMemo, useState } from "react";
import {
    aprobarComentario,
    obtenerComentariosAdmin,
    rechazarComentario,
} from "../api/comentariosApi";
import {
    CheckCircle2,
    MessageSquareText,
    RefreshCcw,
    Search,
    XCircle,
} from "lucide-react";

function formatearFecha(valor) {
    if (!valor) return "—";

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "—";

    return fecha.toLocaleString("es-MX", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function StarsRead({ value }) {
    const total = Math.max(0, Math.min(5, Number(value || 0)));

    return (
        <div className="flex items-center gap-1" aria-label={`${total} de 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < total ? "text-zinc-900" : "text-zinc-300"}>
                    ★
                </span>
            ))}
        </div>
    );
}

function StatusBadge({ estado }) {
    const clases = {
        PENDIENTE: "bg-amber-50 text-amber-700 border-amber-200",
        APROBADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
        RECHAZADO: "bg-red-50 text-red-700 border-red-200",
    };

    return (
        <span
            className={[
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                clases[estado] || "bg-zinc-50 text-zinc-700 border-zinc-200",
            ].join(" ")}
        >
            {estado}
        </span>
    );
}

export default function CommentsAdmin() {
    const [comentarios, setComentarios] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pendientes: 0,
        aprobados: 0,
        rechazados: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [estado, setEstado] = useState("TODOS");
    const [busqueda, setBusqueda] = useState("");
    const [busquedaAplicada, setBusquedaAplicada] = useState("");
    const [accionandoId, setAccionandoId] = useState(null);

    async function cargar() {
        try {
            setLoading(true);
            setError("");

            const data = await obtenerComentariosAdmin({
                estado,
                q: busquedaAplicada,
            });

            setComentarios(Array.isArray(data?.results) ? data.results : []);
            setStats(
                data?.stats || {
                    total: 0,
                    pendientes: 0,
                    aprobados: 0,
                    rechazados: 0,
                }
            );
        } catch (err) {
            setError(err.message || "No se pudieron cargar los comentarios.");
            setComentarios([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        cargar();
    }, [estado, busquedaAplicada]);

    async function aprobar(id) {
        try {
            setAccionandoId(id);
            await aprobarComentario(id);

            setComentarios((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            estado: "APROBADO",
                            reviewedAt: new Date().toISOString(),
                        }
                        : item
                )
            );

            setStats((prev) => ({
                ...prev,
                pendientes: Math.max(0, prev.pendientes - 1),
                aprobados: prev.aprobados + 1,
            }));
        } catch (err) {
            setError(err.message || "No se pudo aprobar el comentario.");
        } finally {
            setAccionandoId(null);
        }
    }

    async function rechazar(id) {
        try {
            setAccionandoId(id);
            await rechazarComentario(id);

            setComentarios((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            estado: "RECHAZADO",
                            reviewedAt: new Date().toISOString(),
                        }
                        : item
                )
            );

            setStats((prev) => ({
                ...prev,
                pendientes: Math.max(0, prev.pendientes - 1),
                rechazados: prev.rechazados + 1,
            }));
        } catch (err) {
            setError(err.message || "No se pudo rechazar el comentario.");
        } finally {
            setAccionandoId(null);
        }
    }

    const pendientesVisibles = useMemo(
        () => comentarios.filter((item) => item.estado === "PENDIENTE").length,
        [comentarios]
    );

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        Administración de comentarios
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Revisa, aprueba o rechaza las reseñas enviadas desde la boutique.
                    </p>
                </div>

                <button
                    onClick={cargar}
                    className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm hover:bg-zinc-50 active:scale-[0.98] transition"
                >
                    <RefreshCcw size={16} />
                    Recargar
                </button>
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="grid gap-3 lg:grid-cols-[220px_1fr_auto]">
                    <label className="block">
                        <span className="text-xs font-medium text-zinc-700">Estado</span>
                        <select
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                        >
                            <option value="TODOS">Todos</option>
                            <option value="PENDIENTE">Pendientes</option>
                            <option value="APROBADO">Aprobados</option>
                            <option value="RECHAZADO">Rechazados</option>
                        </select>
                    </label>

                    <label className="block">
                        <span className="text-xs font-medium text-zinc-700">Buscar</span>
                        <div className="mt-2 flex items-center rounded-xl border bg-white px-3">
                            <Search size={16} className="text-zinc-400" />
                            <input
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setBusquedaAplicada(busqueda);
                                    }
                                }}
                                className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                                placeholder="Nombre, comentario o producto"
                            />
                        </div>
                    </label>

                    <div className="flex items-end">
                        <button
                            onClick={() => setBusquedaAplicada(busqueda)}
                            className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white hover:opacity-95 active:scale-[0.98] transition lg:w-auto"
                        >
                            Buscar
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                        <div className="text-sm font-semibold text-zinc-900">
                            Bandeja de moderación
                        </div>
                        <div className="text-xs text-zinc-500">
                            Pendientes visibles: {pendientesVisibles}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
                        <MessageSquareText size={15} />
                        Comentarios recibidos desde la tienda
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-sm text-zinc-500">
                        Cargando comentarios...
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-sm text-red-600">{error}</div>
                ) : comentarios.length === 0 ? (
                    <div className="p-8 text-center text-sm text-zinc-500">
                        No hay comentarios para mostrar.
                    </div>
                ) : (
                    <div className="divide-y">
                        {comentarios.map((item) => {
                            const bloqueado = accionandoId === item.id;

                            return (
                                <article key={item.id} className="p-4 md:p-5">
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-semibold text-zinc-900">
                                                            {item.name || "Sin nombre"}
                                                        </h3>
                                                        <StatusBadge estado={item.estado} />
                                                    </div>

                                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                                                        <span>Producto: {item.product || "Boutique"}</span>
                                                        <span>Creado: {formatearFecha(item.createdAt)}</span>
                                                        <span>Revisado: {formatearFecha(item.reviewedAt)}</span>
                                                    </div>
                                                </div>

                                                <div className="shrink-0">
                                                    <StarsRead value={item.stars} />
                                                </div>
                                            </div>

                                            <p className="mt-4 rounded-2xl bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-700">
                                                {item.text}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 xl:w-[240px] xl:justify-end">
                                            <button
                                                onClick={() => aprobar(item.id)}
                                                disabled={bloqueado || item.estado === "APROBADO"}
                                                className={[
                                                    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition",
                                                    item.estado === "APROBADO"
                                                        ? "bg-emerald-100 text-emerald-700 cursor-default"
                                                        : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60",
                                                ].join(" ")}
                                            >
                                                <CheckCircle2 size={16} />
                                                Aprobar
                                            </button>

                                            <button
                                                onClick={() => rechazar(item.id)}
                                                disabled={bloqueado || item.estado === "RECHAZADO"}
                                                className={[
                                                    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition",
                                                    item.estado === "RECHAZADO"
                                                        ? "bg-red-100 text-red-700 cursor-default"
                                                        : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60",
                                                ].join(" ")}
                                            >
                                                <XCircle size={16} />
                                                Rechazar
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}