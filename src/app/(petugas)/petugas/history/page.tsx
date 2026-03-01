'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Scale, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Loader2
} from 'lucide-react';
import useSWR from 'swr';
import { api } from '@/lib/api';

const tabs = [
  { key: 'setor', label: 'Setoran Nasabah' },
  { key: 'tukar', label: 'Validasi Tukar' },
] as const;

type TabKey = typeof tabs[number]['key'];

export default function PetugasHistoryPage() {
  const [activeTab, setActiveTab] = React.useState<TabKey>('setor');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: setorRes, isLoading: isLoadingSetor } = useSWR(
    activeTab === 'setor' ? '/setoran/history' : null, 
    () => api.getHistorySetor()
  );
  
  const { data: tukarRes, isLoading: isLoadingTukar } = useSWR(
    activeTab === 'tukar' ? '/tukar-poin/history' : null, 
    () => api.getHistoryTukar()
  );

  const setorData = setorRes?.data || [];
  const tukarData = tukarRes?.data || [];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header + Tabs (sticky) */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <Link href="/petugas/dashboard" className="p-1.5 -ml-1 text-slate-400 hover:text-slate-600">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900">Riwayat Transaksi</h1>
        </div>
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 py-3 text-sm font-medium text-center transition-all relative',
                activeTab === tab.key
                  ? 'text-violet-600'
                  : 'text-slate-400'
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-1 py-1 pb-24">
        {activeTab === 'setor' ? (
          <div className="space-y-0.5">
            {isLoadingSetor && !setorRes ? (
              <div className="flex flex-col items-center py-20">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Memuat Riwayat...</p>
              </div>
            ) : setorData.map((item: any) => (
              <Link key={item.id} href={`/petugas/setor/${item.id}`}>
                <div className="bg-white p-4 border border-slate-100 flex items-center gap-4 active:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{item.nasabah?.nama || item.nasabah?.username || 'Nasabah'}</h3>
                      <span className="text-xs font-black text-emerald-600">+{Number(item.total_poin).toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight mt-0.5">
                      {item.detail?.[0]?.sampah?.nama_sampah || 'Setoran'} {item.detail?.length > 1 ? `+${item.detail.length - 1} item lain` : ''} • {item.detail?.[0]?.berat || 0} Kg
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(item.tanggal_waktu)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {isLoadingTukar && !tukarRes ? (
              <div className="flex flex-col items-center py-20">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Memuat Riwayat...</p>
              </div>
            ) : tukarData.map((item: any) => {
              const status = getStatusLabel(item.status);
              return (
                <Link key={item.id} href={`/petugas/tukar/${item.id}`}>
                  <div className="bg-white p-4 border border-slate-100 flex items-center gap-4 active:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{item.nasabah?.nama || item.nasabah?.username || 'Nasabah'}</h3>
                        <span className="text-xs font-black text-rose-500">-{Number(item.total_poin).toLocaleString('id-ID')}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight mt-0.5">
                        {item.kode_transaksi} • {item.total_item} Item
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(item.tanggal_waktu)}</span>
                        </div>
                        <span className={cn(
                          "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider",
                          status.bg,
                          status.text
                        )}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty State Mock */}
      {!isLoadingSetor && !isLoadingTukar && (activeTab === 'setor' ? setorData.length : tukarData.length) === 0 && (
         <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
               <Calendar className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Tidak ada riwayat</p>
            <p className="text-xs text-slate-400 mt-1">Belum ada transaksi yang tercatat pada kategori ini.</p>
         </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (typeof window === 'undefined') return ''; // Safety for SSR
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ', ' + date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'menunggu':
      return { label: 'Menunggu', bg: 'bg-amber-50', text: 'text-amber-600' };
    case 'disetujui':
      return { label: 'Disetujui', bg: 'bg-blue-50', text: 'text-blue-600' };
    case 'selesai':
      return { label: 'Selesai', bg: 'bg-emerald-50', text: 'text-emerald-600' };
    case 'ditolak':
      return { label: 'Ditolak', bg: 'bg-red-50', text: 'text-red-600' };
    case 'batal':
      return { label: 'Batal', bg: 'bg-slate-50', text: 'text-slate-400' };
    default:
      return { label: status, bg: 'bg-slate-50', text: 'text-slate-600' };
  }
}
