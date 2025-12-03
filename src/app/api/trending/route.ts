import { NextResponse } from "next/server";
import { PrismaLaporanRepository } from "@/infrastructure/repositories/PrismaLaporanRepository";

export async function GET() {
  const repo = new PrismaLaporanRepository();
  const trending = await repo.getTrendingCategories();
  return NextResponse.json({ success: true, data: trending });
}