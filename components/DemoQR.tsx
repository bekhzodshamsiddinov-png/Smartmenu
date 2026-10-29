"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function DemoQR({ path }: { path: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(location.origin + path, { margin: 0, width: 400, color: { dark: "#1F1A17", light: "#FFFFFF" } }).then(setSrc);
  }, [path]);
  return src ? <img src={src} alt="Demo QR" className="aspect-square w-full" /> : <div className="skeleton aspect-square w-full rounded-xl" />;
}
