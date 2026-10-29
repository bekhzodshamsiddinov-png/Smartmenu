import { NextResponse } from "next/server";
import { addCall, closeCall, getCalls } from "@/lib/store";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { table, type } = (await req.json()) as { table: string; type: "waiter" | "bill" };
  if (!table) return NextResponse.json({ error: "table" }, { status: 400 });
  return NextResponse.json(await addCall(String(table).slice(0, 20), type === "bill" ? "bill" : "waiter"));
}
export async function GET() {
  if (!(await requireRole("admin", "kitchen"))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await getCalls());
}
export async function PATCH(req: Request) {
  if (!(await requireRole("admin"))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id: string };
  await closeCall(id);
  return NextResponse.json({ ok: true });
}
