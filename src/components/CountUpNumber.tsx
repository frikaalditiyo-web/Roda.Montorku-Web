"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface CountUpNumberProps {
  /** Nilai akhir yang dituju animasi. */
  value: number;
  /** Durasi animasi dalam milidetik. */
  duration?: number;
  /** Jumlah angka di belakang koma. */
  decimals?: number;
  /** Teks di depan angka, mis. "Rp ". */
  prefix?: string;
  /** Teks di belakang angka, mis. "%". */
  suffix?: string;
  /** Formatter kustom; menggantikan format bawaan id-ID. */
  format?: (n: number) => string;
  className?: string;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Menampilkan angka dengan animasi naik (count-up).
 * Animasi diputar ulang dari 0 setiap kali panel/halaman berganti.
 */
export function CountUpNumber({
  value,
  duration = 1200,
  decimals = 0,
  prefix = "",
  suffix = "",
  format,
  className,
}: CountUpNumberProps) {
  const pathname = usePathname();
  const [display, setDisplay] = useState(0);
  const currentRef = useRef(0);
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    const target = Number.isFinite(value) ? value : 0;
    // Mulai dari 0 saat panel berganti, selain itu lanjut dari nilai terakhir.
    if (lastPathRef.current !== pathname) {
      currentRef.current = 0;
      lastPathRef.current = pathname;
    }
    const from = currentRef.current;
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const next = from + (target - from) * easeOutCubic(progress);
      currentRef.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, pathname]);

  const text = format
    ? format(display)
    : display.toLocaleString("id-ID", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

  return (
    <span className={`tabular-nums ${className ?? ""}`}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}

export default CountUpNumber;
