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

  const handleLogout = () => {
    logoutAdmin();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-inverse-surface/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-primary-container z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col">
          <div className="px-space-lg pt-space-lg pb-space-md">
            <Link href="/" className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary-fixed-dim text-[26px]">
                two_wheeler
              </span>
              <span className="font-headline-sm text-headline-sm font-bold text-on-primary tracking-tight">
                RODA.MOTORKU
              </span>
            </Link>
            <div className="mt-space-xs flex items-center justify-between">
              <span className="inline-flex items-center px-space-xs py-0.5 rounded-DEFAULT bg-primary font-label-sm text-label-sm text-primary-fixed font-bold tracking-wider">
                PANEL ADMIN
              </span>
              <Link
                href="/"
                className="font-label-sm text-label-sm text-primary-fixed-dim hover:text-white inline-flex items-center gap-0.5"
                title="Lihat Katalog Publik"
              >
                <span>Katalog</span>
                <span className="material-symbols-outlined text-[13px]">
                  open_in_new
                </span>
              </Link>
            </div>
          </div>

          <nav className="flex flex-col gap-space-xs px-space-sm mt-space-md">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/admin/dashboard" && pathname === "/admin");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={
                    isActive
                      ? "flex items-center gap-space-sm px-space-md py-space-sm rounded-DEFAULT transition-all duration-150 bg-primary text-on-primary font-semibold border-l-4 border-primary-fixed shadow-sm"
                      : "flex items-center gap-space-sm px-space-md py-space-sm rounded-DEFAULT text-on-primary-container hover:bg-primary hover:text-on-primary transition-all duration-150"
                  }
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {item.icon}
                  </span>
                  <span className="font-label-md text-label-md">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-space-md bg-primary/40 flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-sm px-space-sm py-space-xs">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                person
              </span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-label-md text-label-md text-on-primary truncate font-semibold">
                {currentUser?.nama || "Admin Showroom Otista"}
              </span>
              <span className="font-label-sm text-label-sm text-primary-fixed-dim">
                @{currentUser?.username || "admin_otista"} • Super Admin
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-space-sm px-space-sm py-space-xs rounded-DEFAULT text-error-container hover:bg-error/20 hover:text-on-error transition-all duration-150 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              logout
            </span>
            <span className="font-label-md text-label-md">Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl z-30 flex items-center justify-between px-margin-mobile md:px-margin shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-DEFAULT bg-surface-container flex items-center justify-center text-primary"
              aria-label="Open Sidebar"
            >
              <span className="material-symbols-outlined text-[20px]">
                menu
              </span>
            </button>
            <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">
                store
              </span>
              <span className="hidden sm:inline">Portal Showroom</span>
              <span className="material-symbols-outlined text-[14px] hidden sm:inline">
                chevron_right
              </span>
              <span className="text-on-surface font-semibold">
                RODA.MOTORKU
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="hidden sm:inline-flex items-center gap-space-xs px-space-sm py-1 rounded-DEFAULT bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span>API ML Connected (Flask :5000)</span>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-DEFAULT bg-secondary-container hover:bg-secondary-fixed text-primary font-label-sm text-label-sm font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                storefront
              </span>
              <span className="hidden md:inline">Lihat Katalog Publik</span>
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                person
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 pt-16 w-full p-margin-mobile md:p-margin bg-surface">
          {children}
        </main>

        <footer className="w-full bg-surface-container-lowest py-space-md px-margin-mobile md:px-margin shadow-[0_-1px_4px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-xs">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              © 2026 RODA.MOTORKU — Sistem Manajemen Katalog &amp; Valuasi Harga
              Motor Bekas UMKM.
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              v1.4.0-stable | Engine ML Random Forest / OLS / Decision Tree
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
