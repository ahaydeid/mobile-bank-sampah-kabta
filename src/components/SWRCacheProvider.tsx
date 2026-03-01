'use client';

import React from 'react';
import { SWRConfig } from 'swr';
import Cookies from 'js-cookie';

export function SWRCacheProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = React.useState<Map<any, any> | null>(null);
  const [userKey, setUserKey] = React.useState<string>('guest');

  React.useEffect(() => {
    // Determine user storage key
    const getUserKey = () => {
      try {
        const userCookie = Cookies.get('user');
        if (userCookie) {
          const user = JSON.parse(userCookie);
          return `swr-cache-${user.id}`;
        }
      } catch (e) {}
      return 'swr-cache-guest';
    };

    const storageKey = getUserKey();
    setUserKey(storageKey);

    // Load from localStorage
    const initialCache = new Map(JSON.parse(localStorage.getItem(storageKey) || '[]'));
    
    const syncCache = () => {
      const appCache = JSON.stringify(Array.from(initialCache.entries()));
      localStorage.setItem(storageKey, appCache);
    };

    window.addEventListener('beforeunload', syncCache);
    setCache(initialCache);

    return () => {
      window.removeEventListener('beforeunload', syncCache);
    };
  }, []);

  // Effect to watch for user cookie changes (e.g. on login/logout)
  React.useEffect(() => {
    const interval = setInterval(() => {
        const userCookie = Cookies.get('user');
        const currentId = userCookie ? JSON.parse(userCookie).id : 'guest';
        const currentKey = `swr-cache-${currentId}`;
        
        if (currentKey !== userKey) {
            // User changed! Reload page to reset everything safely
            window.location.reload();
        }
    }, 2000);
    return () => clearInterval(interval);
  }, [userKey]);

  if (!cache) return <>{children}</>;

  return (
    <SWRConfig value={{ 
      provider: () => cache,
      revalidateIfStale: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000
    }}>
      {children}
    </SWRConfig>
  );
}
