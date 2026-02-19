'use client';

import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { ChevronLeft, MapPin, Store, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function PosPage() {
  const { data: unitsData, isLoading } = useSWR('/units', api.getUnits);
  const units = unitsData?.data || [];

  return (
    <div className="flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-1 -ml-1">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900">Daftar Pos</h1>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
            <p className="text-sm text-slate-400">Memuat data pos...</p>
          </div>
        ) : units.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-slate-400">Belum ada pos tersedia</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {units.map((unit: any) => {
              const mapsUrl = unit.latitude && unit.longitude
                ? `https://www.google.com/maps?q=${unit.latitude},${unit.longitude}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(unit.nama_pos + ' ' + (unit.alamat || ''))}`;

              return (
                <div key={unit.id} className="py-3">
                  <div className="mb-2">
                    <h3 className="font-semibold text-slate-900 text-sm">{unit.nama_pos}</h3>
                    {unit.alamat && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{unit.alamat}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 flex-1 py-1.5 text-[11px] font-medium text-slate-600 border border-slate-200 rounded-sm"
                    >
                      <MapPin className="w-3 h-3" />
                      Lokasi
                    </a>
                    <Link
                      href={`/redeem?pos_id=${unit.id}`}
                      className="flex items-center justify-center gap-1 flex-1 py-1.5 text-[11px] font-medium text-white bg-violet-600 rounded-sm"
                    >
                      <Store className="w-3 h-3" />
                      Katalog
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
