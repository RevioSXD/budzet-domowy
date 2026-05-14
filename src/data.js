export const MONTHS = [
  "Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec",
  "Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"
];

export const CATEGORIES = {
  media:           { label: "Media",           icon: "⚡", color: "#4ecdc4" },
  kredyty:         { label: "Kredyty",         icon: "🏦", color: "#ff6b6b" },
  telekomunikacja: { label: "Telekomunikacja", icon: "📱", color: "#a78bfa" },
  ubezpieczenia:   { label: "Ubezpieczenia",   icon: "🛡️", color: "#fbbf24" },
  rozrywka:        { label: "Rozrywka",        icon: "🎬", color: "#f472b6" },
  jedzenie:        { label: "Jedzenie",        icon: "🍕", color: "#fb923c" },
  zakupy:          { label: "Zakupy",          icon: "🛒", color: "#34d399" },
  paliwo:          { label: "Paliwo",          icon: "⛽", color: "#60a5fa" },
  zwierzeta:       { label: "Zwierzęta",       icon: "🐾", color: "#c084fc" },
  dom:             { label: "Dom",             icon: "🏠", color: "#f87171" },
  zdrowie:         { label: "Zdrowie",         icon: "💊", color: "#2dd4bf" },
  inne:            { label: "Inne",            icon: "📦", color: "#94a3b8" },
};

export const DEFAULT_DATA = {
  incomes: {
    patrycja: [
      { id: "i1", name: "Wypłata", amount: 5500 },
      { id: "i2", name: "Dodatkowe", amount: 1300 },
      { id: "i3", name: "Dodatkowe 2", amount: 3500 },
    ],
    piotr: [
      { id: "i4", name: "Wypłata", amount: 12040 },
    ],
  },
  fixedCosts: {
    patrycja: [
      { id: "f1", name: "Kredyt mieszkanie", amount: 2000, category: "kredyty" },
      { id: "f2", name: "Kredyt TV", amount: 431, category: "kredyty" },
      { id: "f3", name: "Kredyt Taras", amount: 636, category: "kredyty" },
      { id: "f4", name: "Izby", amount: 85, category: "inne" },
      { id: "f5", name: "Ochrona", amount: 80, category: "inne" },
    ],
    piotr: [
      { id: "f6",  name: "Gaz", amount: 400, category: "media" },
      { id: "f7",  name: "Śmieci", amount: 200, category: "media" },
      { id: "f8",  name: "Prąd", amount: 250, category: "media" },
      { id: "f9",  name: "Internet", amount: 120, category: "media" },
      { id: "f10", name: "Telefon", amount: 370, category: "telekomunikacja" },
      { id: "f11", name: "Ubezpieczenie Jędrek", amount: 170, category: "ubezpieczenia" },
      { id: "f12", name: "Kredyt 1", amount: 1389, category: "kredyty" },
      { id: "f13", name: "Kredyt 2", amount: 465, category: "kredyty" },
      { id: "f14", name: "Kino", amount: 110, category: "rozrywka" },
      { id: "f15", name: "Media (subskrypcje)", amount: 150, category: "rozrywka" },
      { id: "f16", name: "PS Plus", amount: 70, category: "rozrywka" },
    ],
  },
  extraCosts: {
    patrycja: [
      { id: "e1", name: "Taras do 15.05", amount: 3400, category: "dom" },
      { id: "e2", name: "Taras po 15.05", amount: 3500, category: "dom" },
      { id: "e3", name: "Żabka", amount: 100, category: "jedzenie" },
    ],
    piotr: [
      { id: "e4",  name: "Hotel pies", amount: 800, category: "zwierzeta" },
      { id: "e5",  name: "Wyjazd czerwiec", amount: 1200, category: "rozrywka" },
      { id: "e6",  name: "Rolety", amount: 1000, category: "dom" },
      { id: "e7",  name: "Żabka Pat", amount: 25, category: "jedzenie" },
      { id: "e8",  name: "Stacja benzynowa Pat", amount: 643, category: "paliwo" },
      { id: "e9",  name: "Myjnia", amount: 90, category: "inne" },
      { id: "e10", name: "Stacja benzynowa Pio", amount: 127, category: "paliwo" },
      { id: "e11", name: "Lidl", amount: 456, category: "zakupy" },
      { id: "e12", name: "Karma mokra Jędrek", amount: 147, category: "zwierzeta" },
      { id: "e13", name: "Żabka", amount: 40, category: "jedzenie" },
      { id: "e14", name: "Kino", amount: 30, category: "rozrywka" },
      { id: "e15", name: "Bar Mleczny", amount: 32, category: "jedzenie" },
      { id: "e16", name: "Kebab", amount: 60, category: "jedzenie" },
      { id: "e17", name: "Apteka", amount: 108, category: "zdrowie" },
      { id: "e18", name: "Sklep spożywczy", amount: 74, category: "zakupy" },
      { id: "e19", name: "Piec", amount: 500, category: "dom" },
      { id: "e20", name: "Odido i Biedronka", amount: 140, category: "zakupy" },
      { id: "e21", name: "Media Expert", amount: 50, category: "zakupy" },
      { id: "e22", name: "Fame MMA", amount: 60, category: "rozrywka" },
      { id: "e23", name: "Terra Zoo", amount: 180, category: "zwierzeta" },
      { id: "e24", name: "Środki czystości", amount: 100, category: "dom" },
      { id: "e25", name: "Prowizja limit odnawialny", amount: 150, category: "kredyty" },
      { id: "e26", name: "Leon weterynarz", amount: 130, category: "zwierzeta" },
    ],
  },
};

export const genId = () => Math.random().toString(36).slice(2, 9);

export const fmt = (n) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

export const sumArr = (arr) =>
  (arr || []).reduce((s, x) => s + (Number(x.amount) || 0), 0);
