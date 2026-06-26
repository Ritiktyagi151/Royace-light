import axios from 'axios';
import { API_URL } from './urls';

export const vendorApi = axios.create({
  baseURL: API_URL,
});

vendorApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nc_vendor_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

vendorApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('nc_vendor_token');
      window.location.href = '/vendor';
    }
    return Promise.reject(err);
  },
);
