'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  ChevronLeft, 
  Trash2, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn, getImageUrl } from '@/lib/utils';
import useSWR from 'swr';

export default function DetailSetorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: res, error, isLoading } = useSWR(`setor-detail-${id}`, () => api.getSetorDetail(id));

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
        <h1 className="text-lg font-bold text-slate-900">Detail Setoran</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Info Utama */}
        <Card className="border-none shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-emerald-600 p-4 text-white">
               <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Kode Transaksi</p>
               <h2 className="text-xl font-mono font-bold">{transaction.kode_transaksi}</h2>
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
                        {new Date(transaction.tanggal_waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                        {new Date(transaction.tanggal_waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
               </div>

               <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
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
                      <p className="text-sm font-semibold text-slate-700">Unit Pusat</p>
                    )}
                  </div>
               </div>

               <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Petugas Pelayan</p>
                    <p className="text-sm font-semibold text-slate-700 leading-tight">
                      {transaction.petugas?.profil?.nama || transaction.petugas?.username || 'Petugas'}
                    </p>
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Daftar Sampah */}
        <div className="space-y-2">
           <h3 className="font-bold text-slate-900 text-sm px-1 flex items-center gap-2">
             <Trash2 className="w-4 h-4 text-slate-600" />
             Rincian Sampah
           </h3>
           <Card className="border-none shadow-xs">
             <CardContent className="p-0 divide-y divide-slate-50">
               {(transaction.detail || []).map((item: any, i: number) => (
                 <div key={i} className="p-4 flex gap-4">
                    <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Trash2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-slate-800 truncate">{item.sampah?.nama_sampah || 'Item Sampah'}</p>
                       <p className="text-xs text-slate-500">
                         {Number(item.berat).toFixed(1)} kg x {Number(item.sampah?.poin_per_satuan || 0).toLocaleString('id-ID')} Poin
                       </p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-emerald-600">+{Number(item.subtotal_poin).toLocaleString('id-ID')} Poin</p>
                    </div>
                 </div>
               ))}
               <div className="p-4 bg-emerald-50/30 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                    Total Poin Didapat
                  </span>
                  <span className="text-lg font-black text-emerald-700">+{Number(transaction.total_poin).toLocaleString('id-ID')} Poin</span>
               </div>
             </CardContent>
           </Card>
        </div>

        {/* Bukti Foto (If available) */}
        {transaction.foto_bukti && transaction.foto_bukti.length > 0 && (
           <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm px-1">Bukti Foto</h3>
              <div className="grid grid-cols-2 gap-2">
                 {transaction.foto_bukti.map((foto: string, i: number) => (
                    <div key={i} className="aspect-square bg-slate-200 rounded-lg overflow-hidden border border-slate-100 shadow-xs">
                       <img src={getImageUrl(foto) || undefined} alt={`Bukti ${i+1}`} className="w-full h-full object-cover" />
                    </div>
                 ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
