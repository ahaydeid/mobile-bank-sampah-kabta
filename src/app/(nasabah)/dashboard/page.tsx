'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Coins, TrendingUp, History, Gift, Bell } from 'lucide-react';

export default function NasabahDashboard() {
  return (
    <div className="space-y-6 pb-20" suppressHydrationWarning>
      {/* Header */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Halo, Nasabah!</h1>
          <p className="text-sm text-slate-500">Selamat datang kembali</p>
        </div>
        <div className="flex gap-3">
            <Button variant="ghost" size="icon" className="rounded-full bg-white text-slate-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </Button>
            <div className="w-10 h-10 rounded-full bg-violet-100 border-2 border-white" /> 
        </div>
      </div>

      {/* Balance Card - Premium Gradient */}
      <Card className="border-none text-white bg-violet-700 overflow-hidden relative">
        
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-violet-100 text-xs font-semibold uppercase tracking-wider mb-1">Saldo Poin Anda</p>
              <h2 className="text-4xl font-bold">45.200</h2>
            </div>
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/10">
              <Coins className="w-6 h-6 text-amber-300" />
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-violet-50 font-medium">
            <span>Setara Rp 45.200</span>
            <div className="flex items-center gap-1.5 bg-emerald-500/20 px-2 py-1 rounded-full text-emerald-300 border border-emerald-500/30">
              <TrendingUp className="w-3 h-3" /> +15%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Scan/Menu */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-auto py-5 flex flex-col gap-3 border-slate-100 bg-white shadow-sm hover:bg-violet-50 transition-all group">
          <div className="bg-violet-100 p-3 rounded-2xl group-hover:scale-110 transition-transform">
            <History className="w-6 h-6 text-violet-600" />
          </div>
          <div className="text-center">
            <span className="text-sm font-bold text-slate-800 block">Riwayat</span>
            <span className="text-xs text-slate-400">Cek setoran</span>
          </div>
        </Button>
        <Button variant="outline" className="h-auto py-5 flex flex-col gap-3 border-slate-100 bg-white shadow-sm hover:bg-amber-50 transition-all group">
          {/* Using a different icon for "Katalog" or "Promo" */}
          <div className="bg-amber-100 p-3 rounded-2xl group-hover:scale-110 transition-transform">
             <Gift className="w-6 h-6 text-amber-600" />
          </div>
           <div className="text-center">
            <span className="text-sm font-bold text-slate-800 block">Katalog</span>
            <span className="text-xs text-slate-400">Tukar Poin</span>
          </div>
        </Button>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-bold text-slate-800 text-lg">Aktivitas</h3>
          <Button variant="ghost" size="sm" className="text-violet-600 h-8 px-2 text-xs hover:bg-violet-50">
            Lihat Semua
          </Button>
        </div>
        
        <div className="space-y-3">
          {/* Mock Item 1 */}
          <Card padding="sm" className="flex items-center gap-4 border-slate-100 shadow-sm bg-white hover:border-violet-100 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0 border border-violet-100">
               <History className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">Setor Sampah</p>
              <p className="text-xs text-slate-500 mt-0.5">20 Feb 2026 • 10:30</p>
            </div>
            <span className="font-bold text-violet-600 text-sm bg-violet-50 px-2 py-1 rounded-md">+250 Poin</span>
          </Card>

           {/* Mock Item 2 */}
            <Card padding="sm" className="flex items-center gap-4 border-slate-100 shadow-sm bg-white hover:border-amber-100 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
               <Gift className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">Tukar Sembako</p>
              <p className="text-xs text-slate-500 mt-0.5">18 Feb 2026 • 14:15</p>
            </div>
            <span className="font-bold text-slate-600 text-sm bg-slate-100 px-2 py-1 rounded-md">-50.000</span>
          </Card>
        </div>
      </div>
    </div>
  );
}
