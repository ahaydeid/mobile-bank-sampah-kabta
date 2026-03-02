'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Clock, 
  Calendar,
  User,
  Package,
  Search,
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import useSWR from 'swr';
import { getImageUrl, getUserName } from '@/lib/utils';
import Link from 'next/link';

export default function PetugasAntrianPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const { data: queueRes, error, isLoading } = useSWR('/petugas/antrian', api.getPetugasQueue);
  const queue = queueRes?.data || [];

  const filteredQueue = queue.filter((item: any) => {
    const member = item.nasabah || item.member;
    return (
      member?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_penukaran?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Antrian Pengambilan</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Cari Nasabah atau Kode..." 
            className="pl-10 h-10 bg-slate-50 border-none rounded-full text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="p-1 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-4" />
            <p className="text-sm text-slate-500 font-medium">Memuat Antrian...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-8 rounded-sm border border-slate-200 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">Gagal Memuat Data</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Terjadi kesalahan saat mengambil data antrian.</p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {searchTerm ? 'Pencarian Tidak Ditemukan' : 'Antrian Kosong'}
            </h3>
            <p className="text-xs text-slate-500 max-w-[200px] mx-auto leading-relaxed">
              {searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : 'Saat ini tidak ada antrian pengambilan barang.'}
            </p>
          </div>
        ) : (
          filteredQueue.map((item: any) => (
            <Link key={item.id} href={`/petugas/antrian/${item.id}`} className="block">
              <Card padding="none" className="overflow-hidden border-slate-100 hover:border-violet-200 active:bg-slate-50 transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 shrink-0 border border-violet-100 overflow-hidden">
                    {getImageUrl((item.nasabah || item.member)?.profil?.foto_profil) ? (
                      <img 
                        src={getImageUrl((item.nasabah || item.member)?.profil?.foto_profil) ?? undefined} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{getUserName(item.nasabah || item.member)}</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold tracking-tight uppercase mb-2">
                       {item.kode_penukaran} • {item.detail?.length || 0} Item
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
