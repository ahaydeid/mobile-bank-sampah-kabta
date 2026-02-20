'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Trash2, 
  Gift, 
  Bell, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';

export const DUMMY_NOTIFICATIONS = [
  {
    id: '1',
    type: 'setor',
    title: 'Setoran Sampah Berhasil',
    description: 'Setoran sampah Anda di Pos Unit Balaraja telah diverifikasi. Saldo poin Anda bertambah +540.',
    time: '2 jam yang lalu',
    isRead: false,
    icon: Trash2,
    color: 'emerald'
  },
  {
    id: '2',
    type: 'tukar',
    title: 'Penukaran Disetujui',
    description: 'Permohonan penukaran poin TKR-26021903001 telah disetujui. Silakan ambil barang di unit pos yang dipilih.',
    time: '1 hari yang lalu',
    isRead: true,
    icon: Gift,
    color: 'violet'
  },
  {
    id: '3',
    type: 'info',
    title: 'Update Alamat Pos Unit',
    description: 'Pos Unit Cisoka kini pindah lokasi ke Jl. Raya Serang No. 45. Klik untuk lihat detail lokasi baru.',
    time: '2 hari yang lalu',
    isRead: true,
    icon: Bell,
    color: 'sky'
  },
  {
    id: '4',
    type: 'warning',
    title: 'Poin Hampir Kadaluwarsa',
    description: 'Ada 1.200 poin yang akan kadaluwarsa pada akhir bulan ini. Segera tukarkan dengan hadiah menarik!',
    time: '3 hari yang lalu',
    isRead: false,
    icon: AlertCircle,
    color: 'amber'
  }
];

export default function NotificationListPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-20 shadow-xs">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 flex-1">Notifikasi</h1>
        <button className="text-xs font-bold text-violet-600 hover:text-violet-700">Tandai Dibaca</button>
      </div>

      <div className="divide-y divide-slate-100 bg-white">
        {DUMMY_NOTIFICATIONS.map((notif) => (
          <Link 
            key={notif.id} 
            href={`/notifications/${notif.id}`}
            className={cn(
                "p-4 flex gap-4 transition-colors active:bg-slate-50",
                !notif.isRead && "bg-violet-50/30"
            )}
          >
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-slate-50 shadow-xs",
                notif.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                notif.color === 'violet' && "bg-violet-50 text-violet-600",
                notif.color === 'sky' && "bg-sky-50 text-sky-600",
                notif.color === 'amber' && "bg-amber-50 text-amber-600",
            )}>
              <notif.icon className="w-6 h-6" />
            </div>
            
            <div className="flex-1 min-w-0">
               <div className="flex justify-between items-start mb-1">
                  <h3 className={cn(
                      "text-sm line-clamp-1",
                      notif.isRead ? "text-slate-700 font-semibold" : "text-slate-900 font-bold"
                  )}>
                    {notif.title}
                  </h3>
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-violet-600 rounded-full shrink-0"></div>
                  )}
               </div>
               <p className={cn(
                   "text-xs line-clamp-2 leading-relaxed mb-1.5",
                   notif.isRead ? "text-slate-500" : "text-slate-600"
               )}>
                 {notif.description}
               </p>
               <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-medium">{notif.time}</span>
               </div>
            </div>
          </Link>
        ))}
      </div>

      {DUMMY_NOTIFICATIONS.length === 0 && (
         <div className="flex flex-col items-center justify-center py-24 px-10 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
               <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Belum ada notifikasi</h3>
            <p className="text-sm text-slate-500">Notifikasi mengenai aktivitas akunmu bakal muncul di sini.</p>
         </div>
      )}
    </div>
  );
}
