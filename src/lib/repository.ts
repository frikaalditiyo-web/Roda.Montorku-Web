import fs from "fs";
import path from "path";
import { pool, isPostgresAvailable } from "./db";
import { hashPassword } from "./auth";
import { MODEL_METRICS } from "./mlEngine";
import {
  INITIAL_MOTORS,
  INITIAL_PREDIKSI,
  Motor,
  FotoMotor,
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

const globalRepo = globalThis as unknown as {
  storeMutex: Promise<void> | undefined;
  pgBootstrapped: boolean | undefined;
  pgBootstrapPromise: Promise<void> | undefined;
};

function withStoreLock<T>(fn: () => Promise<T> | T): Promise<T> {
  const prev = globalRepo.storeMutex ?? Promise.resolve();
  let release!: () => void;
  const next = new Promise<void>((res) => {
    release = res;
  });
  globalRepo.storeMutex = next;
  return prev.then(fn).finally(() => release());
}

function getDefaultUsers(): UserRecord[] {
  return [
    {
      id_user: 1,
      nama: "Admin Showroom Roda.Motorku",
      username: "admin_otista",
      password_hash: hashPassword("AdminRoda2026!"),
      role: "admin",
      created_at: "2026-01-01 08:00:00",
    },
  ];
}

function formatDateNowSql(): string {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function formatPredictionTimestamp(d: Date | string): string {
  const dateObj = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return String(d);
  const formatted = dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formatted} WIB`;
}

function formatPgMotorTimestamp(val: unknown): string {
  if (val instanceof Date) {
    return val.toISOString().slice(0, 19).replace("T", " ");
  }
  return String(val || formatDateNowSql());
}

// ----------------------------------------------------------------------
// JSON FALLBACK STORE (Atomic & Serialized with Mutex)
// ----------------------------------------------------------------------

function getStore(): StoreData {
  let existingUsers = getDefaultUsers();
  let existingPreds = INITIAL_PREDIKSI;
  let needsMigrationSave = false;

  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, "utf8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.users) && parsed.users.length > 0) {
        existingUsers = parsed.users.map((u: UserRecord) => {
          if (u.password_hash && !u.password_hash.startsWith("scrypt:")) {
            needsMigrationSave = true;
            return { ...u, password_hash: hashPassword(u.password_hash) };
          }
          return u;
        });
      }
      if (Array.isArray(parsed.predictions) && parsed.predictions.length > 0) {
        existingPreds = parsed.predictions;
      }

      if (Array.isArray(parsed.motors) && parsed.motors.length > 0) {
        const result: StoreData = {
          users: existingUsers,
          motors: parsed.motors,
          predictions: existingPreds,
        };
        if (needsMigrationSave) {
          try {
            saveStoreAtomic(result);
          } catch (migrationErr) {
            console.warn("Read-path store migration skipped:", migrationErr);
          }
        }
        return result;
      }
    }
  } catch {
    // fallback if file unreadable or corrupted
  }

  const initialStore: StoreData = {
    users: existingUsers,
    motors: INITIAL_MOTORS,
    predictions: existingPreds,
  };
  try {
    saveStoreAtomic(initialStore);
  } catch (initErr) {
    console.warn("Initial JSON store persistence skipped:", initErr);
  }
  return initialStore;
}

function saveStoreAtomic(data: StoreData) {
  const serialized = JSON.stringify(data, null, 2);
  const tmpPath = `${STORE_PATH}.${process.pid}.${Date.now()}.tmp`;

  try {
    fs.writeFileSync(tmpPath, serialized, "utf8");
    try {
      fs.renameSync(tmpPath, STORE_PATH);
      return;
    } catch (renameErr) {
      const code = (renameErr as NodeJS.ErrnoException)?.code;
      if (code === "EPERM" || code === "EXDEV" || code === "EACCES") {
        // Fallback for Windows file locks or cross-device mounts when renameSync is blocked
        fs.writeFileSync(STORE_PATH, serialized, "utf8");
        return;
      }
      throw renameErr;
    }
  } catch (err) {
    console.error("Failed to save JSON store atomically:", err);
    throw err;
  } finally {
    try {
      if (fs.existsSync(tmpPath)) {
        fs.unlinkSync(tmpPath);
      }
    } catch {
      // Ignore temp cleanup errors
    }
  }
}

// ----------------------------------------------------------------------
// POSTGRESQL BOOTSTRAP & ROW MAPPERS
// ----------------------------------------------------------------------

async function shouldUsePostgres(): Promise<boolean> {
  const available = await isPostgresAvailable();
  if (!available) return false;
  if (!globalRepo.pgBootstrapped) {
    if (!globalRepo.pgBootstrapPromise) {
      globalRepo.pgBootstrapPromise = ensurePgSchemaAndSeed().finally(() => {
        globalRepo.pgBootstrapPromise = undefined;
      });
    }
    await globalRepo.pgBootstrapPromise;
  }
  return true;
}

async function ensurePgSchemaAndSeed(): Promise<void> {
  if (globalRepo.pgBootstrapped) return;
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id_user SERIAL PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS motor (
        id_motor SERIAL PRIMARY KEY,
        id_user INT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
        sku VARCHAR(50),
        nopol VARCHAR(30),
        merek VARCHAR(50) NOT NULL,
        tipe VARCHAR(100) NOT NULL,
        tahun INT NOT NULL,
        cc INT NOT NULL,
        kilometer INT NOT NULL,
        kondisi_mesin VARCHAR(50) NOT NULL,
        kelengkapan_dokumen VARCHAR(100) NOT NULL,
        domisili_samsat VARCHAR(100) NOT NULL,
        pajak_info VARCHAR(100),
        harga_beli BIGINT NOT NULL,
        harga_jual BIGINT NOT NULL,
        harga_pasar_coret BIGINT,
        deskripsi TEXT,
        status VARCHAR(20) DEFAULT 'Tersedia',
        views_week INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS foto_motor (
        id_foto SERIAL PRIMARY KEY,
        id_motor INT NOT NULL REFERENCES motor(id_motor) ON DELETE CASCADE,
        nama_file VARCHAR(500) NOT NULL,
        label VARCHAR(50),
        caption VARCHAR(255),
        is_utama BOOLEAN DEFAULT FALSE
      );
      CREATE TABLE IF NOT EXISTS prediksi_harga (
        id_prediksi SERIAL PRIMARY KEY,
        kode_prediksi VARCHAR(50) NOT NULL UNIQUE,
        id_user INT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
        id_motor INT REFERENCES motor(id_motor) ON DELETE SET NULL,
        nama_motor_katalog VARCHAR(100),
        nopol_katalog VARCHAR(30),
        kode_motor_katalog VARCHAR(50),
        catatan_simulasi VARCHAR(255),
        fitur_masukan JSONB NOT NULL,
        harga_estimasi BIGINT NOT NULL,
        spread_estimasi INT DEFAULT 350000,
        nama_model VARCHAR(100) NOT NULL,
        akurasi_r2 NUMERIC(5,2) NOT NULL,
        mae_rupiah BIGINT NOT NULL,
        rmse_rupiah BIGINT NOT NULL,
        detail_parameter_model VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const userRes = await client.query(`SELECT COUNT(*)::int AS cnt FROM users`);
    if (userRes.rows[0].cnt === 0) {
      const defAdmin = getDefaultUsers()[0];
      await client.query(
        `INSERT INTO users (id_user, nama, username, password_hash, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (username) DO NOTHING`,
        [defAdmin.id_user, defAdmin.nama, defAdmin.username, defAdmin.password_hash, defAdmin.role]
      );
    }

    const motorRes = await client.query(`SELECT COUNT(*)::int AS cnt FROM motor`);
    if (motorRes.rows[0].cnt === 0) {
      await client.query("BEGIN");
      for (const m of INITIAL_MOTORS) {
        await client.query(
          `INSERT INTO motor (id_motor, id_user, sku, nopol, merek, tipe, tahun, cc, kilometer, kondisi_mesin, kelengkapan_dokumen, domisili_samsat, pajak_info, harga_beli, harga_jual, harga_pasar_coret, deskripsi, status, views_week, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
          [
            m.id_motor,
            m.id_user || 1,
            m.sku,
            m.nopol,
            m.merek,
            m.tipe,
            m.tahun,
            m.cc,
            m.kilometer,
            m.kondisi_mesin,
            m.kelengkapan_dokumen,
            m.domisili_samsat,
            m.pajak_info,
            m.harga_beli,
            m.harga_jual,
            m.harga_pasar_coret ?? null,
            m.deskripsi,
            m.status,
            m.views_week,
            m.created_at,
          ]
        );
        for (const f of m.foto_motor) {
          await client.query(
            `INSERT INTO foto_motor (id_motor, nama_file, label, caption, is_utama) VALUES ($1,$2,$3,$4,$5)`,
            [m.id_motor, f.nama_file, f.label, f.caption, Boolean(f.is_utama)]
          );
        }
      }
      for (const p of INITIAL_PREDIKSI) {
        await client.query(
          `INSERT INTO prediksi_harga (id_prediksi, kode_prediksi, id_user, id_motor, nama_motor_katalog, nopol_katalog, kode_motor_katalog, catatan_simulasi, fitur_masukan, harga_estimasi, spread_estimasi, nama_model, akurasi_r2, mae_rupiah, rmse_rupiah, detail_parameter_model)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) ON CONFLICT DO NOTHING`,
          [
            p.id_prediksi,
            p.kode_prediksi,
            p.id_user,
            p.id_motor,
            p.nama_motor_katalog ?? null,
            p.nopol_katalog ?? null,
            p.kode_motor_katalog ?? null,
            p.catatan_simulasi ?? null,
            JSON.stringify(p.fitur_masukan),
            p.harga_estimasi,
            p.spread_estimasi,
            p.nama_model,
            p.akurasi_r2,
            p.mae_rupiah,
            p.rmse_rupiah,
            p.detail_parameter_model,
          ]
        );
      }
      await client.query("COMMIT");
    }

    // Always ensure SERIAL sequences match MAX(id) even if database was seeded externally
    await client.query(`
      SELECT setval(pg_get_serial_sequence('users', 'id_user'), COALESCE((SELECT MAX(id_user) FROM users), 1));
      SELECT setval(pg_get_serial_sequence('motor', 'id_motor'), COALESCE((SELECT MAX(id_motor) FROM motor), 1));
      SELECT setval(pg_get_serial_sequence('foto_motor', 'id_foto'), COALESCE((SELECT MAX(id_foto) FROM foto_motor), 1));
      SELECT setval(pg_get_serial_sequence('prediksi_harga', 'id_prediksi'), GREATEST(COALESCE((SELECT MAX(id_prediksi) FROM prediksi_harga), 89), 89));
    `);

    globalRepo.pgBootstrapped = true;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("PG bootstrap error:", err);
    throw err;
  } finally {
    client.release();
  }
}

