import type { MenuData } from "./types";

const IMG = (id: string) => `https://cdn.magicpatterns.com/patterns/generated-images/${id}.jpg`;

const non = { id: "a-non", name: { uz: "Tandir non", ru: "Лепёшка", en: "Tandir bread" }, price: 4000 };
const sauce = { id: "a-sauce", name: { uz: "Achchiq sous", ru: "Острый соус", en: "Hot sauce" }, price: 3000 };
const salad = { id: "a-salad", name: { uz: "Achchiq-chuchuk", ru: "Ачичук", en: "Achichuk salad" }, price: 12000 };
const tea = { id: "a-tea", name: { uz: "Ko'k choy", ru: "Зелёный чай", en: "Green tea" }, price: 8000 };
const onion = { id: "a-onion", name: { uz: "Piyoz va ko'kat", ru: "Лук и зелень", en: "Onion & herbs" }, price: 2000 };
const cream = { id: "a-cream", name: { uz: "Qaymoq", ru: "Сметана", en: "Sour cream" }, price: 4000 };

export const seedMenu: MenuData = {
  version: 1,
  settings: {
    name: "Rayhon",
    tagline: { uz: "Milliy taomlar oshxonasi", ru: "Национальная кухня", en: "Uzbek national cuisine" },
    logo: "🌿",
    cover: "/food/cover.jpg",
    phone: "+998 90 123 45 67",
    address: "Namangan sh., Navoiy ko'chasi, 12",
    hours: "09:00 – 23:00",
    currency: "so'm",
    serviceFee: 10,
    wifi: "Rayhon_Guest · 12345678",
    instagram: "rayhon.uz",
    telegram: "rayhon_uz",
    accent: "#E8590C",
    payments: { cash: true, card: true, click: true, payme: true },
    ordering: true,
    mode: "restaurant",
    telegramOrder: "rayhon_uz",
    theme: "light",
  },
  categories: [
    { id: "c-milliy", name: { uz: "Milliy taomlar", ru: "Национальные", en: "National dishes" }, emoji: "🍛", sort: 1, active: true },
    { id: "c-kabob", name: { uz: "Kaboblar", ru: "Шашлыки", en: "Kebabs" }, emoji: "🍢", sort: 2, active: true },
    { id: "c-shorva", name: { uz: "Sho'rvalar", ru: "Супы", en: "Soups" }, emoji: "🥣", sort: 3, active: true },
    { id: "c-salat", name: { uz: "Salatlar", ru: "Салаты", en: "Salads" }, emoji: "🥗", sort: 4, active: true },
    { id: "c-ichimlik", name: { uz: "Ichimliklar", ru: "Напитки", en: "Drinks" }, emoji: "🥤", sort: 5, active: true },
    { id: "c-desert", name: { uz: "Desertlar", ru: "Десерты", en: "Desserts" }, emoji: "🍰", sort: 6, active: true },
  ],
  items: [
    {
      id: "i-osh", categoryId: "c-milliy", sort: 1, available: true, serves: "1 kishi", stock: 24, suggest: { itemId: "i-achchiq", reason: { uz: "Oshning eng yaxshi hamrohi — yangi achchiq-chuchuk", ru: "Лучший спутник плова — свежий ачичук", en: "Plov's best friend — fresh achichuk salad" } },
      name: { uz: "To'y oshi", ru: "Свадебный плов", en: "Wedding plov" },
      desc: { uz: "Devzira guruch, sariq sabzi, qo'y go'shti, no'xat va sarimsoq bilan qozonda damlangan", ru: "Рис девзира, жёлтая морковь, баранина, нут и чеснок — томлёный в казане", en: "Devzira rice, yellow carrots, lamb, chickpeas and garlic slow-cooked in a kazan" },
      price: 45000, image: "/food/osh.jpg", badges: ["hit", "chef", "halal"], weight: "450 g", kcal: 780, time: 10,
      sizes: [
        { id: "s-1", name: { uz: "1 porsiya", ru: "1 порция", en: "1 portion" }, price: 0 },
        { id: "s-15", name: { uz: "1.5 porsiya", ru: "1.5 порции", en: "1.5 portion" }, price: 20000 },
      ],
      addons: [non, salad, tea, { id: "a-meat", name: { uz: "Qo'shimcha go'sht", ru: "Доп. мясо", en: "Extra meat" }, price: 15000 }],
    },
    {
      id: "i-lagmon", categoryId: "c-milliy", sort: 2, available: true, serves: "1 kishi", suggest: { itemId: "i-choy", reason: { uz: "Lag'mondan keyin issiq ko'k choy", ru: "После лагмана — горячий зелёный чай", en: "Hot green tea after lagman" } },
      name: { uz: "Qo'l lag'mon", ru: "Лагман ручной", en: "Hand-pulled lagman" },
      desc: { uz: "Qo'lda cho'zilgan xamir, mol go'shti va sabzavotli quyuq sous", ru: "Тянутая лапша, говядина и густой овощной соус", en: "Hand-pulled noodles, beef and rich vegetable sauce" },
      price: 38000, image: "/food/lagmon.jpg", badges: ["hit", "spicy"], weight: "400 g", kcal: 620, time: 15,
      addons: [non, sauce],
    },
    {
      id: "i-manti", categoryId: "c-milliy", sort: 3, available: true, serves: "1 kishi", stock: 3,
      name: { uz: "Manti", ru: "Манты", en: "Manti dumplings" },
      desc: { uz: "Bug'da pishirilgan, qo'y go'shti va piyozli, qaymoq bilan", ru: "На пару, с бараниной и луком, со сметаной", en: "Steamed, lamb and onion filling, served with sour cream" },
      price: 32000, image: "/food/manti.jpg", badges: [], weight: "5 dona", kcal: 540, time: 20,
      addons: [cream, sauce],
    },
    {
      id: "i-somsa", categoryId: "c-milliy", sort: 4, available: true, stock: 6, suggest: { itemId: "i-choy", reason: { uz: "Issiq somsa + choynak choy — klassika", ru: "Горячая самса + чайник чая — классика", en: "Hot samsa + a pot of tea — a classic" } },
      name: { uz: "Tandir somsa", ru: "Самса тандырная", en: "Tandir samsa" },
      desc: { uz: "Qatlama xamir, sersuv go'sht va piyoz, kunjut sepilgan", ru: "Слоёное тесто, сочное мясо и лук, кунжут", en: "Flaky dough, juicy meat and onion, sesame seeds" },
      price: 12000, image: "/food/somsa.jpg", badges: ["new"], weight: "1 dona", kcal: 380, time: 5,
      addons: [tea],
    },
    {
      id: "i-qozon", categoryId: "c-milliy", sort: 5, available: true, serves: "2 kishi", suggest: { itemId: "i-kompot", reason: { uz: "Yog'li taomga sovuq uy kompoti", ru: "К сытному блюду — холодный компот", en: "Cold compote pairs with rich food" } },
      name: { uz: "Qozon kabob", ru: "Казан-кебаб", en: "Kazan kebab" },
      desc: { uz: "Qo'y qovurg'asi, qizartirilgan kartoshka va piyoz halqalari", ru: "Бараньи рёбрышки, жареный картофель и луковые кольца", en: "Lamb ribs with crispy potatoes and onion rings" },
      price: 65000, image: "/food/qozon.jpg", badges: ["chef", "halal"], weight: "500 g", kcal: 920, time: 25,
      addons: [non, salad],
    },
    {
      id: "i-shashlik", categoryId: "c-kabob", sort: 1, available: true, serves: "1 six", suggest: { itemId: "i-non", reason: { uz: "Kabob issiq tandir nonsiz bo'lmaydi", ru: "Шашлык без горячей лепёшки — не шашлык", en: "Kebab needs hot tandir bread" } },
      name: { uz: "Qo'y go'shti kabob", ru: "Шашлык из баранины", en: "Lamb shashlik" },
      desc: { uz: "Ko'mirda pishirilgan yumshoq qo'y go'shti, piyoz va non bilan", ru: "Мягкая баранина на углях, с луком и лепёшкой", en: "Tender charcoal-grilled lamb with onions and bread" },
      price: 22000, image: "/food/shashlik.jpg", badges: ["hit", "smoky", "halal"], weight: "1 six", kcal: 310, time: 15,
      addons: [onion, non, sauce],
    },
    {
      id: "i-tovuq", categoryId: "c-kabob", sort: 2, available: true, serves: "2–3 kishi", suggest: { itemId: "i-limonad", reason: { uz: "Kabobga muzdek yalpizli limonad", ru: "К шашлыку — ледяной мятный лимонад", en: "Ice-cold mint lemonade with kebabs" } },
      name: { uz: "Tovuq kabob assorti", ru: "Ассорти из курицы", en: "Chicken kebab platter" },
      desc: { uz: "Tovuq va lula kabob, grilda pishgan pomidor va qalampir", ru: "Курица и люля, овощи гриль", en: "Chicken and lula kebab with grilled vegetables" },
      price: 48000, image: "/food/tovuq.jpg", badges: ["new"], weight: "600 g", kcal: 720, time: 20,
      addons: [non, sauce],
    },
    {
      id: "i-lula", categoryId: "c-kabob", sort: 3, available: true, suggest: { itemId: "i-achchiq", reason: { uz: "Lulaga yengil salat", ru: "К люля — лёгкий салат", en: "A light salad with lula" } },
      name: { uz: "Lula kabob", ru: "Люля-кебаб", en: "Lula kebab" },
      desc: { uz: "Qiyma qo'y go'shti, sumakli piyoz va pomidor sous", ru: "Рубленая баранина, лук с сумахом, томатный соус", en: "Minced lamb, sumac onions, tomato sauce" },
      price: 20000, image: "/food/lula.jpg", badges: ["spicy", "smoky", "halal"], weight: "1 six", kcal: 290, time: 15,
      addons: [onion, non],
    },
    {
      id: "i-shorva", categoryId: "c-shorva", sort: 1, available: true, serves: "1 kishi", suggest: { itemId: "i-non", reason: { uz: "Sho'rvaga issiq non to'g'rab", ru: "Горячая лепёшка к шурпе", en: "Hot bread for the soup" } },
      name: { uz: "Qo'y sho'rva", ru: "Шурпа", en: "Lamb shurpa" },
      desc: { uz: "Tiniq sho'rva, qo'y go'shti, kartoshka va sabzi", ru: "Прозрачный бульон, баранина, картофель, морковь", en: "Clear lamb broth with potatoes and carrots" },
      price: 30000, image: "/food/shorva.jpg", badges: [], weight: "400 ml", kcal: 410, time: 10,
      addons: [non, onion],
    },
    {
      id: "i-achchiq", categoryId: "c-salat", sort: 1, available: true,
      name: { uz: "Achchiq-chuchuk", ru: "Ачичук", en: "Achichuk salad" },
      desc: { uz: "Pomidor, piyoz va ko'katlar — oshning eng yaxshi hamrohi", ru: "Томаты, лук и зелень — лучший спутник плова", en: "Tomatoes, onions and herbs — plov's best friend" },
      price: 12000, image: "/food/achchiq.jpg", badges: ["veg"], weight: "250 g", kcal: 60, time: 5,
    },
    {
      id: "i-sezar", categoryId: "c-salat", sort: 2, available: true,
      name: { uz: "Sezar tovuq bilan", ru: "Цезарь с курицей", en: "Chicken Caesar" },
      desc: { uz: "Grildagi tovuq, romen, parmezan va suxariklar", ru: "Курица гриль, романо, пармезан и сухарики", en: "Grilled chicken, romaine, parmesan and croutons" },
      price: 35000, image: "/food/sezar.jpg", badges: [], weight: "280 g", kcal: 430, time: 10,
    },
    {
      id: "i-non", categoryId: "c-salat", sort: 3, available: true,
      name: { uz: "Tandir non", ru: "Лепёшка", en: "Tandir bread" },
      desc: { uz: "Issiq, kunjutli patir non", ru: "Горячая лепёшка с кунжутом", en: "Hot sesame flatbread" },
      price: 4000, image: "/food/non.jpg", badges: ["veg"], weight: "1 dona", time: 2,
    },
    {
      id: "i-choy", categoryId: "c-ichimlik", sort: 1, available: true,
      name: { uz: "Ko'k choy (choynak)", ru: "Зелёный чай (чайник)", en: "Green tea (pot)" },
      desc: { uz: "Choynakda, turshak va bodom bilan", ru: "В чайнике, с курагой и миндалём", en: "Teapot served with dried apricots and almonds" },
      price: 8000, image: "/food/choy.jpg", badges: [], weight: "800 ml", time: 3,
      addons: [{ id: "a-lemon", name: { uz: "Limon", ru: "Лимон", en: "Lemon" }, price: 3000 }],
    },
    {
      id: "i-limonad", categoryId: "c-ichimlik", sort: 2, available: true,
      name: { uz: "Yalpizli limonad", ru: "Мятный лимонад", en: "Mint lemonade" },
      desc: { uz: "Uy limonadi: limon, yalpiz va muz", ru: "Домашний: лимон, мята и лёд", en: "Homemade: lemon, mint and ice" },
      price: 18000, image: "/food/limonad.jpg", badges: ["new"], weight: "400 ml", time: 3,
      sizes: [
        { id: "s-04", name: { uz: "0.4 l", ru: "0.4 л", en: "0.4 l" }, price: 0 },
        { id: "s-1l", name: { uz: "1 l (grafin)", ru: "1 л (графин)", en: "1 l (jug)" }, price: 22000 },
      ],
    },
    {
      id: "i-kompot", categoryId: "c-ichimlik", sort: 3, available: true,
      name: { uz: "Uy kompoti", ru: "Домашний компот", en: "Homemade compote" },
      desc: { uz: "Olcha va o'rikdan, grafinda", ru: "Из вишни и абрикоса, в графине", en: "Cherry and apricot, served in a jug" },
      price: 20000, image: "/food/kompot.jpg", badges: [], weight: "1 l", time: 2,
    },
    {
      id: "i-cola", categoryId: "c-ichimlik", sort: 4, available: false,
      name: { uz: "Kola", ru: "Кола", en: "Cola" },
      desc: { uz: "Muz va limon bilan", ru: "Со льдом и лимоном", en: "With ice and lemon" },
      price: 10000, image: "/food/cola.jpg", badges: [], weight: "330 ml", time: 1,
    },
    {
      id: "i-napoleon", categoryId: "c-desert", sort: 1, available: true, stock: 2, suggest: { itemId: "i-choy", reason: { uz: "Shirinlikka choy", ru: "К десерту — чай", en: "Tea with dessert" } },
      name: { uz: "Napoleon", ru: "Наполеон", en: "Napoleon cake" },
      desc: { uz: "Qatlama xamir va vanilli krem", ru: "Слоёные коржи и ванильный крем", en: "Puff pastry layers with vanilla custard" },
      price: 22000, image: "/food/napoleon.jpg", badges: ["hit"], weight: "180 g", kcal: 450, time: 3,
    },
    {
      id: "i-chakchak", categoryId: "c-desert", sort: 2, available: true,
      name: { uz: "Chak-chak", ru: "Чак-чак", en: "Chak-chak" },
      desc: { uz: "Asalli shirinlik, yong'oq bilan", ru: "Медовая сладость с орехами", en: "Honey dessert with walnuts" },
      price: 18000, image: "/food/chakchak.jpg", badges: [], weight: "200 g", kcal: 520, time: 2,
    },
    {
      id: "i-muz", categoryId: "c-desert", sort: 3, available: true,
      name: { uz: "Muzqaymoq assorti", ru: "Мороженое ассорти", en: "Ice cream trio" },
      desc: { uz: "Vanil, pista va shokolad", ru: "Ваниль, фисташка и шоколад", en: "Vanilla, pistachio and chocolate" },
      price: 20000, image: "/food/muzqaymoq.jpg", badges: ["veg"], weight: "3 shar", kcal: 390, time: 2,
    },
  ],
  tables: Array.from({ length: 12 }, (_, i) => ({ id: String(i + 1), name: `Stol ${i + 1}`, zone: i < 8 ? "Zal" : "Ayvon" })),
};
