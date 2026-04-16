'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Preload images
  useEffect(() => {
    const images = ['/onboarding/slide-1.jpeg', '/onboarding/slide-2.jpeg', '/onboarding/slide-3.jpeg'];
    images.forEach(src => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  const slides = [
    {
      id: 1,
      titlePart1: "Pilah",
      titlePart2: "Sampahmu",
      description: "Pisahkan berdasarkan jenisnya dengan mudah dan praktis.",
      image: "/onboarding/slide-1.jpeg",
    },
    {
      id: 2,
      titlePart1: "Kumpulkan",
      titlePart2: "Koinmu",
      description: "Jadikan sampahmu menjadi saldo digital, menguntungkan setiap hari.",
      image: "/onboarding/slide-2.jpeg",
    },
    {
      id: 3,
      titlePart1: "Tukar Koin &",
      titlePart2: "Event",
      description: "Tukar koin menjadi hadiah menarik & menangkan berbagai event seru!",
      image: "/onboarding/slide-3.jpeg",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(curr => curr + 1);
    } else {
      router.push('/login');
    }
  };

  const handleSkip = () => {
    router.push('/login');
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#FFFF] overflow-hidden font-sans relative">
      {/* Header Skip */}
      <header className="w-full flex justify-end px-6 pt-8 pb-4 absolute top-0 z-20">
        <button
          onClick={handleSkip}
          className="text-[13px] font-bold text-[#5aba1a] bg-[#5aba1a]/10 hover:bg-[#5aba1a]/20 transition-colors px-5 py-2.5 rounded-full"
        >
          Lewati
        </button>
      </header>

      {/* Top Text Content (Title & Desc) */}
      <div className="pt-[90px] pb-6 px-6 text-center z-10 flex flex-col items-center">
        <h1 className="text-[24px] leading-tight font-extrabold text-[#2D2D3A] mb-2 tracking-tight max-w-[300px]">
          {slides[currentSlide].titlePart1} <span className="text-[#5aba1a]">{slides[currentSlide].titlePart2}</span>
        </h1>
        <p className="text-[#84879D] text-[12px] leading-relaxed max-w-[280px] h-10 font-medium">
          {slides[currentSlide].description}
        </p>
      </div>

      {/* Carousel */}
      <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
        <div className="w-full h-[55vh] min-h-[350px] max-h-[500px] relative flex items-center justify-center">
          {slides.map((slide, index) => {
            const difference = index - currentSlide;

            // Animation logic mimicking a 3D horizontal carousel
            let translate = 'translate-x-[0%]';
            let zIndex = 'z-10';
            let scale = 'scale-100';
            let opacity = 'opacity-100';

            if (difference === 1) {
              translate = 'translate-x-[90%]';
              zIndex = 'z-0';
              scale = 'scale-[0.80]';
              opacity = 'opacity-40 hover:opacity-70 cursor-pointer';
            } else if (difference === -1) {
              translate = '-translate-x-[90%]';
              zIndex = 'z-0';
              scale = 'scale-[0.80]';
              opacity = 'opacity-40 hover:opacity-70 cursor-pointer';
            } else if (difference > 1) {
              translate = 'translate-x-[180%]';
              zIndex = '-z-10';
              scale = 'scale-[0.7]';
              opacity = 'opacity-0';
            } else if (difference < -1) {
              translate = '-translate-x-[180%]';
              zIndex = '-z-10';
              scale = 'scale-[0.7]';
              opacity = 'opacity-0';
            }

            return (
              <div
                key={slide.id}
                className={cn(
                  "absolute w-[72%] max-w-[250px] h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-2xl overflow-hidden shadow-sm bg-white",
                  translate,
                  zIndex,
                  scale,
                  opacity
                )}
                onClick={() => {
                  if (difference === 1) setCurrentSlide(curr => curr + 1);
                  if (difference === -1) setCurrentSlide(curr => curr - 1);
                }}
              >
                <div className="absolute inset-0 bg-slate-100 animate-pulse" /> {/* Placeholder loading */}
                <Image
                  src={slide.image}
                  alt={slide.titlePart1}
                  fill
                  sizes="(max-width: 768px) 80vw, 300px"
                  className="object-cover"
                  draggable={false}
                  loading={currentSlide === index ? "eager" : "lazy"}
                  priority={currentSlide === index}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <footer className="w-full px-8 pb-[10vh] pt-6 flex flex-col items-center bg-transparent z-10 gap-10">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-[6px] rounded-full transition-all duration-500",
                currentSlide === index ? "w-6 bg-[#2D2D3A]" : "w-[6px] bg-[#D4D5DF]"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <Button
          fullWidth
          variant="primary"
          onClick={handleNext}
          className="h-10 rounded-full text-[12px] font-bold shadow-sm bg-[#2A2A2E] hover:bg-black border-none text-white max-w-sm transition-transform active:scale-95"
        >
          {currentSlide === slides.length - 1 ? (
            "Mulai Sekarang"
          ) : (
            "Selanjutnya"
          )}
        </Button>
      </footer>
    </main>
  );
}
