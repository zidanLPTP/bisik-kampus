import { Laporan, StatusLaporan } from "../entities/Laporan";

export interface ILaporanRepository {
  create(laporan: Laporan): Promise<void>;
  getAllPublic(): Promise<Laporan[]>;
  getByStatus(status: StatusLaporan): Promise<Laporan[]>; 
  findById(id: string): Promise<Laporan | null>;
  updateStatus(id: string, status: StatusLaporan): Promise<void>;
  getTrendingCategories(): Promise<{ kategori: string; count: number }[]>;
  toggleLike(laporanId: string, deviceId: string): Promise<boolean>;
}