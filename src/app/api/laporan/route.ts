import { NextResponse } from "next/server";
import { CreateLaporanUseCase } from "@/core/usecases/CreateLaporanUseCase";
import { PrismaLaporanRepository } from "@/infrastructure/repositories/PrismaLaporanRepository";
import { PrismaPelaporRepository } from "@/infrastructure/repositories/PrismaPelaporRepository";
import { GetPublicLaporanUseCase } from "@/core/usecases/GetPublicLaporanUseCase";

// Database -> Repository -> Use Case -> Controller
const laporanRepo = new PrismaLaporanRepository();
const pelaporRepo = new PrismaPelaporRepository();
const createLaporanUseCase = new CreateLaporanUseCase(laporanRepo, pelaporRepo);
const getPublicLaporanUseCase = new GetPublicLaporanUseCase(laporanRepo);

// Method POST: Untuk menerima kiriman data laporan baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
 
    const deviceId = request.headers.get("x-device-id");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID tidak ditemukan (Anda dianggap bot)." },
        { status: 400 }
      );
    }

    const laporanBaru = await createLaporanUseCase.execute({
      judul: body.judul,
      deskripsi: body.deskripsi,
      kategori: body.kategori,
      lokasi: body.lokasi,
      foto: body.foto || null, 
      deviceId: deviceId,     
    });

    return NextResponse.json({
      success: true,
      message: "Laporan berhasil dikirim dan menunggu moderasi.",
      data: laporanBaru,
    }, { status: 201 }); 

  } catch (error: any) {
    console.error("API Error:", error);

    const errorMessage = error.message || "Terjadi kesalahan internal server.";

    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  }
}

// Method GET: Untuk mengambil daftar laporan
export async function GET() {
  const laporanRepo = new PrismaLaporanRepository();
  const getUseCase = new GetPublicLaporanUseCase(laporanRepo);

  const data = await getUseCase.execute();

  return NextResponse.json({
    success: true,
    data: data
  });
}

