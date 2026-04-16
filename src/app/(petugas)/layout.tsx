'use client';

import React from 'react';
import { BottomNavPetugas } from '@/components/layout/BottomNavPetugas';
import { usePathname } from 'next/navigation';

export default function PetugasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isScanPage = pathname === '/petugas/scan';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomNavPetugas />
    </div>
  );
}
