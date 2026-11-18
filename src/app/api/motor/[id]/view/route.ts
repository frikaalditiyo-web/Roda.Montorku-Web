import { NextRequest, NextResponse } from "next/server";
import { incrementMotorViews } from "@/lib/repository";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const motorId = parseInt(id, 10);
    if (isNaN(motorId)) {
      return NextResponse.json(
        { success: false, message: "ID motor tidak valid" },
        { status: 400 }
      );
    }

    const views = await incrementMotorViews(motorId);
    if (views === null) {
      return NextResponse.json(
        { success: false, message: "Motor tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id_motor: motorId, views_week: views },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to record view" },
      { status: 500 }
    );
  }
}
