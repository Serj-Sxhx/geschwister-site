const KEY = "gesch.cart.v1";
let lines = [];
try { lines = JSON.parse(localStorage.getItem(KEY)) || []; } catch {}
const subs = new Set();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {} subs.forEach((f) => f()); };

export const cart = {
  get lines() { return lines; },
  get count() { return lines.reduce((n, l) => n + l.quantity, 0); },
  subscribe: (f) => subs.add(f),
  add(p, v, quantity = 1) {
    const key = `${p.handle}|${v.size}`;
    const l = lines.find((x) => x.key === key);
    if (l) l.quantity += quantity;
    else lines.push({ key, handle: p.handle, title: p.title, color: p.color, size: v.size, price: p.price, image: p.image, variantId: v.variantId, quantity });
    save();
  },
  set(key, q) { const l = lines.find((x) => x.key === key); if (!l) return; if (q < 1) lines = lines.filter((x) => x !== l); else l.quantity = q; save(); },
  remove(key) { lines = lines.filter((l) => l.key !== key); save(); },
  clear() { lines = []; save(); },
};
