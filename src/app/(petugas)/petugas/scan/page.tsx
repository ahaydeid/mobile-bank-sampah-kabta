'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  AlertCircle, 
  RotateCcw,
  ShieldAlert,
  Package,
  PlusCircle,
  CheckCircle2,
  Loader2,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

type ScanMode = 'none' | 'setoran' | 'penukaran';

function ScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isLockRef = useRef(false);
  
  const [scanMode, setScanMode] = useState<ScanMode>(
    initialCode?.startsWith('TKR-') ? 'penukaran' : 'none'
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let active = true;

    const startScanner = async () => {
      if (scanMode === 'none' || isLockRef.current) return;
      
      const readerElement = document.getElementById("reader");
      if (!readerElement) {
        if (active) setTimeout(startScanner, 200);
        return;
      }

      try {
        isLockRef.current = true;
        setIsLoading(true);
        setError(null);

        if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
            setError("Koneksi tidak aman. Gunakan HTTPS untuk akses kamera.");
            setCameraPermission(false);
            return;
        }

        // Always ensure a fresh instance
        if (scannerRef.current) {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          try { scannerRef.current.clear(); } catch (e) { /* ignore */ }
          scannerRef.current = null;
        }

        scannerRef.current = new Html5Qrcode("reader");

        const cameras = await Html5Qrcode.getCameras();
        
        if (active && cameras && cameras.length > 0) {
          setCameraPermission(true);
          const backCamera = cameras.find(cam => 
            cam.label.toLowerCase().includes('back') || 
            cam.label.toLowerCase().includes('rear') ||
            cam.label.toLowerCase().includes('belakang')
          );
          const cameraId = backCamera ? backCamera.id : cameras[0].id;

          await scannerRef.current.start(
            cameraId,
            {
              fps: 20,
              qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                  const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                  const size = Math.floor(minEdge * 0.85);
                  return { width: size, height: Math.floor(size * 0.85) };
              },
              aspectRatio: 1.0,
              disableFlip: true,
            },
            (text) => {
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(50);
              }
              if (active) handleScanSuccess(text);
            },
            () => {}
          );
          setIsScanning(true);
        } else if (active) {
          setError("Kamera tidak ditemukan. Harap izinkan akses kamera.");
          setCameraPermission(false);
        }
      } catch (err: any) {
        console.error("Camera error:", err);
        if (active) {
          setError(`Gagal mengakses kamera: ${err.message || 'Error tidak dikenal'}`);
          setCameraPermission(false);
        }
      } finally {
        setIsLoading(false);
        isLockRef.current = false;
      }
    };

    if (scanMode !== 'none') {
      startScanner();
    }

    return () => {
      active = false;
      if (scannerRef.current) {
        const scannerInstance = scannerRef.current;
        if (scannerInstance.isScanning) {
          scannerInstance.stop()
            .then(() => scannerInstance.clear())
            .catch(e => console.warn("Cleanup error", e));
        } else {
          try { scannerInstance.clear(); } catch (e) { /* ignore */ }
        }
      }
    };
  }, [scanMode]);

  const handleScanSuccess = async (decodedText: string) => {
    if (isLockRef.current || isProcessing) return;
    
    let cleanText = decodedText.trim().toUpperCase();
    
    if (scanMode === 'setoran') {
        const isNumeric = /^\d+$/.test(cleanText);
        if (!isNumeric && cleanText.length < 5) {
            setError(`Format QR Nasabah tidak dikenal: "${cleanText}".`);
            return;
        }
    } else if (scanMode === 'penukaran') {
        const tkrMatch = cleanText.match(/TKR-[A-Z0-9]+/);
        if (tkrMatch) {
            cleanText = tkrMatch[0];
        } else if (/^\d+$/.test(cleanText)) {
            // Numeric-only QR: add TKR- prefix
            cleanText = `TKR-${cleanText}`;
        } else {
            setError(`Bukan QR Penukaran: "${cleanText}". Gunakan QR dari detail redeem.`);
            return;
        }
    }

    isLockRef.current = true;
    setIsProcessing(true);
    setError(null);

    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }
      
      setTimeout(() => {
        if (scanMode === 'setoran') {
            router.push(`/petugas/setor/create?member_id=${cleanText}`);
        } else {
            router.push(`/petugas/tukar/validasi?code=${cleanText}`);
        }
      }, 500);

    } catch (e) {
      console.warn("Scan teardown error", e);
      window.location.href = scanMode === 'setoran' 
        ? `/petugas/setor/create?member_id=${cleanText}`
        : `/petugas/tukar/validasi?code=${cleanText}`;
    } finally {
      isLockRef.current = false;
    }
  };

  const handleBack = () => {
    if (scanMode !== 'none') {
      setScanMode('none');
      setError(null);
      setIsProcessing(false);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex flex-col p-4">
        {scanMode === 'none' ? (
          <div className="flex-1 flex flex-col">
             <div className="grid grid-cols-2 gap-4 w-full">
                <Card 
                  onClick={() => setScanMode('setoran')} 
                  className="p-5 cursor-pointer bg-sky-600 transition-all group flex flex-col items-center text-center gap-3"
                >
                   <div className="w-12 h-12 flex items-center justify-center">
                      <PlusCircle className="w-10 h-10 text-white" />
                   </div>
                   <div>
                      <h3 className="text-sm font-bold text-white leading-tight">Input Setoran</h3>
                      <p className="text-[10px] text-white mt-1 leading-relaxed">Pencatatan sampah baru.</p>
                   </div>
                </Card>

                <Card 
                  onClick={() => setScanMode('penukaran')} 
                  className="p-5 cursor-pointer bg-emerald-600 transition-all group flex flex-col items-center text-center gap-3"
                >
                   <div className="w-12 h-12 flex items-center justify-center">
                      <Package className="w-10 h-10 text-white" />
                   </div>
                   <div>
                      <h3 className="text-sm font-bold text-white leading-tight">Validasi Tukar</h3>
                      <p className="text-[10px] text-white mt-1 leading-relaxed">Konfirmasi ambil barang.</p>
                   </div>
                </Card>
             </div>
             
             <p className="mt-12 text-sm text-slate-400 text-center px-8 leading-relaxed italic">
                Pilih jenis transaksi.
             </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center relative py-6">
            <div className="w-full max-w-sm aspect-square relative overflow-hidden rounded-sm border-2 border-slate-200">
              <style dangerouslySetInnerHTML={{ __html: `
                #reader video {
                  object-fit: cover !important;
                }
                #reader img {
                  display: none !important;
                }
                #reader__scan_region {
                  background: transparent !important;
                }
                #reader__scan_region canvas {
                   width: 100% !important;
                   height: 100% !important;
                   object-fit: cover !important;
                }
                #reader__dashboard, #reader__status_span {
                  display: none !important;
                }
              `}} />
              <div 
                id="reader" 
                className="w-full h-full bg-slate-900"
              ></div>

              {isLoading && !isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 rounded-sm">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-600 rounded-full animate-spin mb-3"></div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Memulai Kamera...</p>
                </div>
              )}

              {isProcessing && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-50 z-30 rounded-sm border border-emerald-500 animate-in fade-in duration-300">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg animate-bounce">
                        <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-base font-bold text-emerald-700">QR Terbaca!</h2>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Mengalihkan Halaman...</p>
                 </div>
              )}

              {cameraPermission === false && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-20 p-8 text-center rounded-sm">
                    <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
                    <h2 className="text-sm font-bold mb-2 text-slate-900 leading-tight">Akses Kamera Terkendala</h2>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                       {error || "Kamera tidak dapat diakses. Mohon berikan izin di pengaturan browser Anda."}
                    </p>
                    <button 
                      onClick={() => setScanMode('none')}
                      className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Kembali & Reset
                    </button>
                 </div>
              )}
            </div>

            <div className="mt-10 text-center space-y-6">
              <div className="space-y-3">
                <button 
                  onClick={!isProcessing ? handleBack : undefined}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 px-6 border mx-auto w-fit transition-all active:scale-95",
                    isProcessing ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-white border-slate-100 text-slate-700 hover:border-slate-300"
                  )}
                >
                  {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                      <X className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-xs font-bold uppercase tracking-widest">
                      {isProcessing ? 'Berhasil Memindai' : 'Batal'}
                  </span>
                </button>
              </div>
              
              <div className="max-w-[280px] mx-auto">
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  {scanMode === 'setoran' 
                    ? 'Scan QR Nasabah untuk mulai input setoran.' 
                    : 'Scan QR Penukaran untuk memvalidasi pengambilan barang.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message Toast */}
      {error && cameraPermission !== false && (
        <div className="fixed bottom-28 left-4 right-4 bg-slate-900 text-white p-4 rounded-sm shadow-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
          <div className="flex-1">
             <p className="text-xs font-bold uppercase tracking-wider">Peringatan</p>
             <p className="text-[11px] opacity-90 leading-relaxed font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PetugasScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    }>
      <ScanContent />
    </Suspense>
  );
}
