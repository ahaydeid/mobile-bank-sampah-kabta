'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Trash2, ArrowLeft, Loader2, MapPin, Wallet, Package, Check, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function CartPage() {
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPosId, setSelectedPosId] = useState<string>('');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number | string>>(new Set());
  
  // 1. Fetch Cart (Reactive to selectedPosId)
  const { data: cartData, isLoading: isLoadingCart } = useSWR(
    ['/cart', selectedPosId],
    ([url, posId]) => api.getCart(posId)
  );
  const cartItems = cartData?.data || [];

  // Update selected items when cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      setSelectedItemIds(new Set(cartItems.map((item: any) => item.reward_id)));
    } else {
      setSelectedItemIds(new Set());
    }
  }, [cartItems]);

  // 2. Fetch Units
  const { data: unitsData } = useSWR('/units', api.getUnits);
  
  // Handle default unit
  useEffect(() => {
    if (unitsData?.data?.length > 0 && !selectedPosId) {
      const savedPosId = Cookies.get('selected_pos_id');
      if (savedPosId) {
        setSelectedPosId(savedPosId);
      } else {
        const firstUnitId = String(unitsData.data[0].id);
        setSelectedPosId(firstUnitId);
        Cookies.set('selected_pos_id', firstUnitId, { expires: 1 });
      }
    }
  }, [unitsData, selectedPosId]);

  const selectedPos = unitsData?.data?.find((u: any) => String(u.id) === String(selectedPosId));

  const handlePosChange = (id: string) => {
    setSelectedPosId(id);
    Cookies.set('selected_pos_id', id, { expires: 1 });
  };

  const toggleItemSelection = (id: number | string) => {
    const newSelected = new Set(selectedItemIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItemIds(newSelected);
  };

  // 3. Fetch User Balance
  const { data: userData } = useSWR('/me', () => api.get('/me'));
  const userBalance = userData?.user?.profil?.saldo_poin || 0;

  const selectedItems = cartItems.filter((item: any) => selectedItemIds.has(item.reward_id));

  const totalPoints = selectedItems.reduce((acc: number, item: any) => {
    return acc + (parseInt(item.reward.poin_tukar) * item.jumlah);
  }, 0);

  const handleUpdateQuantity = async (rewardId: number | string, currentQty: number, delta: number, stock: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (newQty > stock && delta > 0) {
      MySwal.fire({
        title: 'Stok Terbatas',
        text: `Maaf, stok hanya tersedia ${stock} unit.`,
        icon: 'warning',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    try {
      await api.updateCartQuantity(rewardId, newQty, selectedPosId);
      mutate(['/cart', selectedPosId]);
    } catch (e) {
      MySwal.fire({
        title: 'Gagal',
        text: 'Gagal memperbarui jumlah item.',
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
    }
  };

  const handleRemove = async (rewardId: number | string, name: string) => {
    const result = await MySwal.fire({
      title: 'Hapus Item?',
      text: `Apakah Anda yakin ingin menghapus ${name} dari keranjang?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'rounded-full px-6',
        cancelButton: 'rounded-full px-6'
      }
    });

    if (result.isConfirmed) {
      try {
        await api.removeFromCart(rewardId, selectedPosId);
        mutate(['/cart', selectedPosId]);
        MySwal.fire({
          title: 'Dihapus',
          text: 'Item berhasil dihapus.',
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
      } catch (e) {
        MySwal.fire('Gagal', 'Terjadi kesalahan saat menghapus item.', 'error');
      }
    }
  };

  const handleCheckout = async () => {
    if (selectedItemIds.size === 0) {
        MySwal.fire({
            title: 'Pilih Barang',
            text: 'Silakan pilih setidaknya satu barang untuk ditukar.',
            icon: 'info',
            confirmButtonColor: '#7c3aed',
            customClass: { popup: 'rounded-xl', confirmButton: 'rounded-full px-6' }
        });
        return;
    }

    if (!selectedPosId) {
        MySwal.fire({
            title: 'Pilih Unit',
            text: 'Silakan klik pilih Unit Pos tempat pengambilan barang.',
            icon: 'info',
            confirmButtonColor: '#7c3aed',
            customClass: { popup: 'rounded-xl', confirmButton: 'rounded-full px-6' }
        });
        return;
    }

    if (userBalance < totalPoints) {
        MySwal.fire('Poin Kurang', 'Saldo poin Anda tidak mencukupi untuk checkout ini.', 'error');
        return;
    }

    const result = await MySwal.fire({
        title: 'Konfirmasi Tukar',
        html: `<p class="text-sm text-slate-600">Total <b>${totalPoints.toLocaleString('id-ID')} poin</b> untuk <b>${selectedItemIds.size} item</b> akan dipotong dari saldo Anda untuk penukaran di <b>${selectedPos?.nama_pos || 'Unit Terpilih'}</b>.</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Tukar Sekarang',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#7c3aed',
        cancelButtonColor: '#94a3b8',
        customClass: {
          popup: 'rounded-xl',
          confirmButton: 'rounded-full px-6 text-sm',
          cancelButton: 'rounded-full px-6 text-sm'
        }
    });

    if (result.isConfirmed) {
        setIsSubmitting(true);
        try {
            const items = selectedItems.map((item: any) => ({
                reward_id: item.reward_id,
                jumlah: item.jumlah
            }));

            const res = await api.checkout(selectedPosId, items);
            
            if (res.data) {
                // Clear cart (backend usually clears it after checkout, but let's revalidate)
                mutate('/cart');
                mutate('/me'); // Refresh balance

                MySwal.fire({
                    title: 'Berhasil!',
                    text: 'Penukaran poin berhasil diproses. Silakan tunjukkan QR Code ke petugas.',
                    icon: 'success',
                    confirmButtonColor: '#7c3aed',
                    customClass: {
                        popup: 'rounded-xl',
                        confirmButton: 'rounded-full px-8'
                    }
                }).then(() => {
                    // Navigate to history or home
                    window.location.href = '/dashboard';
                });
            } else {
                throw new Error(res.message || 'Gagal checkout');
            }
        } catch (e: any) {
            MySwal.fire('Gagal', e.message || 'Terjadi kesalahan saat checkout.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Sticky Top Group */}
      <div className="sticky top-0 z-40 bg-white border-b border-violet-100 shadow-xs">
        {/* Header */}
        <div className="px-4 py-1.5 flex items-center gap-4">
          <Link href="/redeem" className="p-1 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex-1">Keranjang</h1>
          <div className="bg-violet-50 px-3 py-1 rounded-full flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-violet-600 fill-violet-600" />
              <span className="text-xs font-bold text-violet-700">{Number(userBalance).toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Location Selector - 1 Baris 2 Kolom */}
        <div className="px-4 py-2 bg-slate-50/50 flex items-center justify-between gap-3">
             <div className="flex items-center gap-1.5 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-violet-500" />
                <p className="text-[10px] text-slate-400 font-bold tracking-wider">Unit Pos</p>
             </div>
             
             <div className="relative flex-1">
                <select 
                    value={selectedPosId}
                    onChange={(e) => handlePosChange(e.target.value)}
                    className="w-full h-8 pl-3 pr-8 bg-white border border-violet-100 rounded-lg text-[11px] font-medium text-slate-700 focus:outline-none appearance-none"
                >
                    {unitsData?.data?.map((unit: any) => (
                        <option key={unit.id} value={unit.id}>{unit.nama_pos}</option>
                    ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
             </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-1 flex-1">
        {isLoadingCart ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
            <p className="text-slate-400 text-sm font-medium">Memuat isi keranjang...</p>
          </div>
        ) : cartItems.length > 0 ? (
          <>
            <div className="">
              {cartItems.map((item: any) => (
                <Card key={item.id} padding="none" className="overflow-hidden rounded-none border-slate-100 relative bg-white">
                  <CardContent className="p-3 flex items-center gap-3">
                    {/* Checkbox */}
                    <div 
                        onClick={() => toggleItemSelection(item.reward_id)}
                        className="p-1 shrink-0 flex items-center justify-center cursor-pointer"
                    >
                        <div className={cn(
                            "w-4 h-4 rounded border-2 transition-all flex items-center justify-center",
                            selectedItemIds.has(item.reward_id) 
                                ? "bg-violet-600 border-violet-600" 
                                : "bg-white border-slate-300"
                        )}>
                            {selectedItemIds.has(item.reward_id) && (
                                <Check className="w-3.5 h-3.5 text-white" />
                            )}
                        </div>
                    </div>

                    <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                      {item.reward.foto_url ? (
                        <img src={item.reward.foto_url} alt={item.reward.nama_reward} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 py-0.5">
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{(item.reward_flattened || item.reward).nama_reward}</h3>
                      <div className="flex items-center gap-2 mb-1.5 ">
                        <p className={cn(
                            "text-[10px] font-bold",
                            (item.reward_flattened?.stok || 0) > 0 ? "text-amber-600" : "text-red-500"
                        )}>
                            Stok: {item.reward_flattened?.stok || 0}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-violet-700 font-extrabold text-sm">
                            {parseInt((item.reward_flattened || item.reward).poin_tukar).toLocaleString('id-ID')} <span className="text-[10px] text-slate-400 font-medium">Poin</span>
                        </span>
                        
                        <div className="flex items-center bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateQuantity(item.reward_id, item.jumlah, -1, item.reward_flattened?.stok || 0);
                                }}
                                className="p-1 px-2.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30"
                                disabled={item.jumlah <= 1}
                            >
                                <Minus className="w-3 h-3 font-bold" />
                            </button>
                            <span className="px-1 text-[11px] font-black text-slate-700 min-w-[24px] text-center">
                                {item.jumlah}
                            </span>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateQuantity(item.reward_id, item.jumlah, 1, item.reward_flattened?.stok || 0);
                                }}
                                className="p-1 px-2.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30"
                                disabled={item.jumlah >= (item.reward_flattened?.stok || 0)}
                            >
                                <Plus className="w-3 h-3 font-bold" />
                            </button>
                        </div>
                      </div>
                    </div>

                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(item.reward_id, item.reward.nama_reward);
                        }}
                        className="absolute top-2.5 right-2 p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary Footer Bar */}
            <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md z-40 bg-white border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-6 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.05)]">
              <div className="grid grid-cols-[auto_1fr] gap-x-2 items-center">
                <span className="text-[10px] text-slate-400 font-medium tracking-widest">Item</span>
                <span className="text-sm font-bold text-slate-400 flex items-center gap-1">
                  : <span className="text-violet-700">{selectedItemIds.size}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-widest whitespace-nowrap">Total Poin</span>
                <span className="text-sm font-bold text-slate-400 flex items-center gap-1">
                  : <span className="text-violet-700">{totalPoints.toLocaleString('id-ID')}</span>
                </span>
              </div>
              <Button 
                className="rounded-full h-10 px-8 font-black text-sm tracking-wide shrink-0 bg-violet-600 hover:bg-violet-700 text-white"
                onClick={handleCheckout}
                disabled={isSubmitting || cartItems.length === 0}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tukar"}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-slate-100 p-6 rounded-full mb-6">
              <ShoppingCart className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Keranjang Kosong</h3>
            <p className="text-sm text-slate-500 mb-8 px-10">Kamu belum menambahkan barang apapun ke keranjang.</p>
          </div>
        )}
      </div>
    </div>
  );
}
