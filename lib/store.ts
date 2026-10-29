import "server-only";
import { get, put, BlobPreconditionFailedError } from "@vercel/blob";
import { seedMenu } from "./seed";
import type { Call, MenuData, Order } from "./types";

/**
 * Storage layer.
 * Production: Vercel Blob (private store) — JSON documents with ETag-based
 * optimistic concurrency. Local dev without token: in-memory.
 */

const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const PREFIX = "smartmenu/";

type Mem = Map<string, { etag: string; body: string }>;
const g = globalThis as unknown as { __smMem?: Mem; __smCache?: Map<string, { etag: string; data: unknown }> };
const mem: Mem = (g.__smMem ??= new Map());
const cache = (g.__smCache ??= new Map());

async function readDoc<T>(path: string): Promise<{ data: T | null; etag: string | null }> {
  const key = PREFIX + path;
  if (!hasBlob) {
    const v = mem.get(key);
    return v ? { data: JSON.parse(v.body) as T, etag: v.etag } : { data: null, etag: null };
  }
  const cached = cache.get(key);
  const res = await get(key, { access: "private", useCache: false, ifNoneMatch: cached?.etag });
  if (!res) return { data: null, etag: null };
  if (res.statusCode === 304 && cached) return { data: structuredClone(cached.data) as T, etag: cached.etag };
  if (!res.stream) return { data: null, etag: null };
  const text = await new Response(res.stream).text();
  const data = JSON.parse(text) as T;
  cache.set(key, { etag: res.blob.etag, data });
  return { data: structuredClone(data), etag: res.blob.etag };
}

async function writeDoc(path: string, data: unknown, etag: string | null): Promise<void> {
  const key = PREFIX + path;
  const body = JSON.stringify(data);
  if (!hasBlob) {
    const cur = mem.get(key);
    if (etag && cur && cur.etag !== etag) throw new Conflict();
    mem.set(key, { etag: String(Date.now()) + Math.random(), body });
    return;
  }
  try {
    const r = await put(key, body, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      ...(etag ? { ifMatch: etag } : {}),
    });
    const newEtag = (r as unknown as { etag?: string }).etag;
    if (newEtag) cache.set(key, { etag: newEtag, data: JSON.parse(body) });
    else cache.delete(key);
  } catch (e) {
    if (e instanceof BlobPreconditionFailedError) throw new Conflict();
    throw e;
  }
}

class Conflict extends Error {}

/** Read-modify-write with retries on concurrent modification. */
async function mutate<T, R>(path: string, init: () => T, fn: (doc: T) => R): Promise<R> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const { data, etag } = await readDoc<T>(path);
    const doc = data ?? init();
    const result = fn(doc);
    try {
      await writeDoc(path, doc, etag);
      return result;
    } catch (e) {
      if (e instanceof Conflict) {
        cache.delete(PREFIX + path);
        await new Promise((r) => setTimeout(r, 80 + Math.random() * 200));
        continue;
      }
      throw e;
    }
  }
  throw new Error("Saqlashda ziddiyat, qayta urinib ko'ring");
}

/* ---------- Menu ---------- */
export async function getMenu(): Promise<MenuData> {
  const { data } = await readDoc<MenuData>("menu.json");
  return data ?? structuredClone(seedMenu);
}
export async function saveMenu(update: (m: MenuData) => void): Promise<MenuData> {
  return mutate<MenuData, MenuData>("menu.json", () => structuredClone(seedMenu), (m) => {
    update(m);
    m.version = (m.version || 0) + 1;
    return m;
  });
}

/* ---------- Orders (one document per day, Tashkent time) ---------- */
export function dayKey(ts = Date.now()) {
  const d = new Date(ts + 5 * 3600 * 1000); // UTC+5
  return d.toISOString().slice(0, 10);
}
type DayDoc = { orders: Order[]; seq: number };
const dayInit = (): DayDoc => ({ orders: [], seq: 0 });

export async function getOrders(day = dayKey()): Promise<Order[]> {
  const { data } = await readDoc<DayDoc>(`orders/${day}.json`);
  return data?.orders ?? [];
}
export async function addOrder(o: Omit<Order, "num" | "id">): Promise<Order> {
  const day = dayKey(o.createdAt);
  return mutate<DayDoc, Order>(`orders/${day}.json`, dayInit, (doc) => {
    doc.seq += 1;
    const order: Order = { ...o, num: doc.seq, id: `${day.replaceAll("-", "")}-${doc.seq}-${Math.random().toString(36).slice(2, 6)}` };
    doc.orders.push(order);
    return order;
  });
}
function dayFromId(id: string) {
  const s = id.slice(0, 8);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}
export async function getOrder(id: string): Promise<Order | null> {
  const orders = await getOrders(dayFromId(id));
  return orders.find((o) => o.id === id) ?? null;
}
export async function updateOrder(id: string, patch: Partial<Pick<Order, "status" | "rating">>): Promise<Order | null> {
  return mutate<DayDoc, Order | null>(`orders/${dayFromId(id)}.json`, dayInit, (doc) => {
    const o = doc.orders.find((x) => x.id === id);
    if (!o) return null;
    Object.assign(o, patch, { updatedAt: Date.now() });
    return o;
  });
}

/* ---------- Waiter calls ---------- */
type CallDoc = { calls: Call[] };
export async function getCalls(): Promise<Call[]> {
  const { data } = await readDoc<CallDoc>("calls.json");
  return data?.calls ?? [];
}
export async function addCall(table: string, type: Call["type"]): Promise<Call> {
  return mutate<CallDoc, Call>("calls.json", () => ({ calls: [] }), (doc) => {
    const existing = doc.calls.find((c) => !c.done && c.table === table && c.type === type);
    if (existing) return existing;
    const c: Call = { id: Math.random().toString(36).slice(2, 10), table, type, createdAt: Date.now(), done: false };
    doc.calls = [c, ...doc.calls].slice(0, 60);
    return c;
  });
}
export async function closeCall(id: string): Promise<void> {
  await mutate<CallDoc, void>("calls.json", () => ({ calls: [] }), (doc) => {
    const c = doc.calls.find((x) => x.id === id);
    if (c) c.done = true;
  });
}

/* ---------- Images ---------- */
export async function saveImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `img/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  if (!hasBlob) {
    const buf = Buffer.from(await file.arrayBuffer());
    return `data:${file.type};base64,${buf.toString("base64")}`;
  }
  await put(PREFIX + name, file, { access: "private", contentType: file.type, addRandomSuffix: false });
  return `/api/img/${name}`;
}
export async function readImage(name: string) {
  return get(PREFIX + "img/" + name, { access: "private" });
}

export const storageMode = hasBlob ? "blob" : "memory";
