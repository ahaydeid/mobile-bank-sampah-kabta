'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Recycle, Coins, Gift } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming utils exists

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Pilah Sampahmu",
      description: "Pisahkan sampah organik dan anorganik untuk lingkungan yang lebih baik.",
      icon: Recycle,
      color: "text-violet-600",
      bgColor: "bg-violet-100",
    },
    {
      id: 2,
      title: "Kumpulkan Poin",
      description: "Setor sampah ke bank sampah terdekat dan dapatkan poin menarik.",
      icon: Coins,
      color: "text-amber-500",
      bgColor: "bg-amber-100",
    },
    {
      id: 3,
      title: "Tukar Rewards",
      description: "Tukarkan poinmu dengan sembako atau kebutuhan sehari-hari lainnya.",
      icon: Gift,
      color: "text-violet-600",
      bgColor: "bg-violet-100",
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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Skip Button */}
      <div className="flex justify-end p-6">
        <button 
          onClick={handleSkip}
          className="text-sm font-medium text-slate-400 hover:text-slate-600"
        >
          Lewati
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-full max-w-[320px] aspect-square relative mb-8 flex items-center justify-center">
             {/* Illustration Placeholder (Since generation failed) */}
             <div className={cn(
                "w-64 h-64 rounded-full flex items-center justify-center transition-colors duration-500",
                slides[currentSlide].bgColor
             )}>
                {React.createElement(slides[currentSlide].icon, {
                    className: cn("w-32 h-32 transition-colors duration-500", slides[currentSlide].color),
                    strokeWidth: 1.5
                })}
             </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-3 transition-all duration-300">
          {slides[currentSlide].title}
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs transition-all duration-300">
          {slides[currentSlide].description}
        </p>
      </div>

      {/* Footer Controls */}
      <div className="p-8">
        {/* Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div 
              key={index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                currentSlide === index 
                  ? "w-8 bg-violet-600" 
                  : "w-2 bg-slate-200"
              )}
            />
          ))}
        </div>

        {/* Action Button */}
        <Button 
          fullWidth 
          variant={currentSlide === slides.length - 1 ? "secondary" : "primary"}
          onClick={handleNext}
          className="h-12"
        >
          {currentSlide === slides.length - 1 ? (
            "Mulai Sekarang"
          ) : (
            <span className="flex items-center">
              Selanjutnya <ArrowRight className="ml-2 w-4 h-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
