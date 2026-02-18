'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';

const MySwal = withReactContent(Swal);

export default function LoginPage() {
  const router = useRouter();  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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

      MySwal.fire({
        title: <p className="text-violet-700">Login Berhasil!</p>,
        text: `Selamat datang, ${response.user.name || 'User'}!`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-xl',
        }
      }).then(() => {
        // Redirect based on role
        if (role === 'nasabah') {
          router.push('/dashboard');
        } else if (role === 'petugas' || role === 'admin') {
          router.push('/petugas/dashboard');
        } else {
          router.push('/dashboard'); // Default fallback
        }
      });

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
          <div className="mx-auto w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm transform -rotate-3">
            <Lock className="w-8 h-8 text-violet-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Selamat Datang!
          </h1>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            Masuk untuk mulai mengelola sampah<br/>dan tukar poinmu.
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            label="Email / Username / NIK"
            placeholder="Contoh: 1234567890"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="pl-3 h-12 bg-slate-50 border-transparent focus:bg-white transition-all"
            required
          />
          
          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-slate-50 border-transparent focus:bg-white transition-all"
              required
            />
            <div className="flex justify-end">
              <a href="#" className="text-xs font-medium text-violet-600 hover:text-violet-500">
                Lupa Password?
              </a>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              fullWidth 
              variant="primary" 
              size="lg"
              disabled={loading}
              className="rounded-full"
            >
              {loading ? 'Memproses...' : (
                <span className="flex items-center">
                  Masuk Sekarang <ArrowRight className="ml-2 w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Belum punya akun?{' '}
            <a href="#" className="font-bold text-violet-600 hover:text-violet-500">
              Daftar Sekarang
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
