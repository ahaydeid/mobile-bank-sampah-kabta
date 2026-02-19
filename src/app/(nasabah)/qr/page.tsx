'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import Cookies from 'js-cookie';
import { User, QrCode, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QrPage() {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    useEffect(() => {
        const userCookie = Cookies.get('user');
        if (userCookie) {
            try {
                setUserData(JSON.parse(userCookie));
            } catch (e) {
                console.error("Failed to parse user cookie", e);
            }
        }
    }, []);

    const memberId = userData?.username || 'MN-0000000';
    const fullName = userData?.profil?.nama_lengkap || 'Nasabah Bank Sampah';

    return (
        <div>
            {/* Header */}
            <div className="bg-white px-6 py-2 flex items-center border-b border-slate-100 sticky top-0 z-10">
                <h1 className="ml-2 text-xl font-bold text-slate-900 tracking-tight">QR Saya</h1>
            </div>

            <div className="flex flex-col items-center">
                {/* Identity Card */}
                <div className="w-full bg-white overflow-hidden mb-6 rounded-sm">
                    <div className="bg-violet-600 px-6 py-4 flex flex-col items-center text-white text-center">
                        <p className="text-white text-[10px] font-medium uppercase tracking-[0.1em]">ID: {memberId}</p>
                    </div>

                    <div className="p-8 flex flex-col items-center bg-white relative">
                        {/* QR Code Container */}
                        <div className="p-3 w-full bg-white rounded-sm border border-slate-200 mb-6">
                            <div className="bg-white p-1">
                                <QRCode 
                                    value={memberId} 
                                    size={180}
                                    className="w-full h-auto"
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsInfoOpen(true)}
                            className="w-full max-w-[150px] flex border border-slate-200 items-center justify-center gap-2 bg-slate-50 text-slate-700 text-[10px] py-1 rounded-full"
                        >
                            <Info className="w-3.5 h-3.5" />
                            Cara Pakai
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Info */}
            {isInfoOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40">
                    <div 
                        className="bg-white rounded-sm w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900">Panduan Penggunaan</h3>
                        </div>
                        <div className="p-3">
                            <p className="text-xs text-slate-600 leading-relaxed mb-6">
                                Tunjukkan QR Code ini kepada Petugas Bank Sampah saat Anda ingin melakukan setoran sampah.
                            </p>
                            <button 
                                onClick={() => setIsInfoOpen(false)}
                                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-sm transition-colors text-sm"
                            >
                                Mengerti
                            </button>
                        </div>
                    </div>
                    {/* Backdrop Close */}
                    <div className="absolute inset-0 -z-10" onClick={() => setIsInfoOpen(false)}></div>
                </div>
            )}
        </div>
    );
}
