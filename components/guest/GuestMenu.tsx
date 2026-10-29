"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell, ChevronLeft, Clock, Flame, Info, Leaf, Minus, Phone, Plus, Receipt, Search, ShoppingBag, Sparkles, Star, Wifi, X, MapPin, ChefHat, Check, Camera, Send, Weight, Zap,
} from "lucide-react";
import type { Item, Lang, MenuData, Order } from "@/lib/types";
import { money, tr } from "@/lib/format";
import { LANGS, t } from "@/lib/i18n";

type CartLine = { key: string; itemId: string; qty: number; sizeId?: string; addonIds: string[]; note?: string };

const badgeStyle: Record<string, string> = {
  hit: "bg-brand text-white",
  new: "bg-emerald-600 text-white",
  spicy: "bg-red-600 text-white",
  veg: "bg-lime-600 text-white",
  chef: "bg-ink text-white",
};
const BadgeIcon = ({ b }: { b: string }) =>
  b === "spicy" ? <Flame size={11} /> : b === "veg" ? <Leaf size={11} /> : b === "chef" ? <ChefHat size={11} /> : b === "new" ? <Sparkles size={11} /> : <Star size={11} />;

function useLS<T>(key: string, init: T) {
  const [v, setV] = useState<T>(init);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const s = localStorage.getItem(key);
      if (s) setV(JSON.parse(s));
    } catch {}
    loaded.current = true;
  }, [key]);
  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key, v]);
  return [v, setV] as const;
}

