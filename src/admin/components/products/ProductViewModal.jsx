//src/admin/component/products/ProductViewModal.jsx
import { Pencil, X } from "lucide-react";
function SkeletonBox({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-zinc-100 ${className}`} />;
}

export default function ProductViewModal({
  open,
  product,
  onClose,
  onEdit,
  loading = false,
}) {
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
      <button
        type="button"
        className="absolute inset-0 bg-black/40 animate-fadeIn"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6">
        <div className="flex h-[100dvh] w-full flex-col overflow-hidden border bg-white shadow-2xl animate-fadeUp sm:h-auto sm:max-h-[88vh] sm:max-w-4xl sm:rounded-3xl">
          <div className="flex items-start justify-between gap-3 border-b px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold sm:text-xl">
                {product.title || "Producto"}
              </h2>
              <p className="text-xs text-zinc-500 sm:text-sm">
                {product.id} · SKU: {product.sku || "—"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onEdit}
                disabled={loading}
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Pencil size={16} />
                Editar
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border px-3 py-2 hover:bg-zinc-50"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="grid gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-3">
                  <SkeletonBox className="aspect-square w-full border" />
                  <div className="flex gap-2">
                    <SkeletonBox className="h-14 w-14" />
                    <SkeletonBox className="h-14 w-14" />
                    <SkeletonBox className="h-14 w-14" />
                  </div>
                </div>

                <aside className="h-fit rounded-2xl border p-4">
                  <div className="text-sm font-semibold">Resumen</div>
                  <div className="mt-3 space-y-3">
                    <SkeletonBox className="h-4 w-full" />
                    <SkeletonBox className="h-4 w-5/6" />
                    <SkeletonBox className="h-4 w-4/6" />
                    <SkeletonBox className="h-20 w-full" />
                  </div>
                </aside>

                <div className="rounded-2xl border p-4 lg:col-span-2">
                  <div className="text-sm font-semibold">Stock por variante</div>
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    <SkeletonBox className="h-16 w-full" />
                    <SkeletonBox className="h-16 w-full" />
                    <SkeletonBox className="h-16 w-full" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-3">
                  <div className="aspect-square overflow-hidden rounded-2xl border bg-zinc-100">
                    {product.heroUrl ? (
                      <img
                        src={product.heroUrl}
                        alt={product.title || "Producto"}
                        className="h-full w-full object-cover"
                        decoding="async"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-zinc-500">
                        Sin imagen principal
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 overflow-auto pb-1">
                    {thumbs.map((thumb) => (
                      <div
                        key={thumb.id}
                        className="h-14 w-14 flex-none overflow-hidden rounded-xl border bg-zinc-100"
                      >
                        <img
                          src={thumb.url}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="h-fit rounded-2xl border p-4">
                  <div className="text-sm font-semibold">Resumen</div>

                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-600">Precio</span>
                      <span className="font-semibold">
                        ${Number(product.price || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-600">Estado</span>
                      <span className="font-semibold">
                        {product.status || "Activo"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-600">Stock total</span>
                      <span className="font-semibold">
                        {Number(product.stockTotal || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border bg-zinc-50 p-3">
                    <div className="text-xs font-semibold text-zinc-700">
                      Variantes
                    </div>
                    <div className="mt-2 text-xs text-zinc-600">
                      {colors.length} colores · {sizes.length} tallas
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onEdit}
                    className="mt-4 w-full rounded-xl bg-zinc-900 py-2 text-sm text-white hover:opacity-95 sm:hidden"
                  >
                    Editar
                  </button>
                </aside>

                <div className="rounded-2xl border p-4 lg:col-span-2">
                  <div className="text-sm font-semibold">Stock por variante</div>
                  <div className="text-xs text-zinc-500">color × talla</div>

                  <div className="mt-3 hidden overflow-auto rounded-2xl border md:block">
                    <table className="min-w-full text-sm">
                      <thead className="bg-zinc-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-zinc-700">
                            Color
                          </th>
                          {sizes.map((size) => (
                            <th
                              key={size}
                              className="px-4 py-3 text-left font-semibold text-zinc-700"
                            >
                              {size}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="bg-white">
                        {colors.map((color) => (
                          <tr key={color} className="border-t">
                            <td className="px-4 py-3 font-medium">{color}</td>
                            {sizes.map((size) => (
                              <td key={size} className="px-4 py-3">
                                {stockMap[`${color}__${size}`] ?? 0}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 space-y-3 md:hidden">
                    {colors.map((color) => (
                      <div key={color} className="rounded-2xl border bg-white p-4">
                        <div className="font-semibold">{color}</div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {sizes.map((size) => (
                            <div key={size} className="rounded-xl border p-3">
                              <div className="text-xs text-zinc-500">{size}</div>
                              <div className="text-lg font-semibold">
                                {stockMap[`${color}__${size}`] ?? 0}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end border-t px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}