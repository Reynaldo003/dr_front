// src/services/orders.js

/**
 * Modelo de pedido (v1):
 * - orderNumber: string (folio visible, ej MDR-1700000000000)
 * - uid: string|null (si user logueado)
 * - customerEmail: string (siempre lo guardamos para track público)
 * - items: array (tu carrito)
 * - total: number
 * - status: "PAGADO" | "PREPARANDO" | "ENVIADO"
 * - carrier: "fedex" | null
 * - trackingNumber: string | null
 * - createdAt: serverTimestamp
 */
export async function createOrder({
  orderNumber,
  uid = null,
  customerEmail,
  items,
  total,
}) {
  if (!customerEmail) throw new Error("customerEmail es requerido");
  if (!orderNumber) throw new Error("orderNumber es requerido");

  const payload = {
    orderNumber,
    uid,
    customerEmail: String(customerEmail).trim().toLowerCase(),
    items: items ?? [],
    total: Number(total ?? 0),
    status: "PAGADO",
    carrier: null,
    trackingNumber: null,
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "orders"), payload);
  return { id: ref.id, ...payload };
}

export async function getOrdersByUid(uid) {
  const q = query(
    collection(db, "orders"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getOrderById(id) {
  const snap = await getDoc(doc(db, "orders", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Track público por: folio + email (evita que cualquiera adivine folios)
 */
export async function getOrderForTracking({ orderNumber, email }) {
  const e = String(email || "")
    .trim()
    .toLowerCase();
  const o = String(orderNumber || "").trim();

  const q = query(
    collection(db, "orders"),
    where("orderNumber", "==", o),
    where("customerEmail", "==", e),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

/**
 * Link directo a FedEx (v1 simple)
 */
export function buildCarrierTrackingUrl({ carrier, trackingNumber }) {
  if (!carrier || !trackingNumber) return null;
  const tn = encodeURIComponent(trackingNumber);

  if (carrier === "fedex") {
    // FedEx tracking page (query param)
    return `https://www.fedex.com/fedextrack/?trknbr=${tn}`;
  }
  return null;
}