export default function GuestMenu({ initial, tableId }: { initial: MenuData; tableId: string }) {
  const [menu, setMenu] = useState(initial);
  const [lang, setLang] = useLS<Lang>("sm_lang", "uz");
  const [cart, setCart] = useLS<CartLine[]>(`sm_cart_${tableId}`, []);
  const [myOrders, setMyOrders] = useLS<string[]>(`sm_orders_${tableId}`, []);
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<string>("");
  const [dish, setDish] = useState<Item | null>(null);
  const [sheet, setSheet] = useState<null | "cart" | "info" | "call" | "orders">(null);
  const [trackId, setTrackId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [bump, setBump] = useState(0);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const chipsRef = useRef<HTMLDivElement>(null);
  const S = menu.settings;
  const table = menu.tables.find((x) => x.id === tableId);
  const tableName = table?.name ?? `${t("table", lang)} ${tableId}`;

  const showToast = useCallback((text: string) => setToast({ id: Date.now(), text }), []);

  // refresh menu (availability) every 45s
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await fetch("/api/menu", { cache: "no-store" });
        if (r.ok) setMenu(await r.json());
      } catch {}
    }, 45000);
    return () => clearInterval(id);
  }, []);

  const cats = useMemo(() => menu.categories.filter((c) => c.active).sort((a, b) => a.sort - b.sort), [menu]);
  const itemsByCat = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const map: Record<string, Item[]> = {};
    for (const c of cats) {
      map[c.id] = menu.items
        .filter((i) => i.categoryId === c.id)
        .filter((i) => !ql || tr(i.name, lang).toLowerCase().includes(ql) || tr(i.desc, lang).toLowerCase().includes(ql) || i.name.uz.toLowerCase().includes(ql))
        .sort((a, b) => Number(b.available) - Number(a.available) || a.sort - b.sort);
    }
    return map;
  }, [menu, cats, q, lang]);
  const popular = useMemo(() => menu.items.filter((i) => i.available && (i.badges.includes("hit") || i.badges.includes("chef"))).slice(0, 8), [menu]);
  const anyResults = Object.values(itemsByCat).some((a) => a.length);

  // scrollspy
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActiveCat(vis[0].target.getAttribute("data-cat") || "");
      },
      { rootMargin: "-130px 0px -60% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [cats, itemsByCat]);
  useEffect(() => {
    const chip = chipsRef.current?.querySelector<HTMLElement>(`[data-chip="${activeCat}"]`);
    chip?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeCat]);

  const goCat = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 118, behavior: "smooth" });
  };

  const itemOf = (id: string) => menu.items.find((i) => i.id === id);
  const unitPrice = (l: CartLine) => {
    const it = itemOf(l.itemId);
    if (!it) return 0;
    const size = it.sizes?.find((s) => s.id === l.sizeId);
    return it.price + (size?.price ?? 0) + (it.addons ?? []).filter((a) => l.addonIds.includes(a.id)).reduce((s, a) => s + a.price, 0);
  };
  const validCart = cart.filter((l) => itemOf(l.itemId));
  const count = validCart.reduce((s, l) => s + l.qty, 0);
  const subtotal = validCart.reduce((s, l) => s + unitPrice(l) * l.qty, 0);
  const service = Math.round((subtotal * (S.serviceFee || 0)) / 100);
  const qtyOfItem = (id: string) => validCart.filter((l) => l.itemId === id).reduce((s, l) => s + l.qty, 0);

  const addLine = (line: Omit<CartLine, "key">) => {
    const key = `${line.itemId}|${line.sizeId ?? ""}|${[...line.addonIds].sort().join(",")}|${line.note ?? ""}`;
    setCart((c) => {
      const ex = c.find((x) => x.key === key);
      if (ex) return c.map((x) => (x.key === key ? { ...x, qty: x.qty + line.qty } : x));
      return [...c, { ...line, key }];
    });
    setBump((b) => b + 1);
    if (navigator.vibrate) navigator.vibrate(15);
  };
  const quickAdd = (it: Item) => {
    if (!it.available) return;
    if (it.sizes?.length || it.addons?.length) return setDish(it);
    addLine({ itemId: it.id, qty: 1, addonIds: [] });
    showToast(`${tr(it.name, lang)} · ${t("added", lang)}`);
  };
  const changeQty = (key: string, d: number) => setCart((c) => c.map((x) => (x.key === key ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0));

  const lockBody = !!(dish || sheet || trackId);
  useEffect(() => {
    document.body.style.overflow = lockBody ? "hidden" : "";
  }, [lockBody]);

  return (
    <div className="mx-auto min-h-dvh max-w-[520px] overflow-x-clip bg-cream pb-32">
      {/* HERO */}
      <header className="relative h-56 overflow-hidden">
        <img src={S.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/70" />
        <div className="relative flex items-center justify-between p-4">
          <div className="flex rounded-full bg-white/15 p-1 backdrop-blur-md">
            {LANGS.map((l) => (
              <button key={l.id} onClick={() => setLang(l.id)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${lang === l.id ? "bg-white text-ink" : "text-white"}`}>
                {l.label}
              </button>
            ))}
          </div>
          <button onClick={() => setSheet("info")} className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md" aria-label="info">
            <Info size={19} />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex items-end gap-3 p-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white text-3xl shadow-lg ring-4 ring-white/30">
            {S.logo.startsWith("http") || S.logo.startsWith("/") ? <img src={S.logo} alt="" className="h-full w-full object-cover" /> : S.logo}
          </div>
          <div className="min-w-0 flex-1 text-white">
            <h1 className="font-display text-2xl font-extrabold leading-tight">{S.name}</h1>
            <p className="truncate text-sm text-white/85">{tr(S.tagline, lang)}</p>
          </div>
          <span className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-extrabold text-white shadow-lg">{tableName}</span>
        </div>
      </header>

      <div className="flex items-center gap-4 border-b border-line bg-white px-4 py-2.5 text-xs font-semibold text-mute">
        <span className="flex items-center gap-1"><Clock size={14} /> {S.hours}</span>
        <span className="flex items-center gap-1 text-ok"><span className="h-2 w-2 rounded-full bg-ok" /> Ochiq</span>
        {S.wifi && <span className="flex min-w-0 items-center gap-1 truncate"><Wifi size={14} /> <span className="truncate">{S.wifi.split("·")[0]}</span></span>}
      </div>

      {/* STICKY SEARCH + CHIPS */}
      <div className="sticky top-0 z-20 bg-cream/95 pt-3 backdrop-blur-md">
        <div className="flex gap-2 px-4">
          <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-2xl border border-line bg-white px-4 shadow-sm focus-within:border-brand">
            <Search size={18} className="text-mute" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search", lang)} className="h-full w-full min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-mute/70" />
            {q && <button onClick={() => setQ("")} aria-label="clear"><X size={18} className="text-mute" /></button>}
          </label>
          <button onClick={() => setSheet("call")} className="flex h-12 shrink-0 items-center gap-1.5 rounded-2xl bg-ink px-4 text-sm font-bold text-white shadow-sm active:scale-95" aria-label="waiter">
            <Bell size={18} /> <span className="hidden min-[380px]:inline">{lang === "ru" ? "Официант" : lang === "en" ? "Waiter" : "Ofitsiant"}</span>
          </button>
        </div>
        <div ref={chipsRef} className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
          {cats.map((c) => (
            <button
              key={c.id}
              data-chip={c.id}
              onClick={() => goCat(c.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${activeCat === c.id ? "bg-ink text-white shadow-md" : "bg-white text-ink ring-1 ring-line"}`}
            >
              <span>{c.emoji}</span> {tr(c.name, lang)}
            </button>
          ))}
        </div>
      </div>

      {/* POPULAR */}
      {!q && popular.length > 0 && (
        <section className="pt-2">
          <h2 className="flex items-center gap-2 px-4 font-display text-lg font-extrabold"><Zap size={18} className="text-brand" /> {t("popular", lang)}</h2>
          <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
            {popular.map((it) => (
              <button key={it.id} onClick={() => setDish(it)} className="w-40 shrink-0 snap-start overflow-hidden rounded-3xl bg-white text-left shadow-sm ring-1 ring-line active:scale-[0.98]">
                <div className="relative h-28">
                  <img src={it.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  {qtyOfItem(it.id) > 0 && <span className="absolute right-2 top-2 grid h-6 min-w-6 place-items-center rounded-full bg-brand px-1.5 text-xs font-extrabold text-white">{qtyOfItem(it.id)}</span>}
                </div>
                <div className="p-3">
                  <p className="line-clamp-1 text-sm font-bold">{tr(it.name, lang)}</p>
                  <p className="mt-1 text-sm font-extrabold text-brand">{money(it.price, S.currency)}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* SECTIONS */}
      {!anyResults && (
        <div className="px-6 py-20 text-center text-mute">
          <Search className="mx-auto mb-3" size={36} />
          <p className="font-semibold">{t("noResults", lang)}</p>
        </div>
      )}
      {cats.map((c) =>
        itemsByCat[c.id]?.length ? (
          <section key={c.id} data-cat={c.id} ref={(el) => { sectionRefs.current[c.id] = el; }} className="px-4 pt-6">
            <h2 className="mb-3 font-display text-xl font-extrabold">{c.emoji} {tr(c.name, lang)}</h2>
            <div className="space-y-3">
              {itemsByCat[c.id].map((it) => (
                <DishCard key={it.id} it={it} lang={lang} cur={S.currency} qty={qtyOfItem(it.id)} onOpen={() => setDish(it)} onAdd={() => quickAdd(it)} canOrder={S.ordering} />
              ))}
            </div>
          </section>
        ) : null
      )}

      <footer className="px-4 pb-6 pt-10 text-center text-xs text-mute">
        Powered by <span className="font-extrabold text-ink">Smart<span className="text-brand">Menu</span></span>
      </footer>

      {/* FLOATING */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[520px] px-4 safe-b">
        <div className="pointer-events-auto mb-3 flex justify-end gap-2">
          {myOrders.length > 0 && (
            <button onClick={() => setSheet("orders")} className="flex h-12 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold shadow-lg ring-1 ring-line">
              <Receipt size={18} className="text-brand" /> {t("myOrders", lang)}
            </button>
          )}
        </div>
        {count > 0 && S.ordering && (
          <button key={bump} onClick={() => setSheet("cart")} className="pointer-events-auto anim-pop flex h-16 w-full items-center justify-between rounded-2xl bg-brand px-5 text-white shadow-xl shadow-brand/30 active:scale-[0.99]">
            <span className="flex items-center gap-3">
              <span className="grid h-9 min-w-9 place-items-center rounded-xl bg-white/20 px-2 text-sm font-extrabold">{count}</span>
              <span className="font-bold">{t("cart", lang)}</span>
            </span>
            <span className="font-extrabold">{money(subtotal, S.currency)} →</span>
          </button>
        )}
      </div>

      {dish && (
        <DishSheet
          it={dish}
          lang={lang}
          menu={menu}
          onClose={() => setDish(null)}
          onAdd={(line) => {
            addLine(line);
            showToast(`${tr(dish.name, lang)} · ${t("added", lang)}`);
            setDish(null);
          }}
        />
      )}

      {sheet === "cart" && (
        <CartSheet
          menu={menu}
          lang={lang}
          lines={validCart}
          unitPrice={unitPrice}
          subtotal={subtotal}
          service={service}
          tableId={tableId}
          tableName={tableName}
          onQty={changeQty}
          onAdd={(it) => quickAdd(it)}
          onClose={() => setSheet(null)}
          onPlaced={(o) => {
            setCart([]);
            setMyOrders((m) => [o.id, ...m.filter((x) => x !== o.id)].slice(0, 10));
            setSheet(null);
            setTrackId(o.id);
          }}
        />
      )}

      {sheet === "info" && (
        <Sheet onClose={() => setSheet(null)} title={t("info", lang)}>
          <div className="space-y-2 p-4">
            <InfoRow icon={<Clock size={18} />} label={t("hours", lang)} value={S.hours} />
            <InfoRow icon={<MapPin size={18} />} label={t("address", lang)} value={S.address} />
            {S.wifi && <InfoRow icon={<Wifi size={18} />} label={t("wifi", lang)} value={S.wifi} />}
            <a href={`tel:${S.phone.replace(/\s/g, "")}`}><InfoRow icon={<Phone size={18} />} label={t("phone", lang)} value={S.phone} /></a>
            <div className="flex gap-2 pt-2">
              {S.instagram && <a href={`https://instagram.com/${S.instagram}`} target="_blank" className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sand py-3 text-sm font-bold"><Camera size={18} /> Instagram</a>}
              {S.telegram && <a href={`https://t.me/${S.telegram}`} target="_blank" className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sand py-3 text-sm font-bold"><Send size={18} /> Telegram</a>}
            </div>
          </div>
        </Sheet>
      )}

      {sheet === "call" && <CallSheet lang={lang} tableId={tableId} tableName={tableName} onClose={() => setSheet(null)} onDone={(m) => { setSheet(null); showToast(m); }} />}

      {sheet === "orders" && (
        <Sheet onClose={() => setSheet(null)} title={t("myOrders", lang)}>
          <OrdersList ids={myOrders} lang={lang} cur={S.currency} onOpen={(id) => { setSheet(null); setTrackId(id); }} />
        </Sheet>
      )}

      {trackId && <TrackSheet id={trackId} lang={lang} cur={S.currency} tableId={tableId} onClose={() => setTrackId(null)} onToast={showToast} />}

      {toast && (
        <div key={toast.id} className="anim-toast fixed bottom-28 left-1/2 z-[70] flex items-center gap-2 whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-xl" onAnimationEnd={() => setToast(null)}>
          <Check size={16} className="text-emerald-400" /> {toast.text}
        </div>
      )}
    </div>
  );
}

function DishCard({ it, lang, cur, qty, onOpen, onAdd, canOrder }: { it: Item; lang: Lang; cur: string; qty: number; onOpen: () => void; onAdd: () => void; canOrder: boolean }) {
  return (
    <div onClick={onOpen} className={`flex cursor-pointer gap-3 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-line transition active:scale-[0.99] ${!it.available ? "opacity-60" : ""}`}>
      <div className="flex min-w-0 flex-1 flex-col py-1 pl-1">
        <div className="mb-1 flex flex-wrap gap-1">
          {it.badges.slice(0, 2).map((b) => (
            <span key={b} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${badgeStyle[b]}`}><BadgeIcon b={b} /> {t(`b_${b}` as never, lang)}</span>
          ))}
        </div>
        <h3 className="text-[15px] font-extrabold leading-snug">{tr(it.name, lang)}</h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-mute">{tr(it.desc, lang)}</p>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <span className="text-[15px] font-extrabold">{money(it.price, cur)}</span>
          {it.weight && <span className="text-xs text-mute">· {it.weight}</span>}
        </div>
      </div>
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl">
        <img src={it.image} alt="" className={`h-full w-full object-cover ${!it.available ? "grayscale" : ""}`} loading="lazy" />
        {!it.available ? (
          <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1 text-center text-[11px] font-bold text-white">{t("soldout", lang)}</span>
        ) : canOrder ? (
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            className="absolute bottom-1.5 right-1.5 grid h-9 min-w-9 place-items-center rounded-full bg-white px-2 text-brand shadow-md active:scale-90"
            aria-label="add"
          >
            {qty > 0 ? <span className="text-sm font-extrabold">{qty}</span> : <Plus size={20} strokeWidth={3} />}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Sheet({ children, onClose, title, full }: { children: React.ReactNode; onClose: () => void; title?: string; full?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="anim-fade absolute inset-0 bg-black/45" onClick={onClose} />
      <div className={`anim-sheet relative flex w-full max-w-[520px] flex-col overflow-hidden rounded-t-[28px] bg-cream ${full ? "h-[94dvh]" : "max-h-[90dvh]"}`}>
        {title && (
          <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3">
            <h3 className="font-display text-lg font-extrabold">{title}</h3>
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-sand" aria-label="close"><X size={18} /></button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-line">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">{icon}</span>
      <div>
        <p className="text-xs text-mute">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}

function DishSheet({ it, lang, menu, onClose, onAdd }: { it: Item; lang: Lang; menu: MenuData; onClose: () => void; onAdd: (l: Omit<CartLine, "key">) => void }) {
  const [sizeId, setSizeId] = useState(it.sizes?.[0]?.id);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const cur = menu.settings.currency;
  const unit = it.price + (it.sizes?.find((s) => s.id === sizeId)?.price ?? 0) + (it.addons ?? []).filter((a) => addonIds.includes(a.id)).reduce((s, a) => s + a.price, 0);
  return (
    <Sheet onClose={onClose} full>
      <div className="relative h-72 shrink-0">
        <img src={it.image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <button onClick={onClose} className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow" aria-label="back"><ChevronLeft size={22} /></button>
        <div className="absolute left-1/2 top-2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/70" />
      </div>
      <div className="-mt-6 relative rounded-t-[28px] bg-cream px-5 pb-36 pt-5">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {it.badges.map((b) => (
            <span key={b} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase ${badgeStyle[b]}`}><BadgeIcon b={b} /> {t(`b_${b}` as never, lang)}</span>
          ))}
        </div>
        <h2 className="font-display text-2xl font-extrabold leading-tight">{tr(it.name, lang)}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-mute">{tr(it.desc, lang)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {it.weight && <Chip icon={<Weight size={14} />}>{it.weight}</Chip>}
          {it.kcal && <Chip icon={<Flame size={14} />}>{it.kcal} kcal</Chip>}
          {it.time && <Chip icon={<Clock size={14} />}>~{it.time} {t("min", lang)}</Chip>}
        </div>

        {!!it.sizes?.length && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-mute">{t("size", lang)}</p>
            <div className="grid grid-cols-2 gap-2">
              {it.sizes.map((s) => (
                <button key={s.id} onClick={() => setSizeId(s.id)} className={`rounded-2xl p-3 text-left ring-2 transition ${sizeId === s.id ? "bg-brand-soft ring-brand" : "bg-white ring-line"}`}>
                  <p className="font-bold">{tr(s.name, lang)}</p>
                  <p className="text-sm text-mute">{s.price ? `+${money(s.price, cur)}` : money(it.price, cur)}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {!!it.addons?.length && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-mute">{t("addons", lang)}</p>
            <div className="flex flex-wrap gap-2">
              {it.addons.map((a) => {
                const on = addonIds.includes(a.id);
                return (
                  <button key={a.id} onClick={() => setAddonIds((x) => (on ? x.filter((y) => y !== a.id) : [...x, a.id]))} className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold ring-2 transition ${on ? "bg-brand text-white ring-brand" : "bg-white ring-line"}`}>
                    {on ? <Check size={15} /> : <Plus size={15} />} {tr(a.name, lang)} <span className={on ? "text-white/85" : "text-mute"}>+{money(a.price, "").trim()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {menu.settings.ordering && (
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("note", lang)} rows={2} className="mt-6 w-full resize-none rounded-2xl border border-line bg-white p-3 text-[16px] outline-none focus:border-brand" />
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-line bg-white px-4 pt-3 safe-b">
        {!it.available ? (
          <div className="rounded-2xl bg-sand py-4 text-center font-bold text-mute">{t("soldout", lang)}</div>
        ) : !menu.settings.ordering ? (
          <div className="rounded-2xl bg-sand py-4 text-center text-sm font-bold text-mute">{t("viewOnly", lang)}</div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-14 items-center rounded-2xl bg-sand">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-14 w-12 place-items-center" aria-label="minus"><Minus size={18} /></button>
              <span className="w-6 text-center text-lg font-extrabold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid h-14 w-12 place-items-center" aria-label="plus"><Plus size={18} /></button>
            </div>
            <button onClick={() => onAdd({ itemId: it.id, qty, sizeId, addonIds, note: note.trim() || undefined })} className="flex h-14 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-brand px-3 text-[15px] font-extrabold text-white shadow-lg shadow-brand/30 active:scale-[0.99]">
              {t("add", lang)} · {money(unit * qty, cur)}
            </button>
          </div>
        )}
      </div>
    </Sheet>
  );
}

const Chip = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-line">{icon}{children}</span>
);

function CartSheet(props: {
  menu: MenuData; lang: Lang; lines: CartLine[]; unitPrice: (l: CartLine) => number; subtotal: number; service: number; tableId: string; tableName: string;
  onQty: (key: string, d: number) => void; onAdd: (it: Item) => void; onClose: () => void; onPlaced: (o: Order) => void;
}) {
  const { menu, lang, lines, unitPrice, subtotal, service, onQty, onClose } = props;
  const S = menu.settings;
  const payOpts = (["cash", "card", "click", "payme"] as const).filter((p) => S.payments[p]);
  const [payment, setPayment] = useState<(typeof payOpts)[number]>(payOpts[0] ?? "cash");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inCart = new Set(lines.map((l) => l.itemId));
  const upsell = menu.items
    .filter((i) => i.available && !inCart.has(i.id) && !i.sizes?.length && (i.categoryId === "c-ichimlik" || i.categoryId === "c-desert" || i.categoryId === "c-salat" || i.price <= 25000))
    .slice(0, 8);

  const place = async () => {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: props.tableId, lines: lines.map(({ itemId, qty, sizeId, addonIds, note }) => ({ itemId, qty, sizeId, addonIds, note })), payment, comment: comment.trim() || undefined, lang }),
      });
      if (!r.ok) throw new Error();
      props.onPlaced(await r.json());
    } catch {
      setErr(t("error", lang));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet onClose={onClose} title={`${t("cart", lang)} · ${props.tableName}`} full>
      {lines.length === 0 ? (
        <div className="px-6 py-24 text-center">
          <ShoppingBag className="mx-auto mb-3 text-mute" size={44} />
          <p className="font-display text-lg font-extrabold">{t("empty", lang)}</p>
          <p className="mt-1 text-mute">{t("emptyHint", lang)}</p>
        </div>
      ) : (
        <div className="pb-40">
          <div className="space-y-2 p-4">
            {lines.map((l) => {
              const it = menu.items.find((i) => i.id === l.itemId)!;
              const size = it.sizes?.find((s) => s.id === l.sizeId);
              const adds = (it.addons ?? []).filter((a) => l.addonIds.includes(a.id));
              return (
                <div key={l.key} className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-line">
                  <img src={it.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-tight">{tr(it.name, lang)}</p>
                    {(size || adds.length > 0 || l.note) && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-mute">{[size && tr(size.name, lang), ...adds.map((a) => "+ " + tr(a.name, lang)), l.note && `“${l.note}”`].filter(Boolean).join(" · ")}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-extrabold">{money(unitPrice(l) * l.qty, S.currency)}</span>
                      <div className="flex items-center rounded-full bg-sand">
                        <button onClick={() => onQty(l.key, -1)} className="grid h-8 w-8 place-items-center" aria-label="minus"><Minus size={15} /></button>
                        <span className="w-5 text-center text-sm font-extrabold">{l.qty}</span>
                        <button onClick={() => onQty(l.key, 1)} className="grid h-8 w-8 place-items-center" aria-label="plus"><Plus size={15} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {upsell.length > 0 && (
            <div className="pb-2">
              <p className="px-4 font-display font-extrabold">✨ {t("upsell", lang)}</p>
              <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
                {upsell.map((it) => (
                  <button key={it.id} onClick={() => props.onAdd(it)} className="flex w-36 shrink-0 items-center gap-2 rounded-2xl bg-white p-2 text-left ring-1 ring-line">
                    <img src={it.image} alt="" className="h-11 w-11 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold">{tr(it.name, lang)}</p>
                      <p className="text-xs font-extrabold text-brand">+{money(it.price, "").trim()}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 p-4">
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder={t("comment", lang)} className="w-full resize-none rounded-2xl border border-line bg-white p-3 text-[16px] outline-none focus:border-brand" />
            {payOpts.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-mute">{t("payment", lang)}</p>
                <div className="grid grid-cols-4 gap-2">
                  {payOpts.map((p) => (
                    <button key={p} onClick={() => setPayment(p)} className={`rounded-2xl py-3 text-sm font-bold ring-2 ${payment === p ? "bg-brand-soft text-brand ring-brand" : "bg-white ring-line"}`}>
                      {p === "cash" ? "💵" : p === "card" ? "💳" : p === "click" ? "🔵" : "🟢"}
                      <div className="mt-0.5">{p === "cash" ? t("cash", lang) : p === "card" ? t("card", lang) : p === "click" ? "Click" : "Payme"}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2 rounded-2xl bg-white p-4 ring-1 ring-line">
              <div className="flex justify-between text-mute"><span>{t("subtotal", lang)}</span><span>{money(subtotal, S.currency)}</span></div>
              {S.serviceFee > 0 && <div className="flex justify-between text-mute"><span>{t("service", lang)} {S.serviceFee}%</span><span>{money(service, S.currency)}</span></div>}
              <div className="flex justify-between border-t border-dashed border-line pt-2 text-lg font-extrabold"><span>{t("total", lang)}</span><span>{money(subtotal + service, S.currency)}</span></div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 border-t border-line bg-white px-4 pt-3 safe-b">
            {err && <p className="mb-2 text-center text-sm font-semibold text-red-600">{err}</p>}
            <button disabled={busy} onClick={place} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-lg font-extrabold text-white shadow-lg shadow-brand/30 disabled:opacity-60">
              {busy ? t("sending", lang) : <>{t("order", lang)} · {money(subtotal + service, S.currency)}</>}
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function CallSheet({ lang, tableId, tableName, onClose, onDone }: { lang: Lang; tableId: string; tableName: string; onClose: () => void; onDone: (m: string) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const call = async (type: "waiter" | "bill") => {
    setBusy(type);
    try {
      await fetch("/api/calls", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table: tableName || tableId, type }) });
      onDone(type === "bill" ? t("billCalled", lang) : t("called", lang));
    } catch {
      onDone(t("error", lang));
    }
  };
  return (
    <Sheet onClose={onClose} title={tableName}>
      <div className="grid grid-cols-2 gap-3 p-4 pb-8">
        <button disabled={!!busy} onClick={() => call("waiter")} className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 ring-1 ring-line active:scale-[0.98]">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-soft text-brand"><Bell size={30} /></span>
          <span className="text-center font-extrabold">{t("waiter", lang)}</span>
        </button>
        <button disabled={!!busy} onClick={() => call("bill")} className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 ring-1 ring-line active:scale-[0.98]">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><Receipt size={30} /></span>
          <span className="text-center font-extrabold">{t("bill", lang)}</span>
        </button>
      </div>
    </Sheet>
  );
}

const STEPS = ["new", "cooking", "ready", "served"] as const;

function TrackSheet({ id, lang, cur, onClose, onToast }: { id: string; lang: Lang; cur: string; tableId: string; onClose: () => void; onToast: (m: string) => void }) {
  const [o, setO] = useState<Order | null>(null);
  const [rated, setRated] = useState(0);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(`/api/orders/${id}`, { cache: "no-store" });
        if (r.ok && alive) setO(await r.json());
      } catch {}
    };
    load();
    const iv = setInterval(load, 5000);
    return () => { alive = false; clearInterval(iv); };
  }, [id]);
  const stepIdx = o ? Math.max(0, STEPS.indexOf((o.status === "closed" ? "served" : o.status) as never)) : 0;
  const rate = async (n: number) => {
    setRated(n);
    await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating: n }) });
    onToast(t("rated", lang));
  };
  return (
    <Sheet onClose={onClose} full>
      <div className="px-5 pb-10 pt-6">
        <div className="mx-auto mb-1 h-1.5 w-12 rounded-full bg-line" />
        <div className="mt-6 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-ok text-white"><Check size={30} strokeWidth={3} /></div>
          </div>
          <p className="mt-4 text-sm font-bold uppercase tracking-wider text-mute">{t("orderNo", lang)} #{o?.num ?? "…"}</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold">{o?.status === "cancelled" ? t("st_cancelled", lang) : t("thanks", lang)}</h2>
        </div>

        {o?.status !== "cancelled" && (
          <div className="mt-8 rounded-3xl bg-white p-5 ring-1 ring-line">
            {STEPS.map((s, i) => {
              const done = i <= stepIdx;
              const current = i === stepIdx;
              return (
                <div key={s} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={`grid h-9 w-9 place-items-center rounded-full text-sm font-extrabold transition ${done ? "bg-brand text-white" : "bg-sand text-mute"} ${current ? "pulse-ring" : ""}`}>
                      {done && !current ? <Check size={16} strokeWidth={3} /> : i + 1}
                    </span>
                    {i < STEPS.length - 1 && <span className={`my-1 h-7 w-0.5 ${i < stepIdx ? "bg-brand" : "bg-line"}`} />}
                  </div>
                  <div className="pt-1.5">
                    <p className={`font-bold ${done ? "text-ink" : "text-mute"}`}>{t(`st_${s}` as never, lang)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {o && (
          <div className="mt-4 rounded-3xl bg-white p-5 ring-1 ring-line">
            {o.lines.map((l, i) => (
              <div key={i} className="flex justify-between py-1 text-sm">
                <span><b>{l.qty}×</b> {l.name}{l.size ? ` (${l.size})` : ""}</span>
                <span className="font-semibold">{money(l.price * l.qty, cur)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-dashed border-line pt-2 font-extrabold"><span>{t("total", lang)}</span><span>{money(o.total, cur)}</span></div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="font-bold">{t("rate", lang)}</p>
          <div className="mt-2 flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => rate(n)} aria-label={`${n}`}>
                <Star size={34} className={(rated || o?.rating || 0) >= n ? "fill-amber-400 text-amber-400" : "text-line"} />
              </button>
            ))}
          </div>
        </div>

        <button onClick={onClose} className="mt-8 h-14 w-full rounded-2xl bg-ink font-extrabold text-white">{t("backMenu", lang)}</button>
      </div>
    </Sheet>
  );
}

function OrdersList({ ids, lang, cur, onOpen }: { ids: string[]; lang: Lang; cur: string; onOpen: (id: string) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    Promise.all(ids.map((id) => fetch(`/api/orders/${id}`).then((r) => (r.ok ? r.json() : null)).catch(() => null))).then((x) => setOrders(x.filter(Boolean)));
  }, [ids]);
  return (
    <div className="space-y-2 p-4 pb-8">
      {orders.length === 0 && <div className="skeleton h-20 rounded-2xl" />}
      {orders.map((o) => (
        <button key={o.id} onClick={() => onOpen(o.id)} className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left ring-1 ring-line">
          <div>
            <p className="font-extrabold">#{o.num} · {money(o.total, cur)}</p>
            <p className="text-sm text-mute">{o.lines.reduce((s, l) => s + l.qty, 0)} {t("items", lang)} · {new Date(o.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-extrabold text-brand">{t(`st_${o.status}` as never, lang)}</span>
        </button>
      ))}
    </div>
  );
}
