import { Komentar } from "../entities/Komentar";
import { IKomentarRepository } from "../repositories/IKomentarRepository";
import { IPelaporRepository } from "../repositories/IPelaporRepository";
import { Pelapor } from "../entities/Pelapor";

export class AddKomentarUseCase {
  constructor(
    private komentarRepo: IKomentarRepository,
    private pelaporRepo: IPelaporRepository
  ) {}

  async execute(isi: string, laporanId: string, deviceId: string, parentId?: string) {
    // 1. Validasi Input 
    if (!isi || isi.trim().length === 0) {
      throw new Error("Komentar tidak boleh kosong.");
    }

    if (isi.length > 500) {
      throw new Error("Komentar terlalu panjang (maks 500 karakter).");
    }

    // 2. Buat Pelapor (Guest)
    let pelapor = await this.pelaporRepo.findByDeviceId(deviceId);
    if (!pelapor) {
      pelapor = new Pelapor(crypto.randomUUID(), deviceId, new Date(0));
      await this.pelaporRepo.save(pelapor);
    }

    // 3. Buat Object Komentar
    const komentarBaru = new Komentar(
      crypto.randomUUID(),
      isi,
      new Date(),
      laporanId,
      pelapor.idPelapor,
      parentId || null
    );

    // 4. Simpan ke Database
    await this.komentarRepo.create(komentarBaru);

    return komentarBaru;
  }
}