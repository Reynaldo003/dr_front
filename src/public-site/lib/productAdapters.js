//public-site/lib/productAdapters.js
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
  return COLOR_MAP[String(nombre).trim().toLowerCase()] || "#d4d4d8";
}

function buildVariantKey(color = "", talla = "") {
  return `${String(color).trim()}__${String(talla).trim()}`;
}

function crearBaseProducto(producto) {
  const stockTotal = Number(producto?.stock_total || 0);
  const stockDisponible = Number(producto?.stock_disponible || 0);

  return {
    id: producto.id,
    productId: producto.id,
    codigo: producto.codigo,
    name: producto.titulo,
    title: producto.titulo,
    description: producto.descripcion || "",
    price: Number(producto.precio || 0),
    category: producto.categoria || "",
    badge: stockTotal > 0 && stockTotal <= 5 ? "Últimas piezas" : "",
    stockDisponible,
    stockTotal,
    raw: producto,
  };
}

export function adaptarProductoListadoBackend(producto) {
  const base = crearBaseProducto(producto);

  return {
    ...base,
    images: producto?.imagen_principal ? [producto.imagen_principal] : [],
    colors: [],
    sizes: [],
    variantStockMap: {},
  };
}

export function adaptarProductoBackend(producto) {
  const base = crearBaseProducto(producto);

  const imagenesSecundarias = Array.isArray(producto?.imagenes)
    ? producto.imagenes.map((item) => item.imagen).filter(Boolean)
    : [];

  const images = [producto?.imagen_principal, ...imagenesSecundarias].filter(
    Boolean,
  );

  const variantes = Array.isArray(producto?.variantes)
    ? producto.variantes
    : [];

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
    ...base,
    images: images.length
      ? images
      : producto?.imagen_principal
        ? [producto.imagen_principal]
        : [],
    colors,
    sizes: tallasUnicas,
    variantStockMap,
  };
}
