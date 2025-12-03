import { ILaporanRepository } from "@/core/repositories/ILaporanRepository";
import { Laporan, StatusLaporan } from "@/core/entities/Laporan";
import { db } from "../database/db";

export class PrismaLaporanRepository implements ILaporanRepository {
  
  async create(laporan: Laporan): Promise<void> {
    await db.laporan.create({
      data: {
        id: laporan.idLaporan,
        judul: laporan.judul,
        deskripsi: laporan.deskripsi,
        kategori: laporan.kategori,
        lokasi: laporan.lokasi,
        foto: laporan.foto,
        status: laporan.status,
        pelaporId: laporan.pelaporId,
        createdAt: laporan.tanggal
      }
    });
  }

  async getAllPublic(): Promise<Laporan[]> {
    const rawData = await db.laporan.findMany({
      where: {
        OR: [
          { status: 'Ditanggapi' },
          { status: 'Selesai' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: { 
        _count: { 
          select: { komentar: true, likes: true }
        } 
      }
    });

    return this.mapToEntity(rawData);
  }

  async getByStatus(status: StatusLaporan): Promise<Laporan[]> {
    const rawData = await db.laporan.findMany({
      where: { status: status }, 
      orderBy: { createdAt: 'desc' },
      include: { 
        _count: { select: { komentar: true, likes: true } } 
      }
    });

    return this.mapToEntity(rawData);
  }

  async findById(id: string): Promise<Laporan | null> {
    const d = await db.laporan.findUnique({ 
      where: { id },
      include: { 
        _count: { select: { komentar: true, likes: true } } 
      } 
    });
    
    if (!d) return null;

    return new Laporan(
      d.id, d.judul, d.deskripsi, d.kategori, d.lokasi, d.foto,
      d.status as StatusLaporan, d.createdAt, d.pelaporId,
      d._count.komentar,
      d._count.likes
    );
  }

  async updateStatus(id: string, status: StatusLaporan): Promise<void> {
    await db.laporan.update({ 
      where: { id }, 
      data: { status } 
    });
  }

  async getTrendingCategories() {
    const group = await db.laporan.groupBy({
      by: ['kategori'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5 
    });

    return group.map(g => ({
      kategori: g.kategori,
      count: g._count.id
    }));
  }

  async toggleLike(laporanId: string, deviceId: string): Promise<boolean> {
    const existing = await db.like.findUnique({
      where: {
        laporanId_deviceId: { 
          laporanId,
          deviceId
        }
      }
    });

    if (existing) {
      await db.like.delete({ where: { id: existing.id } });
      return false;
    } else {
      await db.like.create({
        data: { laporanId, deviceId }
      });
      return true; 
    }
  }

  private mapToEntity(rawData: any[]): Laporan[] {
    return rawData.map(d => new Laporan(
      d.id,
      d.judul,
      d.deskripsi,
      d.kategori,
      d.lokasi,
      d.foto,
      d.status as StatusLaporan,
      d.createdAt,
      d.pelaporId,
      d._count.komentar, 
      d._count.likes  
    ));
  }
}