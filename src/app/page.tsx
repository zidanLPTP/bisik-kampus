"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  MessageCircle, MapPin, Plus, User, 
  Home, Hash, TrendingUp, Heart 
} from "lucide-react";

type LaporanView = {
  idLaporan: string;
  deskripsi: string;
  lokasi: string;
  kategori: string;
  foto: string | null;
  pelaporId: string;
  jumlahKomentar: number;
  jumlahLikes: number;
  isLikedByMe?: boolean; 
};

type TrendingTopic = {
  kategori: string;
  count: number;
};

export default function HomePage() {
  const [laporanList, setLaporanList] = useState<LaporanView[]>([]);
  const [trendingList, setTrendingList] = useState<TrendingTopic[]>([]); // DATA TRENDING ASLI
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resFeed = await fetch("/api/laporan");
        const jsonFeed = await resFeed.json();
        const resTrend = await fetch("/api/trending");
        const jsonTrend = await resTrend.json();

        if (jsonFeed.success) setLaporanList(jsonFeed.data);
        if (jsonTrend.success) setTrendingList(jsonTrend.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // FUNCTION HANDLE LIKE
  const handleLike = async (id: string) => {
    const guestId = localStorage.getItem("bisik_guest_id");
    if (!guestId) return;

    // Optimistic UI Update 
    setLaporanList(prev => prev.map(post => {
      if (post.idLaporan === id) {
        const isCurrentlyLiked = post.isLikedByMe;
        return {
          ...post,
          isLikedByMe: !isCurrentlyLiked,
          jumlahLikes: isCurrentlyLiked ? post.jumlahLikes - 1 : post.jumlahLikes + 1
        };
      }
      return post;
    }));

    await fetch("/api/like", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-device-id": guestId },
      body: JSON.stringify({ laporanId: id })
    });
  };

  const formatGuestName = (uuid: string) => "guest" + (uuid ? uuid.substring(0, 3) : "???");

  const SidebarRight = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#5D3891]" /> Trending (Real-Time)
        </h3>
        <div className="space-y-4">
          {/* MAP DATA TRENDING ASLI */}
          {trendingList.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Belum ada data trending.</p>
          ) : (
            trendingList.map((topic, idx) => (
              <div key={topic.kategori} className="flex justify-between items-center group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                <div>
                  <p className="text-xs text-gray-400">#{idx + 1} Trending</p>
                  <p className="font-bold text-gray-800 text-sm">{topic.kategori}</p>
                </div>
                <span className="bg-purple-100 text-[#5D3891] text-xs font-bold px-2 py-1 rounded-full">
                  {topic.count} Posts
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans pb-24">
      {/* Navbar sama seperti sebelumnya... */}
      <div className="bg-white px-4 md:px-8 py-3 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <Image src="/logo-kucing.png" alt="Logo" width={36} height={36} />
           <span className="font-extrabold text-xl text-[#5D3891] tracking-tight hidden md:block">BisikKampus</span>
        </div>
        
        <div className="flex items-center gap-3">
             {/* Tombol Buat Laporan di Navbar */}
            <Link href="/buat-laporan" className="hidden md:flex items-center gap-2 bg-[#5D3891] text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-[#4a2c75] transition">
                <Plus className="w-4 h-4" /> Buat Menfess
            </Link>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition">
                <User className="w-5 h-5 text-gray-600" />
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6">
        
        {/* KOLOM KIRI (Menu) */}
        <div className="hidden md:block md:col-span-1 sticky top-24 h-fit">
            {/* ... SidebarLeft Code dari jawaban sebelumnya ... */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Menu Utama</h3>
                <ul className="space-y-2">
                    <li><Link href="/" className="flex items-center gap-3 text-[#5D3891] font-bold bg-purple-50 px-4 py-3 rounded-xl transition"><Home className="w-5 h-5" />Beranda</Link></li>
                    <li><a href="#" className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition font-medium"><Hash className="w-5 h-5" />Explore</a></li>
                </ul>
            </div>
        </div>

        {/* KOLOM TENGAH (Feed) */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-5">
            {/* Input Trigger */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                </div>
                <Link href="/buat-laporan" className="flex-1 bg-gray-100 hover:bg-gray-200 transition rounded-full px-5 py-3 text-left text-gray-500 text-sm cursor-pointer">
                    Apa yang sedang kamu pikirkan, Guest?
                </Link>
            </div>

            {loading && <div className="text-center py-10">Memuat...</div>}

            {laporanList.map((laporan) => (
            <div key={laporan.idLaporan} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <Link href={`/laporan/${laporan.idLaporan}`} className="block">
                    {/* Header Card (Sama seperti sebelumnya) */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${laporan.kategori === 'Horor' ? 'bg-purple-900' : 'bg-[#5D3891]'}`}>
                                {laporan.pelaporId.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">{formatGuestName(laporan.pelaporId)}</h3>
                                <div className="flex items-center text-xs text-gray-400 mt-0.5">
                                    <MapPin className="w-3 h-3 mr-1" /> {laporan.lokasi || "Public"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pl-[52px]">
                        <p className="text-gray-800 text-[15px] leading-relaxed mb-3 whitespace-pre-wrap">{laporan.deskripsi}</p>
                        {laporan.foto && (
                            <div className="mb-4 rounded-xl overflow-hidden border border-gray-100">
                                <img src={laporan.foto} className="w-full h-auto max-h-[500px] object-cover" />
                            </div>
                        )}
                    </div>
                </Link>

                {/* Footer Actions (LIKE BERFUNGSI) */}
                <div className="pl-[52px] flex items-center gap-6 mt-4 pt-3 border-t border-gray-50">
                    <button 
                        onClick={(e) => { e.preventDefault(); handleLike(laporan.idLaporan); }}
                        className={`flex items-center gap-2 transition group ${laporan.isLikedByMe ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
                    >
                        <div className={`p-2 rounded-full group-hover:bg-pink-50 ${laporan.isLikedByMe ? 'bg-pink-50' : ''}`}>
                            <Heart className={`w-5 h-5 ${laporan.isLikedByMe ? 'fill-pink-500' : ''}`} />
                        </div>
                        <span className="text-sm font-medium">{laporan.jumlahLikes} Suka</span>
                    </button>

                    <Link href={`/laporan/${laporan.idLaporan}`} className="flex items-center gap-2 text-gray-500 hover:text-[#5D3891] transition cursor-pointer group">
                        <div className="p-2 rounded-full group-hover:bg-purple-50">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium">{laporan.jumlahKomentar} Komentar</span>
                    </Link>
                </div>
            </div>
            ))}
        </div>

        {/* KOLOM KANAN (Real Trending) */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24 h-fit">
            <SidebarRight />
        </div>
      </div>
      
      {/* FAB Mobile */}
      <Link href="/buat-laporan" className="md:hidden">
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative w-14 h-14 bg-[#5D3891] rounded-full flex items-center justify-center text-white shadow-xl">
            <Plus className="w-7 h-7" />
          </div>
        </div>
      </Link>
    </div>
  );
}