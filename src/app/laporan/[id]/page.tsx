"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, MapPin, Send, MessageSquare, CornerDownRight, Trash2 } from "lucide-react"; // Tambah Trash2

type KomentarView = {
  idKomentar: string;
  isiKomentar: string;
  guestName: string;
  tanggal: string;
  parentId: string | null;
};

export default function DetailLaporanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const router = useRouter();
  const [laporan, setLaporan] = useState<any>(null);
  const [komentars, setKomentars] = useState<KomentarView[]>([]);
  
  const [inputKomentar, setInputKomentar] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  // Cek apakah user adalah Admin
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    
    const adminToken = localStorage.getItem("bisik_admin_token");
    if (adminToken) {
      setIsAdmin(true); 
    }

    // Fetch data
    fetch("/api/laporan")
      .then(res => res.json())
      .then(json => {
        const found = json.data.find((l: any) => l.idLaporan === id);
        setLaporan(found);
      });

    fetchKomentar();
  }, [id]);

  const fetchKomentar = async () => {
    const res = await fetch(`/api/komentar?laporanId=${id}`);
    const json = await res.json();
    if (json.success) setKomentars(json.data);
  };

  const handleKirim = async (parentId: string | null = null) => {
    if (!inputKomentar.trim()) return;
    setIsSending(true);
    const guestId = localStorage.getItem("bisik_guest_id");
    
    await fetch("/api/komentar", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-device-id": guestId || "" },
      body: JSON.stringify({ isi: inputKomentar, laporanId: id, parentId }),
    });

    setInputKomentar("");
    setActiveReplyId(null);
    setIsSending(false);
    fetchKomentar();
  };

  // FUNGSI BARU: Handle Hapus
  const handleDelete = async (komentarId: string) => {
    if(!confirm("Hapus komentar ini?")) return;
    
    await fetch(`/api/komentar?id=${komentarId}`, { method: "DELETE" });
    fetchKomentar(); 
  };

  const rootComments = komentars.filter(k => k.parentId === null);
  const getReplies = (parentId: string) => komentars.filter(k => k.parentId === parentId);

  if (!laporan) return <div className="p-10 text-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center gap-4 z-20">
        <button onClick={() => router.back()}><ArrowLeft /></button>
        <h1 className="font-bold text-[#5D3891]">Detail Laporan</h1>
        {isAdmin && <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Admin Mode</span>}
      </div>

      <div className="p-4">
        {/* Card Laporan */}
        <div className="mb-6">
           {/* ... Bagian isi laporan sama persis kayak sebelumnya ... */}
           <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 bg-[#E8E8D0] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
             </div>
             <div>
                <h3 className="font-bold text-gray-800 text-sm">guest{laporan.pelaporId.substring(0,3)}</h3>
                <div className="flex items-center text-xs text-gray-500">
                   <MapPin className="w-3 h-3 mr-1" />{laporan.lokasi}
                </div>
             </div>
          </div>
          <p className="text-gray-800 leading-relaxed mb-4">{laporan.deskripsi}</p>
          {laporan.foto && <img src={laporan.foto} className="w-full rounded-xl mb-4" />}
        </div>

        {/* Diskusi */}
        <h3 className="font-bold text-gray-700 mb-4">Diskusi ({komentars.length})</h3>
        
        <div className="space-y-6">
          {rootComments.map((induk) => (
            <div key={induk.idKomentar}>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-500">{induk.guestName.slice(-2)}</span>
                </div>
                <div className="w-full">
                  <div className="bg-gray-50 p-3 rounded-2xl w-full flex justify-between group">
                    <div>
                      <div className="text-xs font-bold text-[#5D3891] mb-1">{induk.guestName}</div>
                      <p className="text-sm text-gray-700">{induk.isiKomentar}</p>
                    </div>
                    {/* TOMBOL HAPUS (Hanya muncul jika Admin) */}
                    {isAdmin && (
                      <button onClick={() => handleDelete(induk.idKomentar)} className="text-gray-400 hover:text-red-500 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Tombol Balas */}
                  <div className="flex items-center gap-4 mt-1 ml-2">
                    <button onClick={() => setActiveReplyId(induk.idKomentar)} className="text-xs font-semibold text-gray-500 hover:text-[#5D3891]">
                      Balas
                    </button>
                    <span className="text-[10px] text-gray-400">Baru saja</span>
                  </div>

                  {/* Form Balasan */}
                  {activeReplyId === induk.idKomentar && (
                    <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2">
                      <input 
                        autoFocus
                        type="text" 
                        placeholder={`Balas ${induk.guestName}...`}
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm border border-[#5D3891]"
                        value={inputKomentar}
                        onChange={(e) => setInputKomentar(e.target.value)}
                      />
                      <button onClick={() => handleKirim(induk.idKomentar)} className="bg-[#5D3891] text-white p-2 rounded-full">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* List Balasan (Anak) */}
                  <div className="mt-3 space-y-3 pl-3 border-l-2 border-gray-100 ml-4">
                    {getReplies(induk.idKomentar).map((anak) => (
                      <div key={anak.idKomentar} className="flex gap-2">
                        <CornerDownRight className="w-4 h-4 text-gray-300 mt-2 flex-shrink-0" />
                        <div className="bg-purple-50 p-3 rounded-2xl w-full flex justify-between">
                          <div>
                            <div className="text-xs font-bold text-[#5D3891] mb-1">{anak.guestName}</div>
                            <p className="text-sm text-gray-700">{anak.isiKomentar}</p>
                          </div>
                          {/* TOMBOL HAPUS BALASAN (Admin Only) */}
                          {isAdmin && (
                            <button onClick={() => handleDelete(anak.idKomentar)} className="text-gray-400 hover:text-red-500 p-1">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Bar Utama */}
      {!activeReplyId && (
        <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 p-4 flex gap-2 z-30">
          <input 
            type="text" 
            placeholder="Tulis komentar utama..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#5D3891]"
            value={inputKomentar}
            onChange={(e) => setInputKomentar(e.target.value)}
          />
          <button onClick={() => handleKirim(null)} disabled={isSending} className="w-12 h-12 bg-[#5D3891] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition">
            <Send className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}