function mapPgMotor(row: Record<string, unknown>, photos: FotoMotor[]): Motor {
  return {
    id_motor: Number(row.id_motor),
    id_user: Number(row.id_user),
    sku: String(row.sku || ""),
    nopol: String(row.nopol || ""),
    merek: row.merek as Motor["merek"],
    tipe: String(row.tipe),
    tahun: Number(row.tahun),
    cc: Number(row.cc),
    kilometer: Number(row.kilometer),
    kondisi_mesin: String(row.kondisi_mesin),
    kelengkapan_dokumen: String(row.kelengkapan_dokumen),
    domisili_samsat: String(row.domisili_samsat),
    pajak_info: String(row.pajak_info || "Pajak hidup aktif"),
    harga_beli: Number(row.harga_beli),
    harga_jual: Number(row.harga_jual),
    harga_pasar_coret: row.harga_pasar_coret
      ? Number(row.harga_pasar_coret)
      : undefined,
    deskripsi: String(row.deskripsi || ""),
    status: row.status as Motor["status"],
    created_at: formatPgMotorTimestamp(row.created_at),
    views_week: Number(row.views_week || 0),
    foto_motor: photos,
  };
}

function mapPgPrediction(row: Record<string, unknown>): PrediksiHarga {
  const fitur =
    typeof row.fitur_masukan === "string"
      ? JSON.parse(row.fitur_masukan)
      : row.fitur_masukan;
  return {
    id_prediksi: Number(row.id_prediksi),
    kode_prediksi: String(row.kode_prediksi),
    id_user: Number(row.id_user),
    id_motor: row.id_motor !== null && row.id_motor !== undefined ? Number(row.id_motor) : null,
    nama_motor_katalog: row.nama_motor_katalog
      ? String(row.nama_motor_katalog)
      : undefined,
    nopol_katalog: row.nopol_katalog ? String(row.nopol_katalog) : undefined,
    kode_motor_katalog: row.kode_motor_katalog
      ? String(row.kode_motor_katalog)
      : undefined,
    catatan_simulasi: row.catatan_simulasi
      ? String(row.catatan_simulasi)
      : undefined,
    fitur_masukan: fitur,
    harga_estimasi: Number(row.harga_estimasi),
    spread_estimasi: Number(row.spread_estimasi || 350000),
    nama_model: row.nama_model as PrediksiHarga["nama_model"],
    akurasi_r2: Number(row.akurasi_r2),
    mae_rupiah: Number(row.mae_rupiah),
    rmse_rupiah: Number(row.rmse_rupiah),
    detail_parameter_model: String(row.detail_parameter_model || ""),
    created_at: formatPredictionTimestamp(row.created_at as Date | string),
    waktu_relatif: "Tercatat",
  };
}

