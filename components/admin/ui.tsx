"use client";
import { X } from "lucide-react";
import { useEffect } from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white ring-1 ring-line ${className}`}>{children}</div>;
}

export function Btn({
  children, onClick, variant = "primary", className = "", disabled, type = "button", size = "md",
}: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "dark" | "ghost" | "soft" | "danger" | "ok"; className?: string; disabled?: boolean; type?: "button" | "submit"; size?: "sm" | "md" | "lg" }) {
  const v = {
    primary: "bg-brand text-white shadow-sm shadow-brand/30 hover:bg-brand-dark",
    dark: "bg-ink text-white hover:bg-black",
    ghost: "bg-transparent text-ink hover:bg-sand",
    soft: "bg-sand text-ink hover:bg-line",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ok: "bg-ok text-white hover:bg-emerald-700",
  }[variant];
  const s = { sm: "h-9 px-3 text-sm rounded-xl", md: "h-11 px-4 text-[15px] rounded-xl", lg: "h-14 px-5 text-base rounded-2xl" }[size];
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${className.includes("hidden") ? "" : "inline-flex"} items-center justify-center gap-2 font-bold transition active:scale-[0.98] disabled:opacity-50 ${v} ${s} ${className}`}>
      {children}
    </button>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={(e) => { e.stopPropagation(); onChange(!on); }} className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-ok" : "bg-line"}`}>
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-mute">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mute">{hint}</span>}
    </label>
  );
}

export const inputCls = "h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[16px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

export function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", k); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="anim-fade absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`anim-sheet relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-cream sm:rounded-3xl ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"}`}>
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <h3 className="font-display text-lg font-extrabold">{title}</h3>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-sand" aria-label="close"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="border-t border-line bg-white p-4 safe-b">{footer}</div>}
      </div>
    </div>
  );
}

export function Empty({ icon, title, text }: { icon: React.ReactNode; title: string; text?: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-sand text-mute">{icon}</div>
      <p className="font-display text-lg font-extrabold">{title}</p>
      {text && <p className="mt-1 text-sm text-mute">{text}</p>}
    </div>
  );
}

export function PageHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-mute">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
