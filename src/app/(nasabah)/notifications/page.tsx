'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import { api } from '@/lib/api';
import {
  ChevronLeft,
  Trash2,
  Gift,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Circle,
  CheckCheck,
  Recycle,
  Wallet,
  AlertTriangle,
  PackageX,
  UserPlus,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Map icon string to component
const iconMap: Record<string, any> = {
  'recycle': Recycle,
  'wallet': Wallet,
  'alert-triangle': AlertTriangle,
  'package-x': PackageX,
  'user-plus': UserPlus,
  'gift': Gift,
  'trash2': Trash2,
  'bell': Bell,
};

// Map color to tailwind classes
const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
  red: { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-600', ring: 'ring-sky-100' },
};

function formatTimeAgo(isoString: string): string {
  if (!isoString) return '';
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);

  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export const DUMMY_NOTIFICATIONS = [
  {
    id: '1',
    type: 'setor',
    title: 'Setoran Sampah Berhasil',
    description: 'Setoran sampah Anda di Pos Unit Balaraja telah diverifikasi. Saldo poin Anda bertambah +540.',
    time: '2 jam yang lalu',
    isRead: false,
    icon: 'trash2',
    color: 'emerald'
  },
  {
    id: '2',
    type: 'tukar',
    title: 'Penukaran Disetujui',
    description: 'Permohonan penukaran poin TKR-26021903001 telah disetujui. Silakan ambil barang di unit pos yang dipilih.',
    time: '1 hari yang lalu',
    isRead: true,
    icon: 'gift',
    color: 'violet'
  },
  {
    id: '3',
    type: 'info',
    title: 'Update Alamat Pos Unit',
    description: 'Pos Unit Cisoka kini pindah lokasi ke Jl. Raya Serang No. 45. Klik untuk lihat detail lokasi baru.',
    time: '2 hari yang lalu',
    isRead: true,
    icon: 'bell',
    color: 'sky'
  },
  {
    id: '4',
    type: 'warning',
    title: 'Poin Hampir Kadaluwarsa',
    description: 'Ada 1.200 poin yang akan kadaluwarsa pada akhir bulan ini. Segera tukarkan dengan hadiah menarik!',
    time: '3 hari yang lalu',
    isRead: false,
    icon: 'alert-triangle',
    color: 'amber'
  }
];

export default function NotificationListPage() {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  // TODO: Jika fitur API Notifikasi Backend sudah aktif dan didaftarkan, 
  // hapus State dummy berikut lalu buka komentar barisan useSWR di bawahnya:
  const [localNotifications, setLocalNotifications] = React.useState(() => 
    DUMMY_NOTIFICATIONS.map(notif => ({
      id: notif.id,
      title: notif.title,
      message: notif.description,
      time: notif.time,
      icon: notif.icon,
      color: notif.color,
      read_at: notif.isRead ? 'read' : null, // format dummy
      url: '#'
    }))
  );

  /*
  const { data: notifData, isLoading } = useSWR(
    '/notifications',
    api.getNotifications
  );
  */
  
  const isLoading = false;
  const notifications = localNotifications; // notifData?.notifications || [];

  const handleMarkAllRead = async () => {
    // Mode API (DIBUKA SAAT API SIAP):
    /*
    try {
      await api.markAllNotificationsRead();
      mutate('/notifications');
    } catch (error) { ... }
    */
   
    // Mode Dummy:
    setLocalNotifications(prev => prev.map(n => ({ ...n, read_at: 'now' })));
  };

  const handleDeleteAll = async () => {
    const result = await MySwal.fire({
      title: 'Hapus Semua?',
      text: 'Anda yakin ingin menghapus semua notifikasi ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'rounded-full px-6',
        cancelButton: 'rounded-full px-6'
      }
    });

    if (result.isConfirmed) {
      // Mode API (DIBUKA SAAT API SIAP):
      /*
      try {
        await api.deleteAllNotifications();
        mutate('/notifications');
        MySwal.fire(...);
      } catch (error) { ... }
      */

      // Mode Dummy:
      setLocalNotifications([]);
      MySwal.fire({
        title: 'Berhasil',
        text: 'Semua notifikasi terhapus.',
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-20 shadow-xs">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 flex-1">Notifikasi</h1>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
              title="Tandai Semua Dibaca"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tandai Dibaca</span>
            </button>
            <button
              onClick={handleDeleteAll}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Hapus Semua Notifikasi"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="divide-y divide-slate-100 bg-white">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
            <p className="text-slate-400 text-sm font-medium">Memuat notifikasi...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notif: any) => {
            const IconComponent = iconMap[notif.icon] || Bell;
            const colors = colorMap[notif.color] || colorMap.blue;
            // API return usually has `read_at`, so `isRead` is true if `read_at` is not null.
            const isRead = notif.read_at !== null && notif.read_at !== undefined;

            return (
              <Link
                key={notif.id}
                href={notif.url || '#'}
                className={cn(
                  "p-4 flex gap-4 transition-colors active:bg-slate-50",
                  !isRead && "bg-violet-50/30"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-slate-50 shadow-xs",
                  colors.bg,
                  colors.text
                )}>
                  <IconComponent className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={cn(
                      "text-sm line-clamp-1",
                      isRead ? "text-slate-700 font-semibold" : "text-slate-900 font-bold"
                    )}>
                      {notif.title}
                    </h3>
                    {!isRead && (
                      <div className="w-2 h-2 bg-violet-600 rounded-full shrink-0 mt-1"></div>
                    )}
                  </div>
                  <p className={cn(
                    "text-xs line-clamp-2 leading-relaxed mb-1.5",
                    isRead ? "text-slate-500" : "text-slate-600"
                  )}>
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-medium">
                      {/* the backend payload might have `time` field pre-formatted, or we format `created_at` */}
                      {notif.time ? (notif.time.includes('lalu') ? notif.time : formatTimeAgo(notif.time)) : formatTimeAgo(notif.created_at)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-10 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-2">Belum ada notifikasi</h3>
            <p className="text-xs text-slate-500">Notifikasi mengenai aktivitas akunmu bakal muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
