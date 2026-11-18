import fs from "fs";
import path from "path";
import { pool } from "./db";
import { hashPassword } from "./auth";
import {
  INITIAL_MOTORS,
  INITIAL_PREDIKSI,
  Motor,
  PrediksiHarga,
} from "@/data/mockShowroomData";

export interface UserRecord {
  id_user: number;
  nama: string;
  username: string;
  password_hash: string;
  role: "admin";
  created_at: string;
}

interface StoreData {
  users: UserRecord[];
  motors: Motor[];
  predictions: PrediksiHarga[];
}

const STORE_PATH = path.join(process.cwd(), "src", "data", "db_store.json");

const DEFAULT_USERS: UserRecord[] = [
  {
    id_user: 1,
    nama: "Admin Showroom Otista",
    username: "admin_otista",
    password_hash: "AdminRoda2026!",
    role: "admin",
    created_at: "2026-01-01 08:00:00",
  },
];

// Helper: Ensure store file exists with default seed data
function getStore(): StoreData {
  let existingUsers = DEFAULT_USERS;
  let existingPreds = INITIAL_PREDIKSI;

  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, "utf8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.users) && parsed.users.length > 0) {
        existingUsers = parsed.users;
      }
      if (Array.isArray(parsed.predictions) && parsed.predictions.length > 0) {
        existingPreds = parsed.predictions;
      }

      // If already populated with the full 187 dataset units
      if (Array.isArray(parsed.motors) && parsed.motors.length >= 180) {
        return {
          users: existingUsers,
          motors: parsed.motors,
          predictions: existingPreds,
        };
      }
    }
  } catch {
    // fallback if file corrupted
  }

  // Seed with 187 real dataset motors
  const motorsData: Motor[] = INITIAL_MOTORS;

  const initialStore: StoreData = {
    users: existingUsers,
    motors: motorsData,
    predictions: existingPreds,
  };

  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(initialStore, null, 2), "utf8");
  } catch {
    // ignore
  }

  return initialStore;
}

function saveStore(data: StoreData) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save store:", err);
  }
}

// ----------------------------------------------------------------------
// USER AUTHENTICATION REPOSITORY METHODS
// ----------------------------------------------------------------------

export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  const store = getStore();
  const u = store.users.find(
    (user) => user.username.toLowerCase() === username.trim().toLowerCase()
  );
  return u || null;
}

export async function findUserById(id: number): Promise<UserRecord | null> {
  const store = getStore();
  const u = store.users.find((user) => user.id_user === id);
  return u || null;
}

export async function createUser(data: {
  nama: string;
  username: string;
  password: string;
  role?: "admin";
}): Promise<Omit<UserRecord, "password_hash">> {
  const store = getStore();

  const existing = store.users.find(
    (u) => u.username.toLowerCase() === data.username.trim().toLowerCase()
  );
  if (existing) {
    throw new Error(`Username '${data.username}' sudah terdaftar.`);
  }

  const nextId =
    store.users.length > 0
      ? Math.max(...store.users.map((u) => u.id_user)) + 1
      : 1;

  const now = new Date();
  const newUser: UserRecord = {
    id_user: nextId,
    nama: data.nama.trim(),
    username: data.username.trim().toLowerCase(),
    password_hash: hashPassword(data.password),
    role: data.role || "admin",
    created_at: now.toISOString().slice(0, 19).replace("T", " "),
  };

  store.users.push(newUser);
  saveStore(store);

  const { password_hash, ...safeUser } = newUser;
  return safeUser;
}

// ----------------------------------------------------------------------
// MOTOR REPOSITORY METHODS
// ----------------------------------------------------------------------

