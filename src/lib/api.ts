import Cookies from 'js-cookie';

// Ganti dengan URL backend yang sebenarnya nanti
// Untuk development bisa set lewat .env.local atau hardcode sementara
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = {
  // Helper untuk Login
  login: async (identifier: string, password: string) => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          login: identifier,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  },
  
  getMe: async () => {
    return api.get('/me');
  },

  logout: async () => {
    return api.post('/logout', {});
  },

  // Helper umum untuk request authenticated
  get: async (endpoint: string) => {
    const token = Cookies.get('token');
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    return response.json();
  },
  
  post: async (endpoint: string, body: any) => {
    const token = Cookies.get('token');
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    return response.json();
  },

  // Catalogue & Units
  getUnits: async () => {
    return api.get('/units');
  },

  getRewards: async (params?: { pos_id?: number | string, category?: string, search?: string }) => {
    const query = new URLSearchParams();
    if (params?.pos_id) query.append('pos_id', String(params.pos_id));
    if (params?.category && params.category !== 'Semua') query.append('kategori', params.category);
    if (params?.search) query.append('search', params.search);

    return api.get(`/rewards?${query.toString()}`);
  },

  // Cart
  getCart: async (posId?: number | string) => {
    const endpoint = posId ? `/cart?pos_id=${posId}` : '/cart';
    return api.get(endpoint);
  },

  addToCart: async (rewardId: number | string, unitId: number | string, quantity: number = 1) => {
    return api.post('/cart', {
      reward_id: rewardId,
      pos_id: unitId,
      jumlah: quantity
    });
  },

  updateCartQuantity: async (rewardId: number | string, quantity: number, posId?: number | string) => {
    const token = Cookies.get('token');
    const response = await fetch(`${BASE_URL}/cart/${rewardId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        jumlah: quantity,
        pos_id: posId 
      }),
    });
    return response.json();
  },

  removeFromCart: async (rewardId: number | string, posId?: number | string) => {
    const token = Cookies.get('token');
    const query = posId ? `?pos_id=${posId}` : '';
    const response = await fetch(`${BASE_URL}/cart/${rewardId}${query}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    return response.json();
  },

  checkout: async (posId: number | string, items: { reward_id: number | string, jumlah: number }[]) => {
    return api.post('/tukar-poin/checkout', {
      pos_id: posId,
      items: items
    });
  },

  // History
  getHistorySetor: async (page: number = 1) => {
    return api.get(`/setoran/history?page=${page}`);
  },

  getHistoryTukar: async (page: number = 1) => {
    return api.get(`/tukar-poin/history?page=${page}`);
  },

  getQr: async (id: number | string) => {
    return api.get(`/tukar-poin/${id}/qr`);
  },
};
