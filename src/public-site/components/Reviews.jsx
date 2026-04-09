// dr_front/src/public-site/components/Reviews.jsx
import { useEffect, useMemo, useState } from "react";
import {
  crearComentarioPublico,
  obtenerComentariosPublicos,
} from "../lib/comentariosApi";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StarsRead({ value }) {
  const v = clamp(Number(value || 0), 0, 5);
  return (
    <div className="flex items-center gap-1" aria-label={`${v} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < v ? "text-black" : "text-black/20"}>
          ★
        </span>
      ))}
    </div>
  );
}

function StarsInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const v = clamp(Number(value || 0), 0, 5);
  const h = clamp(Number(hover || 0), 0, 5);
  const shown = h || v;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        const active = idx <= shown;
        return (
          <button
            key={idx}
            type="button"
            onMouseEnter={() => setHover(idx)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(idx)}
            className={[
              "h-10 w-10 rounded-xl grid place-items-center",
              "transition",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25",
              active ? "text-black" : "text-black/25",
              "hover:bg-black/5",
            ].join(" ")}
            aria-label={`Calificar ${idx} estrellas`}
          >
            ★
          </button>
        );
      })}
      <span className="ml-2 text-sm text-black/60">
        {v ? `${v}/5` : "Sin calificar"}
      </span>
    </div>
  );
}

/** ======================
 *  Modal simple
 *  ====================== */
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-black/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
            <div className="text-lg font-extrabold tracking-tight">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 rounded-full border border-black/10 hover:bg-black/5 transition"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** ======================
 *  Reviews
 *  ====================== */
export default function Reviews({
  productId = null,
  productName = "",
  subtitle = "",
  compact = false,
}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [filterStars, setFilterStars] = useState(0);
  const [sortBy, setSortBy] = useState("new");
  const [sending, setSending] = useState(false);
  const [mensajeEnvio, setMensajeEnvio] = useState("");

  const [form, setForm] = useState({
    name: "",
    stars: 0,
    text: "",
  });

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        setLoading(true);
        setErrorCarga("");

        const data = await obtenerComentariosPublicos({
          productId: productId || undefined,
        });

        if (!cancelado) {
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!cancelado) {
          setErrorCarga(error.message || "No se pudieron cargar las reseñas.");
          setReviews([]);
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    }

    cargar();

    return () => {
      cancelado = true;
    };
  }, [productId]);

  const stats = useMemo(() => {
    const total = reviews.length || 0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.stars) || 0), 0);
    const avg = total ? sum / total : 0;

    const dist = [5, 4, 3, 2, 1].map((s) => {
      const count = reviews.filter((r) => Number(r.stars) === s).length;
      const pct = total ? Math.round((count / total) * 100) : 0;
      return { s, count, pct };
    });

    return {
      total,
      avg: Math.round(avg * 10) / 10,
      dist,
    };
  }, [reviews]);

  const list = useMemo(() => {
    let arr = [...reviews];

    if (filterStars) {
      arr = arr.filter((r) => Number(r.stars) === filterStars);
    }

    if (sortBy === "top") {
      arr.sort((a, b) => (Number(b.stars) || 0) - (Number(a.stars) || 0));
    } else {
      arr.sort((a, b) => {
        const da = new Date(a.createdAt || 0).getTime();
        const db = new Date(b.createdAt || 0).getTime();
        return db - da;
      });
    }

    return arr;
  }, [reviews, filterStars, sortBy]);

  const formOk =
    form.name.trim().length >= 2 &&
    Number(form.stars) >= 1 &&
    form.text.trim().length >= 10 &&
    form.text.trim().length <= 400;

  async function submit() {
    if (!formOk || sending) return;

    try {
      setSending(true);
      setMensajeEnvio("");

      await crearComentarioPublico({
        name: form.name.trim(),
        stars: clamp(Number(form.stars), 1, 5),
        text: form.text.trim(),
        productId: productId ? Number(productId) : null,
        productName: productName || "",
      });

      setOpenForm(false);
      setForm({ name: "", stars: 0, text: "" });
      setMensajeEnvio("Tu reseña fue enviada a revisión. Se publicará cuando sea aprobada.");
    } catch (error) {
      setMensajeEnvio(error.message || "No se pudo enviar la reseña.");
    } finally {
      setSending(false);
    }
  }

  const title = productId ? "Reseñas del producto" : "Lo que dicen nuestras clientas";
  const subtitleText =
    subtitle ||
    (productId
      ? "Comparte tu experiencia con esta prenda."
      : "Califica tus compras y ayuda a otras reinas a elegir mejor.");

  const sectionPadding = compact ? "py-0" : "py-16";
  const titleSize = compact ? "text-2xl sm:text-3xl" : "text-4xl md:text-5xl";
  const layout = compact ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 lg:grid-cols-3 gap-6";
  const listCols = compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";

  return (
    <section className={`mx-auto max-w-7xl ${sectionPadding}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className={`${titleSize} font-extrabold tracking-tight text-black`}>
            {title}
          </h2>
          <p className="mt-2 text-black/60">{subtitleText}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpenForm(true)}
            className="h-10 px-4 rounded-full bg-black text-white font-semibold shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
          >
            Escribir reseña
          </button>
          <button
            type="button"
            onClick={() => setOpenForm(true)}
            className="h-10 px-4 rounded-full border border-black/15 bg-white font-semibold transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
          >
            Calificar
          </button>
        </div>
      </div>

      {mensajeEnvio ? (
        <div className="mt-5 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black/70">
          {mensajeEnvio}
        </div>
      ) : null}

      <div className={`mt-6 ${layout}`}>
        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-black/60">Promedio</div>

          <div className="mt-3 flex items-end gap-3">
            <div className="text-5xl font-extrabold tracking-tight">
              {stats.total ? stats.avg : "—"}
            </div>
            <div className="pb-2">
              <StarsRead value={Math.round(stats.avg)} />
              <div className="mt-1 text-sm text-black/60">
                {stats.total} reseña{stats.total === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {stats.dist.map((d) => (
              <button
                key={d.s}
                type="button"
                onClick={() => setFilterStars((x) => (x === d.s ? 0 : d.s))}
                className={[
                  "w-full rounded-2xl border border-black/10 px-4 py-3 text-left transition",
                  "hover:bg-black/[0.03]",
                  filterStars === d.s ? "bg-black/[0.04]" : "bg-white",
                ].join(" ")}
              >
                <div className="grid gap-2 sm:grid-cols-[52px_1fr_64px] sm:items-center">
                  <div className="flex items-center justify-between sm:block">
                    <span className="text-sm font-semibold">{d.s}★</span>
                    <span className="text-sm text-black/60 sm:hidden">{d.pct}%</span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-black/10 overflow-hidden">
                    <div className="h-full bg-black/60" style={{ width: `${d.pct}%` }} />
                  </div>

                  <div className="hidden sm:block text-right text-sm text-black/60">
                    {d.pct}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={compact ? "" : "lg:col-span-2"}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-black/60">Filtrar:</span>
              <button
                type="button"
                onClick={() => setFilterStars(0)}
                className={[
                  "h-9 px-4 rounded-full border text-sm font-semibold transition",
                  filterStars === 0
                    ? "border-black/20 bg-black/5"
                    : "border-black/10 hover:bg-black/5",
                ].join(" ")}
              >
                Todas
              </button>
              {[5, 4, 3, 2, 1].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStars((x) => (x === s ? 0 : s))}
                  className={[
                    "h-9 px-4 rounded-full border text-sm font-semibold transition",
                    filterStars === s
                      ? "border-black/20 bg-black/5"
                      : "border-black/10 hover:bg-black/5",
                  ].join(" ")}
                >
                  {s}★
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-black/60">Orden:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 rounded-2xl border border-black/10 bg-white px-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
              >
                <option value="new">Más recientes</option>
                <option value="top">Mejor calificadas</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 rounded-3xl border border-black/10 bg-white p-8 text-center text-black/60">
              Cargando reseñas...
            </div>
          ) : errorCarga ? (
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
              {errorCarga}
            </div>
          ) : list.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-black/10 bg-white p-8 text-center text-black/60">
              No hay reseñas aprobadas todavía. Sé la primera en comentar ✨
            </div>
          ) : (
            <div className={`mt-5 grid ${listCols} gap-5`}>
              {list.map((r) => (
                <article
                  key={r.id}
                  className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-extrabold tracking-tight text-black">
                        {r.name || "Anónimo"}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StarsRead value={r.stars} />
                        {r.verified ? (
                          <span className="text-xs font-semibold rounded-full border border-black/10 bg-black/[0.03] px-2 py-1">
                            Compra verificada ✓
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-xs text-black/50">{formatDate(r.createdAt)}</div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-black/70">{r.text}</p>

                  <div className="mt-6 pt-4 border-t border-black/10 text-xs text-black/55">
                    {r.product || productName || "Producto"}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={productId ? "Reseñar este producto" : "Escribir reseña"}
      >
        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-black">Tu nombre</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ej. Karla"
              className="mt-2 h-11 w-full rounded-2xl border border-black/10 px-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
            />
          </div>

          {productId ? (
            <div className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3">
              <div className="text-xs font-semibold text-black/60">Producto</div>
              <div className="mt-1 font-semibold text-black">
                {productName || "Este producto"}
              </div>
            </div>
          ) : null}

          <div>
            <label className="text-sm font-semibold text-black">Calificación</label>
            <div className="mt-2">
              <StarsInput
                value={form.stars}
                onChange={(v) => setForm((p) => ({ ...p, stars: v }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-black">Comentario</label>
            <textarea
              value={form.text}
              onChange={(e) => setForm((p) => ({ ...p, text: e.target.value.slice(0, 400) }))}
              placeholder="Cuéntanos cómo te quedó, calidad de tela, si viene a la talla..."
              rows={4}
              className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-black/55">
              <span>Mínimo 10 caracteres</span>
              <span>{form.text.trim().length}/400</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpenForm(false)}
              className="h-11 px-5 rounded-full border border-black/15 bg-white font-semibold hover:bg-black/5 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!formOk || sending}
              className={[
                "h-11 px-5 rounded-full bg-black text-white font-semibold shadow-sm transition",
                "hover:opacity-90",
                "disabled:opacity-40 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {sending ? "Enviando..." : "Enviar a revisión"}
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
