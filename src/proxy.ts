import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth"; 

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Area Admin
  const isAdminRoute = path.startsWith("/admin/dashboard");
  const isAdminApi = path.startsWith("/api/admin") && !path.startsWith("/api/admin/login");

  // Jika bukan area admin, lewat saja
  if (!isAdminRoute && !isAdminApi) {
    return NextResponse.next();
  }

  // --- LOGIKA "SATPAM TIDUR" (BYPASS SECURITY) ---
  
  // Kita tetap coba cek token (untuk log saja), tapi TIDAK KITA BLOKIR
  const token = request.cookies.get("access_token")?.value;
  const verifiedToken = token ? await verifyToken(token) : null;

  if (!verifiedToken) {
    // Console log ini akan muncul di Vercel Logs, jadi kita tahu ada yang akses tanpa izin
    console.warn(`⚠️ [SECURITY BYPASS] Ada akses tanpa token valid ke: ${path}`);
    
    // ❌ DULU: Kita return 401 / Redirect
    // ✅ SEKARANG: Kita biarkan lewat (NextResponse.next())
    return NextResponse.next(); 
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};