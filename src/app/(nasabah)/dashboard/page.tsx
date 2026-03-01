'use client';

import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Wallet, Bell, PackageX, Lightbulb, Headset, Calendar, Store } from 'lucide-react';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import { getUserName, getImageUrl, getGreeting, cn } from '@/lib/utils';

export default function NasabahDashboard() {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [greeting, setGreeting] = React.useState('Selamat datang');

  React.useEffect(() => {
    setGreeting(getGreeting());
    // ... (logic fetch user sama)
    const fetchUser = async () => {
    // ...
      // 1. First, try to load from Cookie (fastest)
      const userCookie = Cookies.get('user');
      if (userCookie) {
         try {
            const parsedUser = JSON.parse(userCookie);
            setUser(parsedUser); 
         } catch(e) { console.error("Cookie parse error", e); }
      }

      // 2. Then, try to refresh from API
      try {
        const data = await api.get('/me');
        if (data && data.user) {
          setUser(data.user);
          // Update cookie with fresh data
          Cookies.set('user', JSON.stringify(data.user), { expires: 7, path: '/' });
        }
      } catch (e: any) {
        console.error("Failed to fetch fresh user data", e);
        // Do NOT set user to null here, keep the cookie value if it exists
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="space-y-3 px-3 py-2" suppressHydrationWarning>
      {/* Header */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {loading ? 'Halo...' : `Halo, ${getUserName(user)}!`}
          </h1>
          <p className="text-sm text-slate-500">{greeting}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/notifications" className="inline-flex items-center justify-center rounded-full bg-white text-slate-600 relative w-10 h-10 hover:bg-slate-50 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </Link>
            {user?.profil?.foto_profil ? (
                <img 
                  src={getImageUrl(user.profil.foto_profil) || ''} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-white object-cover bg-slate-200"
                />
            ) : (
                <div className="w-10 h-10 rounded-full bg-violet-100 border-2 border-white flex items-center justify-center text-violet-600 font-bold text-sm">
                    {getUserName(user)[0] || "U"}
                </div>
            )} 
        </div>
      </div>

      <Card padding="none" className="border-none text-white bg-violet-700 overflow-hidden relative">
        {/* Background Icon */}
        <Wallet className="absolute top-2 right-2 w-10 h-10 opacity-30 text-white pointer-events-none" />

        <CardContent className="p-5 relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-violet-100 text-xs font-semibold uppercase tracking-wider mb-1">
                Poin Kamu
              </p>

              <h2 className="text-3xl font-bold">
                {user?.profil?.saldo_poin
                  ? Number(user.profil.saldo_poin).toLocaleString('id-ID', { maximumFractionDigits: 0 })
                  : '0'}
              </h2>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Services Grid */}
      <div>
        <Card padding="none" className="border-slate-200 rounded-sm bg-white overflow-hidden">
          <CardContent className="p-3">
            <div className="grid grid-cols-4 gap-y-4 gap-x-2">
              <Link href="/pos" className="flex flex-col items-center gap-1.5 group">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center transition-transform group-active:scale-95">
                  <Store className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700">Lokasi Unit</span>
              </Link>
              
              <Link href="#" className="flex flex-col items-center gap-1.5 group">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center transition-transform group-active:scale-95">
                  <PackageX className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 text-center">Nilai Sampah</span>
              </Link>

              <Link href="#" className="flex flex-col items-center gap-1.5 group">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center transition-transform group-active:scale-95">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700">Jadwal</span>
              </Link>

              <Link href="#" className="flex flex-col items-center gap-1.5 group">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center transition-transform group-active:scale-95">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700">Edukasi</span>
              </Link>

              <Link href="#" className="flex flex-col items-center gap-1.5 group">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center transition-transform group-active:scale-95">
                  <Headset className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700">Bantuan</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Monitoring */}
      <StatusTracker />

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-1.5 px-1">
          <h3 className="font-bold text-slate-900 text-sm tracking-tight opacity-80">Aktivitas</h3>
          <Link href="/history">
            <span className="text-xs text-violet-600">Lihat semua</span>
          </Link>
        </div>
        
        <Card padding="none" className="rounded-none bg-white overflow-hidden">
          <CardContent>
            <AktivitasList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AktivitasList() {
  const { data: setorRes, isLoading: setorLoading } = useSWR('history-setor', () => api.getHistorySetor());
  const { data: tukarRes, isLoading: tukarLoading } = useSWR('history-tukar', () => api.getHistoryTukar());

  const loading = setorLoading || tukarLoading;

  const items = React.useMemo(() => {
    if (loading) return [];

    const setorItems = (setorRes?.data || []).map((item: any) => ({
      id: `setor-${item.id}`,
      label: item.pos?.nama_pos || 'Setor Sampah',
      date: item.tanggal_waktu,
      poin: `+${Number(item.total_poin).toLocaleString('id-ID')}`,
      color: 'text-emerald-600',
    }));

    const tukarItems = (tukarRes?.data || []).map((item: any) => ({
      id: `tukar-${item.id}`,
      label: item.kode_penukaran || 'Tukar Poin',
      date: item.tanggal,
      poin: `-${Number(item.total_poin).toLocaleString('id-ID')}`,
      color: 'text-rose-600',
    }));

    return [...setorItems, ...tukarItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [setorRes, tukarRes, loading]);

  if (loading) {
    return (
      <div className="divide-y divide-slate-100">
        {[1, 2].map((i) => (
          <div key={i} className="py-3.5 px-1 flex items-center gap-3 animate-pulse">
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-slate-100 rounded w-28"></div>
              <div className="h-3 bg-slate-100 rounded w-36"></div>
            </div>
            <div className="h-4 bg-slate-100 rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-slate-400">Belum ada aktivitas</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {items.map((item) => (
        <div key={item.id} className="py-3.5 px-1 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-800 truncate">{item.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{formatDateShort(item.date)}</p>
          </div>
          <span className={`text-sm font-medium ${item.color}`}>{item.poin}</span>
        </div>
      ))}
    </div>
  );
}

function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      + ', ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

function StatusTracker() {
  const { data: tukarRes, isLoading } = useSWR('history-tukar', () => api.getHistoryTukar());

  const latestTransaction = React.useMemo(() => {
    const data = tukarRes?.data || [];
    return data.length > 0 ? data[0] : null;
  }, [tukarRes]);

  if (isLoading || !latestTransaction) return null;

  const status = (latestTransaction.status as string || '').toLowerCase().trim();
  const isFinished = !!latestTransaction.tanggal_selesai;

  // Determine active index and labels
  let activeIndex = 0;
  let labelStep3 = '';
  let labelStep4 = ''; 
  let isFailed = false;
  let isSuccess = false;

  if (status === 'menunggu') {
    activeIndex = 1;
  } else if (status === 'disetujui') {
    if (isFinished) {
      activeIndex = 3;
      labelStep3 = 'Disetujui';
      labelStep4 = 'Selesai';
      isSuccess = true;
    } else {
      activeIndex = 2;
      labelStep3 = 'Disetujui';
    }
  } else if (status === 'ditolak' || status === 'dibatalkan') {
    activeIndex = isFinished ? 3 : 2;
    labelStep3 = 'Ditolak';
    labelStep4 = 'Selesai';
    isFailed = true;
  } else if (status === 'selesai') {
    activeIndex = 3;
    labelStep3 = 'Disetujui';
    labelStep4 = 'Selesai';
    isSuccess = true;
  } else if (status === 'kadaluwarsa') {
    activeIndex = 3;
    labelStep3 = 'Disetujui';
    labelStep4 = 'Kadaluwarsa';
    isFailed = true;
  }

  const steps = [
    { label: 'Diajukan' },
    { label: 'Menunggu' },
    { label: labelStep3 },
    { label: labelStep4 },
  ];

  // Determine if we should show the empty state instead of the tracker
  // We hide the tracker ONLY if the latest transaction is finalized as Selesai or Kadaluwarsa
  const isFinalized = ['selesai', 'kadaluwarsa'].includes(status) || isFinished;

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5 px-1">
        <h3 className="font-bold text-slate-900 text-sm tracking-tight opacity-80">Status Penukaran</h3>
        {!isFinalized && <span className="text-[11px] text-slate-400">{latestTransaction.kode_penukaran}</span>}
      </div>
      <Card padding="none" className="rounded-none bg-white overflow-hidden">
        <CardContent className={cn("px-6", isFinalized ? "py-3" : "pt-4 pb-0")}>
          {isFinalized ? (
            <div className="flex flex-col items-center justify-center text-center">
               <p className="text-xs text-slate-500 italic">Belum ada pengajuan penukaran</p>
            </div>
          ) : (
            <>
              <div className="relative">
                {/* Connecting Line Track */}
                <div className="absolute top-3 left-3 right-3 h-0.5 bg-slate-100 -z-0"></div>
                
                {/* Active Line Progress */}
                <div 
                    className={cn(
                      "absolute top-3 left-3 h-0.5 transition-all duration-500 -z-0",
                      isSuccess ? "bg-emerald-500" : isFailed ? "bg-red-500" : "bg-violet-600"
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
                            'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-sm border-2 ring-2 ring-white',
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
                                  ? 'text-violet-600'
                                  : 'text-slate-300 opacity-0'
                          )}
                        >
                          {step.label || '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Spacer for absolute positioned labels */}
              <div className="h-8"></div>
              <div className="flex justify-center border-t border-slate-100 pt-2 pb-3">
                 <Link href={`/redeem/${latestTransaction.id}`} className="text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors">
                    Selengkapnya
                 </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
