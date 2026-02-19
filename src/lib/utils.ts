import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserName(user: any): string {
  if (!user) return 'Nasabah';
  // 1. Cek field nama di relation profil (Prioritas Utama)
  if (user.profil && user.profil.nama) return user.profil.nama;

  // 2. Cek field nama eksplisit di root
  if (user.name) return user.name;
  if (user.nama) return user.nama;
  if (user.nama_lengkap) return user.nama_lengkap;
  if (user.full_name) return user.full_name;
  if (user.username) return user.username;

  // 2. Fallback: Ambil dari email (sebelum @)
  if (user.email) {
    return user.email.split('@')[0];
  }

  return 'Nasabah';
}

export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  // Asumsi Laravel Storage Link
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
  return `${baseUrl}/storage/${path}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'Selamat Pagi';
  if (hour >= 11 && hour < 15) return 'Selamat Siang';
  if (hour >= 15 && hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}
