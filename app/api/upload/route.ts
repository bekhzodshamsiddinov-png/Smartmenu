import { NextResponse } from "next/server";
import { saveImage } from "@/lib/store";
import { requireRole } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await requireRole("admin"))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "no file" }, { status: 400 });
  const is3d = /\.(glb|gltf)$/i.test(file.name);
  if (!file.type.startsWith("image/") && !is3d) return NextResponse.json({ error: "Faqat rasm yoki .glb 3D model" }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Fayl 4MB dan katta" }, { status: 400 });
  return NextResponse.json({ url: await saveImage(file) });
}
