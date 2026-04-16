'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { User, Phone, LogOut, MapPin, Lock, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { getUserName, getImageUrl } from '@/lib/utils';

const MySwal = withReactContent(Swal);

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const cookieUser = Cookies.get('user');
      if(cookieUser) {
        try { setUser(JSON.parse(cookieUser)); } catch(e) {}
      }

      try {
        const data = await api.get('/me');
        if (data && data.user) {
          setUser(data.user);
          Cookies.set('user', JSON.stringify(data.user), { expires: 7 });
        }
      } catch (error) {
        console.error("Profile load error", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    MySwal.fire({
      title: 'Keluar Aplikasi?',
      text: "Anda harus login kembali untuk mengakses akun.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'rounded-full px-6',
        cancelButton: 'rounded-full px-6'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Cookies.remove('token');
        Cookies.remove('role');
        Cookies.remove('user');
        router.push('/login');
      }
    });
  };

  if(!user && !loading) return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <p className="text-slate-500">Gagal memuat data akun.</p>
          <div className="flex gap-2">
            <Button onClick={() => window.location.reload()} variant="primary" size="sm" className="rounded-full">Coba Lagi</Button>
            <Button 
                onClick={() => {
                    Cookies.remove('token');
                    Cookies.remove('role');
                    Cookies.remove('user');
                    window.location.href = '/login';
                }} 
                variant="outline" 
                size="sm" 
                className="rounded-full text-red-500 border-red-200 hover:bg-red-50"
            >
                Logout / Reset
            </Button>
          </div>
      </div>
  )

  return (
    <div>
      {/* Profile Header */}
      <div className="flex flex-col items-center py-6 bg-white rounded-sm border border-slate-100 relative overflow-hidden">
         <div className="absolute top-0 w-full h-24 bg-violet-600 z-0"></div>
         
         {user?.profil?.foto_profil ? (
            <img 
              src={getImageUrl(user.profil.foto_profil) || ''} 
              alt="Profile" 
              className="w-24 h-24 rounded-full border-4 border-white z-10 object-cover bg-slate-200"
            />
         ) : (
            <div className="w-24 h-24 bg-violet-600 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-sm z-10 uppercase">
                {getUserName(user)[0] || "U"}
            </div>
         )}

         <div className="mt-3 text-center z-10 px-4">
             <h2 className="text-xl font-bold text-slate-900">{getUserName(user)}</h2>
             <span className="text-xs font-medium bg-emerald-500 text-white px-3 py-0.5 rounded-full border border-emerald-500">
               {user?.peran || 'Nasabah Aktif'}
             </span>
         </div>
      </div>

      {/* Details Card */}
      <Card className="border-slate-100 bg-white">
        <CardContent className="p-0">
           <div className="flex items-center gap-4 py-3 border-b border-slate-50">
               <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                   <User className="w-5 h-5" />
               </div>
               <div className="flex-1 overflow-hidden">
                   <p className="text-xs text-slate-400 font-medium uppercase">Username / Email</p>
                   <p className="text-sm font-semibold text-slate-700 truncate">{user?.email || "-"}</p>
               </div>
           </div>

           <div className="flex items-center gap-4 py-3 border-b border-slate-50">
               <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                   <Phone className="w-5 h-5" />
               </div>
               <div className="flex-1 overflow-hidden">
                   <p className="text-xs text-slate-400 font-medium uppercase">No. Telepon</p>
                   <p className="text-sm font-semibold text-slate-700 truncate">{user?.profil?.no_hp || "-"}</p>
               </div>
           </div>
            
           <div className="flex items-center gap-4 py-3">
               <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                   <MapPin className="w-5 h-5" />
               </div>
               <div className="flex-1 overflow-hidden">
                   <p className="text-xs text-slate-400 font-medium uppercase">Alamat</p>
                   <p className="text-sm font-semibold text-slate-700 truncate">{user?.profil?.alamat || "-"}</p>
               </div>
           </div>
        </CardContent>
      </Card>

      {/* Change Password Button */}
      <button
        onClick={() => setShowPasswordModal(true)}
        className="w-full flex cursor-pointer items-center gap-3 px-5 py-3.5 bg-white border border-slate-100 rounded-sm hover:bg-slate-50 transition-colors active:scale-[0.99]"
      >
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
          <Lock className="w-4.5 h-4.5 text-gray-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm text-slate-800">Ubah Kata Sandi</p>
        </div>
      </button>

      {/* Logout */}
      <Button 
        onClick={handleLogout}
        className="flex bg-transparent hover:bg-slate-100 cursor-pointer font-light text-red-500 items-center justify-center max-w-[200px] gap-2 mx-auto"
      >
        <LogOut className="w-4 h-4" />
        Keluar Aplikasi
      </Button>

      {/* Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.changePassword(currentPassword, newPassword, confirmPassword);
      
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Password berhasil diubah.',
        confirmButtonColor: '#7c3aed',
      });
      onClose();
    } catch (err: any) {
      const msg = err?.errors?.current_password?.[0] 
        || err?.errors?.new_password?.[0] 
        || err?.message 
        || 'Gagal mengubah password.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
      <div 
        className="bg-white rounded-sm w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Ubah Kata Sandi</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-medium px-4 py-2.5 rounded-sm">
              {error}
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Password Lama</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-slate-200 rounded-sm text-sm text-slate-800 focus:outline-none focus:border-violet-400 pr-10"
                placeholder="Masukkan password lama"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Password Baru</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-sm text-sm text-slate-800 focus:outline-none focus:border-violet-400 pr-10"
                placeholder="Minimal 8 karakter"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-slate-200 rounded-sm text-sm text-slate-800 focus:outline-none focus:border-violet-400"
              placeholder="Ketik ulang password baru"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold text-sm rounded-sm hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-violet-600 text-white font-bold text-sm rounded-sm hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </button>
          </div>
        </form>
      </div>
      {/* Backdrop Close */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
}
