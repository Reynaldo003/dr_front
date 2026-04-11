import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "mdr_cart_v4";
const STORAGE_VERSION = 4;

const clampInt = (n, min, max) => {
  const x = Number(n);
  const safeMax = Math.max(min, Number.isFinite(max) ? max : min);

  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(safeMax, Math.trunc(x)));
};

const money2 = (n) => {
  return Math.round((Number(n) || 0) * 100) / 100;
};

function buildKey(productId, colorName, size) {
  return `${productId}|${String(colorName)}|${String(size)}`;
}

function calcTotals(items) {
  const count = items.reduce((acc, it) => acc + Number(it.qty || 0), 0);
  const subtotal = money2(
    items.reduce((acc, it) => acc + money2(it.price) * Number(it.qty || 0), 0),
  );

  return { count, subtotal };
}

function calcDerived(base) {
  const items = Array.isArray(base.items) ? base.items : [];
  const { count, subtotal } = calcTotals(items);

  return {
    items,
    count,
    subtotal,
    shipping: 0,
    discount: 0,
    total: subtotal,
    updatedAt: Date.now(),
  };
}

function normalizeItem(it) {
  if (!it) return null;

  const productId = Number(it.productId ?? it.product?.id ?? it.id ?? 0);
  if (!productId) return null;

  const colorName = it.colorName ?? it.color?.name ?? "N/A";
  const colorHex = it.colorHex ?? it.color?.hex ?? "#000000";
  const size = it.size ?? "UNI";
  const maxStock = clampInt(it.maxStock ?? it.stock ?? 99, 1, 999);
  const qty = clampInt(it.qty, 1, maxStock);
  const key = it.key || buildKey(productId, colorName, size);

  return {
    key,
    productId,
    name: it.name ?? it.product?.name ?? it.product?.title ?? "Producto",
    price: money2(it.price ?? it.product?.price ?? 0),
    image:
      it.image ??
      it.product?.images?.[0] ??
      it.product?.image ??
      it.product?.imagen_principal ??
      null,
    colorName,
    colorHex,
    size,
    maxStock,
    qty,
  };
}

function normalizeIncomingState(raw) {
  if (!raw) return null;

  const source = raw.version && raw.state ? raw.state : raw;

  if (!source || !Array.isArray(source.items)) {
    return calcDerived({ items: [] });
  }

  const items = source.items.map(normalizeItem).filter(Boolean);
  return calcDerived({ items });
}

function cartReducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return action.payload ?? state;

    case "ADD_ITEM": {
      const item = normalizeItem(action.payload);
      if (!item) return state;

      const existing = state.items.find((x) => x.key === item.key);
      let nextItems;

      if (existing) {
        nextItems = state.items.map((x) => {
          if (x.key !== item.key) return x;

          const maxStock = Number(item.maxStock || x.maxStock || 99);
          return {
            ...x,
            maxStock,
            qty: clampInt(x.qty + item.qty, 1, maxStock),
          };
        });
      } else {
        nextItems = [item, ...state.items];
      }

      return calcDerived({ ...state, items: nextItems });
    }

    case "REMOVE_ITEM": {
      const key = action.payload;
      const nextItems = state.items.filter((x) => x.key !== key);
      return calcDerived({ ...state, items: nextItems });
    }

    case "SET_QTY": {
      const { key, qty } = action.payload;
      const current = state.items.find((x) => x.key === key);
      if (!current) return state;

      const safeQty = clampInt(qty, 0, Number(current.maxStock || 99));

      const nextItems = state.items
        .map((x) => (x.key === key ? { ...x, qty: safeQty } : x))
        .filter((x) => x.qty > 0);

      return calcDerived({ ...state, items: nextItems });
    }

    case "INC": {
      const key = action.payload;
      const nextItems = state.items.map((x) =>
        x.key === key
          ? { ...x, qty: clampInt(x.qty + 1, 1, Number(x.maxStock || 99)) }
          : x,
      );

      return calcDerived({ ...state, items: nextItems });
    }

    case "DEC": {
      const key = action.payload;
      const nextItems = state.items
        .map((x) =>
          x.key === key
            ? { ...x, qty: clampInt(x.qty - 1, 0, Number(x.maxStock || 99)) }
            : x,
        )
        .filter((x) => x.qty > 0);

      return calcDerived({ ...state, items: nextItems });
    }

    case "CLEAR":
      return calcDerived({ items: [] });

    default:
      return state;
  }
}

const initialState = calcDerived({ items: [] });

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const normalized = normalizeIncomingState(parsed);

      if (normalized) {
        dispatch({ type: "HYDRATE", payload: normalized });
      }
    } catch (error) {
      console.error("No se pudo hidratar el carrito:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: STORAGE_VERSION,
          state,
        }),
      );
    } catch (error) {
      console.error("No se pudo guardar el carrito:", error);
    }
  }, [state]);

  const api = useMemo(() => {
    const byKey = new Map(state.items.map((it) => [it.key, it]));

    return {
      items: state.items,
      count: state.count,
      subtotal: state.subtotal,
      shipping: state.shipping,
      discount: state.discount,
      total: state.total,
      updatedAt: state.updatedAt,

      getItem: (key) => byKey.get(key) ?? null,
      hasItem: (key) => byKey.has(key),

      addItem: ({ product, qty = 1, color, size, maxStock = 99 }) => {
        if (!product) return;

        const productId = Number(product.id ?? product.productId ?? 0);
        if (!productId) return;

        const colorName = color?.name ?? "N/A";
        const colorHex = color?.hex ?? "#000000";
        const safeSize = size ?? "UNI";

        dispatch({
          type: "ADD_ITEM",
          payload: {
            key: buildKey(productId, colorName, safeSize),
            productId,
            name: product.name ?? product.title ?? "Producto",
            price: money2(product.price ?? 0),
            image:
              product.images?.[0] ??
              product.image ??
              product.imagen_principal ??
              null,
            colorName,
            colorHex,
            size: safeSize,
            qty: clampInt(qty, 1, Number(maxStock || 99)),
            maxStock: Number(maxStock || 99),
          },
        });
      },

      removeItem: (key) => {
        dispatch({ type: "REMOVE_ITEM", payload: key });
      },

      setQty: (key, qty) => {
        dispatch({ type: "SET_QTY", payload: { key, qty } });
      },

      inc: (key) => {
        dispatch({ type: "INC", payload: key });
      },

      dec: (key) => {
        dispatch({ type: "DEC", payload: key });
      },

      clear: () => {
        dispatch({ type: "CLEAR" });
      },
    };
  }, [state]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart() debe usarse dentro de <CartProvider />");
  }

  return ctx;
}