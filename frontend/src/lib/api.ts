import axios from 'axios';
import { API_URL } from './urls';

const BASE_URL = API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nc_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('nc_token');
    }
    return Promise.reject(err);
  },
);

export async function placeOrderAPI(token: string, orderData: any) {
  const res = await api.post('/orders/place', orderData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data || res.data;
}

export async function createRazorpayOrderAPI(token: string, amount: number, orderData?: any) {
  const res = await api.post('/orders/create-razorpay-order', { amount, ...orderData }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data || res.data;
}

export async function validateCouponAPI(token: string, code: string, subtotal: number) {
  const res = await api.post('/coupons/validate', { code, subtotal }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data || res.data;
}

export async function fetchOrdersAPI(token: string) {
  const res = await api.get('/orders/my-orders', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data || res.data;
}

export async function requestReturnAPI(token: string, orderId: string, data: { reason: string; details?: string }) {
  const res = await api.post(`/orders/${orderId}/return-request`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data || res.data;
}

export async function updateProfileAPI(token: string, data: { name: string; email: string; phone?: string }) {
  const res = await api.patch('/auth/profile', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data || res.data;
}

export async function changePasswordAPI(token: string, data: { currentPassword: string; newPassword: string }) {
  const res = await api.patch('/auth/change-password', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data || res.data;
}

export async function subscribeNewsletterAPI(email: string, source = 'website') {
  const res = await api.post('/newsletter/subscribe', { email, source });
  return res.data.data || res.data;
}

export async function fetchNewsletterPreferenceAPI(token: string) {
  const res = await api.get('/newsletter/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data || res.data;
}

export async function updateNewsletterPreferenceAPI(token: string, isActive: boolean) {
  const res = await api.patch('/newsletter/me', { isActive }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data || res.data;
}
