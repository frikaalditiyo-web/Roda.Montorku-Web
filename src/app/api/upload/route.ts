import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAuthenticatedUser } from "@/lib/auth";

function detectImageExtension(buffer: Buffer): "jpg" | "png" | "webp" | null {
  if (buffer.length < 12) return null;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }
  // WebP: RIFF....WEBP
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akses ditolak. Sesi admin aktif diperlukan untuk mengunggah file foto.",
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Tidak ada file yang diunggah" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: "Ukuran file terlalu besar. Maksimal 5MB.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detectedExt = detectImageExtension(buffer);
    if (!detectedExt) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Isi berkas gambar tidak valid. Harap unggah gambar JPG, PNG, atau WebP asli.",
        },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const baseName = path
      .parse(file.name)
      .name.replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 48) || "motor";
    const uniqueFileName = `${Date.now()}_${baseName}.${detectedExt}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    fs.writeFileSync(filePath, buffer);

    // Serve through /api/upload/[filename] so runtime uploads work in both next dev & next start
    const publicUrl = `/api/upload/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      message: "Foto berhasil diunggah",
      url: publicUrl,
      filename: uniqueFileName,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal mengunggah file foto";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
