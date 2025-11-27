import { create } from 'zustand';
import { CartItem, Product } from '../types';
import { cartService } from '../services/supabaseService';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface CartState {
    items: CartItem[];
    loading: boolean;

    addItem: (product: Product, quantity?: number) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    loadCart: () => Promise<void>;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    loading: false,

    addItem: async (product, quantity = 1) => {
        try {
            set({ loading: true });

            // Add to Supabase
            await cartService.addToCart(product.id, quantity);

            // Update local state
            const currentItems = get().items;
            const existingItem = currentItems.find(item => item.product.id === product.id);

            let newItems: CartItem[];
            if (existingItem) {
                newItems = currentItems.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                newItems = [...currentItems, { product, quantity }];
            }

            set({ items: newItems, loading: false });
            await storage.setItem(STORAGE_KEYS.CART, newItems);
        } catch (error) {
            console.error('Error adding to cart:', error);
            set({ loading: false });
        }
    },

    removeItem: async (productId) => {
        try {
            set({ loading: true });

            const item = get().items.find(i => i.product.id === productId);
            if (item?.itemId) {
                await cartService.removeFromCart(item.itemId);
            }

            const newItems = get().items.filter(item => item.product.id !== productId);
            set({ items: newItems, loading: false });
            await storage.setItem(STORAGE_KEYS.CART, newItems);
        } catch (error) {
            console.error('Error removing from cart:', error);
            set({ loading: false });
        }
    },

    updateQuantity: async (productId, quantity) => {
        try {
            set({ loading: true });

            const item = get().items.find(i => i.product.id === productId);
            if (item?.itemId) {
                await cartService.updateCartItem(item.itemId, quantity);
            }

            const newItems = get().items.map(item =>
                item.product.id === productId ? { ...item, quantity } : item
            );
            set({ items: newItems, loading: false });
            await storage.setItem(STORAGE_KEYS.CART, newItems);
        } catch (error) {
            console.error('Error updating cart:', error);
            set({ loading: false });
        }
    },

    clearCart: async () => {
        try {
            await cartService.clearCart();
            set({ items: [] });
            await storage.removeItem(STORAGE_KEYS.CART);
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    },

    loadCart: async () => {
        try {
            set({ loading: true });

            // Try to load from Supabase first
            const serverCart = await cartService.getCart();
            if (serverCart && serverCart.length > 0) {
                set({ items: serverCart, loading: false });
                await storage.setItem(STORAGE_KEYS.CART, serverCart);
            } else {
                // Fallback to local storage
                const localCart = await storage.getItem<CartItem[]>(STORAGE_KEYS.CART);
                set({ items: localCart || [], loading: false });
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            set({ loading: false });
        }
    },

    getTotal: () => {
        return get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    },

    getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
    },
}));
