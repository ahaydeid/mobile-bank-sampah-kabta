'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, History, User, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNavNasabah() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Beranda',
      href: '/dashboard',
      icon: Home,
    },
    {
      label: 'Katalog',
      href: '/redeem',
      icon: ShoppingBag,
    },
    {
      label: 'QR',
      href: '/qr',
      icon: QrCode,
    },
    {
      label: 'Riwayat',
      href: '/history',
      icon: History,
    },
    {
      label: 'Akun',
      href: '/profile',
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-white border-t border-slate-200 pointer-events-auto shadow-[0_-1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard' && item.href !== '/qr');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1",
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
