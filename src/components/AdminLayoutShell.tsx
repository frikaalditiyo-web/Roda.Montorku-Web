"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useShowroom } from "@/context/ShowroomContext";

const ADMIN_NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: "dashboard",
  },
  {
    href: "/admin/data-motor",
    label: "Data Motor",
    icon: "motorcycle",
  },
  {
    href: "/admin/estimasi",
    label: "Estimasi Harga",
    icon: "price_check",
  },
  {
    href: "/admin/riwayat-estimasi",
    label: "Riwayat Estimasi",
    icon: "history",
  },
];

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logoutAdmin } = useShowroom();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);
    logoutAdmin();
    setTimeout(() => {
      router.push("/login");
      setShowLogoutModal(false);
      setIsLoggingOut(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-primary font-sans text-body-md text-on-surface">
      {/* Full-Width Top Header (menyatu dengan sidebar, tanpa shadow pemisah) */}
      <header className="fixed top-0 left-0 right-0 w-full h-16 bg-primary text-on-primary z-50 flex items-center justify-between px-margin-mobile md:px-space-lg">
        <div className="flex items-center gap-space-sm">
          {/* Mobile Drawer Toggle */}
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="lg:hidden w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-on-primary cursor-pointer transition-colors"
            aria-label="Toggle Sidebar Mobile"
          >
            <span className="material-symbols-outlined text-[20px]">
              {sidebarOpen ? "close" : "menu"}
            </span>
          </button>

          {/* Desktop Collapse / Expand Toggle (Top Only) */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="hidden lg:flex w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 items-center justify-center text-on-primary cursor-pointer transition-colors"
            title={
              sidebarCollapsed
                ? "Lebarkan Menu Samping"
                : "Kecilkan Menu Samping"
            }
            aria-label="Toggle Sidebar Desktop"
          >
            <span className="material-symbols-outlined text-[20px]">
              {sidebarCollapsed ? "menu" : "menu_open"}
            </span>
          </button>

          <Link href="/" className="flex items-center gap-space-sm ml-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-xs flex-shrink-0">
              <img src="/logo.png" alt="Roda.Motorku" className="w-full h-full object-contain" />
            </div>
            <span className="text-base sm:text-headline-sm font-bold tracking-tight leading-none text-on-primary">
              Roda.Motorku
            </span>
          </Link>

          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-[10px] sm:text-[11px] text-on-secondary font-semibold uppercase tracking-wider">
            Panel Admin
          </span>
        </div>

        <div className="flex items-center gap-space-md">
          <div className="hidden sm:inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-white/10 text-on-primary font-label-sm text-label-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-on-primary"></span>
            <span>Mesin ML Aktif</span>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low text-primary font-label-sm text-label-sm font-semibold transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">
              storefront
            </span>
            <span className="hidden md:inline">Katalog Publik</span>
          </Link>
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">
              person
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-inverse-surface/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Collapsible Sidebar below Top Header */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-primary z-40 flex flex-col justify-between transition-all duration-200 w-64 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className="flex flex-col">
          <nav className="flex flex-col gap-1.5 px-3 mt-3">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/admin/dashboard" && pathname === "/admin");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={item.label}
                  className={`${
                    isActive
                      ? "bg-secondary text-on-secondary font-semibold"
                      : "text-on-primary/75 hover:bg-white/10 hover:text-on-primary"
                  } flex items-center ${
                    sidebarCollapsed
                      ? "lg:justify-center lg:px-0"
                      : "gap-space-sm px-space-md"
                  } py-2.5 rounded-xl transition-all duration-150`}
                >
                  <span className="material-symbols-outlined text-[20px] shrink-0">
                    {item.icon}
                  </span>
                  <span
                    className={`font-label-md text-label-md truncate ${
                      sidebarCollapsed ? "lg:hidden" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 m-2 rounded-2xl bg-white/5 flex flex-col gap-1.5">
          <div
            className={`flex items-center ${
              sidebarCollapsed ? "lg:justify-center" : "gap-space-sm"
            } px-2 py-1`}
          >
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                person
              </span>
            </div>
            <div
              className={`flex flex-col overflow-hidden ${
                sidebarCollapsed ? "lg:hidden" : ""
              }`}
            >
              <span className="font-label-md text-label-md text-on-primary truncate font-semibold">
                {currentUser?.nama || "Admin Showroom"}
              </span>
              <span className="font-label-sm text-label-sm text-primary-fixed-dim">
                Super Admin
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            title="Keluar"
            className={`w-full flex items-center ${
              sidebarCollapsed
                ? "lg:justify-center lg:px-0"
                : "gap-space-sm px-2.5"
            } py-1.5 rounded-xl text-on-primary/80 hover:bg-secondary hover:text-on-primary transition-all duration-150 cursor-pointer`}
          >
            <span className="material-symbols-outlined text-[18px]">
              logout
            </span>
            <span
              className={`font-label-md text-label-md ${
                sidebarCollapsed ? "lg:hidden" : ""
              }`}
            >
              Keluar
            </span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-200 animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 text-left animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">
                  logout
                </span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
                  Konfirmasi Keluar
                </h3>
                <span className="text-[12px] text-on-surface-variant font-medium">
                  Sesi Admin Showroom
                </span>
              </div>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant">
              Apakah Anda yakin ingin keluar dari Panel Admin Roda.Motorku? Sesi autentikasi Anda akan diakhiri dan Anda akan dialihkan ke halaman login.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/30">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl text-primary font-label-md text-label-md font-semibold bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleConfirmLogout}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-secondary text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-60"
              >
                {isLoggingOut ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
                    <span>Mengeluarkan...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      logout
                    </span>
                    <span>Ya, Keluar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area with smooth curved inner corner (rounded-tl-[32px]) */}
      <div
        className={`pt-16 flex flex-col min-h-screen transition-all duration-200 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <div className="flex-1 flex flex-col bg-surface rounded-t-2xl lg:rounded-tr-none lg:rounded-tl-[32px] overflow-hidden">
          <main
            key={pathname}
            className="flex-1 w-full px-margin-mobile md:px-margin py-space-lg animate-panel-enter"
          >
            {children}
          </main>

          <footer className="w-full bg-surface-container-lowest py-space-md px-margin-mobile md:px-margin border-t border-outline-variant/40">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-space-xs">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                © 2026 Roda.Motorku
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
