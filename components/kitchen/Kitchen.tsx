"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, ChefHat, Clock, Maximize, MessageSquare, Volume2, VolumeX } from "lucide-react";
import { Login, beep, patchStatus, useLive } from "@/components/admin/AdminApp";
import type { Order } from "@/lib/types";

const mins = (ts: number) => Math.floor((Date.now() - ts) / 60000);

export default function Kitchen() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [sound, setSound] = useState(true);
  const soundRef = useRef(true);
  soundRef.current = sound;
  const [, tick] = useState(0);
  useEffect(() => {
    fetch("/api/auth").then((r) => r.json()).then((d) => setAuthed(!!d.role));
    const i = setInterval(() => tick((x) => x + 1), 20000);
    return () => clearInterval(i);
  }, []);
  const { live, setLive, refresh } = useLive(!!authed, (o) => { if (o.length && soundRef.current) beep(4); });
  if (authed === null) return <div className="min-h-dvh bg-[#14110f]" />;
  if (!authed) return <Login kitchen onOk={() => setAuthed(true)} />;

  const set = async (o: Order, status: Order["status"]) => {
    setLive((l) => ({ ...l, orders: l.orders.map((x) => (x.id === o.id ? { ...x, status } : x)) }));
    await patchStatus(o.id, status);
    refresh();
  };
  const queue = live.orders.filter((o) => o.status === "new" || o.status === "cooking").sort((a, b) => a.createdAt - b.createdAt);
  const ready = live.orders.filter((o) => o.status === "ready").sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8);

  return (
    <div className="min-h-dvh bg-[#14110f] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand"><ChefHat size={20} /></span>
          <div>
            <p className="font-display text-lg font-extrabold">Oshxona ekrani</p>
            <p className="text-xs text-white/50">{queue.length} ta navbatda · {ready.length} ta tayyor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {live.calls.length > 0 && <span className="flex items-center gap-1.5 rounded-xl bg-amber-400/20 px-3 py-2 text-sm font-bold text-amber-300"><Bell size={16} /> {live.calls.length} chaqiruv</span>}
          <span className="hidden rounded-xl bg-white/5 px-3 py-2 font-display text-lg font-extrabold sm:block">{new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
          <button onClick={() => { setSound(!sound); if (!sound) beep(1); }} className="grid h-10 w-10 place-items-center rounded-xl bg-white/10" aria-label="sound">{sound ? <Volume2 size={19} /> : <VolumeX size={19} />}</button>
          <button onClick={() => document.documentElement.requestFullscreen?.()} className="grid h-10 w-10 place-items-center rounded-xl bg-white/10" aria-label="fullscreen"><Maximize size={19} /></button>
        </div>
      </header>

      {queue.length === 0 ? (
        <div className="grid h-[70vh] place-items-center text-center text-white/40">
          <div><ChefHat size={56} className="mx-auto mb-3" /><p className="font-display text-2xl font-extrabold">Navbat bo'sh</p><p>Yangi buyurtmalar shu yerda ovoz bilan paydo bo'ladi</p></div>
        </div>
      ) : (
        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {queue.map((o) => {
            const m = mins(o.createdAt);
            const tone = m >= 20 ? "bg-red-600" : m >= 10 ? "bg-amber-500" : o.status === "new" ? "bg-brand" : "bg-sky-600";
            return (
              <div key={o.id} className="flex flex-col overflow-hidden rounded-2xl bg-[#211c19] ring-1 ring-white/10">
                <div className={`flex items-center justify-between px-4 py-3 ${tone}`}>
                  <p className="font-display text-xl font-extrabold">{o.table}</p>
                  <p className="flex items-center gap-1 font-extrabold"><Clock size={16} /> {m} daq · #{o.num}</p>
                </div>
                <ul className="flex-1 space-y-2 p-4">
                  {o.lines.map((l, i) => (
                    <li key={i} className="text-lg leading-snug">
                      <span className="mr-2 inline-grid h-8 min-w-8 place-items-center rounded-lg bg-white/10 px-1.5 font-extrabold">{l.qty}</span>
                      <span className="font-bold">{l.name}</span>{l.size && <span className="text-white/60"> · {l.size}</span>}
                      {!!l.addons?.length && <p className="ml-10 text-sm text-white/60">+ {l.addons.join(", ")}</p>}
                      {l.note && <p className="ml-10 text-sm font-bold text-amber-300">⚠ {l.note}</p>}
                    </li>
                  ))}
                  {o.comment && <li className="flex gap-2 rounded-xl bg-amber-400/15 p-2 text-sm font-semibold text-amber-200"><MessageSquare size={16} className="mt-0.5 shrink-0" /> {o.comment}</li>}
                </ul>
                {o.status === "new" ? (
                  <button onClick={() => set(o, "cooking")} className="h-16 bg-white/10 text-lg font-extrabold transition hover:bg-white/20">▶ Pishirishni boshlash</button>
                ) : (
                  <button onClick={() => set(o, "ready")} className="h-16 bg-ok text-lg font-extrabold transition hover:bg-emerald-700">✓ Tayyor</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {ready.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 flex gap-2 overflow-x-auto border-t border-white/10 bg-[#1a1613] p-3">
          <span className="shrink-0 self-center px-2 text-sm font-bold text-white/50">Tayyor:</span>
          {ready.map((o) => (
            <button key={o.id} onClick={() => set(o, "cooking")} title="Qaytarish" className="shrink-0 rounded-xl bg-ok/20 px-4 py-2 font-extrabold text-emerald-300">{o.table} #{o.num}</button>
          ))}
        </div>
      )}
    </div>
  );
}