export async function getDatabaseMode(): Promise<"postgresql" | "json-fallback"> {
  return (await isPostgresAvailable()) ? "postgresql" : "json-fallback";
}

// ----------------------------------------------------------------------
// USER AUTHENTICATION REPOSITORY METHODS
// ----------------------------------------------------------------------

export async function findUserByUsername(
  username: string
): Promise<UserRecord | null> {
  const normalized = username.trim().toLowerCase();
  if (await shouldUsePostgres()) {
    const res = await pool.query(
      `SELECT id_user, nama, username, password_hash, role, created_at FROM users WHERE LOWER(username) = $1 LIMIT 1`,
      [normalized]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    let passwordHash = String(r.password_hash || "");
    if (passwordHash && !passwordHash.startsWith("scrypt:")) {
      passwordHash = hashPassword(passwordHash);
      await pool.query(`UPDATE users SET password_hash = $1 WHERE id_user = $2`, [
        passwordHash,
        Number(r.id_user),
      ]);
    }
    return {
      ...r,
      password_hash: passwordHash,
      id_user: Number(r.id_user),
      created_at: formatPgMotorTimestamp(r.created_at),
    };
  }

  const store = getStore();
  return (
    store.users.find((user) => user.username.toLowerCase() === normalized) ||
    null
  );
}

export async function findUserById(id: number): Promise<UserRecord | null> {
  if (await shouldUsePostgres()) {
    const res = await pool.query(
      `SELECT id_user, nama, username, password_hash, role, created_at FROM users WHERE id_user = $1 LIMIT 1`,
      [id]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      ...r,
      id_user: Number(r.id_user),
      created_at: formatPgMotorTimestamp(r.created_at),
    };
  }

  const store = getStore();
  return store.users.find((user) => user.id_user === id) || null;
}

export async function createUser(data: {
  nama: string;
  username: string;
  password: string;
  role?: "admin";
}): Promise<Omit<UserRecord, "password_hash">> {
  const normalizedUsername = data.username.trim().toLowerCase();
  const hashed = hashPassword(data.password);

  if (await shouldUsePostgres()) {
    const existing = await findUserByUsername(normalizedUsername);
    if (existing) {
      throw new Error(`Username '${data.username}' sudah terdaftar.`);
    }
    const res = await pool.query(
      `INSERT INTO users (nama, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id_user, nama, username, role, created_at`,
      [data.nama.trim(), normalizedUsername, hashed, data.role || "admin"]
    );
    const r = res.rows[0];
    return {
      id_user: Number(r.id_user),
      nama: r.nama,
      username: r.username,
      role: r.role,
      created_at: formatPgMotorTimestamp(r.created_at),
    };
  }

  return withStoreLock(() => {
    const store = getStore();
    const existing = store.users.find(
      (u) => u.username.toLowerCase() === normalizedUsername
    );
    if (existing) {
      throw new Error(`Username '${data.username}' sudah terdaftar.`);
    }

    const nextId =
      store.users.length > 0
        ? Math.max(...store.users.map((u) => u.id_user)) + 1
        : 1;

    const newUser: UserRecord = {
      id_user: nextId,
      nama: data.nama.trim(),
      username: normalizedUsername,
      password_hash: hashed,
      role: data.role || "admin",
      created_at: formatDateNowSql(),
    };

    store.users.push(newUser);
    saveStoreAtomic(store);

    const { password_hash: _ph, ...safeUser } = newUser;
    void _ph;
    return safeUser;
  });
}

// ----------------------------------------------------------------------
// MOTOR REPOSITORY METHODS
// ----------------------------------------------------------------------

function filterAndPaginateMotors(
  motors: Motor[],
  params?: {
    search?: string;
    brand?: string;
    year?: string;
    priceRange?: string;
    status?: string;
    page?: number;
    limit?: number;
  }
) {
  let result = [...motors];

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
    const sortedPrices = [...new Set(motors.map((m) => m.harga_jual))].sort(
      (a, b) => a - b
    );
    const lowCut = sortedPrices[Math.floor((sortedPrices.length - 1) / 3)] ?? 0;
    const highCut =
      sortedPrices[Math.floor(((sortedPrices.length - 1) * 2) / 3)] ?? 0;

    if (params.priceRange === "low") {
      result = result.filter((m) => m.harga_jual <= lowCut);
    } else if (params.priceRange === "mid") {
      result = result.filter(
        (m) => m.harga_jual > lowCut && m.harga_jual <= highCut
      );
    } else if (params.priceRange === "high") {
      result = result.filter((m) => m.harga_jual > highCut);
    }
  }

  if (params?.status) {
    result = result.filter((m) => m.status === params.status);
  }

  const total = result.length;
  const page = params?.page && params.page > 0 ? params.page : 1;
  const limit = params?.limit && params.limit > 0 ? params.limit : total || 1;
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

export async function getAllMotors(params?: {
  search?: string;
  brand?: string;
  year?: string;
  priceRange?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  if (await shouldUsePostgres()) {
    const motorsRes = await pool.query(
      `SELECT * FROM motor ORDER BY created_at DESC, id_motor ASC`
    );
    const photosRes = await pool.query(
      `SELECT id_foto, id_motor, nama_file, label, caption, is_utama FROM foto_motor ORDER BY is_utama DESC, id_foto ASC`
    );

    const photosByMotor = new Map<number, FotoMotor[]>();
    for (const r of photosRes.rows) {
      const mid = Number(r.id_motor);
      if (!photosByMotor.has(mid)) photosByMotor.set(mid, []);
      photosByMotor.get(mid)!.push({
        id_foto: Number(r.id_foto),
        id_motor: mid,
        nama_file: String(r.nama_file),
        label: String(r.label || "Foto"),
        caption: String(r.caption || ""),
        is_utama: Boolean(r.is_utama),
      });
    }

    const mapped = motorsRes.rows.map((r) =>
      mapPgMotor(r, photosByMotor.get(Number(r.id_motor)) || [])
    );
    return filterAndPaginateMotors(mapped, params);
  }

  const store = getStore();
  return filterAndPaginateMotors(store.motors, params);
}

export async function getMotorById(id: number): Promise<Motor | null> {
  if (await shouldUsePostgres()) {
    const motorRes = await pool.query(
      `SELECT * FROM motor WHERE id_motor = $1 LIMIT 1`,
      [id]
    );
    if (motorRes.rows.length === 0) return null;
    const photosRes = await pool.query(
      `SELECT id_foto, id_motor, nama_file, label, caption, is_utama FROM foto_motor WHERE id_motor = $1 ORDER BY is_utama DESC, id_foto ASC`,
      [id]
    );
    const photos: FotoMotor[] = photosRes.rows.map((r) => ({
      id_foto: Number(r.id_foto),
      id_motor: Number(r.id_motor),
      nama_file: String(r.nama_file),
      label: String(r.label || "Foto"),
      caption: String(r.caption || ""),
      is_utama: Boolean(r.is_utama),
    }));
    return mapPgMotor(motorRes.rows[0], photos);
  }

  const store = getStore();
  return store.motors.find((m) => m.id_motor === id) || null;
}

export async function incrementMotorViews(id: number): Promise<number | null> {
  if (await shouldUsePostgres()) {
    const res = await pool.query(
      `UPDATE motor SET views_week = COALESCE(views_week, 0) + 1 WHERE id_motor = $1 RETURNING views_week`,
      [id]
    );
    if (res.rows.length === 0) return null;
    return Number(res.rows[0].views_week);
  }

  return withStoreLock(() => {
    const store = getStore();
    const motor = store.motors.find((m) => m.id_motor === id);
    if (!motor) return null;
    motor.views_week = (motor.views_week || 0) + 1;
    saveStoreAtomic(store);
    return motor.views_week;
  });
}

export async function createMotor(
  motorData: Omit<Motor, "id_motor" | "created_at" | "views_week" | "harga_beli"> & {
    harga_beli: number;
  }
): Promise<Motor> {
  if (await shouldUsePostgres()) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const res = await client.query(
        `INSERT INTO motor (id_user, sku, nopol, merek, tipe, tahun, cc, kilometer, kondisi_mesin, kelengkapan_dokumen, domisili_samsat, pajak_info, harga_beli, harga_jual, harga_pasar_coret, deskripsi, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         RETURNING *`,
        [
          motorData.id_user,
          motorData.sku,
          motorData.nopol,
          motorData.merek,
          motorData.tipe,
          motorData.tahun,
          motorData.cc,
          motorData.kilometer,
          motorData.kondisi_mesin,
          motorData.kelengkapan_dokumen,
          motorData.domisili_samsat,
          motorData.pajak_info,
          motorData.harga_beli,
          motorData.harga_jual,
          motorData.harga_pasar_coret ?? null,
          motorData.deskripsi,
          motorData.status,
        ]
      );
      const inserted = res.rows[0];
      const newId = Number(inserted.id_motor);
      const insertedPhotos: FotoMotor[] = [];

      for (const f of motorData.foto_motor || []) {
        const pfRes = await client.query(
          `INSERT INTO foto_motor (id_motor, nama_file, label, caption, is_utama) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
          [newId, f.nama_file, f.label, f.caption, Boolean(f.is_utama)]
        );
        const pf = pfRes.rows[0];
        insertedPhotos.push({
          id_foto: Number(pf.id_foto),
          id_motor: newId,
          nama_file: String(pf.nama_file),
          label: String(pf.label || "Foto"),
          caption: String(pf.caption || ""),
          is_utama: Boolean(pf.is_utama),
        });
      }
      await client.query("COMMIT");
      return mapPgMotor(inserted, insertedPhotos);
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  return withStoreLock(() => {
    const store = getStore();
    const nextId =
      store.motors.length > 0
        ? Math.max(...store.motors.map((m) => m.id_motor)) + 1
        : 1;

    const normalizedPhotos = (motorData.foto_motor || []).map((f, idx) => ({
      ...f,
      id_foto: f.id_foto || nextId * 10 + idx + 1,
      id_motor: nextId,
    }));

    const created: Motor = {
      ...motorData,
      id_motor: nextId,
      created_at: formatDateNowSql(),
      views_week: 0,
      foto_motor: normalizedPhotos,
    };

    store.motors.unshift(created);
    saveStoreAtomic(store);
    return created;
  });
}

export async function updateMotor(
  id: number,
  updatedData: Partial<Motor>
): Promise<Motor | null> {
  if (await shouldUsePostgres()) {
    const existing = await getMotorById(id);
    if (!existing) return null;

    const merged: Motor = { ...existing, ...updatedData, id_motor: id };
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const res = await client.query(
        `UPDATE motor SET
          sku = $1, nopol = $2, merek = $3, tipe = $4, tahun = $5, cc = $6,
          kilometer = $7, kondisi_mesin = $8, kelengkapan_dokumen = $9,
          domisili_samsat = $10, pajak_info = $11, harga_beli = $12,
          harga_jual = $13, harga_pasar_coret = $14, deskripsi = $15, status = $16
         WHERE id_motor = $17 RETURNING *`,
        [
          merged.sku,
          merged.nopol,
          merged.merek,
          merged.tipe,
          merged.tahun,
          merged.cc,
          merged.kilometer,
          merged.kondisi_mesin,
          merged.kelengkapan_dokumen,
          merged.domisili_samsat,
          merged.pajak_info,
          merged.harga_beli,
          merged.harga_jual,
          merged.harga_pasar_coret ?? null,
          merged.deskripsi,
          merged.status,
          id,
        ]
      );

      let finalPhotos = existing.foto_motor;
      if (Array.isArray(updatedData.foto_motor)) {
        await client.query(`DELETE FROM foto_motor WHERE id_motor = $1`, [id]);
        finalPhotos = [];
        for (const f of updatedData.foto_motor) {
          const pfRes = await client.query(
            `INSERT INTO foto_motor (id_motor, nama_file, label, caption, is_utama) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [id, f.nama_file, f.label, f.caption, Boolean(f.is_utama)]
          );
          const pf = pfRes.rows[0];
          finalPhotos.push({
            id_foto: Number(pf.id_foto),
            id_motor: id,
            nama_file: String(pf.nama_file),
            label: String(pf.label || "Foto"),
            caption: String(pf.caption || ""),
            is_utama: Boolean(pf.is_utama),
          });
        }
      }
      await client.query("COMMIT");
      return mapPgMotor(res.rows[0], finalPhotos);
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  return withStoreLock(() => {
    const store = getStore();
    const index = store.motors.findIndex((m) => m.id_motor === id);
    if (index === -1) return null;

    store.motors[index] = {
      ...store.motors[index],
      ...updatedData,
      id_motor: id,
    };

    saveStoreAtomic(store);
    return store.motors[index];
  });
}

export async function deleteMotor(id: number): Promise<boolean> {
  if (await shouldUsePostgres()) {
    const res = await pool.query(`DELETE FROM motor WHERE id_motor = $1`, [id]);
    return (res.rowCount || 0) > 0;
  }

  return withStoreLock(() => {
    const store = getStore();
    const beforeCount = store.motors.length;
    store.motors = store.motors.filter((m) => m.id_motor !== id);
    const deleted = store.motors.length < beforeCount;
    if (deleted) {
      // Unlink predictions pointing to removed motor (mirror ON DELETE SET NULL)
      store.predictions = store.predictions.map((p) =>
        p.id_motor === id ? { ...p, id_motor: null } : p
      );
      saveStoreAtomic(store);
    }
    return deleted;
  });
}

export async function seedAllDatasetMotors(): Promise<number> {
  if (await shouldUsePostgres()) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`TRUNCATE TABLE foto_motor, motor RESTART IDENTITY CASCADE`);
      for (const m of INITIAL_MOTORS) {
        await client.query(
          `INSERT INTO motor (id_motor, id_user, sku, nopol, merek, tipe, tahun, cc, kilometer, kondisi_mesin, kelengkapan_dokumen, domisili_samsat, pajak_info, harga_beli, harga_jual, harga_pasar_coret, deskripsi, status, views_week, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
          [
            m.id_motor,
            m.id_user || 1,
            m.sku,
            m.nopol,
            m.merek,
            m.tipe,
            m.tahun,
            m.cc,
            m.kilometer,
            m.kondisi_mesin,
            m.kelengkapan_dokumen,
            m.domisili_samsat,
            m.pajak_info,
            m.harga_beli,
            m.harga_jual,
            m.harga_pasar_coret ?? null,
            m.deskripsi,
            m.status,
            m.views_week,
            m.created_at,
          ]
        );
        for (const f of m.foto_motor) {
          await client.query(
            `INSERT INTO foto_motor (id_motor, nama_file, label, caption, is_utama) VALUES ($1,$2,$3,$4,$5)`,
            [m.id_motor, f.nama_file, f.label, f.caption, Boolean(f.is_utama)]
          );
        }
      }
      await client.query(`
        SELECT setval(pg_get_serial_sequence('motor', 'id_motor'), COALESCE((SELECT MAX(id_motor) FROM motor), 1));
        SELECT setval(pg_get_serial_sequence('foto_motor', 'id_foto'), COALESCE((SELECT MAX(id_foto) FROM foto_motor), 1));
      `);
      await client.query("COMMIT");
      return INITIAL_MOTORS.length;
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  return withStoreLock(() => {
    const store = getStore();
    store.motors = [...INITIAL_MOTORS];
    saveStoreAtomic(store);
    return store.motors.length;
  });
}

// ----------------------------------------------------------------------
// PREDIKSI HARGA REPOSITORY METHODS
// ----------------------------------------------------------------------

function filterPredictions(
  preds: PrediksiHarga[],
  params?: { search?: string; model?: string; status?: string }
) {
  let result = [...preds];

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

export async function getAllPredictions(params?: {
  search?: string;
  model?: string;
  status?: string;
}) {
  if (await shouldUsePostgres()) {
    const res = await pool.query(
      `SELECT * FROM prediksi_harga ORDER BY id_prediksi DESC`
    );
    return filterPredictions(res.rows.map(mapPgPrediction), params);
  }

  const store = getStore();
  return filterPredictions(store.predictions, params);
}

export async function getPredictionById(
  id: number
): Promise<PrediksiHarga | null> {
  if (await shouldUsePostgres()) {
    const res = await pool.query(
      `SELECT * FROM prediksi_harga WHERE id_prediksi = $1 LIMIT 1`,
      [id]
    );
    if (res.rows.length === 0) return null;
    return mapPgPrediction(res.rows[0]);
  }

  const store = getStore();
  return store.predictions.find((p) => p.id_prediksi === id) || null;
}

export async function createPrediction(
  predData: Omit<
    PrediksiHarga,
    "id_prediksi" | "kode_prediksi" | "created_at" | "waktu_relatif"
  >
): Promise<PrediksiHarga> {
  if (await shouldUsePostgres()) {
    const seqRes = await pool.query(
      `SELECT nextval(pg_get_serial_sequence('prediksi_harga', 'id_prediksi'))::int AS next_id`
    );
    const assignedId = Number(seqRes.rows[0].next_id);
    const kode = `#PRD-2026-${String(assignedId).padStart(4, "0")}`;
    const res = await pool.query(
      `INSERT INTO prediksi_harga (id_prediksi, kode_prediksi, id_user, id_motor, nama_motor_katalog, nopol_katalog, kode_motor_katalog, catatan_simulasi, fitur_masukan, harga_estimasi, spread_estimasi, nama_model, akurasi_r2, mae_rupiah, rmse_rupiah, detail_parameter_model)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [
        assignedId,
        kode,
        predData.id_user,
        predData.id_motor ?? null,
        predData.nama_motor_katalog ?? null,
        predData.nopol_katalog ?? null,
        predData.kode_motor_katalog ?? null,
        predData.catatan_simulasi ?? null,
        JSON.stringify(predData.fitur_masukan),
        predData.harga_estimasi,
        predData.spread_estimasi,
        predData.nama_model,
        predData.akurasi_r2,
        predData.mae_rupiah,
        predData.rmse_rupiah,
        predData.detail_parameter_model,
      ]
    );
    return mapPgPrediction(res.rows[0]);
  }

  return withStoreLock(() => {
    const store = getStore();
    const nextId =
      store.predictions.length > 0
        ? Math.max(...store.predictions.map((p) => p.id_prediksi)) + 1
        : 90;

    const created: PrediksiHarga = {
      ...predData,
      id_prediksi: nextId,
      kode_prediksi: `#PRD-2026-${String(nextId).padStart(4, "0")}`,
      created_at: formatPredictionTimestamp(new Date()),
      waktu_relatif: "Baru saja",
    };

    store.predictions.unshift(created);
    saveStoreAtomic(store);
    return created;
  });
}

