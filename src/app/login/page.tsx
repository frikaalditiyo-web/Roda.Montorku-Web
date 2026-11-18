"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShowroom } from "@/context/ShowroomContext";

export default function LoginAdminPage() {
  const router = useRouter();
  const { loginAdmin } = useShowroom();

  const [username, setUsername] = useState("admin_otista");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<
    "idle" | "verifying" | "authenticated" | "redirecting"
  >("idle");
  const [authSuccess, setAuthSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Always reset loading on mount to prevent any stuck state when returning from logout
  useEffect(() => {
    setIsLoading(false);
    setLoginStep("idle");
    setAuthSuccess(false);
    setShowToast(false);
  }, []);

  const [alertState, setAlertState] = useState<{
    visible: boolean;
    isError: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    isError: true,
    title: "",
    message: "",
  });

  const handleFillDemo = () => {
    setUsername("admin_otista");
    setPassword("AdminRoda2026!");
    setAlertState((prev) => ({ ...prev, visible: false }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      setAlertState({
        visible: true,
        isError: true,
        title: "Gagal Masuk",
        message: "Harap isi username dan kata sandi admin.",
      });
      return;
    }

    setIsLoading(true);
    setLoginStep("verifying");
    setAlertState((prev) => ({ ...prev, visible: false }));

    const res = await loginAdmin(u, p);

    if (res.success) {
      setLoginStep("authenticated");
      setAuthSuccess(true);
      setShowToast(true);

      setTimeout(() => {
        setLoginStep("redirecting");
        setTimeout(() => {
          router.push("/admin/dashboard");
          setTimeout(() => {
            setIsLoading(false);
            setLoginStep("idle");
          }, 500);
        }, 400);
      }, 600);
    } else {
      setIsLoading(false);
      setLoginStep("idle");
      setAlertState({
        visible: true,
        isError: true,
        title: "Gagal Mengotentikasi",
        message: res.message || "Username atau kata sandi tidak valid.",
      });
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col justify-between relative">
      {/* Header */}
      <header className="w-full bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-10">
        <div className="h-16 max-w-7xl mx-auto px-margin-mobile md:px-margin flex items-center justify-between">
          <Link
            className="inline-flex items-center gap-space-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer group"
            href="/"
          >
            <span className="material-symbols-outlined text-primary text-[20px] transition-transform duration-200 group-hover:-translate-x-1">
              arrow_back
            </span>
            <span className="font-label-md text-label-md">
              Kembali ke Katalog
            </span>
          </Link>

          <div className="flex items-center gap-space-sm select-none">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                two_wheeler
              </span>
            </div>
            <span className="font-headline-sm text-headline-sm tracking-tight text-primary font-bold">
              RODA<span className="text-secondary">.MOTORKU</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-space-xs">
            <span className="inline-flex items-center px-space-sm py-space-xs rounded bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant border border-outline-variant/30">
              Konsol Manajemen Internal
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-margin-mobile md:px-margin py-space-xl bg-surface relative">
        {/* Login Loading Transition Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-2xl p-8 max-w-sm w-full flex flex-col items-center text-center gap-4 animate-in zoom-in-95">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-primary/15 border-t-primary animate-spin"></div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">
                    {loginStep === "authenticated" || loginStep === "redirecting"
                      ? "check_circle"
                      : "lock"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                  {loginStep === "verifying"
                    ? "Verifikasi Kredensial"
                    : "Autentikasi Berhasil"}
                </span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
                  {loginStep === "verifying"
                    ? "Memeriksa Akun..."
                    : loginStep === "authenticated"
                    ? "Akses Diterima!"
                    : "Mengalihkan ke Dashboard..."}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mt-1">
                  {loginStep === "verifying"
                    ? "Menghubungkan ke sistem otorisasi showroom Roda.Motorku..."
                    : "Menyiapkan sesi Super Admin & konsol motor..."}
                </p>
              </div>

              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{
                    width:
                      loginStep === "verifying"
                        ? "45%"
                        : loginStep === "authenticated"
                        ? "85%"
                        : "100%",
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
            <div className="bg-primary text-on-primary px-space-md py-space-sm rounded-xl shadow-2xl flex items-center gap-3 border border-primary-container">
              <div className="w-6 h-6 rounded-full bg-on-tertiary-container/30 flex items-center justify-center text-tertiary-fixed">
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <div className="text-left">
                <p className="font-label-md text-label-md font-semibold text-white">
                  Berhasil Masuk!
                </p>
                <p className="font-body-sm text-body-sm text-on-primary-container">
                  Mengalihkan ke Dashboard...
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col w-full items-center justify-center py-space-sm sm:py-space-lg">
          <div className="w-full max-w-[460px] bg-surface-container-lowest rounded-xl shadow-xl p-space-md sm:p-space-xl relative overflow-hidden transition-all duration-300">
            {/* Top Decorative Brand Bar Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-surface-tint"></div>

            {/* Header Section */}
            <div className="flex flex-col items-center text-center mt-space-xs">
              <div className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-secondary-container text-on-secondary-fixed mb-space-md shadow-sm">
                <span
                  className="material-symbols-outlined text-[16px] text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  admin_panel_settings
                </span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider">
                  Akses Khusus Pengelola Showroom
                </span>
              </div>

              <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center mb-space-sm shadow-md transition-transform hover:scale-105 duration-200">
                <span className="material-symbols-outlined text-[26px]">
                  two_wheeler
                </span>
              </div>

              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
                Login Admin
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs max-w-sm">
                Masuk ke Panel Konsol Showroom &amp; Mesin Valuasi Harga Machine Learning
              </p>
            </div>

            {/* Alert / Validation Notice Banner */}
            {alertState.visible && (
              <div className="mt-space-md bg-error-container text-on-error-container rounded-lg p-space-sm sm:p-space-md flex items-start gap-space-sm shadow-sm animate-shake">
                <span
                  className="material-symbols-outlined text-error text-[20px] flex-shrink-0 mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  warning
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-label-md text-label-md font-semibold">
                    {alertState.title}
                  </p>
                  <p className="font-body-sm text-body-sm mt-0.5 text-on-error-container">
                    {alertState.message}
                  </p>
                </div>
                <button
                  className="text-on-error-container hover:text-error transition-colors p-1 cursor-pointer rounded"
                  onClick={() =>
                    setAlertState((prev) => ({ ...prev, visible: false }))
                  }
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-space-md flex items-center justify-center gap-space-xs text-on-surface-variant bg-surface-container-low py-1.5 px-space-sm rounded text-center border border-outline-variant/20">
              <span className="material-symbols-outlined text-on-tertiary-fixed-variant text-[14px]">
                lock
              </span>
              <span className="font-label-sm text-label-sm text-secondary">
                Sesi aman terenkripsi{" "}
                <span className="font-bold text-on-surface">
                  (JWT HttpOnly Cookie)
                </span>
              </span>
            </div>

            {/* LOGIN FORM */}
            <form
              className="mt-space-lg flex flex-col gap-space-md"
              onSubmit={handleLoginSubmit}
            >
              {/* Username Field */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="font-label-md text-label-md text-on-surface"
                  htmlFor="usernameInput"
                >
                  Username
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined text-outline text-[20px] absolute left-3 pointer-events-none">
                    account_circle
                  </span>
                  <input
                    id="usernameInput"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant/60 shadow-sm focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary/20 placeholder:text-outline transition-all duration-200"
                    placeholder="Masukkan username admin"
                    required
                    type="text"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="font-label-md text-label-md text-on-surface"
                    htmlFor="passwordInput"
                  >
                    Kata Sandi
                  </label>
                  <span className="font-label-sm text-[11px] text-secondary">
                    (Akun Showroom: admin_otista)
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined text-outline text-[20px] absolute left-3 pointer-events-none">
                    lock
                  </span>
                  <input
                    id="passwordInput"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md pl-10 pr-10 py-2.5 rounded-lg border border-outline-variant/60 shadow-sm focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary/20 placeholder:text-outline transition-all duration-200"
                    placeholder="••••••••••••"
                    required
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    aria-label="Toggle password visibility"
                    className="absolute right-3 text-outline hover:text-primary rounded p-1 transition-all flex items-center justify-center cursor-pointer"
                    onClick={() => setShowPassword((prev) => !prev)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px] select-none">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me & Demo Helper */}
              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                    type="checkbox"
                  />
                  <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-surface transition-colors">
                    Ingat sesi login
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="font-label-md text-label-md text-surface-tint hover:text-primary transition-colors hover:underline cursor-pointer"
                >
                  Isi Kredensial Admin
                </button>
              </div>

              {/* Submit Button */}
              <button
                disabled={isLoading}
                className="mt-space-xs w-full bg-primary hover:bg-primary-container text-on-primary py-3 px-space-md rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-space-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-75 group"
                type="submit"
              >
                {isLoading ? (
                  <span>Memverifikasi...</span>
                ) : (
                  <>
                    <span>Masuk ke Konsol</span>
                    <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Post-Authentication Success Banner */}
            {authSuccess && (
              <div className="mt-space-md bg-secondary-container/40 border border-primary-container/30 rounded-xl p-space-md transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">
                      verified_user
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-label-md text-label-md font-bold text-primary flex items-center gap-1.5">
                      <span>Sesi Terautentikasi</span>
                      <span className="inline-block w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary">
                      Masuk sebagai{" "}
                      <strong className="text-on-surface">admin_otista</strong>{" "}
                      (Admin Showroom)
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href="/admin/dashboard"
                    className="flex-1 bg-primary hover:bg-primary-container text-on-primary py-2 px-3 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 shadow transition-all"
                  >
                    <span>Lanjut ke Dashboard Konsol</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Developer Helper Badge */}
            <div className="mt-space-lg bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between gap-space-xs border border-outline-variant/30">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[16px]">
                  vpn_key
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Akun:{" "}
                  <span className="font-bold text-on-surface">
                    admin_otista
                  </span>{" "}
                  (Showroom Roda.Motorku)
                </span>
              </div>
              <button
                className="font-label-sm text-label-sm text-primary hover:text-primary-container hover:bg-surface-container-high px-2.5 py-1 rounded bg-surface-container-highest font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1 border border-outline-variant/40"
                onClick={handleFillDemo}
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">
                  bolt
                </span>
                Gunakan
              </button>
            </div>

            {/* Back to Public Catalog Link */}
            <div className="mt-space-md pt-space-sm flex justify-center">
              <Link
                className="inline-flex items-center gap-space-xs text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer group"
                href="/"
              >
                <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:-translate-x-1">
                  keyboard_backspace
                </span>
                <span>Kembali ke Katalog Motor Publik</span>
              </Link>
            </div>
          </div>

          {/* Bottom System Status Indicators */}
          <div className="w-full max-w-[460px] mt-space-md flex flex-col items-center gap-space-xs text-center px-space-sm">
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 text-center">
              © 2026 RODA.MOTORKU — Panel Administrasi Showroom Motor Bekas
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] py-space-md">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin flex items-center justify-between gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
          <p>© 2026 RODA.MOTORKU Indonesia.</p>
          <Link
            className="hover:text-primary transition-colors font-label-sm text-label-sm"
            href="/"
          >
            Katalog Publik
          </Link>
        </div>
      </footer>
    </div>
  );
}
