import { NextResponse } from "next/server";
import { getMenu, saveMenu } from "@/lib/store";
import { requireRole } from "@/lib/auth";
import type { MenuData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const m = await getMenu();
  return NextResponse.json(m, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: Request) {
  if (!(await requireRole("admin"))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<MenuData>;
  const m = await saveMenu((doc) => {
    if (body.settings) doc.settings = { ...doc.settings, ...body.settings };
    if (body.categories) doc.categories = body.categories;
    if (body.items) doc.items = body.items;
    if (body.tables) doc.tables = body.tables;
  });
  return NextResponse.json(m);
}
