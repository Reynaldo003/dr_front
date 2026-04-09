import { X, Pencil } from "lucide-react";

export default function ProductViewModal({ open, product, onClose, onEdit }) {
  if (!open || !product) return null;

  const thumbs = [
    ...(product.heroUrl ? [{ id: "hero", url: product.heroUrl }] : []),
    ...(product.gallery || []),
  ];

  const stockMap = product?.variants?.stockMap || {};
  const colors = product?.variants?.colors || [];
  const sizes = product?.variants?.sizes || [];

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-black/40 animate-fadeIn" onClick={onClose} />

      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-6">
        <div className="w-full h-[100dvh] sm:h-auto sm:max-h-[88vh] sm:max-w-4xl bg-white sm:rounded-3xl shadow-2xl border animate-fadeUp overflow-hidden flex flex-col">
          <div className="px-4 sm:px-6 py-4 border-b flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold truncate">{product.title}</h2>
              <p className="text-xs sm:text-sm text-zinc-500">
                {product.id} · SKU: {product.sku}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:opacity-95"
              >
                <Pencil size={16} /> Editar
              </button>
              <button onClick={onClose} className="rounded-xl border px-3 py-2 hover:bg-zinc-50">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="px-4 sm:px-6 py-5 grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="space-y-3">
                <div className="aspect-square rounded-2xl border bg-zinc-100 overflow-hidden">
                  {product.heroUrl ? (
                    <img src={product.heroUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-zinc-500">
                      Sin imagen principal
                    </div>
                  )}
                </div>

                <div className="flex gap-2 overflow-auto pb-1">
                  {thumbs.map((t) => (
                    <div key={t.id} className="h-14 w-14 rounded-xl border bg-zinc-100 overflow-hidden flex-none">
                      <img src={t.url} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <aside className="rounded-2xl border p-4 h-fit">
                <div className="text-sm font-semibold">Resumen</div>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Precio</span>
                    <span className="font-semibold">${Number(product.price).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Estado</span>
                    <span className="font-semibold">{product.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Stock total</span>
                    <span className="font-semibold">{product.stockTotal}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-zinc-50 border p-3">
                  <div className="text-xs font-semibold text-zinc-700">Variantes</div>
                  <div className="mt-2 text-xs text-zinc-600">
                    {colors.length} colores · {sizes.length} tallas
                  </div>
                </div>

                <button
                  onClick={onEdit}
                  className="sm:hidden mt-4 w-full rounded-xl bg-zinc-900 text-white py-2 text-sm hover:opacity-95"
                >
                  Editar
                </button>
              </aside>

              <div className="lg:col-span-2 rounded-2xl border p-4">
                <div className="text-sm font-semibold">Stock por variante</div>
                <div className="text-xs text-zinc-500">color × talla</div>

                <div className="mt-3 hidden md:block overflow-auto rounded-2xl border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-zinc-700">Color</th>
                        {sizes.map((sz) => (
                          <th key={sz} className="text-left px-4 py-3 font-semibold text-zinc-700">
                            {sz}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {colors.map((c) => (
                        <tr key={c} className="border-t">
                          <td className="px-4 py-3 font-medium">{c}</td>
                          {sizes.map((sz) => (
                            <td key={sz} className="px-4 py-3">
                              {stockMap[`${c}__${sz}`] ?? 0}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 md:hidden space-y-3">
                  {colors.map((c) => (
                    <div key={c} className="rounded-2xl border bg-white p-4">
                      <div className="font-semibold">{c}</div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {sizes.map((sz) => (
                          <div key={sz} className="rounded-xl border p-3">
                            <div className="text-xs text-zinc-500">{sz}</div>
                            <div className="text-lg font-semibold">{stockMap[`${c}__${sz}`] ?? 0}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-3 border-t flex justify-end">
            <button onClick={onClose} className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}