"use client";

import AvatarSelector from "@/components/AvatarSelector";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Search, PenSquare, Loader2 } from "lucide-react";
import SidebarLeft from "@/components/SidebarLeft";
import SidebarRight from "@/components/SidebarRight";
import MenfessCard from "@/components/MenfessCard";
import LandingPage from "@/components/LandingPage";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; 

export default function HomePage() {
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(true);
  const [laporanList, setLaporanList] = useState<any[]>([]);
  const [trendingList, setTrendingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [myAvatar, setMyAvatar] = useState("🐱"); 

  // --- FETCH DATA ---
  useEffect(() => {
    const hasVisited = sessionStorage.getItem("has_visited_bisikkampus");
    if (hasVisited) {
      setShowLanding(false);
    }

    const fetchData = async () => {
      try {
        const [resFeed, resTrend] = await Promise.all([
          fetch("/api/laporan"),
          fetch("/api/trending")
        ]);
        
        const jsonFeed = await resFeed.json();
        const jsonTrend = await resTrend.json();

        if (jsonFeed.success) setLaporanList(jsonFeed.data);
        if (jsonTrend.success) setTrendingList(jsonTrend.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const savedAvatar = localStorage.getItem("bisik_avatar");
    if (savedAvatar) setMyAvatar(savedAvatar);
  }, []);

  const handleNavbarSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value;
      if (query.trim()) {
        router.push(`/explore?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleAvatarChange = (newAvatar: string) => {
    setMyAvatar(newAvatar);
    localStorage.setItem("bisik_avatar", newAvatar);
    setIsAvatarOpen(false); 
    toast.success("Identitas baru dipilih!");
  };

  const handleStart = () => {
    sessionStorage.setItem("has_visited_bisikkampus", "true");
    setShowLanding(false);
  };

  // --- HANDLE LIKE ---
  const handleLike = async (id: string) => {
    const guestId = localStorage.getItem("bisik_guest_id");
    if (!guestId) return;

    setLaporanList(prev => prev.map(post => {
      if (post.idLaporan === id) {
        const liked = post.isLikedByMe;
        return {
          ...post,
          isLikedByMe: !liked,
          jumlahLikes: liked ? post.jumlahLikes - 1 : post.jumlahLikes + 1
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

  if (showLanding) {
    return <LandingPage onStart={handleStart} />;
  }
  
  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-900 font-sans pb-24">
      
      {/* 1. NAVBAR FIXED */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 md:px-8 py-3 flex justify-between items-center shadow-sm sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
           <Image src="/logo-kucing.png" alt="Logo" width={38} height={38} />
           <span className="font-extrabold text-xl bg-gradient-to-r from-[#5D3891] to-purple-500 bg-clip-text text-transparent tracking-tight hidden md:block">
             BisikKampus
           </span>
        </div>
        
        <div className="hidden md:block flex-1 max-w-lg mx-8 relative">
            <div className="absolute left-4 top-2.5 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="Cari menfess, topik, atau jurusan..." 
              className="bg-gray-100 dark:bg-gray-700 rounded-full px-12 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#5D3891] dark:text-white transition-all" 
              onKeyDown={handleNavbarSearch} // <--- TAMBAHKAN INI
            />
        </div>

        <div className="flex items-center gap-3">
            <Link href="/buat-laporan" className="hidden md:flex items-center gap-2 bg-[#5D3891] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#4a2c75] hover:shadow-lg hover:scale-105 transition-all">
                <PenSquare className="w-4 h-4" /> Buat Menfess
            </Link>
            
            {/* BUTTON AVATAR DI NAVBAR JUGA HARUS BISA DIKLIK */}
            <button 
               onClick={() => setIsAvatarOpen(true)}
               className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center cursor-pointer border border-white dark:border-gray-600 shadow-sm hover:scale-105 transition"
            >
               {myAvatar}
            </button>
        </div>
      </div>

      {/* 2. MAIN LAYOUT (GRID) */}
      <div className="max-w-7xl mx-auto pt-6 px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-8">
        
        {/* KOLOM KIRI */}
        <div className="hidden md:block md:col-span-1 h-fit">
            <SidebarLeft />
        </div>

        {/* KOLOM TENGAH */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-6">
            
            {/* 3. INPUT TRIGGER (PERBAIKAN UTAMA) */}
            {/* Hapus onClick dari div pembungkus utama */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 group">
                
                {/* Tombol Avatar: Hanya buka modal */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Mencegah klik tembus
                    setIsAvatarOpen(true);
                  }}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center cursor-pointer border border-transparent hover:border-purple-300 dark:hover:border-purple-500 transition-all shadow-sm text-lg z-10"
                >
                    {myAvatar}
                </button>

                {/* Input Teks Palsu: Hanya ini yang navigasi ke Buat Laporan */}
                <div 
                  onClick={() => router.push('/buat-laporan')} 
                  className="flex-1 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition rounded-full px-5 py-3 text-left text-gray-500 dark:text-gray-400 text-sm cursor-text"
                >
                    Kirim menfess rahasia di sini...
                </div>
            </div>

            {/* Skeleton Loading */}
            {loading && Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-48 animate-pulse border border-gray-100 dark:border-gray-700">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4 pl-14">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </div>
            ))}

            {/* Empty State */}
            {!loading && laporanList.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Sepi banget...</h3>
                    <p className="text-gray-500 mb-6">Belum ada yang berani speak up.</p>
                    <Link href="/buat-laporan" className="text-[#5D3891] font-bold underline">Jadilah yang pertama!</Link>
                </div>
            )}

            {/* Feed Loop */}
            {laporanList.map((laporan) => (
               <MenfessCard 
                 key={laporan.idLaporan} 
                 data={laporan} 
                 onLike={handleLike} 
               />
            ))}
            
            {!loading && laporanList.length > 0 && (
              <div className="flex justify-center py-8">
                 <Loader2 className="w-6 h-6 text-[#5D3891] animate-spin" />
              </div>
            )}
        </div>

        {/* KOLOM KANAN */}
        <div className="hidden lg:block lg:col-span-1 h-fit">
            <SidebarRight trendingList={trendingList} />
        </div>

      </div>
      
      {/* Modal Avatar */}
      <AvatarSelector 
        isOpen={isAvatarOpen}
        onClose={() => setIsAvatarOpen(false)}
        currentAvatar={myAvatar}
        onSelect={handleAvatarChange}
      />
    </div>
  );
}