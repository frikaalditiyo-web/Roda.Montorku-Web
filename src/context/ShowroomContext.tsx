"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  Motor,
  PrediksiHarga,
  User,
  ModelMetric,
} from "@/data/mockShowroomData";

export interface DashboardStats {
  database: "postgresql" | "json-fallback";
  inventory: {
    total: number;
    available: number;
    sold: number;
    added_last_7_days: number;
    available_pct: number;
    total_inventory_value: number;
    total_purchase_value: number;
    potential_margin: number;
    brand_distribution: Record<string, number>;
  };
  predictions: {
    total_count: number;
    linked_count: number;
    recent: PrediksiHarga[];
  };
  models: ModelMetric[];
}

export interface ApiMutationResult<T = void> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ShowroomContextType {
  motors: Motor[];
  predictions: PrediksiHarga[];
  currentUser: User | null;
  dashboardStats: DashboardStats | null;
  isLoading: boolean;
  loginAdmin: (
    username: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; message: string }>;
  logoutAdmin: () => Promise<void>;
  refreshData: (includeAdmin?: boolean) => Promise<void>;
  ensureAdminData: () => Promise<void>;
  addMotor: (
    newMotor: Omit<Motor, "id_motor" | "created_at" | "views_week">
  ) => Promise<ApiMutationResult<Motor>>;
  updateMotor: (
    id_motor: number,
    updated: Partial<Motor>
  ) => Promise<ApiMutationResult<Motor>>;
  deleteMotor: (id_motor: number) => Promise<ApiMutationResult>;
  addPrediction: (
    pred: Omit<
      PrediksiHarga,
      "id_prediksi" | "kode_prediksi" | "created_at" | "waktu_relatif"
    >
  ) => Promise<ApiMutationResult<PrediksiHarga>>;
  deletePrediction: (id_prediksi: number) => Promise<ApiMutationResult>;
  updatePrediction: (
    id_prediksi: number,
    updated: { harga_estimasi?: number; catatan_simulasi?: string }
  ) => Promise<ApiMutationResult<PrediksiHarga>>;
  linkPredictionToMotor: (
    id_prediksi: number,
    motor: Motor
  ) => Promise<ApiMutationResult<PrediksiHarga>>;
}

const ShowroomContext = createContext<ShowroomContextType | undefined>(undefined);

