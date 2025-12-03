export class Komentar {
  constructor(
    public idKomentar: string,
    public isiKomentar: string,
    public tanggal: Date,
    public laporanId: string,
    public pelaporId: string, 
    public parentId: string | null = null, 
    public guestName?: string 
  ) {}
}