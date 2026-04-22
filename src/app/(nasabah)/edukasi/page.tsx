'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EdukasiPage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const edukasiImages = [
    {
      id: 1,
      src: '/edukasi/1.webp',
      title: 'Apa Itu Sampah?',
      desc: 'Sampah adalah sisa aktivitas manusia atau proses alam yang berbentuk padat dan tidak lagi memiliki nilai guna.'
    },
    {
      id: 2,
      src: '/edukasi/2.webp',
      title: 'Mengenal Jenis Sampah',
      desc: 'Sampah umumnya dibedakan menjadi tiga jenis utama: Sampah Organik, Sampah Anorganik, dan Sampah B3.'
    },
    {
      id: 3,
      src: '/edukasi/3.webp',
      title: 'Kategori 1: Organik',
      desc: 'Sampah yang mudah membusuk. Dapat diolah kembali menjadi pupuk kompos yang menyuburkan tanah atau dimanfaatkan sebagai pakan ternak.'
    },
    {
      id: 4,
      src: '/edukasi/4.webp',
      title: 'Kategori 2: Anorganik',
      desc: 'Sampah yang tahan lama dan sulit terurai seperti plastik. Dapat disalurkan ke pabrik daur ulang untuk diproses menjadi barang baru.'
    },
    {
      id: 5,
      src: '/edukasi/5.webp',
      title: 'Kategori 3: B3 & Residu',
      desc: 'Bahan Berbahaya dan Beracun (B3) seperti limbah medis atau baterai. Memerlukan penanganan khusus agar tidak membahayakan lingkungan.'
    },
  ];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollPosition = scrollRef.current.scrollLeft;
    const width = scrollRef.current.clientWidth;
    const newIndex = Math.round(scrollPosition / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: width * index,
      behavior: 'smooth',
    });
  };

  return (
    <div className="h-[calc(100dvh-6rem)] w-full bg-white flex flex-col relative overflow-hidden" suppressHydrationWarning>

      {/* Header - Sesuai dengan screenshot referensi */}
      <header className="bg-white px-4 py-3.5 flex items-center gap-3 sticky top-0 z-30 border-b border-slate-200">
        <button
          onClick={() => router.back()}
          className="p-1 -ml-1 rounded-full hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">Edukasi</h1>
      </header>

      {/* Slider Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory no-scrollbar overscroll-x-contain"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {edukasiImages.map((item, index) => (
          <div
            key={item.id}
            className="w-full h-full shrink-0 snap-center flex flex-col relative px-4 pt-6 pb-20 overflow-hidden"
          >
            {/* Text Content */}
            <div className="text-center px-2 mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">{item.title}</h2>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>

            {/* Image Box */}
            <div className="flex-1 relative w-full flex items-center justify-center pb-2">
              <div
                className={cn(
                  "relative w-full max-w-[280px] sm:max-w-[380px] transition-all duration-500 ease-out",
                  activeIndex === index ? "scale-100 opacity-100" : "scale-95 opacity-50"
                )}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  width={600}
                  height={850}
                  className="w-full h-auto object-contain rounded-3xl shadow-md border border-slate-200/50"
                  priority={index < 2}
                  unoptimized
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation & Pagination Indicators */}
      <div className="absolute bottom-6 inset-x-0 px-4 flex justify-between items-center z-20">
        <button
          onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
          className={cn(
            "px-4 py-2 text-violet-600 font-semibold text-sm transition-opacity active:scale-95",
            activeIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          Kembali
        </button>

        <div className="flex justify-center items-center gap-1.5">
          {edukasiImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollTo(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500 ease-out",
                activeIndex === idx ? "w-5 bg-violet-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"
              )}
              aria-label={`Ke halaman ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => scrollTo(Math.min(edukasiImages.length - 1, activeIndex + 1))}
          className={cn(
            "px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-semibold text-sm shadow-sm transition-all active:scale-95",
            activeIndex === edukasiImages.length - 1 ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          Lanjut
        </button>
      </div>

      {/* Hide Scrollbar CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
