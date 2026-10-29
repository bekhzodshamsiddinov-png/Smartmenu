import { readImage } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ name: string[] }> }) {
  const { name } = await params;
  const safe = name.join("/").replace(/\.\./g, "");
  const r = await readImage(safe);
  if (!r || r.statusCode !== 200) return new Response("Not found", { status: 404 });
  return new Response(r.stream, {
    headers: { "Content-Type": r.blob.contentType, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
