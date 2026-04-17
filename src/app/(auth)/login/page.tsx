'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';

const MySwal = withReactContent(Swal);

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');


    try {
      // Real API Call
      const response = await api.login(identifier, password);

      // Save Token & Role
      Cookies.set('token', response.token, { expires: 7, path: '/' });
      Cookies.set('role', response.role, { expires: 7, path: '/' });
      Cookies.set('user', JSON.stringify(response.user), { expires: 7, path: '/' });

      const role = response.role?.toLowerCase().trim();

      // Redirect based on role
      if (role === 'member' || role === 'nasabah') {
        router.push('/dashboard');
      } else if (role === 'petugas' || role === 'admin') {
        router.push('/petugas/dashboard');
      } else {
        router.push('/dashboard'); // Default fallback
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      setError('Username atau kata sandi salah');
    } finally {

      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid bg-white p-6 place-items-center content-center" suppressHydrationWarning>
      <section className="w-full max-w-sm" suppressHydrationWarning>
        <header className="text-center mb-15" suppressHydrationWarning>
          <div className="flex justify-center mb-10">
            <Image
              src="/logo-sankara.webp"
              alt="Logo Bank Sampah Sankara"
              width={240}
              height={240}
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Selamat Datang!
          </h1>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            Silakan masuk untuk memulai
          </p>
        </header>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            label="Username"
            placeholder="Contoh: 1234567890"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="pl-3 h-12 !bg-[#f8fafc] focus:!bg-white border-0 border-b-0 focus:border-b-2 border-transparent rounded-none focus:ring-0 focus:border-b-violet-500 transition-all duration-200 no-autofill-bg no-autofill-bg-focus"
            required
            autoFocus
          />

          <fieldset className="space-y-1 block border-0 p-0 m-0" suppressHydrationWarning>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-3 pr-10 h-12 !bg-[#f8fafc] focus:!bg-white border-0 border-b-0 focus:border-b-2 border-transparent rounded-none focus:ring-0 focus:border-b-violet-500 transition-all duration-200 no-autofill-bg no-autofill-bg-focus"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[44px] text-slate-400 hover:text-violet-600 transition-colors"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && (
              <p className="text-xs bg-red-50 text-red-500 mt-5 p-3. text-center animate-in fade-in slide-in-from-top-1">
                {error}
              </p>
            )}

            <div className="flex justify-end" suppressHydrationWarning>

              <Link href="/forgot-password" className="text-xs text-violet-600 hover:text-violet-500 transition-colors">
                Lupa Password?
              </Link>
            </div>
          </fieldset>

          <div className="pt-4" suppressHydrationWarning>
            <Button
              type="submit"
              fullWidth
              variant="primary"
              size="md"
              disabled={loading}
              className="rounded-full cursor-pointer bg-violet-500 hover:bg-violet-600"
            >
              <span className="flex items-center">
                Masuk Sekarang
              </span>
            </Button>
          </div>
        </form>

        <footer className="mt-8 text-center" suppressHydrationWarning>
          <p className="text-sm text-slate-500">
            Belum punya akun?{' '}
            <Link href="/register" className="text-violet-600 font-medium hover:text-violet-500 transition-colors">
              Daftar Sekarang
            </Link>
          </p>
        </footer>
      </section>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
            <p className="text-xs font-bold text-white">Tunggu sebentar...</p>
          </div>
        </div>
      )}
    </main>
  );
}
