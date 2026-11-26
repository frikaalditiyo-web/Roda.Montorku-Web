import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const safeName = path.basename(filename);
    if (!safeName || !/^[a-zA-Z0-9_.-]+$/.test(safeName)) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const ext = path.extname(safeName).toLowerCase();
    const contentType = MIME_MAP[ext];
    if (!contentType) {
      return NextResponse.json({ error: "Unsupported type" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", safeName);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load file" }, { status: 500 });
  }
}
