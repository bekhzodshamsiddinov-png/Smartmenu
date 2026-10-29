"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { BarChart3, Bell, ChefHat, ClipboardList, ExternalLink, LayoutGrid, Lock, LogOut, QrCode, Receipt, Settings as Cog, UtensilsCrossed, Volume2, VolumeX, X } from "lucide-react";
import type { Call, MenuData, Order } from "@/lib/types";
import Dashboard from "./Dashboard";
import Orders from "./Orders";
import MenuManager from "./MenuManager";
import Tables from "./Tables";
import SettingsPage from "./Settings";
import { Btn, inputCls } from "./ui";

type Live = { orders: Order[]; calls: Call[] };
type Ctx = {
  menu: MenuData;
  setMenu: (m: MenuData) => void;
  saveMenu: (patch: Partial<MenuData>) => Promise<boolean>;
  live: Live;
  refresh: () => Promise<void>;
  setStatus: (id: string, status: Order["status"]) => Promise<void>;
  closeCall: (id: string) => Promise<void>;
  toast: (m: string) => void;
  go: (tab: Tab) => void;
};
const AdminCtx = createContext<Ctx | null>(null);
export const useAdmin = () => useContext(AdminCtx)!;

export type Tab = "today" | "orders" | "menu" | "tables" | "settings";
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "today", label: "Bugun", icon: BarChart3 },
  { id: "orders", label: "Buyurtmalar", icon: ClipboardList },
  { id: "menu", label: "Menyu", icon: UtensilsCrossed },
  { id: "tables", label: "Stollar", icon: QrCode },
  { id: "settings", label: "Sozlamalar", icon: Cog },
];

export function beep(times = 2) {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    for (let i = 0; i < times; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = i % 2 ? 1046 : 784;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.22);
      g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + i * 0.22 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.22 + 0.2);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.22);
      o.stop(ctx.currentTime + i * 0.22 + 0.22);
    }
  } catch {}
}

export function useLive(enabled: boolean, onNew?: (o: Order[], c: Call[]) => void) {
  const [live, setLive] = useState<Live>({ orders: [], calls: [] });
  const [role, setRole] = useState<string | null>(null);
  const seen = useRef<{ o: Set<string>; c: Set<string> } | null>(null);
  const onNewRef = useRef(onNew);
  onNewRef.current = onNew;
  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/live", { cache: "no-store" });
      if (r.status === 401) { setRole(null); return; }
      if (!r.ok) return;
      const d = (await r.json()) as Live & { role: string };
      setRole(d.role);
      if (seen.current) {
        const newO = d.orders.filter((o) => !seen.current!.o.has(o.id));
        const newC = d.calls.filter((c) => !seen.current!.c.has(c.id));
        if (newO.length || newC.length) onNewRef.current?.(newO, newC);
      }
      seen.current = { o: new Set(d.orders.map((o) => o.id)), c: new Set(d.calls.map((c) => c.id)) };
      setLive({ orders: d.orders, calls: d.calls });
    } catch {}
  }, []);
  useEffect(() => {
    if (!enabled) return;
    refresh();
    const iv = setInterval(() => { if (document.visibilityState === "visible") refresh(); }, 4000);
    const vis = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", vis); };
  }, [enabled, refresh]);
  return { live, setLive, refresh, role };
}

export async function patchStatus(id: string, status: Order["status"]) {
  await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
}

export function Login({ onOk, kitchen }: { onOk: (role: string) => void; kitchen?: boolean }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    const d = await r.json();
    setBusy(false);
    if (r.ok) onOk(d.role);
    else setErr(d.error || "Xatolik");
  };
  return (
    <div className={`grid min-h-dvh place-items-center p-5 ${kitchen ? "bg-[#14110f]" : "bg-cream"}`}>
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-xl ring-1 ring-line">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-white"><Lock size={22} /></span>
          <div>
            <p className="font-display text-xl font-extrabold">Smart<span className="text-brand">Menu</span> {kitchen ? "Oshxona" : "Admin"}</p>
            <p className="text-sm text-mute">{kitchen ? "Oshxona PIN yoki admin paroli" : "Boshqaruv paneliga kirish"}</p>
          </div>
        </div>
        <input autoFocus type="password" inputMode={kitchen ? "numeric" : undefined} value={pw} onChange={(e) => setPw(e.target.value)} placeholder={kitchen ? "PIN" : "Parol"} className={inputCls} />
        {err && <p className="mt-2 text-sm font-semibold text-red-600">{err}</p>}
        <Btn type="submit" size="lg" disabled={busy || !pw} className="mt-4 w-full">{busy ? "Tekshirilmoqda..." : "Kirish"}</Btn>
        {process.env.NEXT_PUBLIC_DEMO === "1" && <p className="mt-4 text-center text-xs text-mute">Demo: parol <b>admin123</b> · oshxona PIN <b>1234</b></p>}
      </form>
    </div>
  );
}

