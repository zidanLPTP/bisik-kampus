import { Pelapor } from "../entities/Pelapor";

export interface IPelaporRepository {
  // Cari pelapor berdasarkan Device ID 
  findByDeviceId(deviceId: string): Promise<Pelapor | null>;

  // Simpan pelapor baru atau update waktu lapor terakhir
  save(pelapor: Pelapor): Promise<void>;
}