export async function updatePrediction(
  id: number,
  updatedData: {
    harga_estimasi?: number;
    catatan_simulasi?: string;
  }
): Promise<PrediksiHarga | null> {
  if (await shouldUsePostgres()) {
    const existing = await getPredictionById(id);
    if (!existing) return null;

    const nextHarga =
      updatedData.harga_estimasi !== undefined
        ? updatedData.harga_estimasi
        : existing.harga_estimasi;
    const nextCatatan =
      updatedData.catatan_simulasi !== undefined
        ? updatedData.catatan_simulasi
        : existing.catatan_simulasi ?? null;

    const res = await pool.query(
      `UPDATE prediksi_harga SET harga_estimasi = $1, catatan_simulasi = $2 WHERE id_prediksi = $3 RETURNING *`,
      [nextHarga, nextCatatan, id]
    );
    return mapPgPrediction(res.rows[0]);
  }

  return withStoreLock(() => {
    const store = getStore();
    const index = store.predictions.findIndex((p) => p.id_prediksi === id);
    if (index === -1) return null;

    store.predictions[index] = {
      ...store.predictions[index],
      ...(updatedData.harga_estimasi !== undefined && {
        harga_estimasi: updatedData.harga_estimasi,
      }),
      ...(updatedData.catatan_simulasi !== undefined && {
        catatan_simulasi: updatedData.catatan_simulasi,
      }),
    };

    saveStoreAtomic(store);
    return store.predictions[index];
  });
}

