import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/supabaseService';
import { supabase } from '../services/supabase';

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;

    setUser: (user: User | null) => void;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
    signOut: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    error: null,

    setUser: (user) => set({ user, loading: false }),

    signIn: async (email, password) => {
        try {
            set({ loading: true, error: null });
            await authService.signIn(email, password);
            const profile = await authService.getCurrentProfile();
            if (profile) {
                set({
                    user: {
                        id: profile.id,
                        name: profile.full_name || profile.email.split('@')[0],
                        email: profile.email,
                        phone: profile.phone || '',
                        role: profile.role,
                        createdAt: profile.created_at,
                    },
                    loading: false,
                });
            }
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    signUp: async (email, password, fullName, phone) => {
        try {
            set({ loading: true, error: null });
            await authService.signUp(email, password, fullName, phone);
            // Wait for profile creation
            await new Promise(resolve => setTimeout(resolve, 1000));
            const profile = await authService.getCurrentProfile();
            if (profile) {
                set({
                    user: {
                        id: profile.id,
                        name: profile.full_name || fullName,
                        email: profile.email,
                        phone: profile.phone || phone || '',
                        role: profile.role,
                        createdAt: profile.created_at,
                    },
                    loading: false,
                });
            }
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    signOut: async () => {
        try {
            await authService.signOut();
            set({ user: null, loading: false });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    checkAuth: async () => {
        try {
            set({ loading: true });
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const profile = await authService.getCurrentProfile();
                if (profile) {
                    set({
                        user: {
                            id: profile.id,
                            name: profile.full_name || profile.email.split('@')[0],
                            email: profile.email,
                            phone: profile.phone || '',
                            role: profile.role,
                            createdAt: profile.created_at,
                        },
                        loading: false,
                    });
                } else {
                    set({ user: null, loading: false });
                }
            } else {
                set({ user: null, loading: false });
            }
        } catch (error) {
            set({ user: null, loading: false });
        }
    },
}));
