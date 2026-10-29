export type Lang = "uz" | "ru" | "en";
export type T3 = { uz: string; ru: string; en: string };

export type Addon = { id: string; name: T3; price: number };
export type Size = { id: string; name: T3; price: number };

export type Item = {
  id: string;
  categoryId: string;
  name: T3;
  desc: T3;
  price: number;
  image: string;
  badges: ("hit" | "new" | "spicy" | "veg" | "chef")[];
  weight?: string;
  kcal?: number;
  time?: number; // minutes
  available: boolean;
  sizes?: Size[];
  addons?: Addon[];
  sort: number;
};

export type Category = { id: string; name: T3; emoji: string; sort: number; active: boolean };

export type Table = { id: string; name: string; zone?: string };

export type Settings = {
  name: string;
  tagline: T3;
  logo: string; // emoji or url
  cover: string;
  phone: string;
  address: string;
  hours: string;
  currency: string;
  serviceFee: number; // percent
  wifi?: string;
  instagram?: string;
  telegram?: string;
  accent: string;
  payments: { cash: boolean; card: boolean; click: boolean; payme: boolean };
  ordering: boolean; // if false — menu only (view mode)
};

export type MenuData = {
  settings: Settings;
  categories: Category[];
  items: Item[];
  tables: Table[];
  version: number;
};

export type OrderStatus = "new" | "cooking" | "ready" | "served" | "closed" | "cancelled";

export type OrderLine = {
  itemId: string;
  name: string;
  price: number; // unit price incl. size+addons
  qty: number;
  size?: string;
  addons?: string[];
  note?: string;
};

export type Order = {
  id: string;
  num: number;
  table: string;
  lines: OrderLine[];
  subtotal: number;
  service: number;
  total: number;
  payment: "cash" | "card" | "click" | "payme";
  comment?: string;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  rating?: number;
  lang: Lang;
};

export type Call = {
  id: string;
  table: string;
  type: "waiter" | "bill";
  createdAt: number;
  done: boolean;
};
