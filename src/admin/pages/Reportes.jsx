//src/admin/pages/Reportes.jsx
import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import DateField from "../components/reports/DateField";
import { Download, FileText, Sheet, Filter } from "lucide-react";
import { descargarReporte, obtenerReportePreview } from "../services/reportesApi";

function fmtMX(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function isoToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysISO(baseIso, days) {
  const [y, m, d] = baseIso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function monthRange(offsetMonths = 0) {
  const now = new Date();
  const dt = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
  const start = new Date(dt.getFullYear(), dt.getMonth(), 1);
  const end = new Date(dt.getFullYear(), dt.getMonth() + 1, 0);

  const s = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(
    start.getDate()
  ).padStart(2, "0")}`;

  const e = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(
    end.getDate()
  ).padStart(2, "0")}`;

  return { s, e };
}

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full px-3 py-1 text-xs border transition",
        active ? "bg-zinc-900 text-white border-zinc-900" : "bg-white hover:bg-zinc-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function Reportes() {
  const today = isoToday();

  const [desde, setDesde] = useState(addDaysISO(today, -7));
  const [hasta, setHasta] = useState(today);
  const [tipo, setTipo] = useState("Ventas");
  const [formato, setFormato] = useState("PDF");

  const [status, setStatus] = useState("idle");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const preset = useMemo(() => {
    const { s: mS, e: mE } = monthRange(0);
    const { s: pmS, e: pmE } = monthRange(-1);

    const isToday = desde === today && hasta === today;
    const is7d = desde === addDaysISO(today, -7) && hasta === today;
    const isMonth = desde === mS && hasta === mE;
    const isPrevMonth = desde === pmS && hasta === pmE;

    return { isToday, is7d, isMonth, isPrevMonth, mS, mE, pmS, pmE };
  }, [desde, hasta, today]);

  const canGenerate = Boolean(desde && hasta && desde <= hasta);

  async function onGenerate() {
    if (!canGenerate) return;

    try {
      setStatus("generating");
      setError("");

      const data = await obtenerReportePreview({ tipo, desde, hasta });
      setPreview(data);
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo generar la vista previa.");
      setStatus("idle");
    }
  }

  async function onDownload() {
    try {
      await descargarReporte({ tipo, formato, desde, hasta });
    } catch (err) {
      console.error(err);
      alert(err.message || "No se pudo descargar el reporte.");
    }
  }

  const IconTipo = tipo === "Ventas" ? FileText : Sheet;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-end justify-between gap-3 animate-fadeUp">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
          <p className="text-sm text-zinc-500">
            Exportables reales con rangos cómodos y vista previa.
          </p>
        </div>
      </div>

      <Card title="Generar reporte" subtitle="Selecciona rango, tipo y formato">
        <div className="flex flex-wrap gap-2 mb-4">
          <Chip
            active={preset.isToday}
            onClick={() => {
              setDesde(today);
              setHasta(today);
              setStatus("idle");
            }}
          >
            Hoy
          </Chip>

          <Chip
            active={preset.is7d}
            onClick={() => {
              setDesde(addDaysISO(today, -7));
              setHasta(today);
              setStatus("idle");
            }}
          >
            Últimos 7 días
          </Chip>

          <Chip
            active={preset.isMonth}
            onClick={() => {
              setDesde(preset.mS);
              setHasta(preset.mE);
              setStatus("idle");
            }}
          >
            Este mes
          </Chip>

          <Chip
            active={preset.isPrevMonth}
            onClick={() => {
              setDesde(preset.pmS);
              setHasta(preset.pmE);
              setStatus("idle");
            }}
          >
            Mes pasado
          </Chip>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <DateField
            label="Desde"
            value={desde}
            onChange={(v) => {
              setDesde(v);
              setStatus("idle");
            }}
            max={hasta || today}
          />

          <DateField
            label="Hasta"
            value={hasta}
            onChange={(v) => {
              setHasta(v);
              setStatus("idle");
            }}
            min={desde || undefined}
            max={today}
          />

          <label className="block">
            <span className="text-xs font-medium text-zinc-700">Tipo</span>
            <div className="mt-2 relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <select
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value);
                  setStatus("idle");
                }}
                className="w-full rounded-xl border bg-white pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option>Ventas</option>
                <option>Inventario</option>
                <option>Low stock</option>
              </select>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-zinc-700">Formato</span>
            <div className="mt-2">
              <select
                value={formato}
                onChange={(e) => {
                  setFormato(e.target.value);
                  setStatus("idle");
                }}
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
              </select>
            </div>
          </label>
        </div>

        <div className="mt-5 rounded-2xl border bg-zinc-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white border grid place-items-center">
                <IconTipo size={18} className="text-zinc-700" />
              </div>
              <div>
                <div className="text-sm font-semibold">Vista previa</div>
                <div className="text-xs text-zinc-500">
                  {tipo} · {formato} · {fmtMX(desde)} → {fmtMX(hasta)}
                </div>
              </div>
            </div>

            <div className="text-xs text-zinc-500">
              {canGenerate ? "Listo para generar" : "Rango inválido"}
            </div>
          </div>

          <div className="mt-3 text-xs text-zinc-500">
            {error
              ? error
              : preview
                ? `${preview.total_registros || 0} registros listos para exportar.`
                : "Genera la vista previa para validar la información."}
          </div>
        </div>

        {preview && (
          <div className="mt-4 rounded-2xl border overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  {preview.filas?.[0] &&
                    Object.keys(preview.filas[0]).map((header) => (
                      <th
                        key={header}
                        className="text-left px-4 py-3 font-semibold text-zinc-700"
                      >
                        {header}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {(preview.filas || []).slice(0, 20).map((fila, idx) => (
                  <tr key={idx} className="border-t">
                    {Object.keys(fila).map((key) => (
                      <td key={key} className="px-4 py-3">
                        {String(fila[key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}

                {(preview.filas || []).length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-sm text-zinc-500" colSpan={6}>
                      Sin datos para ese filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={onGenerate}
            disabled={!canGenerate || status === "generating"}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition",
              !canGenerate || status === "generating"
                ? "bg-zinc-300 text-zinc-600 cursor-not-allowed"
                : "bg-zinc-900 text-white hover:opacity-95 active:scale-[0.98]",
            ].join(" ")}
          >
            {status === "generating" ? "Generando..." : "Generar"}
          </button>

          <button
            onClick={onDownload}
            disabled={status !== "ready"}
            className={[
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition",
              status !== "ready"
                ? "text-zinc-400 cursor-not-allowed"
                : "hover:bg-zinc-50 active:scale-[0.98]",
            ].join(" ")}
          >
            <Download size={16} />
            Descargar
          </button>
        </div>
      </Card>
    </div>
  );
}