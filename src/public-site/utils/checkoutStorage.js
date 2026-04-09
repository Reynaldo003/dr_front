// src/utils/checkoutStorage.js
const KEY = "mdr_checkout_v1";

export function saveCheckout(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function loadCheckout() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCheckout() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
