import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";

export default function ProductEditModal({ open, product, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState("Activo");
  const [heroUrl, setHeroUrl] = useState("");

  useEffect(() => {
    if (!open || !product) return;
    setTitle(product.title || "");
    setSku(product.sku || "");
    setPrice(Number(product.price || 0));
    setStatus(product.status || "Activo");
    setHeroUrl(product.heroUrl || "");
  }, [open, product]);

  if (!open || !product) return null;

  function handleSave() {
    const updated = {
      ...product,
      title: title.trim(),
      sku: sku.trim(),
      price: Number(price || 0),
      status,
      heroUrl: heroUrl.trim(),
    };
    onSave?.(updated);
  }

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-black/40 animate-fadeIn" onClick={onClose} />

      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-6">
        <div className="w-full h-[100dvh] sm:h-auto sm:max-h-[88vh] sm:max-w-3xl bg-white sm:rounded-3xl shadow-2xl border animate-fadeUp overflow-hidden flex flex-col">
          <div className="px-4 sm:px-6 py-4 border-b flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold truncate">Editar producto</h2>
              <p className="text-xs sm:text-sm text-zinc-500">
                {product.id} · actualiza datos generales
              </p>
            </div>

            <button onClick={onClose} className="rounded-xl border px-3 py-2 hover:bg-zinc-50">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-auto px-4 sm:px-6 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-zinc-700">Título</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-zinc-700">SKU</span>
                <input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-zinc-700">Precio</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-zinc-700">Estado</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                >
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-zinc-700">Imagen principal (URL o base64)</span>
                <input
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                />
                <div className="mt-3 aspect-video rounded-2xl border bg-zinc-100 overflow-hidden">
                  {heroUrl ? (
                    <img src={heroUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-zinc-500 text-sm">
                      Sin imagen
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-3 border-t flex flex-col sm:flex-row gap-2 justify-end">
            <button onClick={onClose} className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:opacity-95"
            >
              <Save size={16} /> Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}