export function ShowroomProvider({ children }: { children: React.ReactNode }) {
  const [motors, setMotors] = useState<Motor[]>([]);
  const [predictions, setPredictions] = useState<PrediksiHarga[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.authenticated && json.data) {
          setCurrentUser(json.data);
          return true;
        }
      }
      setCurrentUser(null);
      return false;
    } catch {
      setCurrentUser(null);
      return false;
    }
  }, []);

  const refreshData = useCallback(async (includeAdmin = false) => {
    try {
      const requests: Promise<Response>[] = [
        fetch("/api/motor?limit=2000", { cache: "no-store" }),
      ];
      if (includeAdmin) {
        requests.push(
          fetch("/api/prediksi", { cache: "no-store" }),
          fetch("/api/stats", { cache: "no-store" })
        );
      }

      const [resMotors, resPreds, resStats] = await Promise.all(requests);

      if (resMotors?.ok) {
        const json = await resMotors.json();
        if (Array.isArray(json.data)) {
          setMotors(json.data);
          try {
            // Strip sensitive acquisition pricing before caching in localStorage
            const publicCache = (json.data as Motor[]).map((item) => {
              const { harga_beli: _hb, id_user: _uid, ...rest } = item;
              void _hb;
              void _uid;
              return rest;
            });
            localStorage.setItem(
              "rodamotorku_motors_v1",
              JSON.stringify(publicCache)
            );
          } catch {
            // ignore storage quota
          }
        }
      }

      if (resPreds?.ok) {
        const json = await resPreds.json();
        if (Array.isArray(json.data)) {
          setPredictions(json.data);
        }
      }

      if (resStats?.ok) {
        const json = await resStats.json();
        if (json.success && json.data) {
          setDashboardStats(json.data);
        }
      }
    } catch {
      try {
        const savedMotors = localStorage.getItem("rodamotorku_motors_v1");
        if (savedMotors) setMotors(JSON.parse(savedMotors));
      } catch {
        // ignore
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const ensureAdminData = useCallback(async () => {
    const isAuth = await checkSession();
    await refreshData(isAuth);
  }, [checkSession, refreshData]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      const isAdminRoute =
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin");

      if (!active) return;
      if (isAdminRoute) {
        await ensureAdminData();
      } else {
        await refreshData(false);
      }
    };
    void init();
    return () => {
      active = false;
    };
  }, [ensureAdminData, refreshData]);

  const loginAdmin = async (
    username: string,
    password: string,
    rememberMe = true
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          rememberMe,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setCurrentUser(json.data.user);
        await refreshData(true);
        return { success: true, message: json.message };
      }
      return {
        success: false,
        message: json.message || "Kredensial login tidak valid.",
      };
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal menghubungi server autentikasi.";
      return {
        success: false,
        message: msg,
      };
    }
  };

  const logoutAdmin = async () => {
    setCurrentUser(null);
    setDashboardStats(null);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
  };

  const addMotor = async (
    newMotorData: Omit<Motor, "id_motor" | "created_at" | "views_week">
  ): Promise<ApiMutationResult<Motor>> => {
    try {
      const res = await fetch("/api/motor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMotorData),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        return {
          success: false,
          message: json.message || "Gagal menambahkan unit motor.",
        };
      }
      const created: Motor = json.data;
      setMotors((prev) => [created, ...prev]);
      return { success: true, data: created, message: json.message };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghubungi server.";
      return { success: false, message: msg };
    }
  };

  const updateMotor = async (
    id_motor: number,
    updated: Partial<Motor>
  ): Promise<ApiMutationResult<Motor>> => {
    try {
      const res = await fetch(`/api/motor/${id_motor}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        return {
          success: false,
          message: json.message || "Gagal memperbarui data motor.",
        };
      }
      const saved: Motor = json.data;
      setMotors((prev) =>
        prev.map((m) => (m.id_motor === id_motor ? saved : m))
      );
      return { success: true, data: saved, message: json.message };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghubungi server.";
      return { success: false, message: msg };
    }
  };

  const deleteMotor = async (id_motor: number): Promise<ApiMutationResult> => {
    try {
      const res = await fetch(`/api/motor/${id_motor}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return {
          success: false,
          message: json.message || "Gagal menghapus motor.",
        };
      }
      setMotors((prev) => prev.filter((m) => m.id_motor !== id_motor));
      setPredictions((prev) =>
        prev.map((p) => (p.id_motor === id_motor ? { ...p, id_motor: null } : p))
      );
      return { success: true, message: json.message };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghubungi server.";
      return { success: false, message: msg };
    }
  };

  const addPrediction = async (
    pred: Omit<
      PrediksiHarga,
      "id_prediksi" | "kode_prediksi" | "created_at" | "waktu_relatif"
    >
  ): Promise<ApiMutationResult<PrediksiHarga>> => {
    try {
      const res = await fetch("/api/prediksi", {
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
          save_to_history: true,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.data?.saved_record) {
        return {
          success: false,
          message: json.message || "Gagal menyimpan riwayat prediksi.",
        };
      }
      const saved: PrediksiHarga = json.data.saved_record;
      setPredictions((prev) => [saved, ...prev]);
      return { success: true, data: saved };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghubungi server.";
      return { success: false, message: msg };
    }
  };

  const updatePrediction = async (
    id_prediksi: number,
    updated: { harga_estimasi?: number; catatan_simulasi?: string }
  ): Promise<ApiMutationResult<PrediksiHarga>> => {
    try {
      const res = await fetch(`/api/prediksi/${id_prediksi}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        return {
          success: false,
          message: json.message || "Gagal memperbarui riwayat prediksi.",
        };
      }
      const saved: PrediksiHarga = json.data;
      setPredictions((prev) =>
        prev.map((p) => (p.id_prediksi === id_prediksi ? saved : p))
      );
      return { success: true, data: saved, message: json.message };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghubungi server.";
      return { success: false, message: msg };
    }
  };

  const deletePrediction = async (
    id_prediksi: number
  ): Promise<ApiMutationResult> => {
    try {
      const res = await fetch(`/api/prediksi/${id_prediksi}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return {
          success: false,
          message: json.message || "Gagal menghapus riwayat prediksi.",
        };
      }
      setPredictions((prev) =>
        prev.filter((p) => p.id_prediksi !== id_prediksi)
      );
      return { success: true, message: json.message };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghubungi server.";
      return { success: false, message: msg };
    }
  };

  const linkPredictionToMotor = async (
    id_prediksi: number,
    motor: Motor
  ): Promise<ApiMutationResult<PrediksiHarga>> => {
    try {
      const res = await fetch("/api/prediksi/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_prediksi,
          id_motor: motor.id_motor,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        return {
          success: false,
          message: json.message || "Gagal menautkan prediksi ke unit motor.",
        };
      }
      const linked: PrediksiHarga = json.data;
      setPredictions((prev) =>
        prev.map((p) => (p.id_prediksi === id_prediksi ? linked : p))
      );
      return { success: true, data: linked, message: json.message };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghubungi server.";
      return { success: false, message: msg };
    }
  };

  return (
    <ShowroomContext.Provider
      value={{
        motors,
        predictions,
        currentUser,
        dashboardStats,
        isLoading,
        loginAdmin,
        logoutAdmin,
        refreshData,
        ensureAdminData,
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
