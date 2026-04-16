'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Card, CardContent } from '@/components/ui/Card';
import { Search, Wallet, Package, CircleDollarSign, ShoppingCart, MapPin, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { api } from '@/lib/api';

const MySwal = withReactContent(Swal);

export default function RedeemPage() {
  const { mutate } = useSWRConfig();
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [selectedPosId, setSelectedPosId] = useState<number | string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const categories = ['Semua', 'Sembako', 'Pulsa', 'Peralatan', 'Voucher'];

  // 1. Fetch User Data (Balance)
  const { data: userData } = useSWR('/me', () => api.get('/me'));
  const userBalance = userData?.user?.profil?.saldo_poin || 0;

  // 2. Fetch Units
  const { data: unitsData } = useSWR('/units', api.getUnits);
  
  // Sync selected Pos from cookie or default
  useEffect(() => {
    const savedPosId = Cookies.get('selected_pos_id');
    if (savedPosId && !selectedPosId) {
        setSelectedPosId(savedPosId);
    } else if (unitsData?.data && unitsData.data.length > 0 && !selectedPosId && !savedPosId) {
        setSelectedPosId(unitsData.data[0].id);
        Cookies.set('selected_pos_id', String(unitsData.data[0].id), { expires: 1 });
    }
  }, [unitsData, selectedPosId]);

  const handlePosChange = (id: string) => {
    setSelectedPosId(id);
    Cookies.set('selected_pos_id', id, { expires: 1 });
  };

  // 3. Fetch Cart Data (Total items for the bubble)
  const { data: cartData } = useSWR('/cart', () => api.getCart());
  const cartItemCount = cartData?.total_items ?? cartData?.data?.length ?? 0;

  // 4. Fetch Rewards based on selected Pos
  const { data: rewardsData, isLoading: isLoadingRewards } = useSWR(
    selectedPosId ? ['/rewards', selectedPosId, activeCategory, searchQuery] : null,
    ([url, posId, category, search]) => api.getRewards({ 
        pos_id: posId, 
        category: category === 'Semua' ? '' : category,
        search 
    })
  );

  const rewards = rewardsData?.data || [];

  const handleAddToCart = async (item: any) => {
    if (item.stok === 0) return;

    // Optional: Confirm with Swal or just do it directly for "Add to Cart" feel
    // Let's do direct for speed but show a toast success
    try {
        const res = await api.addToCart(item.id, selectedPosId, 1);
        if (res.message) {
            mutate('/cart'); // Update counter
            
            MySwal.fire({
                title: 'Berhasil!',
                text: `${item.nama_reward} berhasil ditambahkan ke keranjang.`,
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
        }
    } catch (error) {
        MySwal.fire({
            title: 'Gagal',
            text: 'Terjadi kesalahan saat menambahkan ke keranjang.',
            icon: 'error',
            confirmButtonColor: '#7c3aed',
        });
    }
  };

  return (
    <div className="space-y-4 px-4 pt-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Katalog</h1>
        </div>

        <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-1.5 rounded-full border border-slate-100 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-violet-500 fill-violet-500" />
                <span className="text-sm font-bold text-violet-700">
                    {Number(userBalance).toLocaleString('id-ID')}
                </span>
            </div>
            
            
            <Link href="/cart">
                <button className="relative p-2 bg-white rounded-full border border-slate-100 text-slate-600 hover:text-violet-600 active:scale-95 transition-all">
                    <ShoppingCart className="w-5 h-5" />
                    {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold border-2 border-white animate-in zoom-in">
                            {cartItemCount}
                        </span>
                    )}
                </button>
            </Link>
        </div>
      </div>

      {/* Unit Selection & Search Container */}
      <div className="sticky top-0 bg-slate-50 z-20 pb-2 pt-2 -mx-4 px-4">
        <div className="flex gap-2 h-9 w-full overflow-hidden">
            
            {/* Unit Dropdown - Shrinks to icon when search is focused */}
            <div 
                className={cn(
                    "relative transition-all duration-300 ease-in-out h-9 flex-none overflow-hidden",
                    isSearchFocused ? "w-10" : "flex-1"
                )}
            >
                {/* Standard Select View */}
                <div className={cn(
                    "flex items-center h-9 bg-white border border-violet-100 rounded-full transition-opacity duration-200",
                    isSearchFocused ? "opacity-0 invisible" : "opacity-100 visible"
                )}>
                    <MapPin className="ml-3 w-4 h-4 text-violet-500 shrink-0" />
                    <select 
                        value={selectedPosId}
                        onChange={(e) => handlePosChange(e.target.value)}
                        className="bg-transparent border-none outline-none text-[11px] font-bold text-slate-700 flex-1 px-2 appearance-none h-full truncate"
                        style={{ backgroundImage: 'none' }}
                    >
                        {unitsData?.data?.map((unit: any) => (
                            <option key={unit.id} value={unit.id}>{unit.nama_pos}</option>
                        )) || <option>...</option>}
                    </select>
                    <div className="mr-3 pointer-events-none shrink-0">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>

                <div 
                    className={cn(
                        "absolute inset-0 flex items-center justify-center bg-white border border-violet-100 rounded-full transition-opacity duration-200 pointer-events-none",
                        isSearchFocused ? "opacity-100 visible shadow-sm" : "opacity-0 invisible"
                    )}
                >
                    <MapPin className="w-4 h-4 text-violet-500" />
                </div>
            </div>

            {/* Search Input - Expands when focused */}
            <div 
                className={cn(
                    "relative transition-all duration-300 ease-in-out h-9 overflow-hidden",
                    isSearchFocused ? "flex-1" : "w-[40%]"
                )}
            >
                <div className="relative flex items-center h-full">
                    <Search className="absolute left-3 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
                    <Input 
                        placeholder="Cari..." 
                        value={searchQuery}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-9 pr-10 bg-white border border-slate-200 rounded-full text-[11px] font-medium text-slate-700 outline-none focus:border-violet-400 focus:ring-0 transition-all shadow-none"
                    />
                    {searchQuery && (
                         <button 
                            onMouseDown={(e) => e.preventDefault()} 
                            onClick={() => setSearchQuery('')} 
                            className="absolute right-3 text-slate-300 hover:text-slate-500"
                        >
                            <X className="w-4 h-4" />
                         </button>
                    )}
                </div>
            </div>
        </div>

        {/* Categories Scroll */}
        <div className="flex gap-2 pt-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden select-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border",
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
      {isLoadingRewards ? (
         <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
         </div>
      ) : rewards.length > 0 ? (
          <div className="grid grid-cols-2 gap-1">
            {rewards.map((item: any) => (
              <Card key={item.id} padding="none" className="overflow-hidden border-slate-200/60 shadow-xs flex flex-col h-full bg-white rounded-xs">
                {/* Image */}
                <div className={cn("aspect-[16/10] flex items-center justify-center relative bg-slate-50 overflow-hidden")}>
                   {item.foto_url ? (
                     <img src={item.foto_url} alt={item.nama_reward} className="w-full h-full object-cover" />
                   ) : (
                     <Package className="w-10 h-10 text-slate-400/40" />
                   )}
                </div>
                
                <CardContent className="p-3 flex flex-col flex-1">
                  <div className="mb-2">
                     <h3 className="font-bold text-slate-800 text-xs line-clamp-2 leading-relaxed h-8">{item.nama_reward}</h3>
                  </div>
                  
                  <div className="mt-auto space-y-2">
                     <div className="flex flex-col gap-0.5">
                        <span className="text-violet-700 font-extrabold text-sm flex items-center gap-1">
                            <CircleDollarSign className="w-3.5 h-3.5 text-violet-500 fill-white" />
                            {parseInt(item.poin_tukar).toLocaleString('id-ID')}
                        </span>
                        <span className={cn(
                            "text-[10px] font-medium",
                            item.stok > 0 ? "text-slate-400" : "text-red-400"
                        )}>
                            {item.stok > 0 ? `Sisa: ${item.stok}` : "Stok Habis"}
                        </span>
                     </div>

                     <Button 
                        variant={item.stok > 0 ? "primary" : "outline"}
                        size="sm" 
                        fullWidth
                        disabled={item.stok === 0}
                        onClick={() => handleAddToCart(item)}
                        className={cn(
                            "text-[10px] h-8 rounded-xs font-bold shadow-none w-full tracking-wide",
                             item.stok === 0 && "opacity-50 border-slate-100 text-slate-300 bg-slate-50"
                        )}
                     >
                        {item.stok > 0 ? "Tambahkan" : "Habis"}
                     </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
      ) : (
          <div className="text-center py-20">
              <p className="text-slate-400 text-sm">Belum ada reward tersedia di unit ini.</p>
          </div>
      )}
    </div>
  );
}
