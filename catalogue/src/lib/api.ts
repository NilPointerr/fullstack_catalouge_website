import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000/api/v1';

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

import { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

// Types
export interface ProductImage {
    id: number;
    product_id: number;
    image_url: string;
    is_primary: boolean;
}

export interface ProductVariant {
    id: number;
    product_id: number;
    sku?: string;
    size?: string;
    color?: string;
    stock_quantity: number;
    price_override?: number;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    description?: string;
    base_price: number;
    is_active: boolean;
    category_id?: number;
    variants: ProductVariant[];
    images: ProductImage[];
}

export interface User {
    id: number;
    email: string;
    full_name?: string;
    is_active: boolean;
    is_superuser: boolean;
}

export interface UserUpdateData {
    full_name?: string;
    email?: string;
    password?: string;
}

// API Methods
export const searchProducts = async (query: string): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products', {
        params: { search: query },
    });
    return response.data;
};

export const getProduct = async (id: string | number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
};

export const getProfile = async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
};

export const updateProfile = async (data: UserUpdateData): Promise<User> => {
    const response = await api.put<User>('/users/me', data);
    return response.data;
};
