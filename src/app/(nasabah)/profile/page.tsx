'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { User, Mail, Phone, LogOut, MapPin } from 'lucide-react';
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

  useEffect(() => {
    const loadProfile = async () => {
      // 1. Initial Load from Cookie
      const cookieUser = Cookies.get('user');
      if(cookieUser) {
        try { setUser(JSON.parse(cookieUser)); } catch(e) {}
      }

      // 2. Refresh from API
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
      confirmButtonColor: '#ef4444', // Red 500
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
                   <p className="text-xs text-slate-400 font-medium uppercase">Username / ID</p>
                   <p className="text-sm font-semibold text-slate-700 truncate">{user?.username || user?.login || "-"}</p>
               </div>
           </div>

           <div className="flex items-center gap-4 py-3 border-b border-slate-50">
               <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                   <Mail className="w-5 h-5" />
               </div>
               <div className="flex-1 overflow-hidden">
                   <p className="text-xs text-slate-400 font-medium uppercase">Email</p>
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

      {/* Logout */}
      <Button 
        onClick={handleLogout}
        className="flex bg-transparent hover:bg-slate-100 cursor-pointer font-light text-red-500 items-center justify-center max-w-[200px] gap-2 mx-auto"
      >
          <LogOut className="w-4 h-4" />
          Keluar Aplikasi
      </Button>
    </div>
  );
}
