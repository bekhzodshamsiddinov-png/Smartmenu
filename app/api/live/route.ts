import { NextResponse } from "next/server";
import { getCalls, getOrders } from "@/lib/store";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const role = await requireRole("admin", "kitchen");
  if (!role) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [orders, calls] = await Promise.all([getOrders(), getCalls()]);
  return NextResponse.json({ orders, calls: calls.filter((c) => !c.done), role, now: Date.now() }, { headers: { "Cache-Control": "no-store" } });
}
