import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000/api/v1';

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);
