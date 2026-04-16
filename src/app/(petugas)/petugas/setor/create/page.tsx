'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  User, 
  Trash2, 
  Plus, 
  Camera, 
  X,
  Scale,
  Package,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { getImageUrl, getUserName } from '@/lib/utils';
import useSWR from 'swr';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function CreateSetoranContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberIdParam = searchParams.get('member_id');
  const nik = memberIdParam || '';

  const { data: userData, error: userError, isLoading: userLoading } = useSWR(
    nik ? `user-${nik}` : null,
    () => api.findUser(nik)
  );

  const { data: sampahRes, error: sampahError } = useSWR('sampah-types', () => api.getSampahTypes());

  const [items, setItems] = useState([{ sampah_id: '', berat: '' }]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems([{ sampah_id: '', berat: '' }, ...items]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: 'sampah_id' | 'berat', value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const { data: meData } = useSWR('/me', api.getMe);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const remainingSlots = 3 - photos.length;
      const filesToAdd = newFiles.slice(0, remainingSlots);

      setPhotos(prev => [...prev, ...filesToAdd]);
      
      const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      MySwal.fire({
        icon: 'error',
        title: 'Kamera Gagal',
        text: 'Tidak dapat mengakses kamera. Pastikan Anda memberikan izin.'
      });
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `bukti-setor-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setPhotos(prev => [...prev, file]);
            setPreviews(prev => [...prev, URL.createObjectURL(file)]);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData?.data) {
        MySwal.fire({ icon: 'error', title: 'Error', text: 'Data nasabah tidak valid.' });
        return;
    }

    if (items.some(item => !item.sampah_id || !item.berat)) {
        MySwal.fire({ icon: 'warning', title: 'Perhatian', text: 'Mohon lengkapi data sampah dan berat.' });
        return;
    }

    if (photos.length === 0) {
        MySwal.fire({ icon: 'warning', title: 'Perhatian', text: 'Mohon ambil minimal 1 foto bukti.' });
        return;
    }

    const result = await MySwal.fire({
      title: 'Konfirmasi Setoran',
      text: 'Apakah data setoran sudah benar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Simpan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0284c7', // sky-600
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('member_id', String(userData.data.id));
      
      const posId = meData?.user?.profil?.pos_id || userData.data.profil?.pos_id || '1';
      formData.append('pos_id', String(posId));
      
      items.forEach((item, index) => {
        formData.append(`items[${index}][sampah_id]`, item.sampah_id);
        formData.append(`items[${index}][berat]`, item.berat);
      });

      photos.forEach((photo) => {
        formData.append('photos[]', photo);
      });

      await api.createSetoran(formData);

      await MySwal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Transaksi setoran sampah berhasil disimpan.',
        confirmButtonColor: '#0284c7', // sky-600
      });

      router.push('/petugas/dashboard');
    } catch (err: any) {
      console.error(err);
      MySwal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.message || 'Terjadi kesalahan saat menyimpan setoran.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin mb-4" />
        <p className="text-sm text-slate-500">Memvalidasi Data Nasabah...</p>
      </div>
    );
  }

  if (userError || !userData?.data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-slate-900 mb-2">Nasabah Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mb-8">Data nasabah dengan NIK tersebut tidak valid atau tidak terdaftar.</p>
        <Button onClick={() => router.back()} variant="outline" fullWidth>Kembali ke Scanner</Button>
      </div>
    );
  }

  const member = userData.data;
  const profilePhoto = getImageUrl(member?.profil?.foto_profil);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Input Setoran Sampah</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Nasabah Card */}
        <Card className="p-5 relative">
           <div className="flex gap-4 items-center">
              <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 overflow-hidden flex-shrink-0">
                 {profilePhoto ? (
                    <img src={profilePhoto} alt={member?.name} className="w-full h-full object-cover" />
                 ) : (
                    <User className="w-7 h-7" />
                 )}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">Informasi Nasabah</p>
                 <h3 className="text-base font-bold text-slate-900 leading-tight truncate">{getUserName(member)}</h3>
                 <p className="text-xs text-slate-500 font-bold font-mono tracking-tight">{member?.username || 'NIK Nasabah'}</p>
              </div>
              <div className="absolute top-4 right-4">
                 <div className="flex items-center gap-1.5 px-2 py-1 rounded-[2px] bg-emerald-500 text-white text-[9px] font-black">
                    Verified
                 </div>
              </div>
           </div>
        </Card>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                 <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-sky-600" />
                    Daftar Sampah
                 </h3>
                 <button 
                   type="button" 
                   onClick={addItem}
                   className="text-xs font-bold text-sky-600 flex items-center gap-1"
                 >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Item
                 </button>
              </div>

              {items.map((item, index) => (
                <Card key={index} className="overflow-visible">
                   <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                         <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 block">Jenis Sampah</label>
                            <select
                              value={item.sampah_id}
                              onChange={(e) => handleItemChange(index, 'sampah_id', e.target.value)}
                              className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-sm focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors"
                              required
                            >
                               <option value="">Pilih Jenis...</option>
                               {sampahRes?.data?.map((s: any) => (
                                 <option key={s.id} value={s.id}>{s.nama_sampah}</option>
                               ))}
                            </select>
                         </div>
                         <div className="w-32">
                            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 block">Berat (Kg)</label>
                            <div className="relative">
                               <input
                                 type="number"
                                 step="0.01"
                                 value={item.berat}
                                 onChange={(e) => handleItemChange(index, 'berat', e.target.value)}
                                 className="w-full h-10 px-3 pr-8 text-sm bg-white border border-slate-200 rounded-sm focus:border-slate-400 focus:outline-none focus:ring-0 transition-colors"
                                 placeholder="0.00"
                                 required
                               />
                               <Scale className="w-4 h-4 text-slate-300 absolute right-3 top-1/2 -translate-y-1/2" />
                            </div>
                         </div>
                         {items.length > 1 && (
                            <button 
                               type="button"
                               onClick={() => removeItem(index)}
                               className="mt-7 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         )}
                      </div>
                   </div>
                </Card>
              ))}
           </div>

           {/* Photos Section */}
           <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 px-1">
                 <Camera className="w-4 h-4 text-sky-600" />
                 Foto Bukti Setoran
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                 {previews.map((url, i) => (
                    <div key={i} className="aspect-square bg-slate-200 rounded-sm relative overflow-hidden group border border-slate-200 shadow-xs">
                       <img src={url} alt="Preview" className="w-full h-full object-cover" />
                       <button 
                         type="button"
                         onClick={() => removePhoto(i)}
                         className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white flex items-center justify-center rounded-sm shadow-sm"
                       >
                          <X className="w-3.5 h-3.5" />
                       </button>
                    </div>
                 ))}
                 
                 {photos.length < 3 && (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="aspect-square bg-white border-2 border-dashed border-slate-200 rounded-sm flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 transition-colors shadow-xs"
                    >
                       <Camera className="w-6 h-6 text-slate-300" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ambil Foto</span>
                    </button>
                 )}
              </div>
              <p className="text-[10px] text-slate-400 px-1 italic">Maksimal 3 foto. Foto akan dikompresi otomatis.</p>
           </div>

           <div className="pt-4">
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                className="h-10 cursor-pointer rounded-full tracking-widest"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </div>
                ) : 'Simpan Transaksi'}
              </Button>
           </div>
        </form>
      </div>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <h3 className="text-sm font-bold uppercase tracking-widest">Kamera Bukti</h3>
            <button onClick={stopCamera} className="w-8 h-8 flex items-center justify-center">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            {/* Overlay focus area */}
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
              <div className="w-full h-full border border-white/50 border-dashed rounded-sm" />
            </div>
          </div>

          <div className="p-10 flex items-center justify-center bg-black">
            <button 
              onClick={takePhoto}
              className="w-20 h-20 rounded-full bg-white border-[6px] border-slate-300 active:scale-90 transition-transform shadow-lg"
            />
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
}

export default function CreateSetoranPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Memuat Halaman...</p>
       </div>
    }>
      <CreateSetoranContent />
    </Suspense>
  );
}
