import React from 'react';
import Link from 'next/link';
import { Info, ArrowLeft, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen grid bg-white p-6 place-items-center content-center">
      <div className="w-full max-w-sm text-center">
        
        <div className="mx-auto w-16 h-16 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mb-6">
          <KeyRound className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
          Lupa Password?
        </h1>
        
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Untuk alasan keamanan, pengaturan ulang (reset) kata sandi akun Anda hanya dapat dilakukan melalui 
          <span className="font-medium text-slate-700"> Petugas Bank Sampah</span>. 
          Silakan laporkan masalah ini ke petugas bank sampah terdekat.
        </p>

        <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm mb-8 flex gap-3 text-left items-start">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              Pastikan Anda mengingat username Anda, atau membawa identitas diri (KTP/KIA) saat melaporkan kendala ini.
            </p>
        </div>

        <Link 
          href="/login"
          className="inline-flex w-full items-center justify-center h-10 px-4 text-sm font-medium transition-colors border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
        >
          <span className="flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Login
          </span>
        </Link>
      </div>
    </div>
  );
}
