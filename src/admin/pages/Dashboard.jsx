//src/admin/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { Download, Filter, Sparkles, CalendarDays } from "lucide-react";
import { descargarReporte, obtenerDashboardResumen } from "../services/reportesApi";

function estadoBadge(estado) {
  if (estado === "PAGADA") return <Badge variant="success">Pagada</Badge>;
  if (estado === "PENDIENTE") return <Badge variant="warning">Pendiente</Badge>;
  if (estado === "REEMBOLSADA") return <Badge variant="neutral">Reembolsada</Badge>;
  return <Badge variant="danger">Cancelada</Badge>;
}

function todayYmdLocal() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Dashboard() {
  const todayYmd = useMemo(() => todayYmdLocal(), []);
  const [rangeMode, setRangeMode] = useState("day");
  const [selectedYmd, setSelectedYmd] = useState(todayYmd);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    cargarResumen();
  }, [rangeMode, selectedYmd]);

  async function cargarResumen() {
    try {
      setLoading(true);
      setError("");

      const resumen = await obtenerDashboardResumen({
        modo: rangeMode,
        fecha_base: selectedYmd,
      });

      setData(resumen);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExportar() {
    try {
      await descargarReporte({
        tipo: "Ventas",
        formato: "Excel",
        desde: data?.ventas?.length ? data.ventas[data.ventas.length - 1]?.fecha_venta : selectedYmd,
        hasta: data?.ventas?.length ? data.ventas[0]?.fecha_venta : selectedYmd,
      });
    } catch (err) {
      console.error(err);
      alert(err.message || "No se pudo exportar.");
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between animate-fadeUp">
        <div>
          <div className="inline-flex items-center gap-2 text-xs text-zinc-500 mb-2">
            <Sparkles size={14} />
            Panel administrativo
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500">Ventas reales filtradas por periodo.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={cargarResumen}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-zinc-50 active:scale-[0.98] transition"
          >
            <Filter size={16} />
            Actualizar
          </button>

          <button
            onClick={handleExportar}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white px-3 py-2 text-sm hover:opacity-95 active:scale-[0.98] transition"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      <Card title="Filtro de ventas" subtitle="Selecciona periodo y fecha base">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRangeMode("day")}
              className={`rounded-xl px-3 py-2 text-sm border transition ${rangeMode === "day"
                ? "bg-zinc-900 text-white border-zinc-900"
                : "hover:bg-zinc-50"
                }`}
            >
              Día
            </button>

            <button
              onClick={() => setRangeMode("week")}
              className={`rounded-xl px-3 py-2 text-sm border transition ${rangeMode === "week"
                ? "bg-zinc-900 text-white border-zinc-900"
                : "hover:bg-zinc-50"
                }`}
            >
              Semana
            </button>

            <button
              onClick={() => setRangeMode("month")}
              className={`rounded-xl px-3 py-2 text-sm border transition ${rangeMode === "month"
                ? "bg-zinc-900 text-white border-zinc-900"
                : "hover:bg-zinc-50"
                }`}
            >
              Mes
            </button>

            <button
              onClick={() => setSelectedYmd(todayYmd)}
              className="rounded-xl px-3 py-2 text-sm border hover:bg-zinc-50 active:scale-[0.98] transition"
              title="Volver a hoy"
            >
              Hoy
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm bg-white">
              <CalendarDays size={16} className="text-zinc-500" />
              <input
                type="date"
                value={selectedYmd}
                onChange={(e) => setSelectedYmd(e.target.value)}
                className="outline-none bg-transparent"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 rounded-2xl border bg-white p-4 text-sm text-zinc-600">
            Cargando resumen...
          </div>
        ) : error ? (
          <div className="mt-4 rounded-2xl border bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border p-4 bg-white">
                <div className="text-xs text-zinc-500">Órdenes</div>
                <div className="text-2xl font-semibold">{data?.total_ordenes || 0}</div>
              </div>

              <div className="rounded-2xl border p-4 bg-white">
                <div className="text-xs text-zinc-500">Total vendido</div>
                <div className="text-2xl font-semibold">
                  ${Number(data?.total_ventas || 0).toLocaleString()}
                </div>
              </div>

              <div className="rounded-2xl border p-4 bg-white">
                <div className="text-xs text-zinc-500">Pagadas</div>
                <div className="text-2xl font-semibold">{data?.ordenes_pagadas || 0}</div>
              </div>

              <div className="rounded-2xl border p-4 bg-white">
                <div className="text-xs text-zinc-500">Ticket promedio</div>
                <div className="text-2xl font-semibold">
                  ${Number(data?.ticket_promedio || 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl border bg-white p-4">
                <div className="text-sm font-semibold">Resumen por estado</div>
                <div className="mt-3 space-y-2">
                  {(data?.resumen_estados || []).map((item) => (
                    <div
                      key={item.estado}
                      className="rounded-xl border p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {estadoBadge(item.estado)}
                        <span className="text-sm">{item.cantidad} órdenes</span>
                      </div>
                      <div className="font-semibold">
                        ${Number(item.total || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4">
                <div className="text-sm font-semibold">Low stock</div>
                <div className="mt-3 space-y-2">
                  {(data?.low_stock || []).length === 0 ? (
                    <div className="rounded-xl border p-3 text-sm text-zinc-500">
                      No hay productos con bajo stock.
                    </div>
                  ) : (
                    (data?.low_stock || []).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border p-3 flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">{item.titulo}</div>
                          <div className="text-xs text-zinc-500 truncate">
                            {item.codigo} · SKU: {item.sku}
                          </div>
                        </div>
                        <div className="text-sm font-semibold">{item.stock_disponible}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      <Card title="Ventas" subtitle="Resultados según filtro">
        <div className="overflow-auto rounded-2xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                {["Folio", "Fecha", "Cliente", "Total", "Estado"].map((c) => (
                  <th key={c} className="text-left px-4 py-3 font-semibold text-zinc-700">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white">
              {(data?.ventas || []).map((v) => (
                <tr key={v.id} className="border-t hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{v.folio}</td>
                  <td className="px-4 py-3">{v.fecha_venta}</td>
                  <td className="px-4 py-3">{v.cliente}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    ${Number(v.total || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{estadoBadge(v.estado)}</td>
                </tr>
              ))}

              {(!data?.ventas || data.ventas.length === 0) && !loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">
                    No hay ventas para este periodo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}