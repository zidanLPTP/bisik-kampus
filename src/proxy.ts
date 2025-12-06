import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth"; // Helper yang kita buat di Batch 1

export async function middleware(request: NextRequest) {
  // 1. Ambil path yang dituju
  const path = request.nextUrl.pathname;

  // 2. Tentukan area terlarang (Admin Panel & API Admin)
  const isAdminRoute = path.startsWith("/admin/dashboard");
  const isAdminApi = path.startsWith("/api/admin") && !path.startsWith("/api/admin/login");

  // 3. Jika bukan area admin, bebaskan
  if (!isAdminRoute && !isAdminApi) {
    return NextResponse.next();
  }

  // 4. Cek Cookie "access_token"
  const token = request.cookies.get("access_token")?.value;
  
  // Verifikasi Token
  const verifiedToken = token ? await verifyToken(token) : null;

  // 5. Logika Tolak/Terima
  if (!verifiedToken) {
    // Jika akses API Admin tanpa token -> 401 Unauthorized
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Jika akses Dashboard tanpa token -> Redirect ke Login
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

// Konfigurasi: Middleware cuma jalan di path ini
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};