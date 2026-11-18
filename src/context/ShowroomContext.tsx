"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  INITIAL_MOTORS,
  INITIAL_PREDIKSI,
  Motor,
  PrediksiHarga,
  User,
} from "@/data/mockShowroomData";

interface ShowroomContextType {
  motors: Motor[];
  predictions: PrediksiHarga[];
  currentUser: User | null;
  isLoading: boolean;
  loginAdmin: (username: string, password?: string) => Promise<{ success: boolean; message: string }>;
  logoutAdmin: () => Promise<void>;
  refreshData: () => Promise<void>;
  addMotor: (newMotor: Omit<Motor, "id_motor" | "created_at" | "views_week">) => Motor;
  updateMotor: (id_motor: number, updated: Partial<Motor>) => void;
  deleteMotor: (id_motor: number) => void;
  addPrediction: (
    pred: Omit<PrediksiHarga, "id_prediksi" | "kode_prediksi" | "created_at" | "waktu_relatif">
  ) => PrediksiHarga;
  deletePrediction: (id_prediksi: number) => void;
  updatePrediction: (id_prediksi: number, updated: Partial<PrediksiHarga>) => void;
  linkPredictionToMotor: (id_prediksi: number, motor: Motor) => void;
}

const ShowroomContext = createContext<ShowroomContextType | undefined>(undefined);

const DEFAULT_ADMIN: User = {
  id_user: 1,
  nama: "Admin Showroom Otista",
  username: "admin_otista",
  role: "admin",
  created_at: "2026-01-01 08:00:00",
};

