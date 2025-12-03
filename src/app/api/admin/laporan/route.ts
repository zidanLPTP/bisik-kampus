import { NextResponse } from "next/server";
import { PrismaLaporanRepository } from "@/infrastructure/repositories/PrismaLaporanRepository";
import { StatusLaporan } from "@/core/entities/Laporan";

// GET: Admin mengambil daftar laporan berdasarkan status (Pending/Ditanggapi)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as StatusLaporan;

  if (!status) {
    return NextResponse.json({ success: false, error: "Status harus diisi" }, { status: 400 });
  }

  const repo = new PrismaLaporanRepository();
  const data = await repo.getByStatus(status);

  return NextResponse.json({ success: true, data });
}

// PATCH: Admin mengubah status laporan (Terima/Tolak/Selesai)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const repo = new PrismaLaporanRepository();

    await repo.updateStatus(id, status as StatusLaporan);

    return NextResponse.json({ success: true, message: "Status berhasil diubah" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal update" }, { status: 500 });
  }
}