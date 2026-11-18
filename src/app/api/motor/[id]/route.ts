import { NextRequest, NextResponse } from "next/server";
import { getMotorById, updateMotor, deleteMotor } from "@/lib/repository";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
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

    const motor = await getMotorById(motorId);
    if (!motor) {
      return NextResponse.json(
        { success: false, message: "Motor tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: motor,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to get motor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Sesi admin aktif diperlukan untuk mengubah data motor." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const motorId = parseInt(id, 10);
    if (isNaN(motorId)) {
      return NextResponse.json(
        { success: false, message: "ID motor tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updated = await updateMotor(motorId, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Motor tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data motor berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update motor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Sesi admin aktif diperlukan untuk menghapus motor." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const motorId = parseInt(id, 10);
    if (isNaN(motorId)) {
      return NextResponse.json(
        { success: false, message: "ID motor tidak valid" },
        { status: 400 }
      );
    }

    const deleted = await deleteMotor(motorId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Motor tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Motor berhasil dihapus dari inventaris",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete motor" },
      { status: 500 }
    );
  }
}
