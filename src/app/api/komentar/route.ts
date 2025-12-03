import { NextResponse } from "next/server";
import { PrismaKomentarRepository } from "@/infrastructure/repositories/PrismaKomentarRepository";
import { PrismaPelaporRepository } from "@/infrastructure/repositories/PrismaPelaporRepository";
import { AddKomentarUseCase } from "@/core/usecases/AddKomentarUseCase";

// POST: Kirim Komentar Baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const deviceId = request.headers.get("x-device-id");

    if (!deviceId) throw new Error("Akses ditolak (No Device ID).");

    const komentarRepo = new PrismaKomentarRepository();
    const pelaporRepo = new PrismaPelaporRepository();
    const useCase = new AddKomentarUseCase(komentarRepo, pelaporRepo);

    await useCase.execute(body.isi, body.laporanId, deviceId, body.parentId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// GET: Ambil daftar komentar berdasarkan laporanId
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const laporanId = searchParams.get("laporanId");

  if (!laporanId) return NextResponse.json({ success: false, data: [] });

  const repo = new PrismaKomentarRepository();
  const data = await repo.getByLaporanId(laporanId);

  return NextResponse.json({ success: true, data });
}

// DELETE: Hapus Komentar (Khusus Admin)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) throw new Error("ID Komentar diperlukan");
    
    const repo = new PrismaKomentarRepository();
    await repo.delete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}