export default function AdminApp({ initialMenu }: { initialMenu: MenuData }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("today");
  const [menu, setMenu] = useState(initialMenu);
  const [toastMsg, setToastMsg] = useState<{ id: number; m: string } | null>(null);
  const [alert, setAlert] = useState<{ orders: Order[]; calls: Call[] } | null>(null);
  const [sound, setSound] = useState(true);
  const soundRef = useRef(sound);
  soundRef.current = sound;

  useEffect(() => {
    fetch("/api/auth").then((r) => r.json()).then((d) => setAuthed(d.role === "admin"));
    const t = new URLSearchParams(location.search).get("tab") as Tab | null;
    if (t && TABS.some((x) => x.id === t)) setTab(t);
    try { setSound(localStorage.getItem("sm_sound") !== "0"); } catch {}
  }, []);

  const { live, setLive, refresh } = useLive(!!authed, (o, c) => {
    if (soundRef.current) beep(o.length ? 3 : 2);
    setAlert({ orders: o, calls: c });
    if ("Notification" in window && Notification.permission === "granted" && document.visibilityState !== "visible") {
      new Notification(o.length ? `Yangi buyurtma · ${o[0].table}` : `${c[0].table} · ${c[0].type === "bill" ? "Hisob so'radi" : "Ofitsiant chaqirdi"}`);
    }
  });

  const go = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", `/admin?tab=${t}`);
    window.scrollTo({ top: 0 });
  };
  const toast = (m: string) => setToastMsg({ id: Date.now(), m });

  const saveMenu = async (patch: Partial<MenuData>) => {
    const prev = menu;
    setMenu({ ...menu, ...patch, settings: { ...menu.settings, ...(patch.settings ?? {}) } });
    const r = await fetch("/api/menu", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    if (r.ok) {
      setMenu(await r.json());
      return true;
    }
    setMenu(prev);
    toast("Saqlanmadi — qayta urinib ko'ring");
    return false;
  };

  const setStatus = async (id: string, status: Order["status"]) => {
    setLive((l) => ({ ...l, orders: l.orders.map((o) => (o.id === id ? { ...o, status, updatedAt: Date.now() } : o)) }));
    await patchStatus(id, status);
    refresh();
  };
  const closeCall = async (id: string) => {
    setLive((l) => ({ ...l, calls: l.calls.filter((c) => c.id !== id) }));
    await fetch("/api/calls", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  };

  if (authed === null) return <div className="grid min-h-dvh place-items-center bg-cream"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" /></div>;
  if (!authed) return <Login onOk={(r) => (r === "admin" ? setAuthed(true) : (location.href = "/kitchen"))} />;

  const newCount = live.orders.filter((o) => o.status === "new").length;

  return (
    <AdminCtx.Provider value={{ menu, setMenu, saveMenu, live, refresh, setStatus, closeCall, toast, go }}>
      <div className="min-h-dvh bg-cream lg:flex">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-white p-4 lg:flex">
          <Brand name={menu.settings.name} />
          <nav className="mt-6 space-y-1">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => go(t.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-bold transition ${tab === t.id ? "bg-brand-soft text-brand" : "text-ink hover:bg-sand"}`}>
                <t.icon size={19} /> {t.label}
                {t.id === "orders" && newCount > 0 && <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-xs text-white">{newCount}</span>}
              </button>
            ))}
          </nav>
          <div className="mt-auto space-y-1">
            <a href="/kitchen" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold hover:bg-sand"><ChefHat size={19} /> Oshxona ekrani</a>
            <a href="/menu/1" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold hover:bg-sand"><ExternalLink size={19} /> Mijoz menyusi</a>
            <button onClick={async () => { await fetch("/api/auth", { method: "DELETE" }); location.reload(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-bold text-red-600 hover:bg-red-50"><LogOut size={19} /> Chiqish</button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white/90 px-4 py-3 backdrop-blur-md lg:px-8">
            <div className="lg:hidden"><Brand name={menu.settings.name} small /></div>
            <div className="hidden items-center gap-2 text-sm font-semibold text-mute lg:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-ok" /> Jonli rejim · har 4 soniyada yangilanadi
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { const v = !sound; setSound(v); try { localStorage.setItem("sm_sound", v ? "1" : "0"); } catch {} ; if (v) beep(1); if ("Notification" in window && Notification.permission === "default") Notification.requestPermission(); }} className="grid h-10 w-10 place-items-center rounded-xl bg-sand" aria-label="sound">
                {sound ? <Volume2 size={19} /> : <VolumeX size={19} className="text-mute" />}
              </button>
              <button onClick={() => go("orders")} className="relative grid h-10 w-10 place-items-center rounded-xl bg-sand" aria-label="alerts">
                <Bell size={19} />
                {(newCount + live.calls.length) > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-extrabold text-white">{newCount + live.calls.length}</span>}
              </button>
              <a href="/kitchen" target="_blank" className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white lg:hidden" aria-label="kitchen"><ChefHat size={19} /></a>
            </div>
          </header>

          {alert && (alert.orders.length > 0 || alert.calls.length > 0) && (
            <div className="anim-fade sticky top-[65px] z-20 mx-4 mt-3 flex items-center gap-3 rounded-2xl bg-ink p-3 pl-4 text-white shadow-xl lg:mx-8">
              <span className="pulse-ring grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand">{alert.orders.length ? <Receipt size={20} /> : <Bell size={20} />}</span>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold">{alert.orders.length ? `Yangi buyurtma: ${alert.orders.map((o) => `${o.table} (#${o.num})`).join(", ")}` : `${alert.calls[0].table} — ${alert.calls[0].type === "bill" ? "hisob so'radi" : "ofitsiant chaqirdi"}`}</p>
                <p className="text-sm text-white/70">{alert.orders.length ? `${alert.orders.reduce((s, o) => s + o.total, 0).toLocaleString("ru-RU")} so'm` : "Iltimos, stolga boring"}</p>
              </div>
              <Btn size="sm" onClick={() => { go("orders"); setAlert(null); }}>Ko'rish</Btn>
              <button onClick={() => setAlert(null)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10" aria-label="close"><X size={18} /></button>
            </div>
          )}

          <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 lg:px-8 lg:pb-10">
            {tab === "today" && <Dashboard />}
            {tab === "orders" && <Orders />}
            {tab === "menu" && <MenuManager />}
            {tab === "tables" && <Tables />}
            {tab === "settings" && <SettingsPage />}
          </main>
        </div>

        {/* Bottom tabs (mobile) */}
        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-white/95 backdrop-blur-md safe-b lg:hidden">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => go(t.id)} className={`relative flex flex-col items-center gap-0.5 pt-2.5 text-[11px] font-bold ${tab === t.id ? "text-brand" : "text-mute"}`}>
              <t.icon size={22} strokeWidth={tab === t.id ? 2.5 : 2} />
              {t.label}
              {t.id === "orders" && newCount > 0 && <span className="absolute right-[22%] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] text-white">{newCount}</span>}
            </button>
          ))}
        </nav>

        {toastMsg && (
          <div key={toastMsg.id} onAnimationEnd={() => setToastMsg(null)} className="anim-toast fixed bottom-24 left-1/2 z-[80] whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-xl lg:bottom-8">
            {toastMsg.m}
          </div>
        )}
      </div>
    </AdminCtx.Provider>
  );
}

function Brand({ name, small }: { name: string; small?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`grid place-items-center rounded-xl bg-brand text-white ${small ? "h-9 w-9" : "h-10 w-10"}`}><LayoutGrid size={small ? 18 : 20} /></span>
      <div className="leading-tight">
        <p className="font-display font-extrabold">Smart<span className="text-brand">Menu</span></p>
        <p className="text-xs font-semibold text-mute">{name}</p>
      </div>
    </div>
  );
}
