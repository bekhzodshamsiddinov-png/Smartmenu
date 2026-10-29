"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Download, ExternalLink, Plus, Printer, Trash2 } from "lucide-react";
import { useAdmin } from "./AdminApp";
import { Btn, PageHead, inputCls } from "./ui";
import type { Table } from "@/lib/types";

export default function Tables() {
  const { menu, saveMenu, toast, live } = useAdmin();
  const [origin, setOrigin] = useState("");
  const [qrs, setQrs] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  useEffect(() => setOrigin(location.origin), []);
  const url = (t: Table) => `${origin}/menu/${encodeURIComponent(t.id)}`;

  useEffect(() => {
    if (!origin) return;
    Promise.all(menu.tables.map(async (t) => [t.id, await QRCode.toDataURL(url(t), { margin: 1, width: 480, color: { dark: "#1F1A17", light: "#FFFFFF" }, errorCorrectionLevel: "M" })] as const)).then((x) => setQrs(Object.fromEntries(x)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, menu.tables]);

  const add = async () => {
    const nextNum = Math.max(0, ...menu.tables.map((t) => Number(t.id) || 0)) + 1;
    const t: Table = { id: String(nextNum), name: name.trim() || `Stol ${nextNum}`, zone: "Zal" };
    if (await saveMenu({ tables: [...menu.tables, t] })) { setName(""); toast(`${t.name} qo'shildi`); }
  };
  const remove = async (t: Table) => {
    if (!confirm(`${t.name} o'chirilsinmi? Uning QR kodi ishlamay qoladi.`)) return;
    await saveMenu({ tables: menu.tables.filter((x) => x.id !== t.id) });
  };
  const download = (t: Table) => {
    const a = document.createElement("a");
    a.href = qrs[t.id];
    a.download = `smartmenu-${t.name.replace(/\s+/g, "-")}.png`;
    a.click();
  };
  const printAll = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const S = menu.settings;
    w.document.write(`<html><head><title>QR kodlar — ${S.name}</title><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;800&display=swap" rel="stylesheet"><style>
      *{box-sizing:border-box}body{font-family:Manrope,sans-serif;margin:0;padding:10mm;display:grid;grid-template-columns:repeat(2,1fr);gap:8mm}
      .c{border:2px solid #1F1A17;border-radius:18px;padding:18px;text-align:center;page-break-inside:avoid}
      .b{font-weight:800;font-size:22px}.b span{color:#E8590C}.t{display:inline-block;background:#E8590C;color:#fff;border-radius:99px;padding:6px 16px;font-weight:800;font-size:18px;margin:8px 0}
      img{width:62mm;height:62mm}.h{font-size:14px;color:#555;margin-top:6px}
    </style></head><body>${menu.tables.map((t) => `<div class="c"><div class="b">${S.name}</div><div class="t">${t.name}</div><br/><img src="${qrs[t.id]}"/><div class="h">📱 Kamerani yo'naltiring — menyu ochiladi<br/>Наведите камеру — откроется меню</div><div class="h" style="font-size:11px;margin-top:10px">Smart<span style="color:#E8590C">Menu</span></div></div>`).join("")}<script>setTimeout(()=>print(),600)</script></body></html>`);
    w.document.close();
  };
  const busyTables = new Set(live.orders.filter((o) => ["new", "cooking", "ready", "served"].includes(o.status)).map((o) => o.table));

  return (
    <div>
      <PageHead title="Stollar va QR" sub={`${menu.tables.length} ta stol · har bir stolga alohida QR`} right={<Btn variant="dark" onClick={printAll}><Printer size={17} /> <span className="hidden sm:inline">Hammasini chop etish</span></Btn>} />

      <div className="mb-5 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Yangi stol nomi (masalan: VIP 1)" className={inputCls} />
        <Btn onClick={add} className="shrink-0"><Plus size={18} /> Qo'shish</Btn>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {menu.tables.map((t) => (
          <div key={t.id} className="rounded-2xl bg-white p-3 ring-1 ring-line">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-display font-extrabold">{t.name}</p>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${busyTables.has(t.name) ? "bg-brand text-white" : "bg-emerald-50 text-ok"}`}>{busyTables.has(t.name) ? "Band" : "Bo'sh"}</span>
            </div>
            <div className="aspect-square overflow-hidden rounded-xl bg-sand">{qrs[t.id] && <img src={qrs[t.id]} alt={`QR ${t.name}`} className="h-full w-full" />}</div>
            <div className="mt-2 grid grid-cols-4 gap-1">
              <IconBtn onClick={() => download(t)} label="Yuklab olish"><Download size={16} /></IconBtn>
              <IconBtn onClick={() => { navigator.clipboard?.writeText(url(t)); toast("Havola nusxalandi"); }} label="Nusxa"><Copy size={16} /></IconBtn>
              <a href={url(t)} target="_blank" className="grid h-9 place-items-center rounded-lg bg-sand" aria-label="open"><ExternalLink size={16} /></a>
              <IconBtn onClick={() => remove(t)} label="O'chirish" danger><Trash2 size={16} /></IconBtn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, label, danger }: { children: React.ReactNode; onClick: () => void; label: string; danger?: boolean }) {
  return <button onClick={onClick} title={label} aria-label={label} className={`grid h-9 place-items-center rounded-lg ${danger ? "bg-red-50 text-red-600" : "bg-sand"}`}>{children}</button>;
}
