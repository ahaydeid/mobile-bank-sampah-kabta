'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  Package, 
  Scale, 
  Coins, 
  Clock, 
  CheckCircle2, 
  Gift,
  History as HistoryIcon,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { getUserName, getGreeting, getImageUrl } from '@/lib/utils';

export default function PetugasDashboard() {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: userData } = useSWR('/me', api.getMe);
  const { data: statsRes, isLoading: isLoadingStats } = useSWR('/petugas/stats', api.getPetugasStats);
  const { data: queueRes, isLoading: isLoadingQueue } = useSWR('/petugas/queue', api.getPetugasQueue);

  const stats = statsRes?.data || {
    sampah_hari_ini: 0,
    setor_hari_ini: 0,
    tukar_hari_ini: 0,
    poin_hari_ini: 0
  };

  const queue = queueRes?.data || [];
  const user = userData?.user || null;
  const unitName = user?.profil?.pos?.nama_pos || 'Unit';
  const officerName = getUserName(user);

  return (
    <div className="space-y-6 p-2 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Halo, {officerName}!</h1>
          <p className="text-xs text-slate-500 font-medium">
            {unitName} • {mounted ? new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) : '...'}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-violet-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
           {user?.profil?.foto_profil ? (
             <img 
               src={getImageUrl(user.profil.foto_profil) || ''} 
               alt="Profile" 
               className="w-full h-full object-cover" 
             />
           ) : (
             <span className="text-sm font-bold text-violet-700 capitalize">
                {officerName.charAt(0)}
             </span>
           )}
        </div>
      </div>

      {/* Daily Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-emerald-600 border-none text-white overflow-hidden relative">
           <Scale className="absolute -right-2 -bottom-2 w-16 h-16 opacity-20 rotate-12" />
           <CardContent className="p-4 relative z-10">
              <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-wider mb-1">Sampah Hari Ini</p>
              <div className="flex items-end gap-1">
                 {isLoadingStats && !statsRes ? (
                    <Loader2 className="w-5 h-5 animate-spin mb-1" />
                 ) : (
                    <h2 className="text-2xl font-black">{stats.sampah_hari_ini || 0}</h2>
                 )}
                 <span className="text-xs font-bold mb-1 text-emerald-100">Kg</span>
              </div>
           </CardContent>
        </Card>
        <Card className="bg-blue-600 border-none text-white overflow-hidden relative">
           <Users className="absolute -right-2 -bottom-2 w-16 h-16 opacity-20 -rotate-12" />
           <CardContent className="p-4 relative z-10">
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider mb-1">Setor Hari Ini</p>
              <div className="flex items-end gap-1">
                 {isLoadingStats && !statsRes ? (
                    <Loader2 className="w-5 h-5 animate-spin mb-1" />
                 ) : (
                    <h2 className="text-2xl font-black">{stats.setor_hari_ini || 0}</h2>
                 )}
                 <span className="text-xs font-bold mb-1 text-blue-100">Member</span>
              </div>
           </CardContent>
        </Card>
        <Card className="bg-violet-600 border-none text-white overflow-hidden relative">
           <Gift className="absolute -right-2 -bottom-2 w-16 h-16 opacity-20 -rotate-12" />
           <CardContent className="p-4 relative z-10">
              <p className="text-violet-100 text-[10px] font-bold uppercase tracking-wider mb-1">Tukar Hari Ini</p>
              <div className="flex items-end gap-1">
                 {isLoadingStats && !statsRes ? (
                    <Loader2 className="w-5 h-5 animate-spin mb-1" />
                 ) : (
                    <h2 className="text-2xl font-black">{stats.tukar_hari_ini || 0}</h2>
                 )}
                 <span className="text-xs font-bold mb-1 text-violet-100">Member</span>
              </div>
           </CardContent>
        </Card>
        <Card className="bg-amber-500 border-none text-white overflow-hidden relative">
           <Coins className="absolute -right-2 -bottom-2 w-16 h-16 opacity-20 rotate-12" />
           <CardContent className="p-4 relative z-10">
              <p className="text-amber-50 text-[10px] font-bold uppercase tracking-wider mb-1">Poin Hari Ini</p>
              <div className="flex items-end gap-1">
                 {isLoadingStats && !statsRes ? (
                   <Loader2 className="w-5 h-5 animate-spin mb-1" />
                 ) : (
                   <h2 className="text-2xl font-black">
                     {stats.poin_hari_ini >= 1000 
                       ? (stats.poin_hari_ini / 1000).toFixed(1) + 'K' 
                       : stats.poin_hari_ini || 0}
                   </h2>
                 )}
                 <span className="text-xs font-bold mb-1 text-amber-50">Pts</span>
              </div>
           </CardContent>
        </Card>
      </div>

      {/* Services Grid (Matched with Nasabah style) */}
      <Card padding="none" className="border-slate-200 rounded-sm bg-white overflow-hidden">
        <CardContent className="p-3">
          <div className="grid grid-cols-4 gap-y-4 gap-x-2">
            <Link href="/petugas/scan" className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center transition-transform group-active:scale-95">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700">Nasabah</span>
            </Link>

            <Link href="/petugas/scan" className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center transition-transform group-active:scale-95">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700">Stok Barang</span>
            </Link>

            <Link href="#" className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center transition-transform group-active:scale-95">
                <Coins className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700">Nilai Sampah</span>
            </Link>

            <Link href="/petugas/history" className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center transition-transform group-active:scale-95">
                <HistoryIcon className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700">Laporan</span>
            </Link>
          </div>
        </CardContent>
      </Card>

       {/* Pending Queue */}
       <div>
        <div className="flex justify-between items-end mb-4 px-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-lg tracking-tight">Antrian Ambil</h3>
          </div>
           <Link href="/petugas/history">
            <span className="text-[11px] text-violet-600 tracking-wider flex items-center">
                Lainnya
            </span>
           </Link>
        </div>
        
        <div className="space-y-2">
          {isLoadingQueue && !queueRes ? (
            <div className="flex flex-col items-center py-10">
               <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
               <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Memuat Antrian...</p>
            </div>
          ) : queue.map((item: any) => (
            <Card key={item.id} padding="none" className="overflow-hidden border-slate-100 hover:border-violet-100 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                   <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{item.nasabah?.nama || item.nasabah?.username || 'Nasabah'}</h4>
                  <p className="text-[10px] text-slate-500 font-medium tracking-tight uppercase">{item.kode_transaksi} • {item.total_item} Item</p>
                </div>
                <Link href={`/petugas/scan?code=${item.kode_transaksi}`}>
                  <Button size="sm" className="h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider px-3 border-none">
                    Validasi
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
          
          {!isLoadingQueue && queue.length === 0 && (
            <div className="text-center py-3 bg-white rounded-xs border border-slate-200">
               <div className="inline-flex items-center justify-center w-12 h-12 rounded-full text-slate-400">
                    <CheckCircle2 className="w-6 h-6 text-slate-300" />
               </div>
               <p className="text-xs text-slate-400 font-medium tracking-widest">Tidak ada antrian hari ini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
