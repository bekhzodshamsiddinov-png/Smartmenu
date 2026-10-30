"use client";
import { useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Box, ImagePlus, Layers, Minus, Pencil, Plus, Search, Trash2, UtensilsCrossed } from "lucide-react";
import { useAdmin } from "./AdminApp";
import { Btn, Empty, Field, Modal, PageHead, Toggle, inputCls } from "./ui";
import { money } from "@/lib/format";
import type { Addon, Category, Item, Size, T3 } from "@/lib/types";

const BADGES: { id: Item["badges"][number]; label: string }[] = [
  { id: "hit", label: "🔥 Hit" },
  { id: "new", label: "✨ Yangi" },
  { id: "spicy", label: "🌶 Achchiq" },
  { id: "veg", label: "🌿 Vegetarian" },
  { id: "chef", label: "👨‍🍳 Oshpaz tavsiyasi" },
  { id: "halal", label: "☪ Halol" },
  { id: "smoky", label: "🔥 Dudlangan" },
];
const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
const emptyT3 = (): T3 => ({ uz: "", ru: "", en: "" });

export default function MenuManager() {
  const { menu, saveMenu, toast } = useAdmin();
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Item | null>(null);
  const [catsOpen, setCatsOpen] = useState(false);
  const cats = [...menu.categories].sort((a, b) => a.sort - b.sort);
  const cur = menu.settings.currency;

  const list = useMemo(
    () =>
      menu.items
        .filter((i) => cat === "all" || i.categoryId === cat)
        .filter((i) => !q || i.name.uz.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => (cats.findIndex((c) => c.id === a.categoryId) - cats.findIndex((c) => c.id === b.categoryId)) || a.sort - b.sort),
    [menu, cat, q, cats]
  );

  const toggle = async (it: Item, v: boolean) => {
    const ok = await saveMenu({ items: menu.items.map((x) => (x.id === it.id ? { ...x, available: v } : x)) });
    if (ok) toast(v ? `${it.name.uz} — sotuvda` : `${it.name.uz} — tugadi deb belgilandi`);
  };
  const newItem = (): Item => ({
    id: uid("i"), categoryId: cat !== "all" ? cat : cats[0]?.id ?? "", name: emptyT3(), desc: emptyT3(), price: 0, image: "", badges: [], available: true, sort: menu.items.length + 1, addons: [], sizes: [],
  });

  const soldOut = menu.items.filter((i) => !i.available || i.stock === 0).length;

  return (
    <div>
      <PageHead
        title="Menyu"
        sub={`${menu.items.length} ta taom · ${cats.length} kategoriya${soldOut ? ` · ${soldOut} ta tugagan` : ""}`}
        right={
          <div className="flex gap-2">
            <Btn variant="soft" onClick={() => setCatsOpen(true)}><Layers size={17} /> <span className="hidden sm:inline">Kategoriyalar</span></Btn>
            <Btn onClick={() => setEdit(newItem())} className="hidden sm:inline-flex"><Plus size={18} /> Taom qo'shish</Btn>
          </div>
        }
      />

      <label className="mb-3 flex h-12 items-center gap-2 rounded-xl border border-line bg-white px-3.5">
        <Search size={18} className="text-mute" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Taom qidirish" className="h-full flex-1 bg-transparent outline-none" />
      </label>
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        <CatChip on={cat === "all"} onClick={() => setCat("all")}>Hammasi · {menu.items.length}</CatChip>
        {cats.map((c) => (
          <CatChip key={c.id} on={cat === c.id} onClick={() => setCat(c.id)} dim={!c.active}>{c.emoji} {c.name.uz} · {menu.items.filter((i) => i.categoryId === c.id).length}</CatChip>
        ))}
      </div>

      {list.length === 0 ? (
        <Empty icon={<UtensilsCrossed />} title="Taom topilmadi" text="Yangi taom qo'shing" />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((it) => (
            <div key={it.id} onClick={() => setEdit(it)} className={`flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-2.5 ring-1 ring-line transition hover:ring-brand/40 ${!it.available ? "bg-sand/60" : ""}`}>
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                {it.image ? <img src={it.image} alt="" className={`h-full w-full object-cover ${!it.available ? "grayscale" : ""}`} /> : <ImagePlus className="m-auto mt-5 text-mute" size={22} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{it.name.uz || "Nomsiz"}</p>
                <p className="text-sm font-extrabold text-brand">{money(it.price, cur)}</p>
                <p className={`text-xs font-bold ${it.available && it.stock !== 0 ? "text-ok" : "text-red-500"}`}>
                  {!it.available ? "Tugagan" : it.stock === 0 ? "Qoldiq 0 — tugagan" : typeof it.stock === "number" ? `Qoldiq: ${it.stock} ta` : "Sotuvda"}
                  {it.model3d && <span className="ml-1.5 text-brand">· 3D</span>}
                </p>
              </div>
              {typeof it.stock === "number" && (
                <div onClick={(e) => e.stopPropagation()} className="flex items-center rounded-lg bg-sand">
                  <button onClick={() => saveMenu({ items: menu.items.map((x) => (x.id === it.id ? { ...x, stock: Math.max(0, (x.stock ?? 0) - 1) } : x)) })} className="grid h-8 w-7 place-items-center" aria-label="minus"><Minus size={13} /></button>
                  <button onClick={() => saveMenu({ items: menu.items.map((x) => (x.id === it.id ? { ...x, stock: (x.stock ?? 0) + 1 } : x)) })} className="grid h-8 w-7 place-items-center" aria-label="plus"><Plus size={13} /></button>
                </div>
              )}
              <Toggle on={it.available} onChange={(v) => toggle(it, v)} label="Mavjud" />
              <span className="grid h-9 w-9 place-items-center rounded-lg text-mute"><Pencil size={16} /></span>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => setEdit(newItem())} className="fixed bottom-24 right-4 z-30 flex h-14 items-center gap-2 rounded-2xl bg-brand px-5 font-extrabold text-white shadow-xl shadow-brand/30 sm:hidden">
        <Plus size={20} /> Taom
      </button>

      {edit && <ItemEditor item={edit} onClose={() => setEdit(null)} />}
      {catsOpen && <CategoryEditor onClose={() => setCatsOpen(false)} />}
    </div>
  );
}

function CatChip({ on, onClick, children, dim }: { on: boolean; onClick: () => void; children: React.ReactNode; dim?: boolean }) {
  return <button onClick={onClick} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${on ? "bg-ink text-white" : "bg-white ring-1 ring-line"} ${dim ? "opacity-50" : ""}`}>{children}</button>;
}

export function ImageUpload({ value, onChange, aspect = "aspect-[4/3]" }: { value: string; onChange: (url: string) => void; aspect?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const up = async (f: File) => {
    setBusy(true); setErr("");
    const img = await downscale(f);
    const fd = new FormData();
    fd.append("file", img);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await r.json();
    setBusy(false);
    if (r.ok) onChange(d.url); else setErr(d.error || "Yuklanmadi");
  };
  return (
    <div>
      <button type="button" onClick={() => ref.current?.click()} className={`relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-line bg-white ${aspect}`}>
        {value ? <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" /> : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-mute"><ImagePlus size={30} /><span className="text-sm font-bold">Rasm yuklash</span></span>
        )}
        {value && <span className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold text-white">Almashtirish</span>}
        {busy && <span className="absolute inset-0 grid place-items-center bg-white/70"><span className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" /></span>}
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && up(e.target.files[0])} />
      {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
    </div>
  );
}

async function downscale(file: File, max = 1400): Promise<File> {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    if (k === 1 && file.size < 900_000) return file;
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), "image/jpeg", 0.85));
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

function LangTabs({ value, onChange, label, multiline }: { value: T3; onChange: (v: T3) => void; label: string; multiline?: boolean }) {
  const [l, setL] = useState<keyof T3>("uz");
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-bold text-mute">{label}</span>
        <div className="flex rounded-lg bg-sand p-0.5">
          {(["uz", "ru", "en"] as const).map((k) => (
            <button type="button" key={k} onClick={() => setL(k)} className={`rounded-md px-2.5 py-1 text-xs font-extrabold uppercase ${l === k ? "bg-white shadow-sm" : "text-mute"} ${!value[k] && k !== "uz" ? "italic" : ""}`}>{k}</button>
          ))}
        </div>
      </div>
      {multiline ? (
        <textarea value={value[l]} onChange={(e) => onChange({ ...value, [l]: e.target.value })} rows={3} placeholder={l === "uz" ? "" : `${value.uz} (${l.toUpperCase()})`} className={`${inputCls} h-auto resize-none py-3`} />
      ) : (
        <input value={value[l]} onChange={(e) => onChange({ ...value, [l]: e.target.value })} placeholder={l === "uz" ? "" : value.uz} className={inputCls} />
      )}
    </div>
  );
}

function ItemEditor({ item, onClose }: { item: Item; onClose: () => void }) {
  const { menu, saveMenu, toast } = useAdmin();
  const [it, setIt] = useState<Item>(structuredClone(item));
  const [busy, setBusy] = useState(false);
  const isNew = !menu.items.some((x) => x.id === item.id);
  const set = <K extends keyof Item>(k: K, v: Item[K]) => setIt((x) => ({ ...x, [k]: v }));

  const save = async () => {
    if (!it.name.uz.trim()) return toast("Taom nomini kiriting");
    if (!it.price) return toast("Narxni kiriting");
    setBusy(true);
    const items = isNew ? [...menu.items, it] : menu.items.map((x) => (x.id === it.id ? it : x));
    const ok = await saveMenu({ items });
    setBusy(false);
    if (ok) { toast(isNew ? "Taom qo'shildi ✓" : "Saqlandi ✓"); onClose(); }
  };
  const remove = async () => {
    if (!confirm(`"${it.name.uz}" o'chirilsinmi?`)) return;
    const ok = await saveMenu({ items: menu.items.filter((x) => x.id !== it.id) });
    if (ok) { toast("O'chirildi"); onClose(); }
  };

  return (
    <Modal open onClose={onClose} title={isNew ? "Yangi taom" : "Taomni tahrirlash"} wide
      footer={
        <div className="flex gap-2">
          {!isNew && <Btn variant="danger" onClick={remove} className="w-12 px-0"><Trash2 size={18} /></Btn>}
          <Btn variant="soft" onClick={onClose} className="flex-1">Bekor</Btn>
          <Btn onClick={save} disabled={busy} className="flex-[2]">{busy ? "Saqlanmoqda..." : "Saqlash"}</Btn>
        </div>
      }>
      <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
        <div className="space-y-3">
          <ImageUpload value={it.image} onChange={(u) => set("image", u)} />
          <div className="flex items-center justify-between rounded-xl bg-white p-3 ring-1 ring-line">
            <span className="font-bold">Sotuvda</span>
            <Toggle on={it.available} onChange={(v) => set("available", v)} />
          </div>
        </div>
        <div className="space-y-4">
          <LangTabs label="Nomi" value={it.name} onChange={(v) => set("name", v)} />
          <LangTabs label="Tavsif" value={it.desc} onChange={(v) => set("desc", v)} multiline />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Narx (so'm)"><input inputMode="numeric" value={it.price || ""} onChange={(e) => set("price", Number(e.target.value.replace(/\D/g, "")))} className={inputCls} /></Field>
            <Field label="Kategoriya">
              <select value={it.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls}>
                {menu.categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name.uz}</option>)}
              </select>
            </Field>
            <Field label="Og'irligi / hajmi"><input value={it.weight ?? ""} onChange={(e) => set("weight", e.target.value)} placeholder="350 g" className={inputCls} /></Field>
            <Field label="Tayyorlash (daq)"><input inputMode="numeric" value={it.time ?? ""} onChange={(e) => set("time", Number(e.target.value.replace(/\D/g, "")) || undefined)} className={inputCls} /></Field>
            <Field label="Necha kishilik"><input value={it.serves ?? ""} onChange={(e) => set("serves", e.target.value || undefined)} placeholder="1–2 kishi" className={inputCls} /></Field>
            <Field label="Qoldiq soni" hint="Bo'sh = cheksiz. 0 bo'lsa avtomatik «Tugagan»">
              <input inputMode="numeric" value={typeof it.stock === "number" ? it.stock : ""} onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); set("stock", v === "" ? null : Number(v)); }} placeholder="cheksiz" className={inputCls} />
            </Field>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-bold text-mute">Belgilar</p>
            <div className="flex flex-wrap gap-2">
              {BADGES.map((b) => {
                const on = it.badges.includes(b.id);
                return <button type="button" key={b.id} onClick={() => set("badges", on ? it.badges.filter((x) => x !== b.id) : [...it.badges, b.id])} className={`rounded-full px-3 py-2 text-sm font-bold ring-1 ${on ? "bg-ink text-white ring-ink" : "bg-white ring-line"}`}>{b.label}</button>;
              })}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-3 ring-1 ring-line">
            <p className="font-bold">⚡ Aqlli taklif</p>
            <p className="mb-2 text-xs text-mute">Mijoz savatida shu taom bo'lsa, tanlangan taom sababi bilan taklif qilinadi</p>
            <select value={it.suggest?.itemId ?? ""} onChange={(e) => set("suggest", e.target.value ? { itemId: e.target.value, reason: it.suggest?.reason ?? emptyT3() } : undefined)} className={`${inputCls} h-11`}>
              <option value="">— Taklif yo'q —</option>
              {menu.items.filter((x) => x.id !== it.id).map((x) => <option key={x.id} value={x.id}>{x.name.uz}</option>)}
            </select>
            {it.suggest && (
              <input value={it.suggest.reason.uz} onChange={(e) => set("suggest", { ...it.suggest!, reason: { uz: e.target.value, ru: it.suggest!.reason.ru || e.target.value, en: it.suggest!.reason.en || e.target.value } })} placeholder="Sababi: masalan, «Oshga eng zo'r juftlik»" className={`${inputCls} mt-2 h-11`} />
            )}
          </div>
          <ModelField value={it.model3d ?? ""} onChange={(v) => set("model3d", v || undefined)} />
          <OptionList title="Hajm variantlari" hint="Masalan: 0.5 / 1 porsiya — asosiy narxga qo'shiladi" rows={it.sizes ?? []} onChange={(v) => set("sizes", v as Size[])} prefix="s" />
          <OptionList title="Qo'shimchalar (upsell)" hint="Mijozga taom oynasida taklif qilinadi — o'rtacha chekni oshiradi" rows={it.addons ?? []} onChange={(v) => set("addons", v as Addon[])} prefix="a" />
        </div>
      </div>
    </Modal>
  );
}

