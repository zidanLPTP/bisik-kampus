import { IAdminRepository } from "../repositories/IAdminRepository";
import bcrypt from "bcryptjs"; 

export class LoginAdminUseCase {
  constructor(private adminRepo: IAdminRepository) {}

  async execute(username: string, passwordPlain: string) {
    const admin = await this.adminRepo.findByUsername(username);
    
    if (!admin) {
      throw new Error("Username atau password salah.");
    }

    const isPasswordValid = await bcrypt.compare(passwordPlain, admin.passwordHash);

    if (!isPasswordValid) {
      throw new Error("Username atau password salah.");
    }

    return {
      id: admin.id,
      username: admin.username,
      nama: admin.nama,
      role: admin.role
    };
  }
}