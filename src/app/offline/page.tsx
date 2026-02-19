'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center space-y-4">
        <div className="text-5xl">📡</div>
        <h1 className="text-lg font-bold text-slate-900">Tidak Ada Koneksi</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Sepertinya kamu sedang offline. Periksa koneksi internet dan coba lagi.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-full"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
