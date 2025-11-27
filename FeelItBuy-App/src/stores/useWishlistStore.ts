import { create } from 'zustand';
import { wishlistService } from '../services/supabaseService';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface WishlistState {
    productIds: string[];
    loading: boolean;

    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    loadWishlist: () => Promise<void>;
    toggleWishlist: (productId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    productIds: [],
    loading: false,

    addToWishlist: async (productId) => {
        try {
            set({ loading: true });
            await wishlistService.addToWishlist(productId);

            const newIds = [...get().productIds, productId];
            set({ productIds: newIds, loading: false });
            await storage.setItem(STORAGE_KEYS.WISHLIST, newIds);
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            set({ loading: false });
        }
    },

    removeFromWishlist: async (productId) => {
        try {
            set({ loading: true });
            await wishlistService.removeFromWishlist(productId);

            const newIds = get().productIds.filter(id => id !== productId);
            set({ productIds: newIds, loading: false });
            await storage.setItem(STORAGE_KEYS.WISHLIST, newIds);
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            set({ loading: false });
        }
    },

    isInWishlist: (productId) => {
        return get().productIds.includes(productId);
    },

    loadWishlist: async () => {
        try {
            set({ loading: true });

            // Try to load from Supabase
            const serverWishlist = await wishlistService.getWishlist();
            if (serverWishlist && serverWishlist.length > 0) {
                set({ productIds: serverWishlist, loading: false });
                await storage.setItem(STORAGE_KEYS.WISHLIST, serverWishlist);
            } else {
                // Fallback to local storage
                const localWishlist = await storage.getItem<string[]>(STORAGE_KEYS.WISHLIST);
                set({ productIds: localWishlist || [], loading: false });
            }
        } catch (error) {
            console.error('Error loading wishlist:', error);
            set({ loading: false });
        }
    },

    toggleWishlist: async (productId) => {
        const isInWishlist = get().isInWishlist(productId);
        if (isInWishlist) {
            await get().removeFromWishlist(productId);
        } else {
            await get().addToWishlist(productId);
        }
    },
}));
