import { NextResponse } from "next/server";
import { PrismaLaporanRepository } from "@/infrastructure/repositories/PrismaLaporanRepository";

export async function POST(request: Request) {
  const body = await request.json();
  const deviceId = request.headers.get("x-device-id");

  if (!deviceId) return NextResponse.json({ error: "No Device ID" }, { status: 400 });

  const repo = new PrismaLaporanRepository();
  const isLiked = await repo.toggleLike(body.laporanId, deviceId);

  return NextResponse.json({ success: true, isLiked });
}