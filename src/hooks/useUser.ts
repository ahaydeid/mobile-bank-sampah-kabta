import useSWR from 'swr';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';

export function useUser() {
  // Coba ambil data fallback dari cookie terlebih dahulu agar bisa render UI secara instan (zero-loading state)
  const fallbackUser = (() => {
    try {
      if (typeof window === 'undefined') return undefined; // Hindari bentrok pada SSR
      const userCookie = Cookies.get('user');
      return userCookie ? { user: JSON.parse(userCookie) } : undefined;
    } catch {
      return undefined;
    }
  })();

  const { data, error, isLoading, mutate } = useSWR('/me', api.getMe, {
    fallbackData: fallbackUser,
    onSuccess: (resData) => {
      // Jika berhasil dapat data fresh dari server, langsung timpa/perbarui cookie
      if (resData?.user && resData.user.id !== fallbackUser?.user?.id) {
         Cookies.set('user', JSON.stringify(resData.user), { expires: 7, path: '/' });
      }
    },
    // Jika API error (misalnya API mati), jangan retry terus-terusan secara membabi-buta, batasi retry
    shouldRetryOnError: true,
    errorRetryCount: 3, 
  });

  return {
    user: data?.user || fallbackUser?.user || null,
    // Kita men-setting isLoading hanya true JIKA tidak ada data cache SAMA SEKALI
    isLoading: isLoading && !data?.user && !fallbackUser?.user,
    isError: error,
    mutate,
  };
}
