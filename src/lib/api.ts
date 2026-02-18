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
  }
};
