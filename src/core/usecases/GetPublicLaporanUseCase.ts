import { Laporan } from "../entities/Laporan";
import { ILaporanRepository } from "../repositories/ILaporanRepository";

export class GetPublicLaporanUseCase {
  constructor(private laporanRepo: ILaporanRepository) {}

  async execute(): Promise<Laporan[]> {
    return await this.laporanRepo.getAllPublic(); 
  }
}