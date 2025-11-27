import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
    async setItem(key: string, value: any): Promise<void> {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (error) {
            console.error('Error saving to AsyncStorage:', error);
        }
    },

    async getItem<T>(key: string): Promise<T | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (error) {
            console.error('Error reading from AsyncStorage:', error);
            return null;
        }
    },

    async removeItem(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from AsyncStorage:', error);
        }
    },

    async clear(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Error clearing AsyncStorage:', error);
        }
    },
};

// Storage keys
export const STORAGE_KEYS = {
    CART: '@feelitbuy:cart',
    WISHLIST: '@feelitbuy:wishlist',
    USER: '@feelitbuy:user',
    AUTH_TOKEN: '@feelitbuy:auth_token',
};
