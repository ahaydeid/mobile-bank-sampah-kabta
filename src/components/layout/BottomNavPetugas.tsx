'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Scan, Bell, User, History } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNavPetugas() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Beranda',
      href: '/petugas/dashboard',
      icon: Home,
    },
    {
      label: 'Riwayat',
      href: '/petugas/history',
      icon: History,
    },
    {
      label: 'Scan QR',
      href: '/petugas/scan',
      icon: Scan,
      isPrimary: true, // Special styling for main action
    },
    {
      label: 'Notifikasi',
      href: '/petugas/notifikasi',
      icon: Bell,
    },
    {
      label: 'Akun',
      href: '/petugas/profile',
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-white border-t border-slate-200 pointer-events-auto shadow-[0_-1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.isPrimary) {
               return (
                <div key={item.href} className="relative -top-5">
                   <Link
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center w-14 h-14 rounded-full bg-violet-600 text-white shadow-md shadow-violet-200 transition-transform active:scale-95",
                    )}
                  >
                    <Icon strokeWidth={2.5} className="w-6 h-6" />
                  </Link>
                  <span className="text-[10px] font-medium text-slate-500 block text-center mt-1">{item.label}</span>
                </div>
               )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors active:scale-95",
                  isActive 
                    ? "text-violet-600" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Icon strokeWidth={isActive ? 2.5 : 2} className="w-6 h-6" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
