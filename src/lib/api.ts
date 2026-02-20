import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const handleUnauthorized = () => {
  Cookies.remove('token');
  Cookies.remove('role');
  Cookies.remove('user');
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

const baseRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = Cookies.get('token');
  
  const headers = {
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    ...options.headers,
  } as Record<string, string>;

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle Session Expiry / Unauthorized
  if (response.status === 401) {
    handleUnauthorized();
    const data = await response.json();
    throw new Error(data.message || 'Sesi telah berakhir. Silakan login kembali.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const api = {
  // Direct fetch for specialized methods
  get: (endpoint: string) => baseRequest(endpoint, { method: 'GET' }),
  post: (endpoint: string, body: any) => baseRequest(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(body) 
  }),
  patch: (endpoint: string, body: any) => baseRequest(endpoint, { 
    method: 'PATCH', 
    body: JSON.stringify(body) 
  }),
  delete: (endpoint: string) => baseRequest(endpoint, { method: 'DELETE' }),

  // Auth
  login: async (identifier: string, password: string) => {
    return baseRequest('/login', {
      method: 'POST',
      body: JSON.stringify({
        login: identifier,
        password: password,
      }),
    });
  },
  
  getMe: async () => {
    return api.get('/me');
  },

  logout: async () => {
    return api.post('/logout', {});
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
    return api.patch(`/cart/${rewardId}`, { 
      jumlah: quantity,
      pos_id: posId 
    });
  },

  removeFromCart: async (rewardId: number | string, posId?: number | string) => {
    const query = posId ? `?pos_id=${posId}` : '';
    return api.delete(`/cart/${rewardId}${query}`);
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

  getSetorDetail: async (id: number | string) => {
    return api.get(`/setoran/${id}`);
  },

  getHistoryTukar: async (page: number = 1) => {
    return api.get(`/tukar-poin/history?page=${page}`);
  },

  getTukarDetail: async (id: number | string) => {
    return api.get(`/tukar-poin/${id}`);
  },

  getQr: async (id: number | string) => {
    return api.get(`/tukar-poin/${id}/qr`);
  },
};
