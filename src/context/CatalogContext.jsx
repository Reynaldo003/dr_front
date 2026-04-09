import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { productos as seedProductos, ventas as seedVentas } from "../data/mock";

const CatalogContext = createContext(null);

const LS_KEY = "boutique_admin_db_v1";

const DEFAULTS = {
  sizes: ["CH", "M", "G", "XG"],
  colors: ["Negro", "Blanco", "Beige", "Rojo"],

  products: seedProductos,
  sales: seedVentas.map((v) => ({
    ...v,
    metodoPago: v.metodoPago || "Débito",
    items: Array.isArray(v.items) ? v.items : [],
  })),
};

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function load() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return DEFAULTS;

  const parsed = safeParse(raw);
  if (!parsed) return DEFAULTS;

  return {
    sizes: Array.isArray(parsed.sizes) && parsed.sizes.length ? parsed.sizes : DEFAULTS.sizes,
    colors: Array.isArray(parsed.colors) && parsed.colors.length ? parsed.colors : DEFAULTS.colors,
    products: Array.isArray(parsed.products) ? parsed.products : DEFAULTS.products,
    sales: Array.isArray(parsed.sales) ? parsed.sales : DEFAULTS.sales,
  };
}

function save(value) {
  localStorage.setItem(LS_KEY, JSON.stringify(value));
}

