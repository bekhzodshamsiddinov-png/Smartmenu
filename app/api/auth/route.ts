import { NextResponse } from "next/server";
import { adminPassword, clearSession, currentRole, kitchenPin, setSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password: string };
  if (password && password === adminPassword()) {
    await setSession("admin");
    return NextResponse.json({ role: "admin" });
  }
  if (password && password === kitchenPin()) {
    await setSession("kitchen");
    return NextResponse.json({ role: "kitchen" });
  }
  await new Promise((r) => setTimeout(r, 600));
  return NextResponse.json({ error: "Parol noto'g'ri" }, { status: 401 });
}
export async function GET() {
  return NextResponse.json({ role: await currentRole() });
}
export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
