'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Real API Call
      const response = await api.login(identifier, password);
      
      // Save Token & Role
      Cookies.set('token', response.token, { expires: 7 }); // 7 days
      Cookies.set('role', response.role, { expires: 7 });
      Cookies.set('user', JSON.stringify(response.user), { expires: 7 });

      const role = response.role; // 'nasabah' or 'petugas' or 'admin'

      // Redirect based on role
      if (role === 'nasabah') {
        router.push('/dashboard');
      } else if (role === 'petugas' || role === 'admin') {
        router.push('/petugas/dashboard');
      } else {
        router.push('/dashboard'); // Default fallback
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      MySwal.fire({
        title: 'Login Gagal',
        text: error.message || 'Cek kembali email/password Anda.',
        icon: 'error',
        confirmButtonColor: '#7c3aed',
        customClass: {
            popup: 'rounded-xl',
            confirmButton: 'rounded-full px-6'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid bg-white p-6 place-items-center content-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Selamat Datang!
          </h1>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            Ayo masuk untuk memulai!
          </p>
        </div>
        
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
          
          <div className="space-y-1">
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
            <div className="flex justify-end">
              <a href="#" className="text-xs text-violet-600 hover:text-violet-500">
                Lupa Password?
              </a>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              fullWidth 
              variant="primary" 
              size="md"
              disabled={loading}
              className="rounded-full"
            >
              <span className="flex items-center">
                Masuk Sekarang
              </span>
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Belum punya akun?{' '}
            <a href="#" className="text-violet-600 hover:text-violet-500">
              Daftar Sekarang
            </a>
          </p>
        </div>
      </div>
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                <p className="text-xs font-bold text-white">Tunggu sebentar...</p>
            </div>
        </div>
      )}
    </div>
  );
}
