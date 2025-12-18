import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
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

// Utility function to check if token is expired or about to expire
const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
    
    try {
        // Decode JWT without verification to check expiration
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);
        
        // Check if token is expired or will expire in the next 5 minutes
        const exp = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        return exp <= (now + fiveMinutes);
    } catch (error) {
        // If we can't decode the token, consider it expired
        return true;
    }
};

// Function to refresh token
const refreshToken = async (): Promise<string | null> => {
    const currentToken = useAuthStore.getState().accessToken;
    if (!currentToken) return null;
    
    try {
        const response = await axios.post(
            `${baseURL}/login/refresh-token`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${currentToken}`,
                },
            }
        );
        
        const newToken = response.data.access_token;
        useAuthStore.getState().setToken(newToken);
        return newToken;
    } catch (error) {
        // If refresh fails, logout user
        useAuthStore.getState().logout();
        return null;
    }
};

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        let token = useAuthStore.getState().accessToken;
        
        // Check if token is expired or about to expire
        if (token && isTokenExpired(token)) {
            // Try to refresh token
            const newToken = await refreshToken();
            if (newToken) {
                token = newToken;
            }
        }
        
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
        
        // If we get a 401 and haven't retried yet, try to refresh token
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            
            const newToken = await refreshToken();
            if (newToken) {
                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } else {
                // Refresh failed, logout user
                useAuthStore.getState().logout();
            }
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

export interface Showroom {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    phone: string;
    email: string;
    opening_hours: Record<string, string>; // e.g., {"monday": "10:00 AM - 8:00 PM", ...}
    map_url?: string;
    gallery_images?: string[];
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ShowroomCreate {
    name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    phone: string;
    email: string;
    opening_hours: Record<string, string>;
    map_url?: string;
    gallery_images?: string[];
    is_active?: boolean;
}

export interface ShowroomUpdate {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    phone?: string;
    email?: string;
    opening_hours?: Record<string, string>;
    map_url?: string;
    gallery_images?: string[];
    is_active?: boolean;
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

export const getTrendingProducts = async (limit: number = 4): Promise<Product[]> => {
    const response = await api.get<Product[]>(`/products/trending`, {
        params: { limit },
    });
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

// Admin product management functions
export const updateProduct = async (productId: number, formData: FormData): Promise<Product> => {
    const response = await api.put<Product>(`/products/${productId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteProduct = async (productId: number): Promise<Product> => {
    const response = await api.delete<Product>(`/products/${productId}`);
    return response.data;
};

// Showroom API functions
export const getShowrooms = async (activeOnly: boolean = true): Promise<Showroom[]> => {
    const response = await api.get<Showroom[]>('/showrooms', {
        params: { active_only: activeOnly },
    });
    return response.data;
};

export const getShowroom = async (id: number): Promise<Showroom> => {
    const response = await api.get<Showroom>(`/showrooms/${id}`);
    return response.data;
};

export const createShowroom = async (data: ShowroomCreate): Promise<Showroom> => {
    const response = await api.post<Showroom>('/showrooms', data);
    return response.data;
};

export const updateShowroom = async (id: number, data: ShowroomUpdate): Promise<Showroom> => {
    const response = await api.put<Showroom>(`/showrooms/${id}`, data);
    return response.data;
};

export const deleteShowroom = async (id: number): Promise<Showroom> => {
    const response = await api.delete<Showroom>(`/showrooms/${id}`);
    return response.data;
};

// Admin user management functions
export const getAllUsers = async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
};

export interface UserRoleUpdate {
    is_superuser?: boolean;
    is_active?: boolean;
    full_name?: string;
    email?: string;
}

export const updateUserRole = async (userId: number, data: UserRoleUpdate): Promise<User> => {
    const response = await api.put<User>(`/users/${userId}`, data);
    return response.data;
};

// Settings API functions
export interface SiteSetting {
    id: number;
    key: string;
    value: string | null;
    value_type: string;
    description: string | null;
    category: string;
    created_at?: string;
    updated_at?: string;
}

export interface SettingsBulkUpdate {
    settings: Record<string, any>;
}

export const getSettings = async (category?: string): Promise<SiteSetting[]> => {
    const params = category ? { category } : {};
    const response = await api.get<SiteSetting[]>('/settings', { params });
    return response.data;
};

export const getSetting = async (key: string): Promise<SiteSetting> => {
    const response = await api.get<SiteSetting>(`/settings/${key}`);
    return response.data;
};

export const updateSetting = async (key: string, value: string | boolean | number): Promise<SiteSetting> => {
    const response = await api.put<SiteSetting>(`/settings/${key}`, { value: String(value) });
    return response.data;
};

export const bulkUpdateSettings = async (settings: Record<string, any>): Promise<{ message: string; updated_keys: string[] }> => {
    const response = await api.post<{ message: string; updated_keys: string[] }>('/settings/bulk-update', { settings });
    return response.data;
};