'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  ChevronLeft, 
  Package, 
  Calendar, 
  MapPin, 
  Hash, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn, getImageUrl } from '@/lib/utils';
import useSWR from 'swr';

export default function DetailRedeemPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: res, error, isLoading } = useSWR(`redeem-detail-${id}`, () => api.getTukarDetail(id));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error || !res?.data) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-lg font-bold text-slate-900 mb-2">Oops! Data tidak ditemukan</h2>
        <p className="text-sm text-slate-500 mb-6">Sepertinya terjadi kesalahan saat mengambil data transaksi ini.</p>
        <Button onClick={() => router.back()} variant="primary" size="sm">Kembali</Button>
      </div>
    );
  }

  const transaction = res.data;
  
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Detail Penukaran</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Tracker */}
        <div className="bg-white rounded-sm shadow-xs border border-slate-100 p-6">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-900 text-sm">Status Alur Penukaran</h3>
             <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
               {transaction.status}
             </span>
           </div>
           <StatusTracker transaction={transaction} />
           <div className="h-6"></div>
        </div>

        {/* Info Utama */}
        <Card className="border-none shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-violet-600 p-4 text-white">
               <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Kode Penukaran</p>
               <h2 className="text-xl font-mono font-bold">{transaction.kode_penukaran}</h2>
            </div>
            <div className="p-4 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Tanggal</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {new Date(transaction.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Waktu</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {new Date(transaction.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
               </div>

               <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    {/* <p className="text-[10px] text-slate-400 uppercase font-bold">Lokasi Pengambilan (Pos)</p> */}
                    {transaction.pos ? (
                      <a 
                        href={transaction.pos.latitude && transaction.pos.longitude 
                          ? `https://www.google.com/maps?q=${transaction.pos.latitude},${transaction.pos.longitude}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(transaction.pos.nama_pos + ' ' + (transaction.pos.alamat || ''))}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <p className="text-sm font-semibold text-slate-700 leading-tight group-hover:text-violet-600 transition-colors">
                          {transaction.pos.nama_pos}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {transaction.pos.alamat || 'Alamat lokasi pos unit'}
                        </p>
                      </a>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-slate-700 leading-tight">Unit Pusat</p>
                        <p className="text-[11px] text-slate-500 leading-tight">Alamat lokasi pos unit</p>
                      </>
                    )}
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Daftar Barang */}
        <div className="space-y-2">
           <h3 className="font-bold text-slate-900 text-sm px-1 flex items-center gap-2">
             <Package className="w-4 h-4 text-violet-600" />
             Daftar Barang
           </h3>
           <Card className="border-none shadow-xs">
             <CardContent className="p-0 divide-y divide-slate-50">
               {(transaction.detail || []).map((item: any, i: number) => (
                 <div key={i} className="p-4 flex gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                       {item.reward?.foto_url || item.reward?.foto ? (
                          <img 
                            src={getImageUrl(item.reward.foto_url || item.reward.foto) || undefined} 
                            alt={item.reward?.nama_reward} 
                            className="w-full h-full object-cover" 
                          />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                             <Package className="w-6 h-6" />
                          </div>
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-slate-800 truncate">{item.reward?.nama_reward || 'Item Reward'}</p>
                       <p className="text-xs text-slate-500">
                         {item.jumlah} Pcs x {Number(item.poin_per_item || item.reward?.poin_tukar || 0).toLocaleString('id-ID')} Poin
                       </p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-violet-600">{Number(item.subtotal_poin).toLocaleString('id-ID')} Poin</p>
                    </div>
                 </div>
               ))}
               <div className="p-4 bg-slate-50/50 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">Total Penukaran</span>
                  <span className="text-lg font-black text-violet-700">{Number(transaction.total_poin).toLocaleString('id-ID')} Poin</span>
               </div>
             </CardContent>
           </Card>
        </div>

        {/* Footer Action */}
        {transaction.status === 'menunggu' && !transaction.tanggal_selesai && (
           <div className="pt-4 px-2">
              <Button variant="danger" fullWidth className="py-6 font-medium">
                 Batalkan Penukaran
              </Button>
              <p className="text-[10px] text-slate-400 text-center mt-2 px-6">
                Pembatalan hanya dapat dilakukan saat status masih menunggu persetujuan admin.
              </p>
           </div>
        )}
      </div>
    </div>
  );
}

function StatusTracker({ transaction }: { transaction: any }) {
  const status = (transaction.status as string || '').toLowerCase().trim();
  const isFinished = !!transaction.tanggal_selesai;

  let activeIndex = 0;
  let label3 = 'Disetujui';
  let label4 = 'Selesai';
  let isFailed = false;
  let isSuccess = false;

  if (status === 'menunggu') activeIndex = 1;
  else if (status === 'disetujui') {
    if (isFinished) {
      activeIndex = 3;
      isSuccess = true;
    } else {
      activeIndex = 2;
    }
  } else if (['ditolak', 'dibatalkan'].includes(status)) {
    activeIndex = 3;
    label3 = status === 'ditolak' ? 'Ditolak' : 'Dibatalkan';
    isFailed = true;
  } else if (status === 'selesai') {
    activeIndex = 3;
    isSuccess = true;
  } else if (status === 'kadaluwarsa') {
    activeIndex = 3;
    label4 = 'Kadaluwarsa';
    isFailed = true;
  }

  const steps = [
    { label: 'Diajukan' },
    { label: 'Menunggu' },
    { label: label3 },
    { label: label4 },
  ];

  return (
    <div className="relative">
      {/* Background Line */}
      <div className="absolute top-3 left-3 right-3 h-0.5 bg-slate-100 -z-0"></div>
      
      {/* Active Line */}
      <div 
        className={cn(
          "absolute top-3 left-3 h-0.5 transition-all duration-500 -z-0",
          isSuccess ? "bg-emerald-500" : "bg-violet-600"
        )}
        style={{ width: `calc((100% - 24px) * ${activeIndex / (steps.length - 1)})` }}
      ></div>

      <div className="flex justify-between relative z-10">
        {steps.map((step, i) => {
          const isActive = i <= activeIndex;
          const failedStep = isFailed && isActive && i >= 2;
          const successStep = isSuccess && i === 3;

          return (
            <div key={i} className="flex flex-col items-center w-6">
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-xs border-2 ring-2 ring-white',
                  successStep
                           ? 'bg-emerald-500 border-emerald-500 text-white'
                           : failedStep
                             ? 'bg-red-500 border-red-500 text-white'
                             : isActive
                               ? 'bg-violet-600 border-violet-600 text-white'
                               : 'bg-slate-100 border-slate-100 text-slate-300'
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  'text-[10px] mt-2 font-medium text-center absolute top-7 w-20',
                  successStep
                           ? 'text-emerald-600 font-bold'
                           : failedStep
                             ? 'text-red-500 font-bold'
                             : isActive
                               ? 'text-violet-600 font-semibold'
                               : 'text-slate-300 opacity-0'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-6"></div>
      {isSuccess && (
        <div className="mt-6 pt-3 border-t border-slate-50 flex items-center justify-center">
           <div className="flex w-full items-center gap-2 bg-emerald-500 text-white px-4 py-5">
             <span className="text-sm w-full text-center uppercase tracking-widest">Penukaran Selesai</span>
           </div>
        </div>
      )}
      {isFailed && activeIndex === 3 && (
        <div className="mt-6 pt-3 border-t border-slate-50 flex items-center justify-center">
           <div className="flex w-full items-center gap-2 bg-red-500 text-white px-4 py-5">
             <span className="text-sm w-full text-center uppercase tracking-widest">Penukaran Gagal</span>
           </div>
        </div>
      )}
    </div>
  );
}
