"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  loginAdmin: (username: string) => void;
  logoutAdmin: () => void;
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
  const [currentUser, setCurrentUser] = useState<User | null>(DEFAULT_ADMIN);

  useEffect(() => {
    try {
      const savedMotors = localStorage.getItem("rodamotorku_motors_v1");
      if (savedMotors) {
        setMotors(JSON.parse(savedMotors));
      }
      const savedPreds = localStorage.getItem("rodamotorku_preds_v1");
      if (savedPreds) {
        setPredictions(JSON.parse(savedPreds));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const persistMotors = (next: Motor[]) => {
    setMotors(next);
    try {
      localStorage.setItem("rodamotorku_motors_v1", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const persistPredictions = (next: PrediksiHarga[]) => {
    setPredictions(next);
    try {
      localStorage.setItem("rodamotorku_preds_v1", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const loginAdmin = (username: string) => {
    setCurrentUser({
      id_user: 1,
      nama: "Admin Showroom Otista",
      username,
      role: "admin",
      created_at: "2026-01-01 08:00:00",
    });
  };

  const logoutAdmin = () => {
    setCurrentUser(null);
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
      views_week: 12,
    };
    persistMotors([created, ...motors]);
    return created;
  };

  const updateMotor = (id_motor: number, updated: Partial<Motor>) => {
    const next = motors.map((m) =>
      m.id_motor === id_motor ? { ...m, ...updated } : m
    );
    persistMotors(next);
  };

  const deleteMotor = (id_motor: number) => {
    persistMotors(motors.filter((m) => m.id_motor !== id_motor));
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
    persistPredictions([created, ...predictions]);
    return created;
  };

  const deletePrediction = (id_prediksi: number) => {
    persistPredictions(predictions.filter((p) => p.id_prediksi !== id_prediksi));
  };

  const updatePrediction = (
    id_prediksi: number,
    updated: Partial<PrediksiHarga>
  ) => {
    const next = predictions.map((p) =>
      p.id_prediksi === id_prediksi ? { ...p, ...updated } : p
    );
    persistPredictions(next);
  };

  const linkPredictionToMotor = (id_prediksi: number, motor: Motor) => {
    const next = predictions.map((p) =>
      p.id_prediksi === id_prediksi
        ? {
            ...p,
            id_motor: motor.id_motor,
            nama_motor_katalog: `${motor.merek} ${motor.tipe}`,
            nopol_katalog: motor.nopol,
            kode_motor_katalog: `MTR-${String(motor.id_motor).padStart(3, "0")}`,
          }
        : p
    );
    persistPredictions(next);
  };

  return (
    <ShowroomContext.Provider
      value={{
        motors,
        predictions,
        currentUser,
        loginAdmin,
        logoutAdmin,
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
