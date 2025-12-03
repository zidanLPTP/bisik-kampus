import { IPelaporRepository } from "@/core/repositories/IPelaporRepository";
import { Pelapor } from "@/core/entities/Pelapor";
import { db } from "../database/db";

export class PrismaPelaporRepository implements IPelaporRepository {
  
  async findByDeviceId(deviceId: string): Promise<Pelapor | null> {
    const data = await db.pelapor.findUnique({
      where: { deviceId }
    });

    if (!data) return null;

    return new Pelapor(data.id, data.deviceId, data.lastReportTime);
  }

  async save(pelapor: Pelapor): Promise<void> {
    await db.pelapor.upsert({
      where: { deviceId: pelapor.deviceId },
      update: { lastReportTime: pelapor.lastReportTime },
      create: {
        id: pelapor.idPelapor,
        deviceId: pelapor.deviceId,
        lastReportTime: pelapor.lastReportTime
      }
    });
  }
}