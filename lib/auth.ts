import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "sm_session";
const secret = () => process.env.AUTH_SECRET || "smartmenu-dev-secret";
export const adminPassword = () => process.env.ADMIN_PASSWORD || "admin123";
export const kitchenPin = () => process.env.KITCHEN_PIN || "1234";

export type Role = "admin" | "kitchen";

function sign(v: string) {
  return createHmac("sha256", secret()).update(v).digest("base64url");
}
export function makeToken(role: Role) {
  const payload = `${role}.${Date.now() + 1000 * 60 * 60 * 24 * 30}`;
  return `${payload}.${sign(payload)}`;
}
export function verify(token?: string): Role | null {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = sign(payload);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const [role, exp] = payload.split(".");
  if (Number(exp) < Date.now()) return null;
  return role === "admin" || role === "kitchen" ? role : null;
}
export async function currentRole(): Promise<Role | null> {
  const c = await cookies();
  return verify(c.get(COOKIE)?.value);
}
export async function setSession(role: Role) {
  const c = await cookies();
  c.set(COOKIE, makeToken(role), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
}
export async function clearSession() {
  const c = await cookies();
  c.delete(COOKIE);
}
export async function requireRole(...roles: Role[]) {
  const r = await currentRole();
  if (!r || (roles.length && !roles.includes(r))) return null;
  return r;
}
