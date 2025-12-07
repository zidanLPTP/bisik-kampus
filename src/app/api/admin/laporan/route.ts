import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"; 
import { CreateLaporanUseCase } from "@/core/usecases/CreateLaporanUseCase";
import { PrismaLaporanRepository } from "@/infrastructure/repositories/PrismaLaporanRepository";
import { PrismaPelaporRepository } from "@/infrastructure/repositories/PrismaPelaporRepository";

// SETUP REPO (Untuk POST/Input Laporan)
const laporanRepo = new PrismaLaporanRepository();
const pelaporRepo = new PrismaPelaporRepository();
const createLaporanUseCase = new CreateLaporanUseCase(laporanRepo, pelaporRepo);

// 1. WAJIB: Paksa Dinamis (Biar gak kena cache foto lama)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// HANDLE POST (Tetap sama, untuk buat laporan)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const deviceId = request.headers.get("x-device-id");

    if (!deviceId) {
      return NextResponse.json({ error: "Device ID tidak ditemukan" }, { status: 400 });
    }

    const laporanBaru = await createLaporanUseCase.execute({
      judul: body.judul,
      deskripsi: body.deskripsi,
      kategori: body.kategori,
      lokasi: body.lokasi,
      foto: body.foto || null,
      deviceId: deviceId,
    });

    return NextResponse.json({ success: true, data: laporanBaru }, { status: 201 });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// HANDLE GET (INI YANG KITA PERBAIKI TOTAL)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // Ambil param ?status=...

  try {
    // Logic Admin: Ambil data sesuai status yang diminta dashboard
    // Kita pakai prisma langsung biar bypass logic repository public
    const data = await prisma.laporan.findMany({
      where: status ? { status: status } : {}, // Kalau ada status, filter. Kalau gak, ambil semua.
      orderBy: {
        createdAt: 'desc' // Urutkan dari yang terbaru
      }
    });

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    return NextResponse.json({ success: false, data: [] });
  }
}