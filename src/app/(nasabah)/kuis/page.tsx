'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Trophy, CheckCircle2, XCircle, ArrowRight, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import confetti from 'canvas-confetti';

// Tipe Data
interface Question {
  id: number;
  pertanyaan: string;
  opsi_a: string;
  opsi_b: string;
  opsi_c: string;
  opsi_d: string;
  jawaban_benar: string;
  penjelasan: string;
}

interface KuisSettings {
  waktu_total_detik: number;
  poin_per_soal: number;
}

export default function KuisPage() {
  const router = useRouter();

  // State API Data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<KuisSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State Kuis
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [benarCount, setBenarCount] = useState(0);
  const [salahCount, setSalahCount] = useState(0);

  // State Timer & Akhir
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalScoreData, setFinalScoreData] = useState<{ poin_didapat: number, total_poin_sekarang: number } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Data Awal
  useEffect(() => {
    const fetchKuis = async () => {
      try {
        const response = await api.getKuis();
        if (response.success) {
          const qs = response.data.questions;
          const st = response.data.settings;

          if (qs.length === 0) {
            setErrorMsg('Saat ini belum ada soal kuis yang tersedia.');
            setIsLoading(false);
            return;
          }

          setQuestions(qs);
          setSettings(st);
          setTimeLeft(parseInt(st.waktu_total_detik) || 60);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal memuat data kuis.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKuis();
  }, []);

  // Timer Logic
  useEffect(() => {
    if (isLoading || errorMsg || isFinished || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          finishQuiz(true); // paksa selesai karena waktu habis
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, errorMsg, isFinished, questions]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Efek Hore (Confetti) saat selesai
  useEffect(() => {
    if (isFinished && !errorMsg && canvasRef.current) {
      const myConfetti = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true
      });

      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        myConfetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#8b5cf6', '#a78bfa', '#f59e0b', '#10b981', '#f43f5e']
        });
        myConfetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#8b5cf6', '#a78bfa', '#f59e0b', '#10b981', '#f43f5e']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      return () => {
        myConfetti.reset();
      };
    }
  }, [isFinished, errorMsg]);

  const question = questions[currentQuestionIndex];

  const handleAnswer = (optionId: string) => {
    if (isAnswered || isFinished) return;

    setSelectedAnswer(optionId);
    setIsAnswered(true);

    if (optionId === question.jawaban_benar) {
      setBenarCount((prev) => prev + 1);
    } else {
      setSalahCount((prev) => prev + 1);
    }
  };

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      finishQuiz(false);
    }
  };

  const finishQuiz = async (timeUp = false) => {
    setIsFinished(true);
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Hitung sisa yang belum terjawab jika waktu habis
    let finalBenar = benarCount;
    let finalSalah = salahCount;

    if (timeUp && currentQuestionIndex < questions.length) {
      // Jika waktu habis di tengah soal, sisa soal dianggap salah
      const answeredTotal = finalBenar + finalSalah;
      const unassigned = questions.length - answeredTotal;
      if (unassigned > 0) {
        finalSalah += unassigned;
        setSalahCount(finalSalah);
      }
    }

    try {
      const res = await api.submitKuisScore(finalBenar, finalSalah);
      if (res.success) {
        setFinalScoreData(res.data);
      }
    } catch (err: any) {
      console.error("Gagal menyimpan skor:", err);
      setErrorMsg(err.message || 'Gagal menyimpan skor kuis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format Waktu MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // View Loading
  if (isLoading) {
    return (
      <div className="h-[calc(100dvh-6rem)] w-full bg-slate-50 flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <p className="text-slate-500 font-medium">Memuat Kuis...</p>
      </div>
    );
  }

  // View Error / Sudah Mengerjakan
  if (errorMsg) {
    return (
      <div className="h-[calc(100dvh-6rem)] w-full bg-slate-50 flex flex-col justify-center items-center px-6">
        <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">Pemberitahuan</h2>
        <p className="text-slate-500 text-sm text-center mb-8">{errorMsg}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full max-w-xs py-2.5 bg-violet-600 text-white rounded-full font-bold shadow-md hover:bg-violet-700 transition-colors"
        >
          Kembali
        </button>
      </div>
    );
  }

  // View Selesai
  if (isFinished) {
    const isSuccess = !errorMsg && finalScoreData;

    return (
      <div className="h-[calc(100dvh-6rem)] w-full bg-white flex flex-col justify-center items-center px-6 relative overflow-hidden" suppressHydrationWarning>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-50" />
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-violet-200/50 to-transparent pointer-events-none" />

        <div className="bg-white p-8 rounded-3xl shadow-md w-full max-w-sm text-center relative z-10 border border-slate-100">
          {isSubmitting ? (
            <div className="py-10">
              <Loader2 className="w-10 h-10 animate-spin text-violet-600 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Menghitung Skormu...</p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Trophy className="w-10 h-10" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Kuis Selesai!</h2>
              <p className="text-slate-500 text-sm mb-6">Kamu mendapatkan poin sebanyak:</p>

              <div className="text-6xl font-black text-violet-600 mb-2 tracking-tighter">
                +{finalScoreData?.poin_didapat || 0}
              </div>
              <p className="text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest">Poin Saldo</p>

              <div className="bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100 flex justify-between px-6">
                <div className="text-center">
                  <p className="text-xs text-slate-400 font-bold mb-1">BENAR</p>
                  <p className="text-xl font-black text-emerald-600">{benarCount}</p>
                </div>
                <div className="w-px bg-slate-200"></div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 font-bold mb-1">SALAH</p>
                  <p className="text-xl font-black text-rose-500">{salahCount}</p>
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-2.5 bg-violet-600 text-white rounded-full font-bold shadow-sm hover:bg-violet-700 transition-colors active:scale-95"
              >
                Kembali
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // View Kuis Aktif
  return (
    <div className="h-[calc(100dvh-6rem)] w-full bg-white flex flex-col relative overflow-hidden" suppressHydrationWarning>
      {/* Header */}
      <header className="bg-white px-4 py-3.5 flex items-center gap-3 sticky top-0 z-30 border-b border-slate-200">
        <button
          onClick={() => router.back()}
          className="p-1 -ml-1 rounded-full hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <div className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase">
            Kuis Sankara
          </div>
        </div>
        <div className="w-8"></div> {/* Spacer for symmetry */}
      </header>

      {/* Progress Bar & Timer */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-sm font-bold text-slate-800 tracking-tight">Soal {currentQuestionIndex + 1}</span>
            <span className="text-xs font-semibold text-slate-400 ml-1">dari {questions.length}</span>
          </div>

          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-sm transition-colors duration-300",
            timeLeft <= 10 ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-slate-100 text-slate-700"
          )}>
            <Clock className="w-3.5 h-3.5" />
            <span className="tabular-nums">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Container */}
      <div className="flex-1 px-6 pt-5 pb-8 flex flex-col overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 leading-snug mb-8 tracking-tight">
          {question.pertanyaan}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {[
            { id: 'A', text: question.opsi_a },
            { id: 'B', text: question.opsi_b },
            { id: 'C', text: question.opsi_c },
            { id: 'D', text: question.opsi_d },
          ].map((opt) => {
            const isSelected = selectedAnswer === opt.id;
            const isCorrect = opt.id === question.jawaban_benar;

            let btnStyle = "bg-white border-slate-200 text-slate-700 hover:border-violet-300 hover:bg-violet-50";
            let icon = null;

            if (isAnswered) {
              if (isCorrect) {
                btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-700 font-medium shadow-sm";
                icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
              } else if (isSelected && !isCorrect) {
                btnStyle = "bg-rose-50 border-rose-400 text-rose-700 font-medium";
                icon = <XCircle className="w-5 h-5 text-rose-500" />;
              } else {
                btnStyle = "bg-white border-slate-200 text-slate-400 opacity-50";
              }
            } else if (isSelected) {
              btnStyle = "bg-violet-50 border-violet-500 text-violet-700 shadow-sm";
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleAnswer(opt.id)}
                disabled={isAnswered || isFinished}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group",
                  btnStyle,
                  !isAnswered && !isFinished && "active:scale-[0.98]"
                )}
              >
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors",
                    isAnswered && isCorrect ? "bg-emerald-200 text-emerald-800" :
                      isAnswered && isSelected && !isCorrect ? "bg-rose-200 text-rose-800" :
                        "bg-slate-100 text-slate-500 group-hover:bg-violet-200 group-hover:text-violet-700"
                  )}>
                    {opt.id}
                  </span>
                  <span className="text-sm leading-relaxed">{opt.text}</span>
                </div>
                {icon && <div className="shrink-0 ml-2 animate-in zoom-in duration-300">{icon}</div>}
              </button>
            );
          })}
        </div>

        {/* Explanation Box */}
        {isAnswered && question.penjelasan && (
          <div className="mt-6 p-5 bg-slate-100 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Penjelasan</p>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">{question.penjelasan}</p>
          </div>
        )}

        {/* Bottom Action */}
        {isAnswered && !isFinished && (
          <div className="mt-8 mt-auto pt-4 animate-in fade-in duration-500">
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-violet-600 text-white rounded-full font-bold shadow-md hover:bg-violet-700 transition-transform active:scale-95 disabled:opacity-70"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Selesai & Lihat Poin' : 'Selanjutnya'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
