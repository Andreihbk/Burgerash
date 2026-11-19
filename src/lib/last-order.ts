// Last placed order, kept in this browser only so the customer can find the status page again.
const KEY = "burgerash:last-order";
const EVENT = "burgerash:last-order-change";

export interface LastOrder {
  token: string;
  orderNumber: string;
}

export function readLastOrder(): LastOrder | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<LastOrder>;
    return typeof v.token === "string" && typeof v.orderNumber === "string"
      ? { token: v.token, orderNumber: v.orderNumber }
      : null;
  } catch {
    return null;
  }
}

function notify() {
  window.dispatchEvent(new Event(EVENT));
}

export function saveLastOrder(order: LastOrder) {
  try {
    localStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    /* storage unavailable: the success screen still shows the link */
  }
  notify();
}

export function clearLastOrder(token?: string) {
  try {
    if (token && readLastOrder()?.token !== token) return;
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  notify();
}

export function subscribeLastOrder(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
