import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Cek apakah Variable terbaca oleh Vercel
    const url = process.env.POSTGRES_PRISMA_URL;
    const directUrl = process.env.POSTGRES_URL_NON_POOLING;

    console.log("🔍 MENGUJI KONEKSI DATABASE...");

    // 2. Tes Koneksi Asli ke Database
    // Kita coba ambil 1 data user/admin (atau count data)
    const userCount = await prisma.pelapor.count();

    return NextResponse.json({
      status: "✅ SUKSES",
      message: "Database Terhubung!",
      debug: {
        variable_url_ada: !!url, // True jika terbaca
        variable_direct_ada: !!directUrl, // True jika terbaca
        jumlah_pelapor: userCount
      }
    });

  } catch (error: any) {
    console.error("❌ ERROR FATAL:", error);
    
    // INI YANG KITA CARI: Pesan Error Aslinya
    return NextResponse.json({
      status: "❌ GAGAL",
      error_message: error.message,
      error_code: error.code,
      meta: error.meta,
      debug: {
        variable_url_ada: !!process.env.POSTGRES_PRISMA_URL,
      }
    }, { status: 500 });
  }
}