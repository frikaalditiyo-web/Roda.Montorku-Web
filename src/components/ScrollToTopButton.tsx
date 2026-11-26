"use client";

import React, { useEffect, useState } from "react";

/**
 * Floating button at bottom-right to smoothly return to the top when scrolled down.
 */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 360);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleScrollTop}
      aria-label="Kembali ke atas"
      title="Kembali ke atas"
      className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-primary hover:bg-secondary text-on-primary font-label-sm text-label-sm font-semibold shadow-xl shadow-black/25 border border-white/20 backdrop-blur-md transition-all duration-200 cursor-pointer ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
      <span>Ke Atas</span>
    </button>
  );
}
