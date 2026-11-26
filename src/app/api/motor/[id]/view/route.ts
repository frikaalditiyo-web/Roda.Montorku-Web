import { NextRequest, NextResponse } from "next/server";
import { getMotorById, incrementMotorViews } from "@/lib/repository";

const VIEW_COOLDOWN_MS = 60 * 1000;

const globalForViewThrottle = globalThis as unknown as {
  motorViewCooldown?: Map<string, number>;
};

function getCooldownMap(): Map<string, number> {
  if (!globalForViewThrottle.motorViewCooldown) {
    globalForViewThrottle.motorViewCooldown = new Map();
  }
  return globalForViewThrottle.motorViewCooldown;
}

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

    const forwarded = request.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : "local";
    const key = `${clientIp}:${motorId}`;
    const cooldownMap = getCooldownMap();
    const now = Date.now();

    if (cooldownMap.size > 1000) {
      for (const [k, exp] of cooldownMap.entries()) {
        if (now >= exp) cooldownMap.delete(k);
      }
    }

    const expiresAt = cooldownMap.get(key);
    if (expiresAt && now < expiresAt) {
      const existing = await getMotorById(motorId);
      if (!existing) {
        return NextResponse.json(
          { success: false, message: "Motor tidak ditemukan" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: {
          id_motor: motorId,
          views_week: existing.views_week,
          throttled: true,
        },
      });
    }

    const views = await incrementMotorViews(motorId);
    if (views === null) {
      return NextResponse.json(
        { success: false, message: "Motor tidak ditemukan" },
        { status: 404 }
      );
    }

    cooldownMap.set(key, now + VIEW_COOLDOWN_MS);

    return NextResponse.json({
      success: true,
      data: { id_motor: motorId, views_week: views, throttled: false },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to record view";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
