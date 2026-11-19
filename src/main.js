import { PRODUCTS, EDITORIALS, PRESS, SHOWS, TRACKS } from "./products.js";
import { hydrate, live, checkoutUrl } from "./shopify.js";
import { cart } from "./cart.js";

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const gbp = (n) => n == null ? "Price TBC" : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
const view = $("#view"), overlay = $("#overlay");
let products = PRODUCTS;
const byHandle = (h) => products.find((p) => p.handle === h);
const img = (p, cls = "") => p.image ? `<img class="${cls}" src="${esc(p.image)}" alt="${esc(p.title)} ${esc(p.color)}">` : `<div class="ph ${cls}">${esc(p.title)}</div>`;

/* ---------- pages ---------- */
const pages = {
  home: () => `<section class="spread"><a class="page left" href="#/shop"><img src="assets/img/ed-1.jpg" alt="Knight facing the tent"></a><a class="page right" href="#/shop"><img src="assets/img/ed-2.jpg" alt="Two men in armour in the forest"></a></section>`,
  shop: () => `<section class="grid">${products.map((p) => `
    <button class="tile" data-product="${p.handle}">${img(p)}<span class="cap">${esc(p.title)}<br><i>${esc(p.color)}</i><br>${gbp(p.price)}</span></button>`).join("")}
    ${EDITORIALS.map((e) => `<button class="tile" data-editorial="${e.id}">${e.image ? `<img src="${esc(e.image)}" alt="">` : `<div class="ph">Editorial<br><small>Shop this image</small></div>`}<span class="cap">Shop this image</span></button>`).join("")}
  </section>`,
  about: () => `<section class="about">
    <div class="row"><h2>Group Shows</h2><div>${SHOWS.map((s) => `<p>${esc(s.title)}<br>${esc(s.kind)}<br>${esc(s.venue)}<br>${esc(s.place)}<br>${s.year}</p>`).join("")}</div></div>
    <div class="row"><h2>Press</h2><div>${PRESS.map((s) => `<p><a href="${esc(s.url)}" target="_blank" rel="noopener">‘${esc(s.title)}’</a>,<br>${esc(s.outlet)},<br>${esc(s.place)}<br>${s.year}</p>`).join("")}</div></div>
  </section>`,
  cart: () => {
    const sub = cart.lines.reduce((n, l) => n + (l.price ?? 0) * l.quantity, 0);
    if (!cart.lines.length) return `<section class="cart"><div><h2>YOUR CART</h2><p>Your cart is empty.</p><a class="u" href="#/shop">Continue shopping</a></div></section>`;
    return `<section class="cart"><div class="lines"><h2>YOUR CART</h2>${cart.lines.map((l) => `
      <div class="line"><div class="thumb">${l.image ? `<img src="${esc(l.image)}" alt="">` : `<div class="ph">${esc(l.title)}</div>`}</div>
        <div><b>${esc(l.title)}</b><br><span>${esc(l.color)} / Size ${esc(l.size)}</span><p>${gbp(l.price)}</p>
          <div class="qty"><button data-q="${esc(l.key)}" data-d="-1">-</button><span>${l.quantity}</span><button data-q="${esc(l.key)}" data-d="1">+</button></div><br>
          <button class="u" data-rm="${esc(l.key)}">Remove</button></div></div>`).join("")}
      <a class="u" href="#/shop">Continue shopping</a></div>
      <div class="summary"><h2>ORDER SUMMARY</h2>
        <p class="r"><span>Subtotal (${cart.count} items)</span><span>${gbp(sub)}</span></p>
        <p class="r"><span>Delivery</span><span>Calculated at checkout</span></p>
        <p class="r"><span>Total before delivery</span><span>${gbp(sub)}</span></p>
        <button class="cta" id="checkout">PROCEED TO CHECKOUT</button>
        <small id="co-note">${live ? "" : "Demo mode: connect Shopify in config.js to enable checkout."}</small></div></section>`;
  },
};

