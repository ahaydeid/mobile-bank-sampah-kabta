'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Coins, Search, Loader2, AlertCircle, Leaf } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import useSWR from 'swr';
import { api } from '@/lib/api';

function NilaiSampahContent() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = React.useState('Semua');
  const [search, setSearch] = React.useState('');

  const { data: sampahRes, isLoading, error } = useSWR('sampah-types', api.getSampahTypes);

  const allSampah: any[] = sampahRes?.data || [];

  // Get unique categories
  const categories = ['Semua', ...Array.from(new Set(allSampah.map((s: any) => s.kategori).filter(Boolean)))];

  // Filter by selected category and search
  const filtered = allSampah.filter((s: any) => {
    const matchCategory = activeCategory === 'Semua' || s.kategori === activeCategory;
    const matchSearch = !search || s.nama_sampah.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Group by kategori for display
  const grouped = filtered.reduce((acc: Record<string, any[]>, item: any) => {
    const key = item.kategori || 'Lainnya';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Nilai Sampah</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari jenis sampah..."
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
            <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Memuat Data...</p>
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

        {/* Grouped List */}
        {!isLoading && !error && Object.keys(grouped).length > 0 && (
          <div className="space-y-5">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">{category}</h3>
                <Card padding="none" className="overflow-hidden">
                  <div className="divide-y divide-slate-50">
                    {(items as any[]).map((item: any, idx: number) => (
                      <div key={item.id} className="flex items-center justify-between p-3.5">
                        <div className="flex items-center min-w-0 flex-1">
                          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-slate-500">{idx + 1}.</span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{item.nama_sampah}</h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                          <span className="text-base font-black text-emerald-600">
                            {Number(item.poin_per_satuan).toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Poin/Kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && allSampah.length === 0 && (
          <div className="text-center py-16">
            <Coins className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">Tidak Ada Data</p>
            <p className="text-xs text-slate-400 mt-1">Belum ada jenis sampah yang terdaftar.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NilaiSampahPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    }>
      <NilaiSampahContent />
    </Suspense>
  );
}
