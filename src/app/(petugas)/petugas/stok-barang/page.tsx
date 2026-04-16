'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Package, Search, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

function StokBarangContent() {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('Semua');

  const { data: userData } = useSWR('/me', api.getMe);
  const posId = userData?.user?.profil?.pos_id;

  const { data: rewardRes, isLoading, error } = useSWR(
    posId ? `rewards-pos-${posId}-${activeCategory}` : null,
    () => api.getRewards({ pos_id: posId, category: activeCategory !== 'Semua' ? activeCategory : undefined })
  );

  const rewards: any[] = rewardRes?.data || [];

  // Filter locally by search
  const filtered = search
    ? rewards.filter((r: any) => r.nama_reward.toLowerCase().includes(search.toLowerCase()))
    : rewards;

  // Get unique categories
  const categories = ['Semua', ...Array.from(new Set(rewards.map((r: any) => r.kategori).filter(Boolean)))];

  const posName = userData?.user?.profil?.pos?.nama_pos || 'Unit Anda';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Stok Barang <span className="text-slate-400 font-medium italic">({posName})</span></h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-sm text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-300"
          />
        </div>

        {/* Category Chips */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat as string}
                onClick={() => setActiveCategory(cat as string)}
                className={`px-3 py-1.5 rounded-sm text-xs font-bold whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                {cat as string}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center py-16">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Memuat Stok...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex flex-col items-center py-16 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
            <p className="text-sm font-bold text-slate-700">Gagal Memuat Data</p>
            <p className="text-xs text-slate-500 mt-1">{error.message || 'Terjadi kesalahan.'}</p>
          </div>
        )}

        {/* List */}
        {!isLoading && !error && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((item: any) => (
              <Card key={item.id} padding="none" className="overflow-hidden">
                <div className="flex items-center gap-3 p-3">
                  <div className="w-14 h-14 rounded-sm bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.foto_url ? (
                      <img src={getImageUrl(item.foto_url) || item.foto_url} alt={item.nama_reward} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{item.nama_reward}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      {item.kategori || 'Umum'} • {Number(item.poin_tukar).toLocaleString('id-ID')} Poin
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {item.stok > 0 ? (
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-black text-slate-900">{item.stok}</span>
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Tersedia</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-black text-slate-300">0</span>
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Habis</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">Tidak Ada Barang</p>
            <p className="text-xs text-slate-400 mt-1">
              {search ? 'Tidak ditemukan barang yang cocok.' : 'Belum ada reward yang terdaftar di pos ini.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StokBarangPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    }>
      <StokBarangContent />
    </Suspense>
  );
}