export async function deletePrediction(id: number): Promise<boolean> {
  if (await shouldUsePostgres()) {
    const res = await pool.query(
      `DELETE FROM prediksi_harga WHERE id_prediksi = $1`,
      [id]
    );
    return (res.rowCount || 0) > 0;
  }

  return withStoreLock(() => {
    const store = getStore();
    const beforeCount = store.predictions.length;
    store.predictions = store.predictions.filter((p) => p.id_prediksi !== id);
    const deleted = store.predictions.length < beforeCount;
    if (deleted) {
      saveStoreAtomic(store);
    }
    return deleted;
  });
}

export async function linkPredictionToMotor(
  id_prediksi: number,
  motor: Motor
): Promise<PrediksiHarga | null> {
  const namaMotor = `${motor.merek} ${motor.tipe}`;
  const kodeMotor = `MTR-${String(motor.id_motor).padStart(3, "0")}`;

  if (await shouldUsePostgres()) {
    const res = await pool.query(
      `UPDATE prediksi_harga SET id_motor = $1, nama_motor_katalog = $2, nopol_katalog = $3, kode_motor_katalog = $4 WHERE id_prediksi = $5 RETURNING *`,
      [motor.id_motor, namaMotor, motor.nopol, kodeMotor, id_prediksi]
    );
    if (res.rows.length === 0) return null;
    return mapPgPrediction(res.rows[0]);
  }

  return withStoreLock(() => {
    const store = getStore();
    const index = store.predictions.findIndex(
      (p) => p.id_prediksi === id_prediksi
    );
    if (index === -1) return null;

    store.predictions[index] = {
      ...store.predictions[index],
      id_motor: motor.id_motor,
      nama_motor_katalog: namaMotor,
      nopol_katalog: motor.nopol,
      kode_motor_katalog: kodeMotor,
    };

    saveStoreAtomic(store);
    return store.predictions[index];
  });
}

