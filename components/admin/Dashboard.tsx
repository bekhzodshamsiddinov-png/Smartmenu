"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bell, Receipt, ShoppingBag, Sparkles, Star, TrendingUp, Wallet } from "lucide-react";
import { useAdmin } from "./AdminApp";
import { Btn, Card, PageHead } from "./ui";
import { ago, money, uzDate, uzDayShort } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function Dashboard() {
  const { live, menu, go, closeCall } = useAdmin();
  const [week, setWeek] = useState<{ day: string; orders: Order[] }[]>([]);
  useEffect(() => {
    fetch("/api/stats?days=7").then((r) => (r.ok ? r.json() : [])).then(setWeek).catch(() => {});
  }, []);
  const cur = menu.settings.currency;
  const valid = live.orders.filter((o) => o.status !== "cancelled");
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const avg = valid.length ? revenue / valid.length : 0;
  const lines = valid.flatMap((o) => o.lines);
  const addonRate = lines.length ? Math.round((lines.filter((l) => l.addons?.length).length / lines.length) * 100) : 0;
  const rated = valid.filter((o) => o.rating);
  const rating = rated.length ? rated.reduce((s, o) => s + (o.rating || 0), 0) / rated.length : 0;

  const hours = useMemo(() => {
    const h = Array.from({ length: 24 }, () => 0);
    valid.forEach((o) => { h[new Date(o.createdAt + 5 * 3600000).getUTCHours()] += o.total; });
    return h.slice(8, 24).map((v, i) => ({ h: i + 8, v }));
  }, [valid]);
  const maxH = Math.max(1, ...hours.map((x) => x.v));

  const top = useMemo(() => {
    const m = new Map<string, { name: string; qty: number; sum: number }>();
    lines.forEach((l) => {
      const x = m.get(l.itemId) ?? { name: l.name, qty: 0, sum: 0 };
      x.qty += l.qty; x.sum += l.qty * l.price;
      m.set(l.itemId, x);
    });
    return [...m.entries()].sort((a, b) => b[1].qty - a[1].qty).slice(0, 5);
  }, [lines]);

  const weekData = week.map((d) => ({ day: d.day, sum: d.orders.reduce((s, o) => s + o.total, 0), n: d.orders.length }));
  const maxW = Math.max(1, ...weekData.map((d) => d.sum));
  const active = live.orders.filter((o) => ["new", "cooking", "ready"].includes(o.status));
  const hello = (() => { const h = new Date().getHours(); return h < 12 ? "Xayrli tong" : h < 18 ? "Xayrli kun" : "Xayrli kech"; })();

  return (
    <div>
      <PageHead title={`${hello} 👋`} sub={uzDate()} right={<Btn onClick={() => go("orders")} className="hidden sm:inline-flex">Buyurtmalar <ArrowRight size={17} /></Btn>} />

      {live.calls.length > 0 && (
        <div className="mb-4 space-y-2">
          {live.calls.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200">
              <span className="pulse-ring grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-white"><Bell size={19} /></span>
              <div className="flex-1">
                <p className="font-extrabold">{c.table} · {c.type === "bill" ? "Hisob so'radi" : "Ofitsiant chaqirdi"}</p>
                <p className="text-sm text-mute">{ago(c.createdAt)} oldin</p>
              </div>
              <Btn size="sm" variant="dark" onClick={() => closeCall(c.id)}>Bajarildi</Btn>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={<Wallet size={20} />} label="Bugungi tushum" value={money(revenue, cur)} tone="brand" />
        <Kpi icon={<ShoppingBag size={20} />} label="Buyurtmalar" value={String(valid.length)} sub={`${active.length} ta faol`} />
        <Kpi icon={<Receipt size={20} />} label="O'rtacha chek" value={money(avg, cur)} />
        <Kpi icon={<Sparkles size={20} />} label="Qo'shimcha sotuv" value={`${addonRate}%`} sub={rating ? `★ ${rating.toFixed(1)} reyting` : "taomlarda qo'shimcha"} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display font-extrabold">Soatlar bo'yicha tushum</p>
            <span className="text-xs font-semibold text-mute">08:00 – 23:00</span>
          </div>
          <div className="flex h-40 items-end gap-1.5">
            {hours.map((x) => (
              <div key={x.h} className="group flex h-full flex-1 flex-col items-center gap-1">
                <div className="relative flex w-full flex-1 items-end">
                  <div className={`w-full rounded-t-md transition-all ${x.v ? "bg-brand" : "bg-sand"}`} style={{ height: `${Math.max(4, (x.v / maxH) * 100)}%` }} />
                  {x.v > 0 && <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white group-hover:block">{x.v.toLocaleString("ru-RU")}</span>}
                </div>
                <span className="text-[10px] font-semibold text-mute">{x.h}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <p className="mb-3 font-display font-extrabold">Top taomlar</p>
          {top.length === 0 ? (
            <p className="py-8 text-center text-sm text-mute">Bugun hali buyurtma yo'q</p>
          ) : (
            <ol className="space-y-3">
              {top.map(([id, x], i) => {
                const it = menu.items.find((m) => m.id === id);
                return (
                  <li key={id} className="flex items-center gap-3">
                    <span className="w-4 text-sm font-extrabold text-mute">{i + 1}</span>
                    {it && <img src={it.image} alt="" className="h-10 w-10 rounded-xl object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{x.name}</p>
                      <p className="text-xs text-mute">{x.qty} ta · {money(x.sum, cur)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="flex items-center gap-2 font-display font-extrabold"><TrendingUp size={18} className="text-brand" /> Oxirgi 7 kun</p>
            <span className="text-sm font-bold">{money(weekData.reduce((s, d) => s + d.sum, 0), cur)}</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {(weekData.length ? weekData : Array.from({ length: 7 }, (_, i) => ({ day: String(i), sum: 0, n: 0 }))).map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-1.5">
                <div className="flex h-28 w-full items-end">
                  <div className="w-full rounded-lg bg-ink/90" style={{ height: `${Math.max(5, (d.sum / maxW) * 100)}%` }} />
                </div>
                <span className="text-[11px] font-bold text-mute">{d.day.length > 5 ? uzDayShort(d.day) : "—"}</span>
                <span className="text-[10px] text-mute">{d.n} ta</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <p className="mb-3 font-display font-extrabold">Hozir faol</p>
          {active.length === 0 ? <p className="py-8 text-center text-sm text-mute">Faol buyurtma yo'q ✨</p> : (
            <div className="space-y-2">
              {active.slice(0, 6).map((o) => (
                <button key={o.id} onClick={() => go("orders")} className="flex w-full items-center justify-between rounded-xl bg-sand px-3 py-2.5 text-left">
                  <span className="font-bold">{o.table} <span className="text-mute">#{o.num}</span></span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${o.status === "new" ? "bg-brand text-white" : o.status === "cooking" ? "bg-amber-400 text-white" : "bg-ok text-white"}`}>{o.status === "new" ? "Yangi" : o.status === "cooking" ? "Pishmoqda" : "Tayyor"}</span>
                </button>
              ))}
            </div>
          )}
          {rated.length > 0 && <p className="mt-4 flex items-center gap-1 text-sm text-mute"><Star size={15} className="fill-amber-400 text-amber-400" /> {rated.length} ta baho, o'rtacha {rating.toFixed(1)}</p>}
        </Card>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub?: string; tone?: "brand" }) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ${tone === "brand" ? "bg-brand text-white ring-brand" : "bg-white ring-line"}`}>
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone === "brand" ? "bg-white/20" : "bg-brand-soft text-brand"}`}>{icon}</span>
      <p className={`mt-3 text-xs font-bold ${tone === "brand" ? "text-white/80" : "text-mute"}`}>{label}</p>
      <p className="mt-0.5 font-display text-xl font-extrabold leading-tight sm:text-2xl">{value}</p>
      {sub && <p className={`mt-0.5 text-xs ${tone === "brand" ? "text-white/80" : "text-mute"}`}>{sub}</p>}
    </div>
  );
}
