export type StatusLaporan = 'Pending' | 'Ditanggapi' | 'Selesai' | 'Ditolak';

export class Laporan {
  constructor(
    public idLaporan: string,
    public judul: string,
    public deskripsi: string,
    public kategori: string,
    public lokasi: string,
    public foto: string | null,
    public status: StatusLaporan,
    public tanggal: Date,
    public pelaporId: string,
    public jumlahKomentar: number = 0,
    public jumlahLikes: number = 0
  ) {}

  public isValid(): boolean {
    return this.judul.length > 0 && this.deskripsi.length > 0;
  }
}