function normalizeTag(s) {
  return String(s || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function makeProductMap(products) {
  const m = new Map();
  (products || []).forEach((p) => m.set(p.id, p));
  return m;
}

function itemsToQtyMap(items = []) {
  const m = new Map();
  for (const it of items) {
    const pid = it.productId;
    const qty = Number(it.qty || 0);
    if (!pid || qty <= 0) continue;
    m.set(pid, (m.get(pid) || 0) + qty);
  }
  return m;
}

function sumSaleItemsTotal(items = [], productMap) {
  return (items || []).reduce((acc, it) => {
    const p = productMap.get(it.productId);
    const price = Number(p?.precio || 0);
    const qty = Number(it.qty || 0);
    return acc + price * qty;
  }, 0);
}

// delta negativo = descuenta, delta positivo = regresa
function applyStockDelta(products, deltaMap) {
  return (products || []).map((p) => {
    const d = deltaMap.get(p.id) || 0;
    if (!d) return p;
    return { ...p, stock: Number(p.stock || 0) + d };
  });
}

// solo "Pagado" afecta inventario
function affectsInventory(estado) {
  return estado === "Pagado";
}

export function CatalogProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    save(state);
  }, [state]);

  const api = useMemo(() => {
    return {
      // tags
      sizes: state.sizes,
      colors: state.colors,

      addSize: (name) => {
        const v = normalizeTag(name);
        if (!v) return;
        setState((prev) => {
          if (prev.sizes.some((x) => x.toLowerCase() === v.toLowerCase())) return prev;
          return { ...prev, sizes: [...prev.sizes, v] };
        });
      },

      removeSize: (name) => {
        setState((prev) => ({ ...prev, sizes: prev.sizes.filter((x) => x !== name) }));
      },

      addColor: (name) => {
        const v = normalizeTag(name);
        if (!v) return;
        setState((prev) => {
          if (prev.colors.some((x) => x.toLowerCase() === v.toLowerCase())) return prev;
          return { ...prev, colors: [...prev.colors, v] };
        });
      },

      removeColor: (name) => {
        setState((prev) => ({ ...prev, colors: prev.colors.filter((x) => x !== name) }));
      },

      // catálogo / ventas
      products: state.products,
      sales: state.sales,

      // ✅ agregar producto
      addProduct: (product) => {
        if (!product) return;

        setState((prev) => {
          const exists = prev.products.some((p) => p.id === product.id);
          if (exists) return prev;

          return {
            ...prev,
            products: [product, ...prev.products],
          };
        });
      },

      // ✅ actualizar producto
      updateProduct: (updatedProduct) => {
        if (!updatedProduct?.id) return;

        setState((prev) => {
          return {
            ...prev,
            products: prev.products.map((p) =>
              p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
            ),
          };
        });
      },

      // ✅ Crear venta:
      // - si Pagado: valida stock y descuenta
      // - si Pendiente/Cancelado: NO toca inventario
      createSale: (saleDraft) => {
        setState((prev) => {
          const productMap = makeProductMap(prev.products);

          const nextSale = {
            ...saleDraft,
            items: Array.isArray(saleDraft.items) ? saleDraft.items : [],
          };

          const total = sumSaleItemsTotal(nextSale.items, productMap);
          nextSale.total = total;

          if (!affectsInventory(nextSale.estado)) {
            return { ...prev, sales: [nextSale, ...prev.sales] };
          }

          const need = itemsToQtyMap(nextSale.items);

          for (const [pid, qty] of need.entries()) {
            const p = productMap.get(pid);
            const stock = Number(p?.stock || 0);
            if (!p) throw new Error("Producto inválido en la venta.");
            if (qty > stock) throw new Error(`Stock insuficiente para "${p.titulo}". Solo quedan ${stock}.`);
          }

          const delta = new Map();
          for (const [pid, qty] of need.entries()) delta.set(pid, -qty);
          const nextProducts = applyStockDelta(prev.products, delta);

          return { ...prev, products: nextProducts, sales: [nextSale, ...prev.sales] };
        });
      },

      // ✅ Actualizar venta
      updateSale: (saleId, patch) => {
        setState((prev) => {
          const existing = prev.sales.find((s) => s.id === saleId);
          if (!existing) return prev;

          const next = {
            ...existing,
            ...patch,
            items: Array.isArray(patch.items) ? patch.items : existing.items,
          };

          const productMap = makeProductMap(prev.products);

          const oldAffects = affectsInventory(existing.estado);
          const newAffects = affectsInventory(next.estado);

          const oldNeed = itemsToQtyMap(existing.items);
          const newNeed = itemsToQtyMap(next.items);

          if (!oldAffects && newAffects) {
            for (const [pid, qty] of newNeed.entries()) {
              const p = productMap.get(pid);
              const stock = Number(p?.stock || 0);
              if (!p) throw new Error("Producto inválido en la edición.");
              if (qty > stock) throw new Error(`Stock insuficiente para "${p.titulo}". Solo quedan ${stock}.`);
            }

            const delta = new Map();
            for (const [pid, qty] of newNeed.entries()) delta.set(pid, -qty);
            const nextProducts = applyStockDelta(prev.products, delta);

            const total = sumSaleItemsTotal(next.items, productMap);
            const nextSales = prev.sales.map((s) => (s.id === saleId ? { ...next, total } : s));
            return { ...prev, products: nextProducts, sales: nextSales };
          }

          if (oldAffects && !newAffects) {
            const restore = new Map();
            for (const [pid, qty] of oldNeed.entries()) restore.set(pid, +qty);
            const nextProducts = applyStockDelta(prev.products, restore);

            const total = sumSaleItemsTotal(next.items, productMap);
            const nextSales = prev.sales.map((s) => (s.id === saleId ? { ...next, total } : s));
            return { ...prev, products: nextProducts, sales: nextSales };
          }

          if (!oldAffects && !newAffects) {
            const total = sumSaleItemsTotal(next.items, productMap);
            const nextSales = prev.sales.map((s) => (s.id === saleId ? { ...next, total } : s));
            return { ...prev, sales: nextSales };
          }

          const restore = new Map();
          for (const [pid, qty] of oldNeed.entries()) restore.set(pid, +qty);
          const restoredProducts = applyStockDelta(prev.products, restore);

          const restoredMap = makeProductMap(restoredProducts);
          for (const [pid, qty] of newNeed.entries()) {
            const p = restoredMap.get(pid);
            const stock = Number(p?.stock || 0);
            if (!p) throw new Error("Producto inválido en la edición.");
            if (qty > stock) throw new Error(`Stock insuficiente para "${p.titulo}". Solo quedan ${stock}.`);
          }

          const discount = new Map();
          for (const [pid, qty] of newNeed.entries()) discount.set(pid, -qty);
          const finalProducts = applyStockDelta(restoredProducts, discount);

          const total = sumSaleItemsTotal(next.items, productMap);
          const nextSales = prev.sales.map((s) => (s.id === saleId ? { ...next, total } : s));
          return { ...prev, products: finalProducts, sales: nextSales };
        });
      },

      // ✅ Eliminar venta
      deleteSale: (saleId) => {
        setState((prev) => {
          const existing = prev.sales.find((s) => s.id === saleId);
          if (!existing) return prev;

          if (!affectsInventory(existing.estado)) {
            return { ...prev, sales: prev.sales.filter((s) => s.id !== saleId) };
          }

          const need = itemsToQtyMap(existing.items);
          const restore = new Map();
          for (const [pid, qty] of need.entries()) restore.set(pid, +qty);
          const nextProducts = applyStockDelta(prev.products, restore);

          return {
            ...prev,
            products: nextProducts,
            sales: prev.sales.filter((s) => s.id !== saleId),
          };
        });
      },
    };
  }, [state]);

  return <CatalogContext.Provider value={api}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog debe usarse dentro de <CatalogProvider />");
  return ctx;
}