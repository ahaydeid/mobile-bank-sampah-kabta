'use client';

import React from 'react';
import useSWR from 'swr';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import Link from 'next/link';

const tabs = [
  { key: 'setor', label: 'Setor Sampah' },
  { key: 'tukar', label: 'Tukar Poin' },
] as const;

type TabKey = typeof tabs[number]['key'];

export default function HistoryPage() {
  const [activeTab, setActiveTab] = React.useState<TabKey>('setor');

  return (
    <div className="bg-white">
      {/* Header + Tabs (sticky) */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="px-4 pt-4 pb-0">
          <h1 className="text-lg font-bold text-slate-900 mb-3">Riwayat</h1>
        </div>
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium text-center transition-colors',
                activeTab === tab.key
                  ? 'text-violet-600 border-b-2 border-violet-600'
                  : 'text-slate-400 border-b-2 border-transparent'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'setor' ? <SetorList /> : <TukarList />}
      </div>
    </div>
  );
}

// --- Setor List ---

function SetorList() {
  const { data: res, isLoading } = useSWR('history-setor', () => api.getHistorySetor());
  const data = res?.data || [];

  if (isLoading) return <LoadingState />;
  if (data.length === 0) return <EmptyState message="Belum ada riwayat setor" />;

  return (
    <div className="divide-y divide-slate-100">
      {data.map((item: any) => (
        <Link 
          key={item.id} 
          href={`/setor/${item.id}`}
          className="px-4 py-3.5 flex items-center justify-between active:bg-slate-50 transition-colors"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">{item.pos?.nama_pos || 'Pos'}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatDate(item.tanggal_waktu)} · {Number(item.total_berat).toFixed(1)} kg
            </p>
          </div>
          <span className="text-sm font-bold text-emerald-600 ml-3">
            +{Number(item.total_poin).toLocaleString('id-ID')}
          </span>
        </Link>
      ))}
    </div>
  );
}

// --- Tukar List ---

function TukarList() {
  const { data: res, isLoading } = useSWR('history-tukar', () => api.getHistoryTukar());
  const data = res?.data || [];

  if (isLoading) return <LoadingState />;
  if (data.length === 0) return <EmptyState message="Belum ada riwayat tukar" />;

  return (
    <div className="divide-y divide-slate-100">
      {data.map((item: any) => {
        const statusLabel = getStatusLabel(item.status);
        const isFinished = !!item.tanggal_selesai;

        return (
          <Link 
            key={item.id} 
            href={`/redeem/${item.id}`}
            className="px-4 py-3.5 flex items-center justify-between active:bg-slate-50 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate pr-2">
                {item.kode_penukaran}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatDate(item.tanggal)} · {item.detail?.length || 0} item
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 ml-3">
              <div className="flex items-center gap-1.5 mt-0.5">
                {isFinished && statusLabel?.text !== 'Selesai' && (
                  <span className={cn(
                    "text-[10px] leading-none mt-0.5",
                    ['ditolak', 'dibatalkan'].includes((item.status || '').toLowerCase()) ? "text-red-500" : "text-emerald-500"
                  )}>
                    Selesai
                  </span>
                )}
                {statusLabel && (
                  <span className={cn(
                    'text-[9px] font-bold text-white px-2 py-0.5 rounded-sm uppercase tracking-wider',
                    statusLabel.bg
                  )}>
                    {statusLabel.text}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-rose-500 leading-none">
                -{Number(item.total_poin).toLocaleString('id-ID')}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// --- Helpers ---

function LoadingState() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="px-4 py-4 flex items-center justify-between animate-pulse">
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-100 rounded w-32"></div>
            <div className="h-3 bg-slate-100 rounded w-44"></div>
          </div>
          <div className="h-4 bg-slate-100 rounded w-16"></div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ', ' + date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function getStatusLabel(status: string): { text: string; bg: string } | null {
  const s = status.toLowerCase();
  switch (s) {
    case 'menunggu':
      return { text: 'Menunggu', bg: 'bg-amber-500' };
    case 'disetujui':
      return { text: 'Disetujui', bg: 'bg-sky-600' };
    case 'selesai':
      return { text: 'Selesai', bg: 'bg-emerald-500' };
    case 'ditolak':
    case 'dibatalkan':
      return { text: 'Ditolak', bg: 'bg-red-500' };
    case 'kadaluwarsa':
      return { text: 'Kadaluwarsa', bg: 'bg-slate-500' };
    default:
      return null;
  }
}