export async function getAllMotors(params?: {
  search?: string;
  brand?: string;
  year?: string;
  priceRange?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const store = getStore();
  let result = [...store.motors];

  if (params?.search) {
    const q = params.search.trim().toLowerCase();
    result = result.filter(
      (m) =>
        `${m.merek} ${m.tipe}`.toLowerCase().includes(q) ||
        m.domisili_samsat.toLowerCase().includes(q) ||
        m.nopol.toLowerCase().includes(q)
    );
  }

  if (params?.brand) {
    result = result.filter(
      (m) => m.merek.toLowerCase() === params.brand!.toLowerCase()
    );
  }

  if (params?.year) {
    if (params.year === "<2020") {
      result = result.filter((m) => m.tahun < 2020);
    } else {
      result = result.filter((m) => String(m.tahun) === params.year);
    }
  }

  if (params?.priceRange) {
    if (params.priceRange === "low") {
      result = result.filter((m) => m.harga_jual < 15000000);
    } else if (params.priceRange === "mid") {
      result = result.filter(
        (m) => m.harga_jual >= 15000000 && m.harga_jual <= 25000000
      );
    } else if (params.priceRange === "high") {
      result = result.filter((m) => m.harga_jual > 25000000);
    }
  }

  if (params?.status) {
    result = result.filter((m) => m.status === params.status);
  }

  const total = result.length;
  const page = params?.page && params.page > 0 ? params.page : 1;
  const limit = params?.limit && params.limit > 0 ? params.limit : total;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;
  const paginated = result.slice(offset, offset + limit);

  return {
    data: paginated,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

export async function getMotorById(id: number): Promise<Motor | null> {
  const store = getStore();
  const motor = store.motors.find((m) => m.id_motor === id);
  return motor || null;
}

export async function incrementMotorViews(id: number): Promise<number | null> {
  const store = getStore();
  const motor = store.motors.find((m) => m.id_motor === id);
  if (!motor) return null;

  motor.views_week = (motor.views_week || 0) + 1;
  saveStore(store);
  return motor.views_week;
}

export async function createMotor(
  motorData: Omit<Motor, "id_motor" | "created_at" | "views_week">
): Promise<Motor> {
  const store = getStore();
  const nextId =
    store.motors.length > 0
      ? Math.max(...store.motors.map((m) => m.id_motor)) + 1
      : 1;

  const now = new Date();
  const created: Motor = {
    ...motorData,
    id_motor: nextId,
    created_at: now.toISOString().slice(0, 19).replace("T", " "),
    views_week: 0,
  };

  store.motors.unshift(created);
  saveStore(store);
  return created;
}

export async function updateMotor(
  id: number,
  updatedData: Partial<Motor>
): Promise<Motor | null> {
  const store = getStore();
  const index = store.motors.findIndex((m) => m.id_motor === id);
  if (index === -1) return null;

  store.motors[index] = {
    ...store.motors[index],
    ...updatedData,
  };

  saveStore(store);
  return store.motors[index];
}

export async function deleteMotor(id: number): Promise<boolean> {
  const store = getStore();
  const beforeCount = store.motors.length;
  store.motors = store.motors.filter((m) => m.id_motor !== id);
  const deleted = store.motors.length < beforeCount;
  if (deleted) {
    saveStore(store);
  }
  return deleted;
}

// ----------------------------------------------------------------------
// PREDIKSI HARGA REPOSITORY METHODS
// ----------------------------------------------------------------------

export async function getAllPredictions(params?: {
  search?: string;
  model?: string;
  status?: string;
}) {
  const store = getStore();
  let result = [...store.predictions];

  if (params?.search) {
    const q = params.search.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.kode_prediksi.toLowerCase().includes(q) ||
        p.fitur_masukan.merek.toLowerCase().includes(q) ||
        (p.nama_motor_katalog || "").toLowerCase().includes(q) ||
        (p.nopol_katalog || "").toLowerCase().includes(q) ||
        p.nama_model.toLowerCase().includes(q)
    );
  }

  if (params?.model && params.model !== "all") {
    if (params.model === "rf") {
      result = result.filter((p) => p.nama_model.includes("Random Forest"));
    } else if (params.model === "lr") {
      result = result.filter((p) => p.nama_model.includes("Linear Regression"));
    } else if (params.model === "dt") {
      result = result.filter((p) => p.nama_model.includes("Decision Tree"));
    }
  }

  if (params?.status && params.status !== "all") {
    if (params.status === "catalog") {
      result = result.filter((p) => p.id_motor !== null);
    } else if (params.status === "unlinked") {
      result = result.filter((p) => p.id_motor === null);
    }
  }

  return result;
}

export async function createPrediction(
  predData: Omit<
    PrediksiHarga,
    "id_prediksi" | "kode_prediksi" | "created_at" | "waktu_relatif"
  >
): Promise<PrediksiHarga> {
  const store = getStore();
  const nextId =
    store.predictions.length > 0
      ? Math.max(...store.predictions.map((p) => p.id_prediksi)) + 1
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
    ...predData,
    id_prediksi: nextId,
    kode_prediksi: `#PRD-2026-${String(nextId).padStart(4, "0")}`,
    created_at: `${formattedDate} WIB`,
    waktu_relatif: "Baru saja",
  };

  store.predictions.unshift(created);
  saveStore(store);
  return created;
}

export async function deletePrediction(id: number): Promise<boolean> {
  const store = getStore();
  const beforeCount = store.predictions.length;
  store.predictions = store.predictions.filter((p) => p.id_prediksi !== id);
  const deleted = store.predictions.length < beforeCount;
  if (deleted) {
    saveStore(store);
  }
  return deleted;
}

export async function linkPredictionToMotor(
  id_prediksi: number,
  motor: Motor
): Promise<PrediksiHarga | null> {
  const store = getStore();
  const index = store.predictions.findIndex((p) => p.id_prediksi === id_prediksi);
  if (index === -1) return null;

  store.predictions[index] = {
    ...store.predictions[index],
    id_motor: motor.id_motor,
    nama_motor_katalog: `${motor.merek} ${motor.tipe}`,
    nopol_katalog: motor.nopol,
    kode_motor_katalog: `MTR-${String(motor.id_motor).padStart(3, "0")}`,
  };

  saveStore(store);
  return store.predictions[index];
}
