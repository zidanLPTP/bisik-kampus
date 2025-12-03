// src/core/entities/Pelapor.ts

export class Pelapor {
  constructor(
    public idPelapor: string,
    public deviceId: string, 
    public lastReportTime: Date 
  ) {}

  // Cek apakah boleh melapor lagi?!! (Batas 1 laporan/jam)
  public canPostReport(): boolean {
    const oneHour = 60 * 60 * 1000;
    const now = new Date().getTime();
    const last = this.lastReportTime.getTime();
    
    return (now - last) > oneHour;
  }
}