function OptionList({ title, hint, rows, onChange, prefix }: { title: string; hint: string; rows: { id: string; name: T3; price: number }[]; onChange: (v: { id: string; name: T3; price: number }[]) => void; prefix: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-line">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="font-bold">{title}</p>
          <p className="text-xs text-mute">{hint}</p>
        </div>
        <Btn size="sm" variant="soft" onClick={() => onChange([...rows, { id: uid(prefix), name: emptyT3(), price: 0 }])}><Plus size={15} /> Qo'shish</Btn>
      </div>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={r.id} className="flex gap-2">
            <input value={r.name.uz} onChange={(e) => onChange(rows.map((x, j) => (j === i ? { ...x, name: { uz: e.target.value, ru: x.name.ru || e.target.value, en: x.name.en || e.target.value } } : x)))} placeholder="Nomi" className={`${inputCls} h-10 flex-1`} />
            <input inputMode="numeric" value={r.price || ""} onChange={(e) => onChange(rows.map((x, j) => (j === i ? { ...x, price: Number(e.target.value.replace(/\D/g, "")) } : x)))} placeholder="+ narx" className={`${inputCls} h-10 w-28`} />
            <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600" aria-label="remove"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryEditor({ onClose }: { onClose: () => void }) {
  const { menu, saveMenu, toast } = useAdmin();
  const [cats, setCats] = useState<Category[]>(structuredClone([...menu.categories].sort((a, b) => a.sort - b.sort)));
  const [busy, setBusy] = useState(false);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= cats.length) return;
    const c = [...cats];
    [c[i], c[j]] = [c[j], c[i]];
    setCats(c);
  };
  const upd = (i: number, p: Partial<Category>) => setCats((c) => c.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const save = async () => {
    setBusy(true);
    const ok = await saveMenu({ categories: cats.map((c, i) => ({ ...c, sort: i + 1 })) });
    setBusy(false);
    if (ok) { toast("Kategoriyalar saqlandi ✓"); onClose(); }
  };
  return (
    <Modal open onClose={onClose} title="Kategoriyalar" footer={<Btn onClick={save} disabled={busy} className="w-full">{busy ? "Saqlanmoqda..." : "Saqlash"}</Btn>}>
      <div className="space-y-2">
        {cats.map((c, i) => {
          const n = menu.items.filter((x) => x.categoryId === c.id).length;
          return (
            <div key={c.id} className="flex items-center gap-2 rounded-2xl bg-white p-2 ring-1 ring-line">
              <div className="flex flex-col">
                <button onClick={() => move(i, -1)} className="grid h-6 w-7 place-items-center text-mute" aria-label="up"><ArrowUp size={15} /></button>
                <button onClick={() => move(i, 1)} className="grid h-6 w-7 place-items-center text-mute" aria-label="down"><ArrowDown size={15} /></button>
              </div>
              <input value={c.emoji} onChange={(e) => upd(i, { emoji: e.target.value })} className={`${inputCls} h-10 w-12 px-0 text-center text-lg`} />
              <input value={c.name.uz} onChange={(e) => upd(i, { name: { ...c.name, uz: e.target.value } })} className={`${inputCls} h-10 flex-1`} />
              <Toggle on={c.active} onChange={(v) => upd(i, { active: v })} />
              <button disabled={n > 0} title={n > 0 ? "Avval taomlarni boshqa kategoriyaga o'tkazing" : ""} onClick={() => setCats(cats.filter((_, j) => j !== i))} className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600 disabled:opacity-30" aria-label="delete"><Trash2 size={16} /></button>
            </div>
          );
        })}
      </div>
      <Btn variant="soft" className="mt-3 w-full" onClick={() => setCats([...cats, { id: uid("c"), name: { uz: "Yangi kategoriya", ru: "", en: "" }, emoji: "🍽", sort: cats.length + 1, active: true }])}><Plus size={17} /> Kategoriya qo'shish</Btn>
      <p className="mt-3 text-xs text-mute">RU/EN nomlari bo'sh qolsa, o'zbekcha nom ko'rsatiladi.</p>
    </Modal>
  );
}

function ModelField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const up = async (f: File) => {
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("file", f);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await r.json();
    setBusy(false);
    if (r.ok) onChange(d.url); else setErr(d.error || "Yuklanmadi");
  };
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-line">
      <p className="flex items-center gap-1.5 font-bold"><Box size={16} className="text-brand" /> 3D / AR model</p>
      <p className="mb-2 text-xs text-mute">Taomning .glb modeli bo'lsa, mijoz uni stolida AR'da ko'radi (4MB gacha yoki havola)</p>
      <div className="flex gap-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://…/osh.glb" className={`${inputCls} h-11 flex-1`} />
        <Btn size="sm" variant="soft" className="h-11" onClick={() => ref.current?.click()} disabled={busy}>{busy ? "..." : "Yuklash"}</Btn>
      </div>
      <input ref={ref} type="file" accept=".glb,.gltf,model/gltf-binary" hidden onChange={(e) => e.target.files?.[0] && up(e.target.files[0])} />
      {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
    </div>
  );
}