// ----------------------------------------------------------------------
// DASHBOARD ANALYTICS AGGREGATION
// ----------------------------------------------------------------------

export async function getDashboardStats() {
  const motorsRes = await getAllMotors({ limit: 2000 });
  const motors = motorsRes.data;
  const predictions = await getAllPredictions();

  const totalMotors = motors.length;
  const availableMotors = motors.filter((m) => m.status === "Tersedia").length;
  const soldMotors = motors.filter((m) => m.status === "Terjual").length;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const addedLast7Days = motors.filter((m) => {
    const ts = new Date(m.created_at.replace(" ", "T")).getTime();
    return !isNaN(ts) && ts >= sevenDaysAgo;
  }).length;

  const totalInventoryValue = motors.reduce((sum, m) => sum + m.harga_jual, 0);
  const totalPurchaseValue = motors.reduce(
    (sum, m) => sum + (m.harga_beli ?? 0),
    0
  );
  const potentialMargin = totalInventoryValue - totalPurchaseValue;

  const brandCounts: Record<string, number> = {};
  for (const m of motors) {
    brandCounts[m.merek] = (brandCounts[m.merek] || 0) + 1;
  }

  const dbMode = await getDatabaseMode();

  return {
    database: dbMode,
    inventory: {
      total: totalMotors,
      available: availableMotors,
      sold: soldMotors,
      added_last_7_days: addedLast7Days,
      available_pct:
        totalMotors > 0 ? Math.round((availableMotors / totalMotors) * 100) : 0,
      total_inventory_value: totalInventoryValue,
      total_purchase_value: totalPurchaseValue,
      potential_margin: potentialMargin,
      brand_distribution: brandCounts,
    },
    predictions: {
      total_count: predictions.length,
      linked_count: predictions.filter((p) => p.id_motor !== null).length,
      recent: predictions.slice(0, 5),
    },
    models: MODEL_METRICS,
  };
}
