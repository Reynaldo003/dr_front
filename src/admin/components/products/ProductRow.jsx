//src/admin/component/products/ProductRow.jsx
import Badge from "../ui/Badge";

function stockBadge(stock) {
  const n = Number(stock || 0);
  if (n <= 0) return <Badge variant="danger">Sin stock</Badge>;
  if (n <= 5) return <Badge variant="warning">Bajo</Badge>;
  return <Badge>OK</Badge>;
}

function estadoBadge(estado) {
  if (estado === "Activo") return <Badge variant="success">Activo</Badge>;
  return <Badge variant="danger">Inactivo</Badge>;
}

export default function ProductRow({ p, onView, onEdit }) {
  const imagen = p.heroUrl || p.img || "";
  const titulo = p.title || p.titulo || "";
  const sku = p.sku || "—";
  const stock = Number(p.stockTotal ?? p.stock ?? 0);
  const precio = Number(p.price ?? p.precio ?? 0);
  const estado = p.status || p.estado || "Activo";
  const id = p.id;

  return (
    <tr className="border-t hover:bg-zinc-50 transition-colors">
      <td className="px-4 py-3 text-sm text-zinc-700">{id}</td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl border bg-zinc-100 overflow-hidden shrink-0">
            {imagen ? (
              <img
                src={imagen}
                alt={titulo}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-[10px] text-zinc-500">
                Sin
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="font-medium truncate">{titulo}</div>
            <div className="text-xs text-zinc-500">SKU: {sku}</div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="tabular-nums">{stock}</span>
          {stockBadge(stock)}
        </div>
      </td>

      <td className="px-4 py-3 text-right font-medium tabular-nums">
        ${precio.toLocaleString()}
      </td>

      <td className="px-4 py-3">{estadoBadge(estado)}</td>

      <td className="px-4 py-3 text-right">
        <div className="inline-flex gap-2">
          <button
            onClick={() => onView?.(p)}
            className="rounded-lg border px-3 py-1 text-xs hover:bg-zinc-50 active:scale-[0.98] transition"
          >
            Ver
          </button>
          <button
            onClick={() => onEdit?.(p)}
            className="rounded-lg bg-zinc-900 text-white px-3 py-1 text-xs hover:opacity-95 active:scale-[0.98] transition"
          >
            Editar
          </button>
        </div>
      </td>
    </tr>
  );
}