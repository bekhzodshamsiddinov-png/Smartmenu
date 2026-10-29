import { NextResponse } from "next/server";
import { dayKey, getOrders } from "@/lib/store";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await requireRole("admin"))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const n = Math.min(30, Number(new URL(req.url).searchParams.get("days") || 7));
  const days = Array.from({ length: n }, (_, i) => dayKey(Date.now() - i * 86400000)).reverse();
  const all = await Promise.all(days.map((d) => getOrders(d)));
  return NextResponse.json(days.map((d, i) => ({ day: d, orders: all[i].filter((o) => o.status !== "cancelled") })));
}
