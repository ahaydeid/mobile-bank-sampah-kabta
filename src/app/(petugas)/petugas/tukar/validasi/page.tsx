'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  User, 
  Package, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  QrCode,
  ArrowRight,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { getImageUrl, getUserName } from '@/lib/utils';
import useSWR from 'swr';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function ValidasiTukarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const { data: res, error, isLoading } = useSWR(
    code ? `scan-redeem-${code}` : null,
    () => api.scanRedeem(code || '')
  );

  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!res?.data) return;

    const result = await MySwal.fire({
      title: 'Konfirmasi Pengambilan',
      text: 'Pastikan barang telah diserahkan kepada Nasabah sebelum konfirmasi.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Selesaikan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0284c7', // purple-600
    });

    if (result.isConfirmed) {
      setIsConfirming(true);
      try {
        await api.confirmRedeem(res.data.id, res.data.pos_id);
        
        await MySwal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Penukaran poin telah diselesaikan dan dicatat.',
          confirmButtonColor: '#0284c7',
        });

        router.push('/petugas/dashboard');
      } catch (err: any) {
        console.error(err);
        MySwal.fire({
          icon: 'error',
          title: 'Gagal',
          text: err.message || 'Terjadi kesalahan saat mengonfirmasi pengambilan.'
        });
      } finally {
        setIsConfirming(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
        <p className="text-sm text-slate-500">Memvalidasi Kode Penukaran...</p>
      </div>
    );
  }

  if (error || !res?.data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-slate-900 mb-2">Kode Tidak Valid</h2>
        <p className="text-sm text-slate-500 mb-8">
            {error?.message || "Kode penukaran tidak ditemukan atau sudah tidak berlaku."}
        </p>
        <Button onClick={() => router.back()} variant="outline" fullWidth>Kembali ke Scanner</Button>
      </div>
    );
  }

  const transaction = res.data;
  const member = transaction.member;
  const profilePhoto = getImageUrl(member?.profil?.foto_profil);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Validasi Penukaran</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Banner Status */}
        <div className="bg-purple-600 text-white p-6 rounded-sm flex items-center justify-between relative overflow-hidden group">
            <div className="relative z-10">
               <p className="text-[10px] uppercase font-bold tracking-widest opacity-70 mb-1">Kode Penukaran</p>
               <h2 className="text-2xl font-black">{transaction.kode_penukaran}</h2>
            </div>
            <QrCode className="w-16 h-16 opacity-10 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" />
        </div>

        {/* Nasabah Card */}
        <Card className="p-5 relative">
           <div className="flex gap-4 items-center">
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 overflow-hidden flex-shrink-0">
                 {profilePhoto ? (
                    <img src={profilePhoto ?? undefined} alt={member?.name} className="w-full h-full object-cover" />
                 ) : (
                    <User className="w-7 h-7" />
                 )}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">Identitas Pengambil</p>
                 <h3 className="text-base font-bold text-slate-900 leading-tight truncate">{getUserName(member)}</h3>
                 <p className="text-xs text-slate-500 font-bold font-mono tracking-tight">{member?.username || 'NIK Nasabah'}</p>
              </div>
              <div className="absolute top-4 right-4">
                 <div className="flex items-center gap-1.5 px-2 py-1 rounded-[2px] bg-emerald-500 text-white text-[9px] font-black">
                    Verified
                 </div>
              </div>
           </div>
        </Card>

        {/* Info Transaksi */}
        <div className="grid grid-cols-2 gap-3">
           <Card className="p-4 bg-white/80">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-6 h-6 rounded-sm flex items-center justify-center text-purple-600">
                    <Calendar className="w-3.5 h-3.5" />
                 </div>
                 <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Tanggal</span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {new Date(transaction.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
           </Card>
           <Card className="p-4 bg-white/80">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-6 h-6 rounded-sm flex items-center justify-center text-purple-600">
                    <Clock className="w-3.5 h-3.5" />
                 </div>
                 <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Jam</span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {new Date(transaction.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
           </Card>
        </div>

        {/* Daftar Barang */}
        <div className="space-y-3 pt-2">
           <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 px-1">
              Barang yang Ditukar
           </h3>
           <Card className="p-0 overflow-hidden bg-white">
              <div className="divide-y divide-slate-50">
                {transaction.detail.map((item: any, i: number) => (
                  <div key={i} className="p-4 flex gap-4 items-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-sm flex items-center justify-center text-slate-400 group-hover:bg-white transition-colors overflow-hidden">
                         {item.reward?.foto ? (
                            <img 
                               src={getImageUrl(item.reward.foto) ?? undefined} 
                               alt={item.reward.nama_reward}
                               className="w-full h-full object-cover"
                            />
                         ) : (
                            <Package className="w-6 h-6" />
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold text-slate-800 truncate">{item.reward?.nama_reward || 'Item Reward'}</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Jumlah: {item.jumlah} Pcs</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                         <p className="text-xs font-black text-slate-900 leading-none">
                            {Number(item.subtotal_poin).toLocaleString('id-ID')}
                         </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Poin</p>
                      </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-6 border-t border-slate-100 text-white flex justify-between items-center relative overflow-hidden">
                 <div className="relative z-10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Total Poin Terpotong</span>
                    <span className="text-xl font-black text-purple-400">-{Number(transaction.total_poin).toLocaleString('id-ID')} Poin</span>
                 </div>
                 <Loader2 className="w-20 h-20 text-white opacity-[0.03] absolute -right-6 -bottom-6 rotate-12" />
              </div>
           </Card>
        </div>

        {/* Action Button */}
        <div className="pt-6">
           <Button 
             onClick={handleConfirm}
             variant="purple" 
             fullWidth 
             className="h-12 rounded-full cursor-pointer text-sm flex items-center justify-center gap-3"
             disabled={isConfirming}
           >
              {isConfirming ? (
                 <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                 </>
              ) : (
                <>
                  Konfirmasi Pengambilan
                </>
              )}
           </Button>
        </div>
      </div>
    </div>
  );
}

export default function ValidasiTukarPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Memuat Halaman...</p>
       </div>
    }>
      <ValidasiTukarContent />
    </Suspense>
  );
}
