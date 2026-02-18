'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, History, User } from 'lucide-react';
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
      label: 'Tukar Poin',
      href: '/redeem',
      icon: ShoppingBag,
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
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white border-t border-slate-200 shadow-[0_-5px_10px_rgba(0,0,0,0.05)] h-16 px-2" suppressHydrationWarning>
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
          const Icon = item.icon;

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
  );
}
