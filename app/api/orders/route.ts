import { NextResponse } from "next/server";
import { addOrder, dayKey, getMenu, getOrders, reserveStock, StockError } from "@/lib/store";
import { requireRole } from "@/lib/auth";
import type { Lang, OrderLine } from "@/lib/types";

export const dynamic = "force-dynamic";

type InLine = { itemId: string; qty: number; sizeId?: string; addonIds?: string[]; note?: string };

export async function POST(req: Request) {
  const body = (await req.json()) as { place?: string; table: string; lines: InLine[]; payment: "cash" | "card" | "click" | "payme"; comment?: string; lang?: Lang };
  const menu = await getMenu();
  if (!menu.settings.ordering) return NextResponse.json({ error: "ordering disabled" }, { status: 400 });
  if (!body?.lines?.length) return NextResponse.json({ error: "empty" }, { status: 400 });
  const table = menu.tables.find((t) => t.id === String(body.table));
  const place = (body.place || "").trim().slice(0, 30);
  if (!table && !place) return NextResponse.json({ error: "place required" }, { status: 400 });
  const lines: OrderLine[] = [];
  for (const l of body.lines.slice(0, 50)) {
    const item = menu.items.find((i) => i.id === l.itemId);
    if (!item || !item.available || item.stock === 0) return NextResponse.json({ error: "unavailable", itemId: l.itemId }, { status: 409 });
    const size = item.sizes?.find((s) => s.id === l.sizeId);
    const addons = (item.addons ?? []).filter((a) => l.addonIds?.includes(a.id));
    const unit = item.price + (size?.price ?? 0) + addons.reduce((s, a) => s + a.price, 0);
    const qty = Math.max(1, Math.min(99, Math.floor(l.qty || 1)));
    lines.push({ itemId: item.id, name: item.name.uz, price: unit, qty, size: size?.name.uz, addons: addons.map((a) => a.name.uz), note: l.note?.slice(0, 200) });
  }
  const want = new Map<string, number>();
  lines.forEach((l) => want.set(l.itemId, (want.get(l.itemId) || 0) + l.qty));
  try {
    await reserveStock(want);
  } catch (e) {
    if (e instanceof StockError) return NextResponse.json({ error: "stock", itemId: e.itemId, left: e.left }, { status: 409 });
    throw e;
  }
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const service = Math.round((subtotal * (menu.settings.serviceFee || 0)) / 100);
  const now = Date.now();
  const order = await addOrder({
    table: table?.name ?? `${menu.settings.mode === "hotel" ? "Xona" : "Stol"} ${place}`,
    lines, subtotal, service, total: subtotal + service,
    payment: body.payment || "cash",
    comment: body.comment?.slice(0, 300),
    status: "new", createdAt: now, updatedAt: now, lang: body.lang || "uz",
  });
  return NextResponse.json(order);
}

export async function GET(req: Request) {
  if (!(await requireRole("admin", "kitchen"))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const day = new URL(req.url).searchParams.get("day") || dayKey();
  return NextResponse.json(await getOrders(day), { headers: { "Cache-Control": "no-store" } });
}
