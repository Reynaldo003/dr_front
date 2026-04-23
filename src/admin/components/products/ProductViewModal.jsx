import { useEffect, useMemo, useState } from "react";
import { Pencil, X } from "lucide-react";

function SkeletonBox({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-zinc-100 ${className}`} />;
}

function money(value) {
  return `$${Number(value || 0).toLocaleString("es-MX")}`;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizarProducto(product) {
  const variantesRaw = Array.isArray(product?.variantes)
    ? product.variantes
    : Array.isArray(product?.variants)
      ? product.variants
      : [];

  const galleryRaw = Array.isArray(product?.imagenes)
    ? product.imagenes
    : Array.isArray(product?.gallery)
      ? product.gallery
      : [];

  const variantes = variantesRaw.map((item) => ({
    color: item?.color || "",
    talla: item?.talla || "",
    stock: Number(item?.stock || 0),
  }));

  const stockMap = {};
  variantes.forEach((item) => {
    stockMap[`${item.color}__${item.talla}`] = Number(item.stock || 0);
  });

  const colors = unique(variantes.map((item) => item.color));
  const sizes = unique(variantes.map((item) => item.talla));

  const thumbs = [
    ...(product?.heroUrl || product?.imagen_principal
      ? [
        {
          id: "hero",
          url: product?.heroUrl || product?.imagen_principal,
        },
      ]
      : []),
    ...galleryRaw.map((item, index) => ({
      id: item?.id || `gallery_${index}`,
      url: item?.url || item?.imagen || "",
    })),
  ].filter((item) => item.url);

  return {
    id: product?.codigo || product?.id || "—",
    title: product?.title || product?.titulo || "Producto",
    sku: product?.sku || "—",
    category: product?.category || product?.categoria || "—",
    description: product?.description || product?.descripcion || "",
    status: product?.status || product?.estado || "Activo",
    price: Number(product?.price ?? product?.precio ?? 0),
    salePrice:
      product?.salePrice !== null && product?.salePrice !== undefined
        ? Number(product.salePrice)
        : product?.precio_rebaja !== null && product?.precio_rebaja !== undefined
          ? Number(product.precio_rebaja)
          : null,
    finalPrice:
      product?.precio_final !== undefined
        ? Number(product.precio_final || 0)
        : product?.salePrice || product?.precio_rebaja
          ? Number(product?.salePrice ?? product?.precio_rebaja ?? 0)
          : Number(product?.price ?? product?.precio ?? 0),
    stockTotal: Number(product?.stockTotal ?? product?.stock_total ?? 0),
    esNewArrival: Boolean(product?.es_new_arrival || product?.isNewArrival),
    permiteCompra:
      product?.permite_compra !== undefined
        ? Boolean(product.permite_compra)
        : product?.permiteCompra !== undefined
          ? Boolean(product.permiteCompra)
          : true,
    enRebaja:
      product?.en_rebaja !== undefined
        ? Boolean(product.en_rebaja)
        : product?.salePrice !== null && product?.salePrice !== undefined
          ? Number(product.salePrice) > 0 &&
          Number(product.salePrice) < Number(product?.price ?? product?.precio ?? 0)
          : false,
    porcentajeDescuento: Number(
      product?.porcentaje_descuento ?? product?.discountPercent ?? 0
    ),
    thumbs,
    colors,
    sizes,
    stockMap,
    fechaCreacion: product?.fecha_creacion || product?.createdAt || "",
    fechaActualizacion: product?.fecha_actualizacion || product?.updatedAt || "",
  };
}

export default function ProductViewModal({
  open,
  product,
  onClose,
  onEdit,
  loading = false,
}) {
  const data = useMemo(() => normalizarProducto(product || {}), [product]);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectedImage(data.thumbs?.[0]?.url || "");
  }, [open, data]);

  if (!open || !product) return null;

  const stockPorColor = data.colors.map((color) => {
    const total = data.sizes.reduce(
      (acc, size) => acc + Number(data.stockMap[`${color}__${size}`] || 0),
      0
    );
    return { color, total };
  });

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 animate-fadeIn"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6">
        <div className="flex h-[100dvh] w-full flex-col overflow-hidden border bg-white shadow-2xl animate-fadeUp sm:h-auto sm:max-h-[92vh] sm:max-w-6xl sm:rounded-3xl">
          <div className="flex items-start justify-between gap-3 border-b px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold sm:text-xl">
                {data.title}
              </h2>
              <p className="text-xs text-zinc-500 sm:text-sm">
                {data.id} · SKU: {data.sku}
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
              <div className="grid gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-3">
                  <SkeletonBox className="aspect-square w-full border" />
                  <div className="flex gap-2">
                    <SkeletonBox className="h-16 w-16" />
                    <SkeletonBox className="h-16 w-16" />
                    <SkeletonBox className="h-16 w-16" />
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
              <div className="grid gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border bg-zinc-100">
                    <div className="aspect-square">
                      {selectedImage ? (
                        <img
                          src={selectedImage}
                          alt={data.title}
                          className="h-full w-full object-cover"
                          decoding="async"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-zinc-500">
                          Sin imagen principal
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 overflow-auto pb-1">
                    {data.thumbs.map((thumb) => (
                      <button
                        key={thumb.id}
                        type="button"
                        onClick={() => setSelectedImage(thumb.url)}
                        className={[
                          "h-16 w-16 flex-none overflow-hidden rounded-xl border bg-zinc-100",
                          selectedImage === thumb.url ? "ring-2 ring-zinc-900" : "",
                        ].join(" ")}
                      >
                        <img
                          src={thumb.url}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl border p-4">
                    <div className="text-sm font-semibold">Descripción</div>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      {data.description || "Sin descripción registrada."}
                    </p>
                  </div>

                  <div className="rounded-2xl border p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Stock por color</div>
                      <div className="text-xs text-zinc-500">Resumen rápido</div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {stockPorColor.map((item) => (
                        <div key={item.color} className="rounded-xl border bg-zinc-50 p-3">
                          <div className="text-xs text-zinc-500">{item.color}</div>
                          <div className="text-lg font-semibold">{item.total}</div>
                        </div>
                      ))}

                      {stockPorColor.length === 0 ? (
                        <div className="rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-500">
                          Sin colores registrados.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <aside className="h-fit rounded-2xl border p-4">
                  <div className="text-sm font-semibold">Resumen</div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                      {data.status}
                    </span>

                    {data.esNewArrival ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                        New arrival
                      </span>
                    ) : null}

                    {data.enRebaja ? (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                        Rebaja {data.porcentajeDescuento ? `${data.porcentajeDescuento}%` : ""}
                      </span>
                    ) : null}

                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs font-medium",
                        data.permiteCompra
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-zinc-100 text-zinc-700",
                      ].join(" ")}
                    >
                      {data.permiteCompra ? "Compra habilitada" : "Solo exhibición"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-600">Precio</span>
                      <span className="font-semibold">{money(data.price)}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-600">Precio final</span>
                      <span className="font-semibold">{money(data.finalPrice)}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-600">Categoría</span>
                      <span className="font-semibold">{data.category}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-600">Stock total</span>
                      <span className="font-semibold">{data.stockTotal}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-600">Carrusel</span>
                      <span className="font-semibold">{data.thumbs.length}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-600">Colores</span>
                      <span className="font-semibold">{data.colors.length}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-600">Tallas</span>
                      <span className="font-semibold">{data.sizes.length}</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border bg-zinc-50 p-3">
                    <div className="text-xs font-semibold text-zinc-700">Colores</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {data.colors.length ? (
                        data.colors.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border bg-white px-3 py-1 text-xs"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500">Sin colores</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border bg-zinc-50 p-3">
                    <div className="text-xs font-semibold text-zinc-700">Tallas</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {data.sizes.length ? (
                        data.sizes.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border bg-white px-3 py-1 text-xs"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500">Sin tallas</span>
                      )}
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
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">Stock por variante</div>
                      <div className="text-xs text-zinc-500">color × talla</div>
                    </div>

                    <div className="text-xs text-zinc-500">
                      Creado: {data.fechaCreacion || "—"} · Actualizado: {data.fechaActualizacion || "—"}
                    </div>
                  </div>

                  <div className="mt-3 hidden overflow-auto rounded-2xl border md:block">
                    <table className="min-w-full text-sm">
                      <thead className="bg-zinc-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-zinc-700">
                            Color
                          </th>
                          {data.sizes.map((size) => (
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
                        {data.colors.map((color) => (
                          <tr key={color} className="border-t">
                            <td className="px-4 py-3 font-medium">{color}</td>
                            {data.sizes.map((size) => (
                              <td key={size} className="px-4 py-3">
                                {data.stockMap[`${color}__${size}`] ?? 0}
                              </td>
                            ))}
                          </tr>
                        ))}

                        {data.colors.length === 0 && (
                          <tr>
                            <td colSpan={Math.max(1, data.sizes.length + 1)} className="px-4 py-6 text-sm text-zinc-500">
                              Este producto aún no tiene variantes registradas.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 space-y-3 md:hidden">
                    {data.colors.map((color) => (
                      <div key={color} className="rounded-2xl border bg-white p-4">
                        <div className="font-semibold">{color}</div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {data.sizes.map((size) => (
                            <div key={size} className="rounded-xl border p-3">
                              <div className="text-xs text-zinc-500">{size}</div>
                              <div className="text-lg font-semibold">
                                {data.stockMap[`${color}__${size}`] ?? 0}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {data.colors.length === 0 ? (
                      <div className="rounded-2xl border bg-zinc-50 p-4 text-sm text-zinc-500">
                        Este producto aún no tiene variantes registradas.
                      </div>
                    ) : null}
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