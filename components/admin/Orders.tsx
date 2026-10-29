"use client";
import { useEffect, useState } from "react";
import { Bell, ClipboardList, Clock, MessageSquare, Printer, X } from "lucide-react";
import { useAdmin } from "./AdminApp";
import { Btn, Empty, PageHead } from "./ui";
import { ago, money } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

const COLS: { id: OrderStatus; label: string; dot: string }[] = [
  { id: "new", label: "Yangi", dot: "bg-brand" },
  { id: "cooking", label: "Tayyorlanmoqda", dot: "bg-amber-400" },
  { id: "ready", label: "Tayyor", dot: "bg-ok" },
  { id: "served", label: "Yetkazildi", dot: "bg-sky-500" },
];
const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string; variant: "primary" | "dark" | "ok" }>> = {
  new: { to: "cooking", label: "Qabul qilish", variant: "primary" },
  cooking: { to: "ready", label: "Tayyor", variant: "ok" },
  ready: { to: "served", label: "Yetkazildi", variant: "dark" },
  served: { to: "closed", label: "Yopish · to'landi", variant: "dark" },
};
const PAY: Record<string, string> = { cash: "💵 Naqd", card: "💳 Karta", click: "Click", payme: "Payme" };

export default function Orders() {
  const { live, setStatus, menu, closeCall } = useAdmin();
  const [tab, setTab] = useState<OrderStatus | "closed">("new");
  const [, tick] = useState(0);
  useEffect(() => { const i = setInterval(() => tick((x) => x + 1), 15000); return () => clearInterval(i); }, []);
  const cur = menu.settings.currency;
  const by = (s: OrderStatus) => live.orders.filter((o) => o.status === s).sort((a, b) => a.createdAt - b.createdAt);
  const closed = live.orders.filter((o) => o.status === "closed" || o.status === "cancelled").sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div>
      <PageHead title="Buyurtmalar" sub={`Bugun ${live.orders.length} ta buyurtma`} />

      {live.calls.length > 0 && (
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
          {live.calls.map((c) => (
            <div key={c.id} className="flex shrink-0 items-center gap-2 rounded-2xl bg-amber-50 py-2 pl-3 pr-2 ring-1 ring-amber-200">
              <Bell size={17} className="text-amber-500" />
              <span className="text-sm font-extrabold">{c.table}</span>
              <span className="text-sm text-mute">{c.type === "bill" ? "hisob" : "ofitsiant"} · {ago(c.createdAt)}</span>
              <button onClick={() => closeCall(c.id)} className="ml-1 grid h-7 w-7 place-items-center rounded-lg bg-white" aria-label="done"><X size={15} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Mobile segmented */}
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
        {[...COLS, { id: "closed" as const, label: "Yopilgan", dot: "bg-mute" }].map((c) => {
          const n = c.id === "closed" ? closed.length : by(c.id).length;
          return (
            <button key={c.id} onClick={() => setTab(c.id)} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold ${tab === c.id ? "bg-ink text-white" : "bg-white ring-1 ring-line"}`}>
              <span className={`h-2 w-2 rounded-full ${c.dot}`} /> {c.label}
              <span className={`rounded-full px-1.5 text-xs ${tab === c.id ? "bg-white/20" : "bg-sand"}`}>{n}</span>
            </button>
          );
        })}
      </div>
      <div className="space-y-3 lg:hidden">
        {(tab === "closed" ? closed : by(tab)).map((o) => <OrderCard key={o.id} o={o} cur={cur} onSet={setStatus} />)}
        {(tab === "closed" ? closed : by(tab)).length === 0 && <Empty icon={<ClipboardList />} title="Bu bo'limda buyurtma yo'q" text="Yangi buyurtmalar avtomatik paydo bo'ladi" />}
      </div>

      {/* Desktop kanban */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-4">
        {COLS.map((c) => (
          <div key={c.id} className="min-h-[60vh] rounded-3xl bg-sand/60 p-3">
            <p className="mb-3 flex items-center gap-2 px-1 font-extrabold"><span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} /> {c.label} <span className="ml-auto rounded-full bg-white px-2 text-sm">{by(c.id).length}</span></p>
            <div className="space-y-3">{by(c.id).map((o) => <OrderCard key={o.id} o={o} cur={cur} onSet={setStatus} />)}</div>
          </div>
        ))}
      </div>
      {closed.length > 0 && (
        <div className="mt-6 hidden lg:block">
          <p className="mb-2 font-extrabold text-mute">Yopilgan ({closed.length})</p>
          <div className="grid grid-cols-3 gap-3">{closed.slice(0, 12).map((o) => <OrderCard key={o.id} o={o} cur={cur} onSet={setStatus} compact />)}</div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ o, cur, onSet, compact }: { o: Order; cur: string; onSet: (id: string, s: OrderStatus) => void; compact?: boolean }) {
  const next = NEXT[o.status];
  const late = o.status === "new" && Date.now() - o.createdAt > 3 * 60000;
  const print = () => {
    const w = window.open("", "_blank", "width=380,height=600");
    if (!w) return;
    w.document.write(`<html><head><title>#${o.num}</title><style>body{font-family:monospace;padding:12px;width:280px}h2{margin:0}td{padding:2px 0}hr{border:0;border-top:1px dashed #000}</style></head><body><h2>${o.table} · #${o.num}</h2><p>${new Date(o.createdAt).toLocaleString("ru-RU")}</p><hr/><table width="100%">${o.lines.map((l) => `<tr><td>${l.qty}× ${l.name}${l.size ? " (" + l.size + ")" : ""}${l.addons?.length ? "<br/><small>+ " + l.addons.join(", ") + "</small>" : ""}${l.note ? "<br/><small>! " + l.note + "</small>" : ""}</td><td align="right">${(l.price * l.qty).toLocaleString("ru-RU")}</td></tr>`).join("")}</table><hr/><p>Xizmat: ${o.service.toLocaleString("ru-RU")}<br/><b>JAMI: ${o.total.toLocaleString("ru-RU")} so'm</b></p>${o.comment ? `<p>Izoh: ${o.comment}</p>` : ""}<script>print();</script></body></html>`);
    w.document.close();
  };
  return (
    <div className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ${late ? "ring-2 ring-brand" : "ring-line"} ${o.status === "cancelled" ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-extrabold leading-tight">{o.table}</p>
          <p className="flex items-center gap-1 text-xs font-semibold text-mute"><Clock size={12} /> #{o.num} · {ago(o.createdAt)} oldin</p>
        </div>
        <div className="text-right">
          <p className="font-extrabold">{money(o.total, cur)}</p>
          <p className="text-xs text-mute">{PAY[o.payment]}</p>
        </div>
      </div>
      {!compact && (
        <ul className="mt-3 space-y-1.5 border-t border-dashed border-line pt-3">
          {o.lines.map((l, i) => (
            <li key={i} className="text-sm">
              <span className="font-extrabold text-brand">{l.qty}×</span> <span className="font-semibold">{l.name}</span>{l.size && <span className="text-mute"> · {l.size}</span>}
              {!!l.addons?.length && <p className="pl-5 text-xs text-mute">+ {l.addons.join(", ")}</p>}
              {l.note && <p className="pl-5 text-xs font-semibold text-amber-600">! {l.note}</p>}
            </li>
          ))}
        </ul>
      )}
      {o.comment && !compact && <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-amber-50 p-2 text-xs font-semibold text-amber-700"><MessageSquare size={13} className="mt-0.5 shrink-0" /> {o.comment}</p>}
      {o.status === "cancelled" && <p className="mt-2 text-sm font-bold text-red-600">Bekor qilingan</p>}
      {o.rating && <p className="mt-2 text-xs text-mute">Baho: {"★".repeat(o.rating)}</p>}
      {!compact && (
        <div className="mt-3 flex gap-2">
          {next && <Btn variant={next.variant} className="flex-1" onClick={() => onSet(o.id, next.to)}>{next.label}</Btn>}
          <Btn variant="soft" onClick={print} className="w-11 px-0"><Printer size={17} /></Btn>
          {o.status === "new" && <Btn variant="danger" onClick={() => confirm("Buyurtmani bekor qilasizmi?") && onSet(o.id, "cancelled")} className="w-11 px-0"><X size={17} /></Btn>}
        </div>
      )}
    </div>
  );
}
