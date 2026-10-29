import type { Lang, T3 } from "./types";
export const money = (n: number, cur = "so'm") => `${Math.round(n).toLocaleString("ru-RU").replace(/,/g, " ")} ${cur}`;
export const tr = (t: T3 | undefined, l: Lang) => (t ? t[l] || t.uz : "");
export const ago = (ts: number) => {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} daq`;
  return `${Math.floor(m / 60)} soat ${m % 60} daq`;
};

const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const DAYS = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
export const uzDate = (d = new Date()) => `${DAYS[d.getDay()]}, ${d.getDate()}-${MONTHS[d.getMonth()]}`;
export const uzDayShort = (iso: string) => ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"][new Date(iso + "T12:00:00").getDay()];