function route() {
  const r = (location.hash.replace(/^#\//, "") || "home").split("/")[0];
  if (r === "top") { scrollTo({ top: 0, behavior: "smooth" }); return; }
  closeOverlay();
  view.innerHTML = (pages[r] || pages.home)();
  document.body.dataset.route = pages[r] ? r : "home";
}

/* ---------- overlays ---------- */
function sizePicker(p, picked) {
  return `<div class="sizes" role="radiogroup" aria-label="Size">${p.variants.map((v) =>
    `<button role="radio" class="size ${v.size === picked ? "on" : ""}" data-size="${esc(v.size)}" ${v.available ? "" : "disabled"} aria-checked="${v.size === picked}">${esc(v.size)}</button>`).join("")}</div>`;
}
const firstAvail = (p) => p.variants.find((v) => v.available)?.size;

function openOverlay(html) { overlay.innerHTML = `<button class="x" aria-label="Close">×</button>${html}`; overlay.hidden = false; document.body.classList.add("lock"); $(".x", overlay).focus(); }
function closeOverlay() { overlay.hidden = true; overlay.innerHTML = ""; document.body.classList.remove("lock"); }

function openProduct(handle) {
  const list = products, i = list.findIndex((p) => p.handle === handle);
  const p = list[i]; let picked = firstAvail(p);
  const render = () => openOverlay(`<div class="pv">
    <button class="nav-arrow l" data-step="-1" aria-label="Previous">‹</button>
    <div class="pimg">${img(p)}</div>
    <button class="nav-arrow r" data-step="1" aria-label="Next">›</button>
    <div class="pinfo"><h2>${esc(p.title).toUpperCase()}</h2><i>${esc(p.color)}</i><p class="price">${gbp(p.price)}</p>${live ? "" : "<small>(Illustrative price)</small>"}
      <p class="blurb">${esc(p.blurb)}</p><label>SIZE</label>${sizePicker(p, picked)}
      <button class="cta" data-add ${picked ? "" : "disabled"}>${picked ? "ADD TO CART" : "SOLD OUT"}</button>
      <details><summary>Product details</summary><p>${esc(p.blurb)}</p></details>
      <details><summary>Delivery &amp; returns</summary><p>Delivery calculated at checkout.</p></details>
      <small class="credit">${esc(p.credit).replace(/\n/g, "<br>")}</small></div></div>`);
  render();
  overlay.onclick = (e) => {
    const t = e.target;
    if (t === overlay || t.closest(".x")) return closeOverlay();
    if (t.dataset.size) { picked = t.dataset.size; return render(); }
    if (t.closest("[data-add]")) { cart.add(p, p.variants.find((v) => v.size === picked)); return closeOverlay(); }
    const st = t.closest("[data-step]"); if (st) openProduct(list[(i + Number(st.dataset.step) + list.length) % list.length].handle);
  };
}

function openEditorial(id) {
  const e = EDITORIALS.find((x) => x.id === id), ps = e.handles.map(byHandle).filter(Boolean);
  const pick = Object.fromEntries(ps.map((p) => [p.handle, firstAvail(p)]));
  const render = () => openOverlay(`<div class="shopimg"><div class="eimg">${e.image ? `<img src="${esc(e.image)}" alt="">` : `<div class="ph">Editorial image</div>`}</div>
    <div class="elist"><h2>SHOP THIS IMAGE</h2><p>${ps.length} featured pieces</p>
      ${ps.map((p) => `<div class="erow" data-h="${p.handle}"><div class="eth">${img(p)}</div><div><b>${esc(p.title).toUpperCase()}</b><br><i>${esc(p.color)}</i><p>${gbp(p.price)}</p>
        ${p.variants.length === 1 ? `<p>${esc(p.blurb)}</p>` : sizePicker(p, pick[p.handle])}
        <button class="cta" data-add ${pick[p.handle] || p.variants.length === 1 ? "" : "disabled"}>ADD TO CART</button></div></div>`).join("")}
      ${live ? "" : "<small>Prices shown are illustrative.</small>"}</div></div>`);
  render();
  overlay.onclick = (ev) => {
    const t = ev.target; if (t === overlay || t.closest(".x")) return closeOverlay();
    const row = t.closest("[data-h]"); if (!row) return;
    const p = byHandle(row.dataset.h);
    if (t.dataset.size) { pick[p.handle] = t.dataset.size; return render(); }
    if (t.closest("[data-add]")) { cart.add(p, p.variants.find((v) => v.size === pick[p.handle]) || p.variants[0]); closeOverlay(); }
  };
}

/* ---------- cart + nav ---------- */
const updateNav = () => { $("[data-cart]").textContent = `CART{${cart.count}}`; if (location.hash === "#/cart") view.innerHTML = pages.cart(); };
cart.subscribe(updateNav); updateNav();

document.addEventListener("click", async (e) => {
  const t = e.target;
  const pr = t.closest("[data-product]"); if (pr) return openProduct(pr.dataset.product);
  const ed = t.closest("[data-editorial]"); if (ed) return openEditorial(ed.dataset.editorial);
  const q = t.closest("[data-q]"); if (q) { const l = cart.lines.find((x) => x.key === q.dataset.q); return cart.set(q.dataset.q, l.quantity + Number(q.dataset.d)); }
  const rm = t.closest("[data-rm]"); if (rm) return cart.remove(rm.dataset.rm);
  if (t.id === "checkout") {
    if (!live) return;
    const note = $("#co-note"); t.disabled = true; note.textContent = "Redirecting to secure checkout…";
    try {
      const missing = cart.lines.find((l) => !l.variantId);
      if (missing) throw new Error(`"${missing.title}" is not linked to a Shopify variant`);
      location.href = await checkoutUrl(cart.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })));
    } catch (err) { note.textContent = `Checkout failed: ${err.message}`; t.disabled = false; }
  }
});
addEventListener("keydown", (e) => { if (e.key === "Escape" && !overlay.hidden) closeOverlay(); });
addEventListener("hashchange", route);

