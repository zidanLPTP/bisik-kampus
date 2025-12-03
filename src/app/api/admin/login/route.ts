import { NextResponse } from "next/server";
import { PrismaAdminRepository } from "@/infrastructure/repositories/PrismaAdminRepository";
import { LoginAdminUseCase } from "@/core/usecases/LoginAdminUseCase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const adminRepo = new PrismaAdminRepository();
    const loginUseCase = new LoginAdminUseCase(adminRepo);


    const adminData = await loginUseCase.execute(body.username, body.password);

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      data: adminData
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}