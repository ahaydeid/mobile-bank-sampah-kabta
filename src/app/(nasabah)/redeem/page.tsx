'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Search, Filter, ShoppingBag, Coins, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function RedeemPage() {
  const [activeCategory, setActiveCategory] = useState('Semua');

  const categories = ['Semua', 'Sembako', 'Pulsa', 'Peralatan', 'Voucher'];

  const rewards = [
    {
      id: 1,
      name: "Beras Premium 5kg",
      category: "Sembako",
      points: 50000,
      stock: 10,
      imageColor: "bg-slate-200"
    },
    {
      id: 2,
      name: "Minyak Goreng 2L",
      category: "Sembako",
      points: 28000,
      stock: 5,
      imageColor: "bg-amber-100"
    },
    {
      id: 3,
      name: "Pulsa 25rb",
      category: "Pulsa",
      points: 26000,
      stock: 99,
      imageColor: "bg-violet-100"
    },
    {
      id: 4,
      name: "Gula Pasir 1kg",
      category: "Sembako",
      points: 12000,
      stock: 0, // Out of stock
      imageColor: "bg-slate-100"
    },
    {
      id: 5,
      name: "Telur Ayam 1kg",
      category: "Sembako",
      points: 25000,
      stock: 15,
      imageColor: "bg-orange-100"
    }
  ];

  const filteredRewards = activeCategory === 'Semua' 
    ? rewards 
    : rewards.filter(r => r.category === activeCategory);

  const handleRedeem = (item: any) => {
    if (item.stock === 0) return;

    MySwal.fire({
      title: <p className="text-violet-700 text-lg">Tukar Poin?</p>,
      html: <p className="text-sm text-slate-600">Anda akan menukar <b>{item.points.toLocaleString()}</b> poin dengan <b>{item.name}</b></p>,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Tukar',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#94a3b8',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'rounded-full px-6',
        cancelButton: 'rounded-full px-6'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        MySwal.fire({
          title: 'Berhasil!',
          text: 'Permintaan penukaran sedang diproses admin.',
          icon: 'success',
          confirmButtonColor: '#7c3aed',
          customClass: {
            popup: 'rounded-xl',
            confirmButton: 'rounded-full px-6'
          }
        });
      }
    });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Katalog Reward</h1>
          <p className="text-sm text-slate-500">Tukarkan poin dengan sembako murah!</p>
        </div>
        <div className="bg-violet-50 px-3 py-1 rounded-full border border-violet-100 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-violet-700">45.200</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3 sticky top-0 bg-slate-50 py-2 z-10 -mx-4 px-4 backdrop-blur-sm bg-slate-50/90">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Cari beras, minyak, pulsa..." 
            className="pl-10 bg-white border-slate-200 focus:border-violet-500 shadow-sm rounded-full"
          />
        </div>

        {/* Categories Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                activeCategory === cat
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredRewards.map((item) => (
          <Card key={item.id} padding="none" className="overflow-hidden border-slate-100 shadow-sm flex flex-col h-full hover:border-violet-200 transition-colors bg-white">
            {/* Image Placeholder */}
            <div className={cn("aspect-square flex items-center justify-center relative", item.imageColor)}>
               <Package className="w-12 h-12 text-slate-400 opacity-50" />
               <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-700 border border-white/20">
                  {item.category}
               </div>
            </div>
            
            <CardContent className="p-3 flex flex-col flex-1">
              <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-1">{item.name}</h3>
              
              <div className="mt-auto space-y-3">
                 <div className="flex justify-between items-end">
                    <span className="text-violet-600 font-bold text-sm flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        {item.points.toLocaleString()}
                    </span>
                    <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-md font-medium",
                        item.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    )}>
                        {item.stock > 0 ? `Stok: ${item.stock}` : "Habis"}
                    </span>
                 </div>

                 <Button 
                    variant={item.stock > 0 ? "primary" : "outline"}
                    size="sm" 
                    fullWidth
                    disabled={item.stock === 0}
                    onClick={() => handleRedeem(item)}
                    className={cn(
                        "text-xs h-8 rounded-full",
                         item.stock === 0 && "opacity-50 border-slate-200 text-slate-400 bg-slate-50"
                    )}
                 >
                    {item.stock > 0 ? "Tukar" : "Stok Habis"}
                 </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
