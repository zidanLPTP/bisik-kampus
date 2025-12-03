import { Laporan, StatusLaporan } from "../entities/Laporan";
import { Pelapor } from "../entities/Pelapor";
import { ILaporanRepository } from "../repositories/ILaporanRepository";
import { IPelaporRepository } from "../repositories/IPelaporRepository";

// Agar parameternya rapi dan tidak berantakan
export interface CreateLaporanRequest {
  judul: string;
  deskripsi: string;
  kategori: string;
  lokasi: string;
  foto: string | null;
  deviceId: string; 
}

export class CreateLaporanUseCase {
  constructor(
    private laporanRepo: ILaporanRepository,
    private pelaporRepo: IPelaporRepository
  ) {}

  async execute(request: CreateLaporanRequest): Promise<Laporan> {
   
    let pelapor = await this.pelaporRepo.findByDeviceId(request.deviceId);

    if (!pelapor) {
      pelapor = new Pelapor(
        crypto.randomUUID(), 
        request.deviceId,
        new Date(0) 
      );
    }

    if (!pelapor.canPostReport()) {
      throw new Error("Anda hanya boleh mengirim 1 laporan per jam.");
    }

    const laporanBaru = new Laporan(
      crypto.randomUUID(),
      request.judul,
      request.deskripsi,
      request.kategori,
      request.lokasi,
      request.foto,
      "Pending" as StatusLaporan,
      new Date(),
      pelapor.idPelapor
    );

    if (!laporanBaru.isValid()) {
      throw new Error("Judul dan Deskripsi tidak boleh kosong.");
    }

    pelapor.lastReportTime = new Date();
    await this.pelaporRepo.save(pelapor);

    await this.laporanRepo.create(laporanBaru);

    return laporanBaru;
  }
}