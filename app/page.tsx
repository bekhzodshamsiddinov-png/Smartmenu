import Link from "next/link";
import { BarChart3, Bell, ChefHat, Clock, Globe, QrCode, ShieldCheck, Smartphone, Sparkles, TrendingUp, Zap, Check, ArrowRight, Printer, Star } from "lucide-react";
import DemoQR from "@/components/DemoQR";


const features = [
  { icon: QrCode, t: "Har stolga QR", d: "Mijoz kamerani yo'naltiradi — menyu 1 soniyada ochiladi. Ilova yuklash va ro'yxatdan o'tish shart emas." },
  { icon: Zap, t: "Buyurtma oshxonaga darhol", d: "Buyurtma stol raqami bilan oshxona ekraniga ovozli signal bilan tushadi. Ofitsiant kutish yo'q." },
  { icon: Sparkles, t: "Aqlli qo'shimcha sotuv", d: "Har bir taomda non, sous, ichimlik takliflari. O'rtacha chek 15–30% gacha oshadi." },
  { icon: Bell, t: "Ofitsiant va hisob chaqirish", d: "Bir tugma — ofitsiant telefonida va admin panelda signal. Xizmat tezligi ikki barobar." },
  { icon: Globe, t: "3 tilda menyu", d: "O'zbek, rus va ingliz tillari. Sayyohlar va mehmonlar uchun qulay." },
  { icon: BarChart3, t: "Jonli statistika", d: "Bugungi tushum, o'rtacha chek, top taomlar va soatlar kesimida savdo — telefoningizda." },
  { icon: Clock, t: "Tugagan taomni 1 tugmada o'chirish", d: "Stop-list bir soniyada yangilanadi — mijoz tugagan taomni buyurtma qila olmaydi." },
  { icon: Printer, t: "Chek va QR chop etish", d: "Har bir buyurtma uchun oshxona cheki, stollar uchun tayyor QR kartochkalar." },
];

const plans = [
  { name: "Start", price: "199 000", for: "Kichik kafe va choyxonalar", items: ["QR menyu (3 til)", "15 tagacha stol", "Cheksiz taom va rasm", "Stop-list boshqaruvi", "Ofitsiant chaqirish"] },
  { name: "Biznes", price: "349 000", for: "Restoranlar uchun eng mashhur", hot: true, items: ["Start'dagi hammasi", "Onlayn buyurtma + oshxona ekrani", "Qo'shimcha sotuv (upsell)", "Jonli statistika", "50 tagacha stol", "Chek chop etish"] },
  { name: "Premium", price: "590 000", for: "Tarmoqlar va katta zallar", items: ["Biznes'dagi hammasi", "Cheksiz stol va filiallar", "Click / Payme integratsiyasi", "Telegram bildirishnomalar", "Shaxsiy dizayn va domen", "Shaxsiy menejer"] },
];

