import { NextResponse } from "next/server";
import { getOrder, updateOrder } from "@/lib/store";
import { requireRole } from "@/lib/auth";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
const STATUSES: OrderStatus[] = ["new", "cooking", "ready", "served", "closed", "cancelled"];

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await getOrder(id);
  if (!o) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(o, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as { status?: OrderStatus; rating?: number };
  if (body.status) {
    if (!(await requireRole("admin", "kitchen"))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "bad status" }, { status: 400 });
    return NextResponse.json(await updateOrder(id, { status: body.status }));
  }
  if (body.rating) {
    const r = Math.max(1, Math.min(5, Math.round(body.rating)));
    return NextResponse.json(await updateOrder(id, { rating: r }));
  }
  return NextResponse.json({ error: "nothing" }, { status: 400 });
}
