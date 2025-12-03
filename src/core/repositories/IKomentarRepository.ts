import { Komentar } from "../entities/Komentar";

export interface IKomentarRepository {
  create(komentar: Komentar): Promise<void>;
  getByLaporanId(laporanId: string): Promise<Komentar[]>;

  delete(id: string): Promise<void>;
}