"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, CheckCircle, XCircle, LogOut } from "lucide-react";
import Image from "next/image";

// Tipe data sederhana untuk UI
type LaporanView = {
  idLaporan: string;
  deskripsi: string;
  lokasi: string;
  kategori: string;
  foto: string | null;
  pelaporId: string;
  status: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Pending"); // Default tab: Pending
  const [laporanList, setLaporanList] = useState<LaporanView[]>([]);
  const [adminName, setAdminName] = useState("");

  // Cek Login & Ambil Data
  useEffect(() => {
    const token = localStorage.getItem("bisik_admin_token");
    const name = localStorage.getItem("bisik_admin_name");

    if (!token) {
      router.push("/admin/login"); // Tendang kalau belum login
    } else {
      setAdminName(name || "Admin");
      fetchLaporan(activeTab); // Ambil data awal
    }
  }, [router, activeTab]);

  // Fungsi ambil data dari API Admin yang baru kita buat
  const fetchLaporan = async (status: string) => {
    // Mapping Tab Name ke Status Database
    let dbStatus = "Pending";
    if (status === "Laporan ditanggapi") dbStatus = "Ditanggapi";
    // "Untuk Anda" kita anggap Pending dulu untuk MVP
    
    const res = await fetch(`/api/admin/laporan?status=${dbStatus}`);
    const json = await res.json();
    if (json.success) {
      setLaporanList(json.data);
    }
  };

  // Fungsi Moderasi (Terima/Tolak)
  const handleModerasi = async (id: string, newStatus: string) => {
    if(!confirm(`Yakin ingin mengubah status menjadi ${newStatus}?`)) return;

    await fetch("/api/admin/laporan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });

    // Refresh data setelah update
    fetchLaporan(activeTab);
  };

  const handleLogout = () => {
    localStorage.removeItem("bisik_admin_token");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* Header Admin */}
      <div className="bg-white px-4 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
             {/* Logo Kucing Kecil */}
             <Image src="/logo-kucing.png" alt="Logo" width={30} height={30} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#5D3891]">Halo, {adminName}</h1>
            <p className="text-xs text-gray-500">Moderator</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-red-500">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs Menu (Persis Desain) */}
      <div className="bg-white flex justify-around border-b border-gray-100 text-sm font-medium text-gray-500 mt-1">
        {["Pending", "Untuk Anda", "Laporan ditanggapi"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-2 ${
              activeTab === tab
                ? "border-b-2 border-[#5D3891] text-[#5D3891] font-bold"
                : "text-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Feed */}
      <div className="p-4 space-y-4">
        {laporanList.length === 0 && (
          <div className="text-center py-10 text-gray-400">Tidak ada laporan di tab ini.</div>
        )}

        {laporanList.map((laporan) => (
          <div key={laporan.idLaporan} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            {/* Header Card */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-[#E8E8D0] rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">
                    guest{laporan.pelaporId.substring(0, 3)}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    {laporan.lokasi}
                  </div>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                laporan.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
              }`}>
                {laporan.status}
              </span>
            </div>

            <p className="text-gray-700 text-sm mb-3">{laporan.deskripsi}</p>

            {laporan.foto && (
              <div className="mb-3 rounded-xl overflow-hidden h-48 bg-gray-100 relative">
                <img src={laporan.foto} alt="Bukti" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Action Buttons (Hanya muncul jika status Pending) */}
            {laporan.status === "Pending" && (
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleModerasi(laporan.idLaporan, "Ditolak")}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4" /> Tolak
                </button>
                <button
                  onClick={() => handleModerasi(laporan.idLaporan, "Ditanggapi")}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#5D3891] text-white text-sm font-semibold hover:opacity-90"
                >
                  <CheckCircle className="w-4 h-4" /> Tanggapi
                </button>
              </div>
            )}
            
             {/* Tombol Selesai (Hanya muncul jika status Ditanggapi) */}
             {laporan.status === "Ditanggapi" && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  {/* Tombol Selesai (Tetap Tampil tapi status Selesai) */}
                  <button
                    onClick={() => handleModerasi(laporan.idLaporan, "Selesai")}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:opacity-90"
                  >
                    <CheckCircle className="w-4 h-4" /> Selesai
                  </button>
                  
                  {/* TOMBOL BARU: TAKE DOWN (Hilangkan dari Publik) */}
                  <button
                    onClick={() => handleModerasi(laporan.idLaporan, "Ditolak")}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4" /> Take Down
                  </button>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}