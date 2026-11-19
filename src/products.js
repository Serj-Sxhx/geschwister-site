// Local fallback catalogue. When Shopify is configured, shopify.js overlays live price/stock by handle.
// Prices are illustrative per Saeed's mockups. Replace `image` with clean product photography.
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const stock = (sizes) => sizes.map((s) => ({ size: s, available: true, variantId: null }));

const D = "Signature red collar and cuffs. All-over illustrated print with embroidered details.";
const apparel = (sizes) => stock(sizes);
const ONE = [{ size: "One size", available: true, variantId: null }];
const P = (handle, title, color, image, extra = {}) => ({ handle, title, color, price: null, blurb: "", credit: "", image: `assets/img/${image}`, variants: apparel(SIZES.slice(0, 5)), ...extra });

// Names, colourways and prices are placeholders until Saeed confirms the range (price null => "Price TBC").
export const PRODUCTS = [
  P("signature-6-jersey-white", "Signature 6 Jersey", "White", "1.jpg", { price: 120, blurb: D }),
  P("signature-6-jersey-black", "Signature 6 Jersey", "Black", "2.jpg", { price: 120, blurb: D, variants: apparel(SIZES) }),
  P("mww-aop-sweatshirt", "MWW AOP Sweatshirt", "All-over print", "4.jpg", { price: 180, blurb: "All-over printed sweatshirt." }),
  P("s1-scarf", "S1 Scarf", "For Another Body", "16.jpg", { price: 95, blurb: "One size · 100 × 100 cm", variants: ONE }),
  P("scarf-sepia", "Scarf", "Sepia", "3.jpg", { variants: ONE }),
  P("crewneck-white-back-print", "Crewneck", "White, back print", "5.jpg"),
  P("crewneck-white", "Crewneck", "White", "6.jpg"),
  P("crewneck-white-chest-print", "Crewneck", "White, chest print", "15.jpg"),
  P("crewneck-black-back-print", "Crewneck", "Black, back print", "9.jpg"),
  P("crewneck-black", "Crewneck", "Black", "10.jpg"),
  P("crewneck-black-chest-print", "Crewneck", "Black, chest print", "11.jpg"),
  P("tee-orange", "Tee", "Orange", "7.jpg"),
  P("tee-black-boots", "Tee", "Black, boots print", "12.jpg"),
  P("tee-aop", "Tee", "All-over print", "13.jpg"),
  P("tee-white-sleeve", "Tee", "White, sleeve print", "14.jpg"),
  P("trousers-orange", "Trousers", "Orange", "8.jpg"),
  P("trousers-black", "Trousers", "Black", "18.jpg"),
  P("belt", "Belt", "White", "19.png", { variants: ONE }),
];

// Editorial images that open "Shop this image" with linked products.
export const EDITORIALS = [
  { id: "forest-pair", image: "assets/img/ed-2.jpg", caption: "", handles: ["signature-6-jersey-white", "mww-aop-sweatshirt", "s1-scarf"] },
];

export const PRESS = [
  { title: "The Signature 6", outlet: "Dance Wax", place: "London", year: 2026, url: "https://dancewax.net/2026/07/08/geschwister-embraces-footballs-global-spirit-with-the-signature-6/" },
  { title: "Alliance of the Epic II", outlet: "NUMERO Berlin", place: "Berlin", year: 2025, url: "https://www.numeroberlin.de/2025/09/campain-alliance-of-the-epic-ii/" },
  { title: "Phenomena of Identity", outlet: "Lifestyle Asia", place: "London", year: 2025, url: "https://lifestyleasia-onemega.com/" },
  { title: "Get to know Saeed Agboke, founder of Geschwister", outlet: "FAB L'Style", place: "Vienna", year: 2024, url: "https://fablstyle.com/get-to-know-saeed-agboke-founder-of-geschwister/" },
];

export const SHOWS = [
  { title: "Alliance of The Epic (PFW)", kind: "Runway Show", venue: "Gallery", place: "Paris, France", year: 2023 },
];

// Geschwister Radio. Tracks 4-6 still to come from Saeed.
export const TRACKS = [
  { title: "Closing Show — GAUNT", src: "assets/audio/1-closing-show-gaunt.mp3" },
  { title: "Feasting — Yebbz Ashanti, Tino G", src: "assets/audio/2-feasting.mp3" },
  { title: "Fox Spirit (demo) — bubz cooks", src: "assets/audio/3-fox-spirit-demo.mp3" },
  { title: "Opening Show — GAUNT", src: "assets/audio/7-opening-show-gaunt.mp3" },
];