export default function Home() {
  return (
    <div className="bg-cream text-ink">
      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b border-line/70 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white"><QrCode size={18} /></span>
            <span className="font-display text-lg font-extrabold">Smart<span className="text-brand">Menu</span></span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-bold text-mute md:flex">
            <a href="#features" className="hover:text-ink">Imkoniyatlar</a>
            <a href="#how" className="hover:text-ink">Qanday ishlaydi</a>
            <a href="#pricing" className="hover:text-ink">Narxlar</a>
            <a href="#faq" className="hover:text-ink">Savollar</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="hidden h-10 items-center rounded-xl px-4 text-sm font-bold hover:bg-sand sm:inline-flex">Kirish</Link>
            <Link href="/menu/1" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-bold text-white">Demo <ArrowRight size={15} /></Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand/15 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 md:grid-cols-[1.1fr_0.9fr] md:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-brand ring-1 ring-line"><Sparkles size={14} /> Restoran va kafelar uchun №1 QR menyu</span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Mijoz skanerlaydi.<br />Buyurtma <span className="text-brand">oshxonaga</span> tushadi.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-mute">
              SmartMenu — qog'oz menyu o'rniga chiroyli raqamli menyu, stoldan to'g'ridan-to'g'ri buyurtma, ofitsiant chaqirish va jonli statistika. Ilova kerak emas, 1 kunda ishga tushadi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/menu/1" className="inline-flex h-14 items-center gap-2 rounded-2xl bg-brand px-6 text-base font-extrabold text-white shadow-xl shadow-brand/30 hover:bg-brand-dark"><Smartphone size={20} /> Mijoz menyusini sinab ko'ring</Link>
              <Link href="/admin" className="inline-flex h-14 items-center gap-2 rounded-2xl bg-white px-6 text-base font-extrabold ring-1 ring-line hover:bg-sand"><BarChart3 size={20} /> Admin panel</Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm font-bold text-mute">
              <span className="flex items-center gap-1.5"><Check size={17} className="text-ok" /> Ilova yuklash shart emas</span>
              <span className="flex items-center gap-1.5"><Check size={17} className="text-ok" /> 3 til</span>
              <span className="flex items-center gap-1.5"><Check size={17} className="text-ok" /> 14 kun bepul</span>
            </div>
          </div>

          {/* Phone mock */}
          <div className="relative mx-auto w-full max-w-[330px]">
            <div className="relative rounded-[46px] bg-ink p-3 shadow-2xl shadow-black/30">
              <div className="overflow-hidden rounded-[36px] bg-cream">
                <div className="relative h-40">
                  <img src={"/food/cover.jpg"} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end gap-2 text-white">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-2xl">🌿</span>
                    <div className="flex-1"><p className="font-display font-extrabold">Rayhon</p><p className="text-xs text-white/80">Milliy taomlar</p></div>
                    <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-extrabold">Stol 7</span>
                  </div>
                </div>
                <div className="flex gap-1.5 px-3 py-3 text-[11px] font-bold">
                  <span className="rounded-full bg-ink px-3 py-1.5 text-white">🍛 Milliy</span>
                  <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-line">🍢 Kabob</span>
                  <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-line">🥗 Salat</span>
                </div>
                {[["/food/osh.jpg", "To'y oshi", "45 000"], ["/food/lagmon.jpg", "Qo'l lag'mon", "38 000"], ["/food/shashlik.jpg", "Qo'y kabob", "22 000"]].map(([img, n, p]) => (
                  <div key={n} className="mx-3 mb-2 flex gap-2 rounded-2xl bg-white p-2 ring-1 ring-line">
                    <div className="flex-1 py-1 pl-1"><p className="text-[13px] font-extrabold">{n}</p><p className="mt-0.5 text-[10px] text-mute">Qozonda, an'anaviy usulda</p><p className="mt-1.5 text-[13px] font-extrabold">{p} so'm</p></div>
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl"><img src={img} alt="" className="h-full w-full object-cover" /><span className="absolute bottom-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-extrabold text-brand">+</span></div>
                  </div>
                ))}
                <div className="m-3 flex items-center justify-between rounded-2xl bg-brand px-4 py-3 text-sm font-extrabold text-white"><span>3 · Savat</span><span>105 000 so'm →</span></div>
              </div>
            </div>
            <div className="absolute -left-12 top-44 hidden rounded-2xl bg-white p-3 shadow-xl ring-1 ring-line sm:block">
              <p className="flex items-center gap-2 text-xs font-extrabold"><ChefHat size={16} className="text-brand" /> Oshxonaga yuborildi</p>
              <p className="text-[11px] text-mute">Stol 7 · #24 · hozirgina</p>
            </div>
            <div className="absolute -right-8 bottom-24 hidden rounded-2xl bg-white p-3 shadow-xl ring-1 ring-line sm:block">
              <p className="text-[11px] font-bold text-mute">Bugungi tushum</p>
              <p className="flex items-center gap-1 font-display font-extrabold"><TrendingUp size={16} className="text-ok" /> 4 850 000</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 text-center md:grid-cols-4">
          {[["+27%", "o'rtacha chek o'sishi"], ["2×", "tezroq xizmat"], ["0 so'm", "menyu chop etish xarajati"], ["1 kun", "ishga tushirish"]].map(([a, b]) => (
            <div key={b}><p className="font-display text-3xl font-extrabold text-brand sm:text-4xl">{a}</p><p className="mt-1 text-sm font-semibold text-mute">{b}</p></div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-sm font-extrabold uppercase tracking-widest text-brand">Imkoniyatlar</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold sm:text-4xl">Restoraningizni ko'proq sotadigan va tezroq ishlaydigan qiladi</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.t} className="rounded-3xl bg-white p-6 ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-lg">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand"><f.icon size={22} /></span>
              <p className="mt-4 font-display text-lg font-extrabold">{f.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-mute">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="bg-ink text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-widest text-brand">Qanday ishlaydi</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">3 qadam — va mijoz buyurtma berdi</h2>
            <ol className="mt-8 space-y-6">
              {[["Skanerlash", "Stoldagi QR kodni telefon kamerasi bilan skanerlaydi — menyu brauzerda ochiladi."], ["Tanlash", "Rasmli menyudan taom, hajm va qo'shimchalarni tanlaydi. Narx darhol hisoblanadi."], ["Buyurtma", "Bir tugma — buyurtma oshxona ekraniga, admin telefoniga ovozli signal bilan tushadi. Mijoz holatni jonli kuzatadi."]].map(([a, b], i) => (
                <li key={a} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand font-display text-lg font-extrabold">{i + 1}</span>
                  <div><p className="font-display text-lg font-extrabold">{a}</p><p className="mt-1 text-white/70">{b}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-[32px] bg-white/5 p-8 text-center ring-1 ring-white/10">
            <p className="font-display text-xl font-extrabold">Hoziroq telefoningizda sinang</p>
            <p className="mt-1 text-sm text-white/60">Kamera bilan skanerlang — demo menyu ochiladi</p>
            <div className="mx-auto mt-6 w-56 rounded-3xl bg-white p-4"><DemoQR path="/menu/7" /></div>
            <p className="mt-4 text-sm font-bold text-white/70">Stol 7 · Rayhon (demo)</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <p className="text-sm font-extrabold uppercase tracking-widest text-brand">Narxlar</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Oddiy va shaffof tariflar</h2>
          <p className="mt-2 text-mute">14 kun bepul sinov · istalgan vaqtda bekor qilish mumkin</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`relative flex flex-col rounded-3xl p-7 ${p.hot ? "bg-ink text-white shadow-2xl" : "bg-white ring-1 ring-line"}`}>
              {p.hot && <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-xs font-extrabold text-white">Eng mashhur</span>}
              <p className="font-display text-xl font-extrabold">{p.name}</p>
              <p className={`text-sm ${p.hot ? "text-white/60" : "text-mute"}`}>{p.for}</p>
              <p className="mt-5"><span className="font-display text-4xl font-extrabold">{p.price}</span> <span className={p.hot ? "text-white/60" : "text-mute"}>so'm/oy</span></p>
              <ul className="mt-6 flex-1 space-y-3">
                {p.items.map((i) => <li key={i} className="flex items-start gap-2 text-sm font-semibold"><Check size={18} className="shrink-0 text-brand" /> {i}</li>)}
              </ul>
              <Link href="#contact" className={`mt-7 inline-flex h-12 items-center justify-center rounded-2xl font-extrabold ${p.hot ? "bg-brand text-white" : "bg-sand"}`}>Ulanish</Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 pb-20">
        <h2 className="text-center font-display text-3xl font-extrabold">Ko'p so'raladigan savollar</h2>
        <div className="mt-8 space-y-3">
          {[
            ["Mijoz ilova yuklab olishi kerakmi?", "Yo'q. QR kod skanerlanganda menyu oddiy brauzerda ochiladi — iPhone va Android'da ishlaydi."],
            ["Menyuni o'zim o'zgartira olamanmi?", "Ha. Admin paneldan narx, rasm, tavsif, kategoriya va stop-listni telefoningizdan istalgan vaqtda o'zgartirasiz."],
            ["Internet bo'lmasa nima bo'ladi?", "Mijoz o'z mobil internetidan foydalanadi. Restoranda Wi-Fi bo'lsa, menyuda uning paroli ko'rsatiladi."],
            ["Oshxona buyurtmani qanday ko'radi?", "Oshxonadagi planshet yoki televizorda «Oshxona ekrani» ochiq turadi — har bir yangi buyurtma ovozli signal bilan chiqadi."],
            ["Qancha vaqtda ishga tushadi?", "Menyuingizni yuborsangiz, 24 soat ichida tayyor QR kodlar bilan topshiramiz."],
          ].map(([q, a]) => (
            <details key={q} className="group rounded-2xl bg-white p-5 ring-1 ring-line">
              <summary className="flex cursor-pointer list-none items-center justify-between font-bold">{q}<span className="text-brand transition group-open:rotate-45">＋</span></summary>
              <p className="mt-3 text-mute">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="px-4 pb-20">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-brand p-10 text-white sm:p-14">
          <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Restoraningizga SmartMenu ulaymizmi?</h2>
              <p className="mt-3 text-white/85">Demo ko'rsatamiz, menyuingizni o'zimiz kiritamiz va QR kodlarni tayyorlab beramiz.</p>
              <div className="mt-6 flex items-center gap-1 text-white/90">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={18} className="fill-white" />)} <span className="ml-2 text-sm font-bold">Restoranlar ishonadi</span></div>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/menu/1" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-white font-extrabold text-ink">Demo menyuni ochish <ArrowRight size={18} /></Link>
              <Link href="/admin" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-white/15 font-extrabold ring-1 ring-white/30"><ShieldCheck size={18} /> Admin panelni ko'rish</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-mute sm:flex-row">
          <span className="font-display font-extrabold text-ink">Smart<span className="text-brand">Menu</span></span>
          <span>© {new Date().getFullYear()} SmartMenu · United IT Clubs</span>
        </div>
      </footer>
    </div>
  );
}
