'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Scan, Users, Package, ArrowRight, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function PetugasDashboard() {
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Halo, Petugas!</h1>
          <p className="text-sm text-slate-500">Pos Unit: Melati 01</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-violet-100 border-2 border-white shadow-sm flex items-center justify-center">
          <span className="text-sm font-bold text-violet-700">P</span>
        </div>
      </div>

      {/* Quick Scan Card - Dark Theme for Petugas High Tech feel */}
      <Card className="bg-slate-900 text-white border-none overflow-hidden relative shadow-xl shadow-slate-200">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Scan className="w-32 h-32 text-white" />
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
        
        <CardContent className="pt-8 pb-8 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                <Scan className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Mode Petugas</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">Terima Penukaran</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-[80%] leading-relaxed">Scan QR Code nasabah untuk validasi penukaran barang secara instan.</p>
          <Link href="/petugas/scan">
            <Button variant="primary" size="lg" className="w-full bg-violet-600 hover:bg-violet-500 border-none">
              <Scan className="w-5 h-5 mr-2" />
              Buka Scanner
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card padding="md" className="border-slate-100 shadow-sm hover:border-violet-200 transition-colors">
           <div className="flex flex-col">
              <span className="text-slate-500 text-xs font-medium">Total Nasabah</span>
              <div className="flex items-end justify-between mt-3">
                 <span className="text-3xl font-bold text-slate-900">128</span>
                 <div className="p-1.5 bg-violet-50 rounded-lg">
                    <Users className="w-5 h-5 text-violet-500" />
                 </div>
              </div>
           </div>
        </Card>
        <Card padding="md" className="border-slate-100 shadow-sm hover:border-amber-200 transition-colors">
           <div className="flex flex-col">
              <span className="text-slate-500 text-xs font-medium">Stok Reward</span>
              <div className="flex items-end justify-between mt-3">
                 <span className="text-3xl font-bold text-slate-900">45</span>
                 <div className="p-1.5 bg-amber-50 rounded-lg">
                    <Package className="w-5 h-5 text-amber-500" />
                 </div>
              </div>
           </div>
        </Card>
      </div>

       {/* Today's Activity */}
       <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-bold text-slate-900 text-lg">Antrian Hari Ini</h3>
           <Link href="/petugas/history">
            <span className="text-xs text-violet-600 font-medium flex items-center bg-violet-50 px-2 py-1 rounded-md hover:bg-violet-100 transition-colors">
                Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
            </span>
           </Link>
        </div>
        
        {/* Empty State / List */}
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
           <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3 text-slate-400">
                <Wallet className="w-6 h-6" />
           </div>
           <p className="text-sm text-slate-500 font-medium">Belum ada transaksi hari ini</p>
           <Button variant="ghost" size="sm" className="mt-2 text-violet-600 hover:text-violet-700 hover:bg-violet-50">
             + Input Setoran Manual
           </Button>
        </div>
      </div>
    </div>
  );
}
