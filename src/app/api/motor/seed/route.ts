import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { DATASET_187_MOTORS } from "@/data/dataset187Motors";
import { getAuthenticatedUser } from "@/lib/auth";

const STORE_PATH = path.join(process.cwd(), "src", "data", "db_store.json");

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Sesi admin aktif diperlukan untuk menjalankan seed dataset." },
        { status: 401 }
      );
    }

    const seededMotors = DATASET_187_MOTORS;

    // Update store
    let storeData: any = { motors: [], predictions: [], users: [] };
    if (fs.existsSync(STORE_PATH)) {
      try {
        storeData = JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
      } catch {
        // ignore
      }
    }
    storeData.motors = seededMotors;
    fs.writeFileSync(STORE_PATH, JSON.stringify(storeData, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor dan men-seed ${seededMotors.length} unit motor riil dari dataset Capstone ke basis data!`,
      total_imported: seededMotors.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal melakukan seeding dataset" },
      { status: 500 }
    );
  }
}
