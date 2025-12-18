import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: number;
    email: string;
    full_name?: string;
    is_active: boolean;
    is_superuser: boolean;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
    setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            login: (user, token) => set({ user, accessToken: token, isAuthenticated: true }),
            logout: () => {
                // Clear session storage for password
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('user_email');
                }
                set({ user: null, accessToken: null, isAuthenticated: false });
            },
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setToken: (token) => set({ accessToken: token }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
