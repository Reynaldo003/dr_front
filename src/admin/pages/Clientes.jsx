import { useEffect, useMemo, useState } from "react";
import { Search, Users, MapPin, Mail, Phone } from "lucide-react";
import Card from "../components/ui/Card";
import { obtenerClientesAdmin } from "../services/clientesApi";

function money(n) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
    }).format(Number(n || 0));
}

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [q, setQ] = useState("");

    useEffect(() => {
        cargarClientes();
    }, []);

    async function cargarClientes(search = "") {
        try {
            setLoading(true);
            setError("");
            const data = await obtenerClientesAdmin({ q: search });
            setClientes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(err.message || "No se pudieron cargar los clientes.");
            setClientes([]);
        } finally {
            setLoading(false);
        }
    }

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();

        if (!query) return clientes;

        return clientes.filter((cliente) => {
            const texto = [
                cliente.nombre,
                cliente.email,
                cliente.telefono,
                ...(cliente.direcciones || []).map((d) =>
                    [
                        d.alias,
                        d.destinatario,
                        d.direccion_linea1,
                        d.ciudad,
                        d.estado_direccion,
                        d.codigo_postal,
                    ].join(" "),
                ),
            ]
                .join(" ")
                .toLowerCase();

            return texto.includes(query);
        });
    }, [clientes, q]);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
                    <p className="text-sm text-zinc-500">
                        Lista de clientes registrados con sus datos y direcciones.
                    </p>
                </div>

                <div className="relative w-full sm:w-80">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                        size={18}
                    />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="w-full rounded-xl border bg-white pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                        placeholder="Buscar cliente, correo, teléfono o dirección"
                    />
                </div>
            </div>

            <Card title="Clientes registrados">
                {loading ? (
                    <div className="rounded-2xl border bg-white p-6 text-sm text-zinc-600">
                        Cargando clientes...
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border bg-red-50 p-6 text-sm text-red-700">
                        {error}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl border bg-zinc-50 p-6 text-sm text-zinc-600">
                        No hay clientes para mostrar.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((cliente) => (
                            <div key={cliente.id} className="rounded-2xl border bg-white p-4">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-zinc-50">
                                                <Users size={18} />
                                            </div>

                                            <div>
                                                <div className="font-semibold text-lg">{cliente.nombre}</div>
                                                <div className="text-xs text-zinc-500">
                                                    Cliente #{cliente.id} · Registrado el {cliente.fecha_creacion}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-xl border p-3">
                                                <div className="text-xs text-zinc-500 flex items-center gap-2">
                                                    <Mail size={14} />
                                                    Correo
                                                </div>
                                                <div className="mt-1 font-medium break-all">{cliente.email || "-"}</div>
                                            </div>

                                            <div className="rounded-xl border p-3">
                                                <div className="text-xs text-zinc-500 flex items-center gap-2">
                                                    <Phone size={14} />
                                                    Teléfono
                                                </div>
                                                <div className="mt-1 font-medium">{cliente.telefono || "-"}</div>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                            <div className="rounded-xl border p-3">
                                                <div className="text-xs text-zinc-500">Pedidos</div>
                                                <div className="mt-1 font-semibold">{cliente.total_pedidos}</div>
                                            </div>

                                            <div className="rounded-xl border p-3">
                                                <div className="text-xs text-zinc-500">Pagados</div>
                                                <div className="mt-1 font-semibold">{cliente.pedidos_pagados}</div>
                                            </div>

                                            <div className="rounded-xl border p-3">
                                                <div className="text-xs text-zinc-500">Total gastado</div>
                                                <div className="mt-1 font-semibold">{money(cliente.total_gastado)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full lg:max-w-xl">
                                        <div className="text-sm font-semibold">Direcciones</div>

                                        <div className="mt-2 space-y-2">
                                            {(cliente.direcciones || []).length === 0 ? (
                                                <div className="rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-600">
                                                    Sin direcciones registradas.
                                                </div>
                                            ) : (
                                                cliente.direcciones.map((dir) => (
                                                    <div key={dir.id} className="rounded-xl border p-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <MapPin size={14} className="text-zinc-500" />
                                                            <span className="font-medium">
                                                                {dir.alias || dir.destinatario || "Dirección"}
                                                            </span>
                                                            {dir.principal ? (
                                                                <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                                                                    Principal
                                                                </span>
                                                            ) : null}
                                                        </div>

                                                        <div className="mt-2 text-sm text-zinc-700">
                                                            {dir.destinatario ? <div>{dir.destinatario}</div> : null}
                                                            <div>{dir.direccion_linea1}</div>
                                                            {dir.direccion_linea2 ? <div>{dir.direccion_linea2}</div> : null}
                                                            <div>
                                                                {dir.ciudad}, {dir.estado_direccion} {dir.codigo_postal || ""}
                                                            </div>
                                                            {dir.telefono ? <div>Tel: {dir.telefono}</div> : null}
                                                            {dir.referencias_envio ? (
                                                                <div className="text-xs text-zinc-500 mt-1">
                                                                    Referencias: {dir.referencias_envio}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}