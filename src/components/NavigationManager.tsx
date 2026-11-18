"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

interface PageMeta {
  title: string;
  subtitle: string;
  icon: string;
  panel: "catalog" | "admin" | "login" | "other";
}

function resolvePageMeta(path: string): PageMeta {
  if (path === "/") {
    return {
      title: "Katalog Motor",
      subtitle: "Etalase unit motor bekas showroom",
      icon: "storefront",
      panel: "catalog",
    };
  }
  if (path.startsWith("/katalog/")) {
    return {
      title: "Detail Unit Motor",
      subtitle: "Spesifikasi lengkap dan kondisi unit",
      icon: "two_wheeler",
      panel: "catalog",
    };
  }
  if (path === "/login") {
    return {
      title: "Masuk Admin Showroom",
      subtitle: "Portal autentikasi pengelola",
      icon: "lock",
      panel: "login",
    };
  }
  if (path === "/admin/dashboard" || path === "/admin") {
    return {
      title: "Dashboard Admin",
      subtitle: "Ringkasan stok dan aktivitas valuasi",
      icon: "dashboard",
      panel: "admin",
    };
  }
  if (path === "/admin/data-motor") {
    return {
      title: "Kelola Data Motor",
      subtitle: "Manajemen inventaris motor showroom",
      icon: "garage",
      panel: "admin",
    };
  }
  if (path === "/admin/estimasi") {
    return {
      title: "Kalkulator Estimasi ML",
      subtitle: "Valuasi rekomendasi harga jual",
      icon: "calculate",
      panel: "admin",
    };
  }
  if (path === "/admin/riwayat-estimasi") {
    return {
      title: "Riwayat Estimasi",
      subtitle: "Catatan histori prediksi machine learning",
      icon: "history",
      panel: "admin",
    };
  }
  return {
    title: "Halaman Roda.Motorku",
    subtitle: path,
    icon: "arrow_forward",
    panel: "other",
  };
}

