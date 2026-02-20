'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Trash2, 
  Gift, 
  Bell, 
  AlertCircle,
  Clock,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DUMMY_NOTIFICATIONS } from '../page';

export default function NotificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const notif = DUMMY_NOTIFICATIONS.find(n => n.id === id);

  if (!notif) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
        <AlertCircle className="w-16 h-16 text-slate-200 mb-4" />
        <h2 className="text-lg font-bold text-slate-800 mb-2">Notifikasi tidak ditemukan</h2>
        <button 
          onClick={() => router.back()}
          className="text-sm font-bold text-violet-600 hover:text-violet-700"
        >
          Kembali ke daftar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-50 px-4 py-4 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <span className="text-sm font-bold text-slate-900">Rincian Notifikasi</span>
      </div>

      <div className="p-6">
         {/* Icon & Title */}
         <div className="flex flex-col items-center text-center mb-8">
            <div className={cn(
                "w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-50",
                notif.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                notif.color === 'violet' && "bg-violet-50 text-violet-600",
                notif.color === 'sky' && "bg-sky-50 text-sky-600",
                notif.color === 'amber' && "bg-amber-50 text-amber-600",
            )}>
              <notif.icon className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{notif.title}</h1>
            <div className="flex items-center justify-center gap-4 text-slate-400">
               <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">21 Feb 2026</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">{notif.time}</span>
               </div>
            </div>
         </div>

         {/* Content Card */}
         <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <p className="text-slate-600 text-sm leading-7 font-medium">
               {notif.description}
            </p>
            
            <p className="text-slate-600 text-sm leading-7 mt-4 font-medium">
               Halo Nasabah, <br />
               Terima kasih telah menggunakan layanan Bank Sampah kami. Terus kumpulkan sampah anorganikmu dan tukarkan dengan berbagai hadiah menarik di katalog kami. 
            </p>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
               <button 
                 onClick={() => router.push(notif.type === 'setor' ? '/history' : notif.type === 'tukar' ? '/history?tab=tukar' : '/dashboard')}
                 className="w-full bg-violet-600 text-white font-black text-xs py-3.5 rounded-xl hover:bg-violet-700 active:scale-[0.98] transition-all uppercase tracking-widest"
                >
                  Lihat Transaksi
               </button>
               <button 
                 onClick={() => router.back()}
                 className="w-full bg-white text-slate-400 font-bold text-xs py-3 rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all uppercase tracking-widest"
                >
                  Tutup
               </button>
            </div>
         </div>
         
         <div className="mt-10 text-center">
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">Bank Sampah Kab. Tangerang</p>
         </div>
      </div>
    </div>
  );
}