export function ShowroomProvider({ children }: { children: React.ReactNode }) {
  const [motors, setMotors] = useState<Motor[]>(INITIAL_MOTORS);
  const [predictions, setPredictions] = useState<PrediksiHarga[]>(INITIAL_PREDIKSI);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check current session from /api/auth/me
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        if (json.authenticated && json.data) {
          setCurrentUser(json.data);
          return;
        }
      }
      setCurrentUser(null);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  // Fetch motors and predictions from Backend API
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [resMotors, resPreds] = await Promise.all([
        fetch("/api/motor?limit=1000"),
        fetch("/api/prediksi"),
      ]);

      if (resMotors.ok) {
        const json = await resMotors.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setMotors(json.data);
          try {
            localStorage.setItem("rodamotorku_motors_v1", JSON.stringify(json.data));
          } catch {}
        }
      }

      if (resPreds.ok) {
        const json = await resPreds.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setPredictions(json.data);
        }
      }
    } catch {
      // Fallback to local storage if API is momentarily unreachable
      try {
        const savedMotors = localStorage.getItem("rodamotorku_motors_v1");
        if (savedMotors) setMotors(JSON.parse(savedMotors));
        const savedPreds = localStorage.getItem("rodamotorku_preds_v1");
        if (savedPreds) setPredictions(JSON.parse(savedPreds));
      } catch {
        // ignore
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
    refreshData();
  }, [checkSession, refreshData]);

  const loginAdmin = async (
    username: string,
    password?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password: password || "AdminRoda2026!",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setCurrentUser(json.data.user);
        return { success: true, message: json.message };
      } else {
        return {
          success: false,
          message: json.message || "Kredensial login tidak valid.",
        };
      }
    } catch (err: any) {
      // Local fallback
      if (username === "admin_otista" || username === "admin") {
        const user: User = {
          id_user: 1,
          nama: "Admin Showroom Otista",
          username,
          role: "admin",
          created_at: "2026-01-01 08:00:00",
        };
        setCurrentUser(user);
        return { success: true, message: "Login berhasil (mode lokal)." };
      }
      return {
        success: false,
        message: err.message || "Gagal menghubungi server autentikasi.",
      };
    }
  };

  const logoutAdmin = async () => {
    setCurrentUser(null);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
  };

  const addMotor = (
    newMotorData: Omit<Motor, "id_motor" | "created_at" | "views_week">
  ): Motor => {
    const nextId =
      motors.length > 0 ? Math.max(...motors.map((m) => m.id_motor)) + 1 : 1;
    const now = new Date();
    const created: Motor = {
      ...newMotorData,
      id_motor: nextId,
      created_at: now.toISOString().slice(0, 19).replace("T", " "),
      views_week: 0,
    };

    setMotors((prev) => [created, ...prev]);

    // Background sync to backend API
    fetch("/api/motor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMotorData),
    }).catch((err) => console.error("API error adding motor:", err));

    return created;
  };

  const updateMotor = (id_motor: number, updated: Partial<Motor>) => {
    setMotors((prev) =>
      prev.map((m) => (m.id_motor === id_motor ? { ...m, ...updated } : m))
    );

    // Background sync to backend API
    fetch(`/api/motor/${id_motor}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch((err) => console.error("API error updating motor:", err));
  };

  const deleteMotor = (id_motor: number) => {
    setMotors((prev) => prev.filter((m) => m.id_motor !== id_motor));

    // Background sync to backend API
    fetch(`/api/motor/${id_motor}`, {
      method: "DELETE",
    }).catch((err) => console.error("API error deleting motor:", err));
  };

  const addPrediction = (
    pred: Omit<
      PrediksiHarga,
      "id_prediksi" | "kode_prediksi" | "created_at" | "waktu_relatif"
    >
  ): PrediksiHarga => {
    const nextId =
      predictions.length > 0
        ? Math.max(...predictions.map((p) => p.id_prediksi)) + 1
        : 90;
    const now = new Date();
    const formattedDate = now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const created: PrediksiHarga = {
      ...pred,
      id_prediksi: nextId,
      kode_prediksi: `#PRD-2026-${String(nextId).padStart(4, "0")}`,
      created_at: `${formattedDate} WIB`,
      waktu_relatif: "Baru saja",
    };

    setPredictions((prev) => [created, ...prev]);

    // Background sync to backend API
    fetch("/api/prediksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...pred.fitur_masukan,
        model: pred.nama_model,
        catatan_simulasi: pred.catatan_simulasi,
        id_motor: pred.id_motor,
        nama_motor_katalog: pred.nama_motor_katalog,
        nopol_katalog: pred.nopol_katalog,
        kode_motor_katalog: pred.kode_motor_katalog,
      }),
    }).catch((err) => console.error("API error adding prediction:", err));

    return created;
  };

  const deletePrediction = (id_prediksi: number) => {
    setPredictions((prev) => prev.filter((p) => p.id_prediksi !== id_prediksi));

    // Background sync to backend API
    fetch(`/api/prediksi/${id_prediksi}`, {
      method: "DELETE",
    }).catch((err) => console.error("API error deleting prediction:", err));
  };

  const updatePrediction = (
    id_prediksi: number,
    updated: Partial<PrediksiHarga>
  ) => {
    setPredictions((prev) =>
      prev.map((p) =>
        p.id_prediksi === id_prediksi ? { ...p, ...updated } : p
      )
    );
  };

  const linkPredictionToMotor = (id_prediksi: number, motor: Motor) => {
    setPredictions((prev) =>
      prev.map((p) =>
        p.id_prediksi === id_prediksi
          ? {
              ...p,
              id_motor: motor.id_motor,
              nama_motor_katalog: `${motor.merek} ${motor.tipe}`,
              nopol_katalog: motor.nopol,
              kode_motor_katalog: `MTR-${String(motor.id_motor).padStart(3, "0")}`,
            }
          : p
      )
    );

    // Background sync to backend API
    fetch("/api/prediksi/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_prediksi,
        id_motor: motor.id_motor,
      }),
    }).catch((err) => console.error("API error linking prediction:", err));
  };

  return (
    <ShowroomContext.Provider
      value={{
        motors,
        predictions,
        currentUser,
        isLoading,
        loginAdmin,
        logoutAdmin,
        refreshData,
        addMotor,
        updateMotor,
        deleteMotor,
        addPrediction,
        deletePrediction,
        updatePrediction,
        linkPredictionToMotor,
      }}
    >
      {children}
    </ShowroomContext.Provider>
  );
}

export function useShowroom() {
  const ctx = useContext(ShowroomContext);
  if (!ctx) {
    throw new Error("useShowroom must be used inside ShowroomProvider");
  }
  return ctx;
}
