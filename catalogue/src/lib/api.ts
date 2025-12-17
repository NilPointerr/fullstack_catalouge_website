import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

// Get API base URL - use localhost for client-side, backend hostname for server-side
const getBaseURL = () => {
    if (typeof window !== 'undefined') {
        // Client-side: use localhost
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    }
    // Server-side: use backend hostname
    return process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000/api/v1';
};

const baseURL = getBaseURL();

// Get backend base URL (without /api/v1) for static file serving
export const getBackendBaseURL = () => {
    if (typeof window !== 'undefined') {
        return process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
    }
    return process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://backend:8000';
};

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

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    is_active: boolean;
}

// API Methods
export const getCategories = async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
};

export interface ProductFilters {
    query?: string;
    categoryIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    colors?: string[];
    sizes?: string[];
    sortBy?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export interface SearchProductsOptions extends ProductFilters {
    page?: number;
    size?: number;
}

export const searchProducts = async (
    query?: string, 
    categoryId?: number,
    filters?: ProductFilters,
    page?: number,
    size?: number
): Promise<PaginatedResponse<Product>> => {
    const params: any = {};
    if (query) params.search = query;
    if (categoryId) params.category_id = categoryId;
    
    // Pagination parameters
    if (page !== undefined) params.page = page;
    if (size !== undefined) params.page_size = size;
    
    // Apply new filters
    if (filters) {
        if (filters.categoryIds && filters.categoryIds.length > 0) {
            params.category_ids = filters.categoryIds.join(',');
        }
        if (filters.minPrice !== undefined) params.min_price = filters.minPrice;
        if (filters.maxPrice !== undefined) params.max_price = filters.maxPrice;
        if (filters.colors && filters.colors.length > 0) {
            params.color = filters.colors[0]; // Backend currently supports single color
        }
        if (filters.sizes && filters.sizes.length > 0) {
            params.size = filters.sizes[0]; // Backend currently supports single size
        }
        if (filters.sortBy) {
            params.sort_by = filters.sortBy;
        }
    }
    
    const response = await api.get<PaginatedResponse<Product>>('/products', { params });
    return response.data;
};

// Backward compatibility: get products as array (uses first page, default size)
export const searchProductsArray = async (
    query?: string, 
    categoryId?: number,
    filters?: ProductFilters
): Promise<Product[]> => {
    const result = await searchProducts(query, categoryId, filters, 1, 100);
    return result.items;
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

export interface WishlistItem {
    id: number;
    user_id: number;
    product_id: number;
    product: Product;
}

export const getWishlist = async (): Promise<WishlistItem[]> => {
    const response = await api.get<WishlistItem[]>('/wishlist');
    return response.data;
};

export const addToWishlist = async (productId: number): Promise<WishlistItem> => {
    const response = await api.post<WishlistItem>('/wishlist', {
        product_id: productId,
    });
    return response.data;
};

export const removeFromWishlist = async (productId: number): Promise<WishlistItem> => {
    const response = await api.delete<WishlistItem>(`/wishlist/${productId}`);
    return response.data;
};