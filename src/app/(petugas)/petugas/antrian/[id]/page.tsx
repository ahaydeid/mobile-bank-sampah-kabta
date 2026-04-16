'use client';

import React, { Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ChevronLeft, 
  User, 
  Package, 
  Calendar, 
  Clock,
  QrCode,
  Loader2,
  AlertCircle,
  Coins
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { getImageUrl, getUserName } from '@/lib/utils';
import useSWR from 'swr';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

function QueueDetailContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { data: res, error, isLoading } = useSWR(
    id ? `/tukar-poin/${id}` : null,
    () => api.getTukarDetail(String(id))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium tracking-tight">Memuat Detail Antrian...</p>
      </div>
    );
  }

  if (error || !res?.data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-slate-900 mb-2">Data Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Maaf, detail antrian tidak dapat ditemukan atau telah diproses.
        </p>
        <button 
           onClick={() => router.back()}
           className="w-full h-11 bg-slate-900 text-white rounded-sm font-bold uppercase text-[11px] tracking-widest shadow-sm"
        >
          Kembali
        </button>
      </div>
    );
  }

  const transaction = res.data;
  const member = transaction.member || transaction.nasabah;
  const profilePhoto = getImageUrl(member?.profil?.foto_profil);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Detail Antrian</h1>
      </div>

      <div className="p-1 space-y-4">
        {/* Code Banner */}
        <div className="bg-purple-600 text-white p-6 rounded-sm flex items-center justify-between relative overflow-hidden group">
            <div className="relative z-10">
               <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white mb-1.5">Kode Penukaran</p>
               <h2 className="text-2xl font-black tracking-tighter">{transaction.kode_penukaran}</h2>
            </div>
            <QrCode className="w-16 h-16 opacity-10 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" />
            <div className="absolute top-4 right-4 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
               Pending
            </div>
        </div>

        {/* Nasabah Section */}
        <Card className="p-5 border-none shadow-sm shadow-slate-200/50">
           <div className="flex gap-4 items-center">
              <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 overflow-hidden flex-shrink-0 shadow-inner group">
                 {getImageUrl(member?.profil?.foto_profil) ? (
                    <img 
                       src={getImageUrl(member?.profil?.foto_profil) ?? undefined} 
                       alt={getUserName(member)} 
                       className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    />
                 ) : (
                    <User className="w-7 h-7" />
                 )}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 tracking-[0.1em]">Nasabah</p>
                 <h3 className="text-base font-bold text-slate-900 leading-tight truncate">{getUserName(member)}</h3>
                 <p className="text-xs text-slate-500 font-bold font-mono tracking-tight">{member?.username || 'NIK Nasabah'}</p>
              </div>
           </div>
        </Card>

        {/* Time Info */}
        <div className="grid grid-cols-2 gap-3">
           <Card className="p-4 border-none shadow-sm shadow-slate-200/50">
              <div className="flex items-center gap-2 mb-2">
                 <Calendar className="w-3.5 h-3.5 text-violet-500" />
                 <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Tanggal</span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {new Date(transaction.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
           </Card>
           <Card className="p-4 border-none shadow-sm shadow-slate-200/50">
              <div className="flex items-center gap-2 mb-2">
                 <Clock className="w-3.5 h-3.5 text-violet-500" />
                 <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Waktu</span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {new Date(transaction.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
           </Card>
        </div>

        {/* Items List */}
        <div className="space-y-3 pt-2">
           <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-violet-500" />
                Daftar Barang
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{transaction.detail?.length || 0} Jenis</span>
           </div>
           
           <Card padding="none" className="overflow-hidden border-slate-100 shadow-sm shadow-slate-200/50">
              <div className="divide-y divide-slate-50">
                {transaction.detail?.map((item: any, i: number) => (
                  <div key={i} className="p-4 flex gap-4 items-center">
                     <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0 border border-slate-100 overflow-hidden">
                        {getImageUrl(item.reward?.foto_url) ? (
                           <img 
                             src={getImageUrl(item.reward?.foto_url) ?? undefined} 
                             alt={item.reward?.nama_reward} 
                             className="w-full h-full object-cover" 
                           />
                        ) : (
                           <Package className="w-6 h-6 text-slate-300" />
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{item.reward?.nama_reward || 'Item Reward'}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{item.jumlah} Unit</p>
                     </div>
                  </div>
                ))}
              </div>
              
              <div className="px-5 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                 <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Potongan Poin</span>
                    <div className="flex items-center gap-1 text-violet-600">
                       <span className="text-lg font-black tracking-tight">{Number(transaction.total_poin).toLocaleString('id-ID')} Pts</span>
                    </div>
                 </div>
              </div>
           </Card>
        </div>

        {/* Note & Action */}
        <div className="bg-yellow-50 border border-yellow-100 p-3">
           <p className="text-[10px] text-yellow-600 font-medium leading-relaxed italic text-center">
             Pastikan barang sudah disiapkan sebelum menekan tombol validasi di atas.
           </p>
        </div>
        <div className="space-y-3 pt-4">
           <Link href={`/petugas/scan?code=${transaction.kode_penukaran}`}>
              <Button className="w-full cursor-pointer h-12 bg-emerald-500 hover:bg-emerald-600 text-white text-xs tracking-widest rounded-full border-none flex items-center justify-center gap-2">
                 Validasi Penukaran
              </Button>
           </Link>
        </div>
      </div>
    </div>
  );
}

export default function AntrianDetailPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500 font-medium">Memuat Halaman...</p>
       </div>
    }>
      <QueueDetailContent />
    </Suspense>
  );
}
