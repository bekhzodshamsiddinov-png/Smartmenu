"use client";
import { useState } from "react";
import { ChefHat, ExternalLink, LogOut, Save } from "lucide-react";
import { useAdmin } from "./AdminApp";
import { ImageUpload } from "./MenuManager";
import { Btn, Card, Field, PageHead, Toggle, inputCls } from "./ui";
import type { Settings } from "@/lib/types";

export default function SettingsPage() {
  const { menu, saveMenu, toast } = useAdmin();
  const [s, setS] = useState<Settings>(structuredClone(menu.settings));
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((x) => ({ ...x, [k]: v }));
  const dirty = JSON.stringify(s) !== JSON.stringify(menu.settings);
  const save = async () => {
    setBusy(true);
    if (await saveMenu({ settings: s })) toast("Sozlamalar saqlandi ✓");
    setBusy(false);
  };

  return (
    <div className="pb-16">
      <PageHead title="Sozlamalar" sub="Restoran ma'lumotlari va buyurtma qoidalari" right={<Btn onClick={save} disabled={!dirty || busy} className="hidden sm:inline-flex"><Save size={17} /> Saqlash</Btn>} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <p className="font-display font-extrabold">Restoran</p>
          <Field label="Muqova rasmi"><ImageUpload value={s.cover} onChange={(u) => set("cover", u)} aspect="aspect-[16/7]" /></Field>
          <div className="grid grid-cols-[84px_1fr] gap-3">
            <Field label="Logo"><input value={s.logo.startsWith("http") || s.logo.startsWith("/") ? "🖼" : s.logo} onChange={(e) => set("logo", e.target.value)} className={`${inputCls} text-center text-2xl`} /></Field>
            <Field label="Nomi"><input value={s.name} onChange={(e) => set("name", e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="Shior (UZ)"><input value={s.tagline.uz} onChange={(e) => set("tagline", { ...s.tagline, uz: e.target.value })} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Shior (RU)"><input value={s.tagline.ru} onChange={(e) => set("tagline", { ...s.tagline, ru: e.target.value })} className={inputCls} /></Field>
            <Field label="Shior (EN)"><input value={s.tagline.en} onChange={(e) => set("tagline", { ...s.tagline, en: e.target.value })} className={inputCls} /></Field>
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <p className="font-display font-extrabold">Aloqa</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Telefon"><input value={s.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} /></Field>
            <Field label="Ish vaqti"><input value={s.hours} onChange={(e) => set("hours", e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="Manzil"><input value={s.address} onChange={(e) => set("address", e.target.value)} className={inputCls} /></Field>
          <Field label="Wi-Fi (nomi · parol)"><input value={s.wifi ?? ""} onChange={(e) => set("wifi", e.target.value)} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Instagram"><input value={s.instagram ?? ""} onChange={(e) => set("instagram", e.target.value)} placeholder="username" className={inputCls} /></Field>
            <Field label="Telegram"><input value={s.telegram ?? ""} onChange={(e) => set("telegram", e.target.value)} placeholder="username" className={inputCls} /></Field>
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <p className="font-display font-extrabold">Buyurtma va to'lov</p>
          <Row title="Onlayn buyurtma" text="O'chirilsa, menyu faqat ko'rish rejimida ishlaydi"><Toggle on={s.ordering} onChange={(v) => set("ordering", v)} /></Row>
          <Field label="Xizmat haqi (%)"><input inputMode="numeric" value={s.serviceFee} onChange={(e) => set("serviceFee", Math.min(30, Number(e.target.value.replace(/\D/g, "")) || 0))} className={inputCls} /></Field>
          <p className="text-sm font-bold text-mute">To'lov usullari</p>
          {(["cash", "card", "click", "payme"] as const).map((p) => (
            <Row key={p} title={{ cash: "💵 Naqd pul", card: "💳 Bank kartasi (terminal)", click: "🔵 Click", payme: "🟢 Payme" }[p]}>
              <Toggle on={s.payments[p]} onChange={(v) => set("payments", { ...s.payments, [p]: v })} />
            </Row>
          ))}
        </Card>

        <Card className="space-y-3 p-5">
          <p className="font-display font-extrabold">Kirish va ekranlar</p>
          <p className="text-sm text-mute">Admin paroli va oshxona PIN kodi Vercel'dagi <code className="rounded bg-sand px-1">ADMIN_PASSWORD</code> va <code className="rounded bg-sand px-1">KITCHEN_PIN</code> muhit o'zgaruvchilarida saqlanadi.</p>
          <a href="/kitchen" target="_blank"><Btn variant="dark" className="w-full"><ChefHat size={18} /> Oshxona ekranini ochish</Btn></a>
          <a href="/menu/1" target="_blank"><Btn variant="soft" className="w-full"><ExternalLink size={18} /> Mijoz menyusini ko'rish</Btn></a>
          <Btn variant="danger" className="w-full" onClick={async () => { await fetch("/api/auth", { method: "DELETE" }); location.reload(); }}><LogOut size={18} /> Chiqish</Btn>
        </Card>
      </div>

      {dirty && (
        <div className="fixed inset-x-0 bottom-[68px] z-30 px-4 sm:hidden">
          <Btn size="lg" onClick={save} disabled={busy} className="w-full shadow-xl"><Save size={18} /> {busy ? "Saqlanmoqda..." : "O'zgarishlarni saqlash"}</Btn>
        </div>
      )}
    </div>
  );
}

function Row({ title, text, children }: { title: string; text?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-cream p-3">
      <div>
        <p className="font-bold">{title}</p>
        {text && <p className="text-xs text-mute">{text}</p>}
      </div>
      {children}
    </div>
  );
}
