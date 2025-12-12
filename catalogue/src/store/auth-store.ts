import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            login: (user, token) => set({ user, accessToken: token, isAuthenticated: true }),
            logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
            setUser: (user) => set({ user, isAuthenticated: !!user }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
