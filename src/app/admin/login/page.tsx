"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error);
      }

      // Simpan status login di localStorage (Sederhana untuk tugas kuliah)
      localStorage.setItem("bisik_admin_token", "logged_in");
      localStorage.setItem("bisik_admin_name", json.data.nama);
      
      // Redirect ke Dashboard Admin
      router.push("/admin/dashboard");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image Full Screen */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg-login.png" // Pastikan nama file sesuai yang kamu taruh di folder public
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Card Login Glassmorphism */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-white/30 backdrop-blur-md border border-white/50 rounded-[30px] p-8 shadow-2xl">
        
        {/* Header: LOGIN Text */}
        <h1 className="text-2xl font-extrabold text-black mb-6 tracking-wide">
          LOGIN
        </h1>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 relative mb-2">
             {/* Pastikan logo-kucing.png ada di folder public */}
            <Image src="/logo-kucing.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="text-[#5D3891] font-bold text-lg tracking-tight">
            BisikKampus
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="text-red-600 text-xs font-bold text-center bg-red-100/80 p-2 rounded">
              {error}
            </div>
          )}

          {/* Input Username */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#2D2D2D] ml-1">
              Username:
            </label>
            <input
              type="text"
              placeholder="adminimoet124"
              className="w-full px-4 py-3 rounded-full bg-white shadow-inner border-none focus:ring-2 focus:ring-[#5D3891] text-sm text-gray-700 placeholder-gray-400"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          {/* Input Password */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#2D2D2D] ml-1">
              Password:
            </label>
            <input
              type="password"
              placeholder="dimsum4ntal!89"
              className="w-full px-4 py-3 rounded-full bg-white shadow-inner border-none focus:ring-2 focus:ring-[#5D3891] text-sm text-gray-700 placeholder-gray-400"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {/* Link Reset Password */}
          <div className="text-xs text-gray-600 ml-1">
            Dont remember your password? <span className="text-blue-700 font-bold cursor-pointer">Reset here</span>
          </div>

          {/* Button Login */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-[#B06AB3] to-[#4568DC] text-white font-bold tracking-wide shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? "LOADING..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}