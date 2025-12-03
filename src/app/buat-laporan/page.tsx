"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Image as ImageIcon, MapPin, Send, ChevronDown } from "lucide-react"; 

export default function BuatMenfessCleanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    judul: "", 
    deskripsi: "",
    kategori: "Curhat", 
    lokasi: "",
    foto: "", 
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("bisik_guest_id")) {
      localStorage.setItem("bisik_guest_id", crypto.randomUUID());
    }
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, foto: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if(!formData.deskripsi.trim()) return;
    setIsLoading(true);
    const guestId = localStorage.getItem("bisik_guest_id");
    
    try {
      const payload = { 
        ...formData, 
        judul: formData.deskripsi.substring(0, 30) + "...", 
        deviceId: guestId 
      };
      
      const res = await fetch("/api/laporan", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-device-id": guestId || "" },
        body: JSON.stringify(payload),
      });

      if (res.ok) router.push("/");
    } catch (e) { alert("Gagal mengirim"); } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col font-sans animate-in fade-in duration-300">
      
      {/* 1. Header Minimalis */}
      <div className="px-6 py-4 flex justify-between items-center border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition">
          <X className="w-6 h-6 text-gray-500" />
        </button>
        <div className="flex gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-2">Draft Menfess</span>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={!formData.deskripsi.trim() || isLoading}
          className="bg-[#5D3891] text-white px-6 py-2 rounded-full font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          {isLoading ? "..." : <>Kirim <Send className="w-3 h-3" /></>}
        </button>
      </div>

      {/* 2. Canvas Penulisan (Zen Mode) */}
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-[20%]">
        <div className="flex gap-3 mb-6">
            {/* Chip Kategori */}
            <div className="relative group">
                <select 
                    name="kategori" 
                    value={formData.kategori} 
                    onChange={handleChange}
                    className="appearance-none bg-purple-50 text-[#5D3891] font-bold text-sm pl-4 pr-8 py-2 rounded-full cursor-pointer hover:bg-purple-100 transition outline-none"
                >
                    <option value="Curhat">Curhat</option>
                    <option value="Confess">Confess</option>
                    <option value="Info">Info Kampus</option>
                    <option value="Horor">Horor</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#5D3891] absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {/* Chip Lokasi */}
            <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 text-sm text-gray-600 focus-within:ring-2 ring-gray-200 transition">
                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                <input 
                    type="text" 
                    name="lokasi"
                    placeholder="Lokasi (Opsional)"
                    className="bg-transparent outline-none w-32 placeholder-gray-400"
                    value={formData.lokasi}
                    onChange={handleChange}
                />
            </div>
        </div>

        {/* Textarea Besar & Bersih */}
        <textarea
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
            placeholder="Tuliskan unek-unekmu di sini..."
            className="w-full h-[60vh] text-2xl text-gray-800 placeholder-gray-300 resize-none outline-none leading-relaxed bg-transparent"
            autoFocus
        />

        {/* Preview Image */}
        {formData.foto && (
            <div className="relative mt-4 rounded-2xl overflow-hidden border border-gray-100 shadow-sm max-w-md">
                <img src={formData.foto} className="w-full object-cover" />
                <button onClick={() => setFormData({...formData, foto: ""})} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-red-500 transition">
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}
      </div>

      {/* 3. Bottom Toolbar (Attachment) */}
      <div className="px-6 py-4 md:px-[20%] flex items-center gap-4 text-gray-400 border-t border-gray-50 bg-white/80 backdrop-blur-sm">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        <button 
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-xl transition ${formData.foto ? 'bg-purple-50 text-[#5D3891]' : 'hover:bg-gray-50'}`}
        >
            <ImageIcon className="w-6 h-6" />
        </button>
        <div className="text-xs text-gray-300 ml-auto">
            {formData.deskripsi.length}/1000
        </div>
      </div>
    </div>
  );
}