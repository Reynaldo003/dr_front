export const ventas = [
  { id: "V-1001", fecha: "2026-02-07", cliente: "Ana G.", total: 520, estado: "Pagado" },
  { id: "V-1002", fecha: "2026-02-07", cliente: "María R.", total: 340, estado: "Pendiente" },
  { id: "V-1003", fecha: "2026-02-06", cliente: "Diana P.", total: 780, estado: "Pagado" },
  { id: "V-1004", fecha: "2026-02-06", cliente: "Karla S.", total: 260, estado: "Cancelado" },
];

export const ventas7d = [
  { day: "Lun", total: 1200 },
  { day: "Mar", total: 900 },
  { day: "Mié", total: 1450 },
  { day: "Jue", total: 1100 },
  { day: "Vie", total: 1800 },
  { day: "Sáb", total: 2100 },
  { day: "Dom", total: 1600 },
];

export const topProductos = [
  { id: "TP-01", nombre: "Vestido satín", vendidos: 18, ingreso: 7182 },
  { id: "TP-02", nombre: "Conjunto tejido", vendidos: 12, ingreso: 5988 },
  { id: "TP-03", nombre: "Jeans recto", vendidos: 9, ingreso: 4131 },
];

export const lowStock = [
  { id: "LS-01", nombre: "Conjunto tejido", stock: 4, min: 10 },
  { id: "LS-02", nombre: "Jeans recto", stock: 7, min: 12 },
  { id: "LS-03", nombre: "Vestido satín", stock: 14, min: 20 },
];

export const productos = [
  {
    id: "P-01",
    titulo: "Vestido satín",
    sku: "VS-001",
    stock: 14,
    precio: 399,
    estado: "Activo",
    img: "https://images.unsplash.com/photo-1520975958225-1a5d6a0a0f19?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "P-02",
    titulo: "Conjunto tejido",
    sku: "CJ-014",
    stock: 4,
    precio: 499,
    estado: "Activo",
    img: "https://images.unsplash.com/photo-1520975693416-35a0b9bf1c7c?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "P-03",
    titulo: "Blusa básica",
    sku: "BL-210",
    stock: 0,
    precio: 199,
    estado: "Inactivo",
    img: "https://images.unsplash.com/photo-1520975628612-5a3f0dd2c3a4?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "P-04",
    titulo: "Jeans recto",
    sku: "JN-088",
    stock: 7,
    precio: 459,
    estado: "Activo",
    img: "https://images.unsplash.com/photo-1520975742595-1a69b4c4f3d4?auto=format&fit=crop&w=200&q=60",
  },
];

export const stats = {
  tendencia: {
    id: "P-02",
    titulo: "Conjunto tejido",
    sku: "CJ-014",
    img: productos.find(p => p.id === "P-02")?.img,
    ventasSemanaActual: 18,
    ventasSemanaPasada: 9,
    ingresoSemana: 8982,
  },

  // top / bottom por unidades vendidas (mock)
  ranking: {
    top: [
      { id: "P-01", titulo: "Vestido satín", unidades: 22, ingreso: 8778 },
      { id: "P-02", titulo: "Conjunto tejido", unidades: 18, ingreso: 8982 },
      { id: "P-04", titulo: "Jeans recto", unidades: 14, ingreso: 6426 },
      { id: "P-05", titulo: "Blusa elegante", unidades: 11, ingreso: 3729 },
      { id: "P-06", titulo: "Falda plisada", unidades: 9, ingreso: 3231 },
    ],
    bottom: [
      { id: "P-07", titulo: "Blusa básica", unidades: 2, ingreso: 398 },
      { id: "P-08", titulo: "Short mezclilla", unidades: 3, ingreso: 747 },
      { id: "P-09", titulo: "Suéter ligero", unidades: 3, ingreso: 897 },
      { id: "P-10", titulo: "Palazzo", unidades: 4, ingreso: 1596 },
      { id: "P-11", titulo: "Vestido casual", unidades: 4, ingreso: 1396 },
    ],
  },

  // Métodos de pago (mock)
  pagos: [
    { label: "Crédito", value: 46 },
    { label: "Débito", value: 32 },
    { label: "Efectivo", value: 18 },
    { label: "Transferencia", value: 4 },
  ],

  // Gastos (mock)
  gastos: [
    { label: "Proveedores", value: 18500 },
    { label: "Paquetería", value: 3200 },
    { label: "Publicidad", value: 4100 },
    { label: "Empaques", value: 1300 },
  ],

  // Serie semanal (ventas / órdenes) (mock)
  seriesSemana: [
    { day: "Lun", ventas: 1200, ordenes: 6 },
    { day: "Mar", ventas: 900, ordenes: 4 },
    { day: "Mié", ventas: 1450, ordenes: 7 },
    { day: "Jue", ventas: 1100, ordenes: 5 },
    { day: "Vie", ventas: 1800, ordenes: 8 },
    { day: "Sáb", ventas: 2100, ordenes: 10 },
    { day: "Dom", ventas: 1600, ordenes: 7 },
  ],
};
