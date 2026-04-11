const COLOR_MAP = {
  negro: "#111111",
  blanco: "#f5f5f5",
  beige: "#d6c4a1",
  crema: "#f3ead8",
  rojo: "#dc2626",
  rosa: "#ec4899",
  azul: "#2563eb",
  marino: "#1e3a8a",
  verde: "#16a34a",
  gris: "#6b7280",
  cafe: "#7c4a2d",
  marron: "#7c4a2d",
  morado: "#7c3aed",
  lila: "#c4b5fd",
  amarillo: "#eab308",
};

function normalizarColor(nombre = "") {
  return COLOR_MAP[nombre.trim().toLowerCase()] || "#d4d4d8";
}

function buildVariantKey(color = "", talla = "") {
  return `${String(color).trim()}__${String(talla).trim()}`;
}

export function adaptarProductoBackend(producto) {
  const imagenesSecundarias = Array.isArray(producto.imagenes)
    ? producto.imagenes.map((item) => item.imagen).filter(Boolean)
    : [];

  const images = [producto.imagen_principal, ...imagenesSecundarias].filter(
    Boolean,
  );

  const variantes = Array.isArray(producto.variantes) ? producto.variantes : [];

  const coloresUnicos = Array.from(
    new Set(variantes.map((v) => v.color).filter(Boolean)),
  );

  const tallasUnicas = Array.from(
    new Set(variantes.map((v) => v.talla).filter(Boolean)),
  );

  const colors = coloresUnicos.map((name) => ({
    name,
    hex: normalizarColor(name),
  }));

  const variantStockMap = variantes.reduce((acc, item) => {
    acc[buildVariantKey(item.color, item.talla)] = Number(item.stock || 0);
    return acc;
  }, {});

  return {
    id: producto.id,
    productId: producto.id,
    codigo: producto.codigo,
    name: producto.titulo,
    title: producto.titulo,
    description: producto.descripcion || "",
    price: Number(producto.precio || 0),
    category: producto.categoria || "",
    badge: Number(producto.stock_total || 0) <= 5 ? "Últimas piezas" : "",
    images,
    colors,
    sizes: tallasUnicas,
    stockDisponible: Number(producto.stock_disponible || 0),
    stockTotal: Number(producto.stock_total || 0),
    variantStockMap,
    raw: producto,
  };
}
