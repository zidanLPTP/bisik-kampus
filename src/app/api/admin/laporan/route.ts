import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Pastikan file src/lib/prisma.ts ada
import { CreateLaporanUseCase } from "@/core/usecases/CreateLaporanUseCase";
import { PrismaLaporanRepository } from "@/infrastructure/repositories/PrismaLaporanRepository";
import { PrismaPelaporRepository } from "@/infrastructure/repositories/PrismaPelaporRepository";

// SETUP REPO (Untuk POST/Input Laporan)
const laporanRepo = new PrismaLaporanRepository();
const pelaporRepo = new PrismaPelaporRepository();
const createLaporanUseCase = new CreateLaporanUseCase(laporanRepo, pelaporRepo);

// 1. WAJIB: Paksa Dinamis (Agar data selalu fresh & tidak nyangkut)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// === GET: UNTUK MENAMPILKAN DATA DI DASHBOARD ===
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // Contoh: "Pending", "Ditanggapi", "Ditolak"

  try {
    let data;

    if (status) {
      // LOGIC ADMIN: Ambil data sesuai status yang diminta Dashboard
      data = await prisma.laporan.findMany({
        where: { 
            status: status // 👈 KUNCI: Filter sesuai tab yang diklik admin
        },
        orderBy: {
            createdAt: 'desc' // Urutkan dari yang paling baru masuk
        },
        // Include relasi agar tabel tidak error (butuh nama pelapor/foto)
        include: {
            pelapor: true,
            komentar: true, 
            likes: true
        }
      });
    } else {
      // Jaga-jaga kalau dipanggil tanpa status, ambil semua
      data = await prisma.laporan.findMany({
        orderBy: { createdAt: 'desc' },
        include: { pelapor: true }
      });
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error("Error GET Admin:", error);
    return NextResponse.json({ success: false, data: [] });
  }
}

// === PATCH: UNTUK EKSEKUSI MODERASI (TERIMA / TOLAK) ===
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body; // Admin kirim ID Laporan & Status Baru (misal: "Ditanggapi" atau "Ditolak")

    if (!id || !status) {
        return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Update status di database
    const updatedLaporan = await prisma.laporan.update({
        where: { id: id }, // Cari laporan berdasarkan ID
        data: { status: status } // Ubah statusnya
    });

    return NextResponse.json({ 
        success: true, 
        message: `Status berhasil diubah menjadi ${status}`,
        data: updatedLaporan 
    });

  } catch (error: any) {
    console.error("Error Moderasi:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// === POST: UNTUK INPUT LAPORAN BARU (Biarkan saja) ===
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
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}