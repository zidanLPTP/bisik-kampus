import { IAdminRepository } from "@/core/repositories/IAdminRepository";
import { Admin } from "@/core/entities/Admin";
import { db } from "../database/db";

export class PrismaAdminRepository implements IAdminRepository {
  async findByUsername(username: string): Promise<Admin | null> {
    const data = await db.admin.findUnique({
      where: { username },
    });

    if (!data) return null;

    return new Admin(
      data.id,
      data.username,
      data.password, 
      data.nama,
      data.role
    );
  }
}