export function NavigationManager() {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    title: string;
    subtitle: string;
    icon: string;
  }>({
    visible: false,
    title: "",
    subtitle: "",
    icon: "",
  });

  // Panel Switch Loading state
  const [panelLoading, setPanelLoading] = useState<{
    visible: boolean;
    title: string;
    desc: string;
    icon: string;
  }>({
    visible: false,
    title: "",
    desc: "",
    icon: "",
  });

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const panelTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Safety fail-safe: ensures panelLoading NEVER gets stuck under any circumstance
  useEffect(() => {
    if (!panelLoading.visible) return;
    const safetyTimer = setTimeout(() => {
      setPanelLoading({ visible: false, title: "", desc: "", icon: "" });
    }, 1000);
    return () => clearTimeout(safetyTimer);
  }, [panelLoading.visible]);

  useEffect(() => {
    // Initial mount - do not trigger navigation toast on fresh page refresh
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      return;
    }

    const prevPath = prevPathRef.current;
    if (prevPath === pathname) return;

    prevPathRef.current = pathname;

    const prevMeta = resolvePageMeta(prevPath);
    const nextMeta = resolvePageMeta(pathname);

    // 1. Check if switching panel between Catalog and Admin, or opening detail motor
    const isSwitchingToAdmin =
      prevMeta.panel !== "admin" && nextMeta.panel === "admin";
    const isSwitchingToCatalog =
      prevMeta.panel === "admin" && nextMeta.panel === "catalog";
    const isSwitchingToLogin =
      prevMeta.panel === "admin" && nextMeta.panel === "login";
    const isOpeningDetail =
      !prevPath.startsWith("/katalog/") && pathname.startsWith("/katalog/");
    const isReturningToCatalog =
      prevPath.startsWith("/katalog/") && pathname === "/";

    if (isSwitchingToAdmin) {
      if (panelTimerRef.current) clearTimeout(panelTimerRef.current);
      setPanelLoading({
        visible: true,
        title: "Beralih ke Panel Admin",
        desc: "Menyiapkan konsol inventaris dan mesin valuasi machine learning...",
        icon: "admin_panel_settings",
      });
      panelTimerRef.current = setTimeout(() => {
        setPanelLoading({ visible: false, title: "", desc: "", icon: "" });
      }, 650);
    } else if (isSwitchingToCatalog) {
      if (panelTimerRef.current) clearTimeout(panelTimerRef.current);
      setPanelLoading({
        visible: true,
        title: "Beralih ke Katalog Publik",
        desc: "Memuat etalase motor bekas bergaransi...",
        icon: "storefront",
      });
      panelTimerRef.current = setTimeout(() => {
        setPanelLoading({ visible: false, title: "", desc: "", icon: "" });
      }, 650);
    } else if (isSwitchingToLogin) {
      if (panelTimerRef.current) clearTimeout(panelTimerRef.current);
      setPanelLoading({
        visible: true,
        title: "Sesi Admin Ditutup",
        desc: "Mengarahkan kembali ke halaman autentikasi...",
        icon: "logout",
      });
      panelTimerRef.current = setTimeout(() => {
        setPanelLoading({ visible: false, title: "", desc: "", icon: "" });
      }, 500);
    } else if (isOpeningDetail) {
      if (panelTimerRef.current) clearTimeout(panelTimerRef.current);
      setPanelLoading({
        visible: true,
        title: "Memuat Detail Motor",
        desc: "Menyiapkan galeri foto, spesifikasi lengkap, dan estimasi harga...",
        icon: "two_wheeler",
      });
      panelTimerRef.current = setTimeout(() => {
        setPanelLoading({ visible: false, title: "", desc: "", icon: "" });
      }, 450);
    } else if (isReturningToCatalog) {
      if (panelTimerRef.current) clearTimeout(panelTimerRef.current);
      setPanelLoading({
        visible: true,
        title: "Kembali ke Katalog",
        desc: "Menampilkan daftar seluruh unit motor showroom...",
        icon: "storefront",
      });
      panelTimerRef.current = setTimeout(() => {
        setPanelLoading({ visible: false, title: "", desc: "", icon: "" });
      }, 400);
    }

    // 2. Trigger Navigation Toast for every page transition
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({
      visible: true,
      title: nextMeta.title,
      subtitle: nextMeta.subtitle,
      icon: nextMeta.icon,
    });

    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);

    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (panelTimerRef.current) clearTimeout(panelTimerRef.current);
    };
  }, [pathname]);

  return (
    <>
      {/* Panel Switch Transition Overlay */}
      {panelLoading.visible && (
        <div className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-2xl p-7 max-w-sm w-full flex flex-col items-center text-center gap-4 transform transition-all scale-100">
            {/* Spinning Loader & Icon */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/15 border-t-primary animate-spin"></div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-xs">
                <span className="material-symbols-outlined text-[20px]">
                  {panelLoading.icon}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                Transisi Panel
              </span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
                {panelLoading.title}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mt-1">
                {panelLoading.desc}
              </p>
            </div>

            {/* Pulse Indicator */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span className="font-label-sm text-label-sm font-semibold text-primary">
                Sinkronisasi status...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Page Transition Toast */}
      {toast.visible && (
        <aside
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in"
        >
          <div className="bg-surface-container-lowest text-on-surface border border-outline-variant/70 shadow-xl rounded-xl p-3.5 flex items-center gap-3.5 min-w-[280px] max-w-sm relative overflow-hidden group">
            {/* Left Icon */}
            <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[20px]">
                {toast.icon}
              </span>
            </div>

            {/* Content Text */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                <span className="font-label-sm text-[11px] font-semibold text-primary uppercase tracking-wider">
                  Navigasi Halaman
                </span>
              </div>
              <span className="font-label-md text-label-md font-bold text-on-surface truncate">
                {toast.title}
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant truncate">
                {toast.subtitle}
              </span>
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
              className="text-on-surface-variant hover:text-primary p-1 rounded-md hover:bg-surface-container transition-colors cursor-pointer shrink-0"
              title="Tutup Notifikasi"
              aria-label="Tutup Notifikasi"
            >
              <span className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>

            {/* Subtle Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface-container overflow-hidden">
              <div className="h-full bg-primary animate-shrink origin-left"></div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