/* ---------- music player ---------- */
const player = $("#player"); const audio = new Audio(); let ti = 0, open = false;
const pl = () => {
  const tr = TRACKS[ti];
  player.innerHTML = `<img class="g" src="assets/img/20.png" alt="G"><div class="meta"><b>GESCHWISTER RADIO</b><span>${esc(tr?.title || "")}</span><div class="bar"><i style="width:${audio.duration ? (audio.currentTime / audio.duration) * 100 : 0}%"></i></div></div>
    <button data-pp aria-label="${audio.paused ? "Play" : "Pause"}">${audio.paused ? "▶" : "❚❚"}</button><button data-ex aria-label="Tracklist">${open ? "⌄" : "⌃"}</button>
    ${open ? `<ol>${TRACKS.map((x, n) => `<li><button data-tr="${n}" class="${n === ti ? "on" : ""}">${esc(x.title)}</button></li>`).join("")}</ol>` : ""}`;
};
const load = (n) => { ti = n; audio.src = TRACKS[n].src; };
player.onclick = (e) => {
  const t = e.target;
  if (t.closest("[data-pp]")) { if (!TRACKS[ti]?.src) return; if (!audio.src) load(ti); audio.paused ? audio.play() : audio.pause(); }
  if (t.closest("[data-ex]")) open = !open;
  const tr = t.closest("[data-tr]"); if (tr && TRACKS[tr.dataset.tr].src) { load(Number(tr.dataset.tr)); audio.play(); }
  pl();
};
["play", "pause", "timeupdate"].forEach((ev) => audio.addEventListener(ev, pl));
audio.addEventListener("ended", () => { if (TRACKS[ti + 1]?.src) { load(ti + 1); audio.play(); } });
pl();

/* ---------- boot ---------- */
route();
hydrate(PRODUCTS).then((p) => { products = p; route(); }).catch((e) => console.warn("Shopify hydrate failed, using local catalogue:", e));
