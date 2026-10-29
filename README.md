# SmartMenu — QR menyu va buyurtma tizimi

Restoran va kafelar uchun mobil QR menyu: mijoz stoldagi QR kodni skanerlaydi, taom tanlaydi va buyurtma darhol oshxona ekraniga hamda admin panelga tushadi.

## Sahifalar
| Yo'l | Vazifasi |
|---|---|
| `/` | Sotuv (landing) sahifasi — imkoniyatlar, tariflar, demo QR |
| `/menu/{stol}` | Mijoz menyusi (har stol uchun alohida QR) |
| `/admin` | Admin panel: Bugun, Buyurtmalar, Menyu, Stollar va QR, Sozlamalar |
| `/kitchen` | Oshxona ekrani (planshet/TV uchun, ovozli signal) |

## Imkoniyatlar
- 3 til (UZ/RU/EN), qidiruv, kategoriyalar, "Eng ko'p buyurtma" karuseli
- Taom oynasi: hajm variantlari, qo'shimchalar (upsell), oshxonaga izoh
- Savat, "Bunga qo'shib oling" takliflari, xizmat haqi, to'lov usuli (Naqd/Karta/Click/Payme)
- Buyurtma holatini jonli kuzatish, baholash, ofitsiant/hisob chaqirish
- Admin: jonli buyurtmalar (ovoz + bildirishnoma), stop-list 1 tugmada, taom/kategoriya tahrirlash, rasm yuklash, QR yaratish va chop etish, chek chop etish, statistika
- Narxlar serverda qayta hisoblanadi (mijoz narxni o'zgartira olmaydi)

## Texnologiya
Next.js 15 · React 19 · Tailwind CSS 4 · Vercel Blob (private store, ETag bilan xavfsiz yozish)

## Muhit o'zgaruvchilari
| Kalit | Tavsif |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store ulanganda avtomatik qo'shiladi |
| `ADMIN_PASSWORD` | Admin paroli (default: `admin123`) |
| `KITCHEN_PIN` | Oshxona ekrani PIN (default: `1234`) |
| `AUTH_SECRET` | Sessiya imzosi uchun maxfiy kalit |

Blob token bo'lmasa (lokal), ma'lumotlar xotirada saqlanadi.

```bash
npm install
npm run dev
```
