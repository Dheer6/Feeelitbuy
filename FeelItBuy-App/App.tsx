import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from './src/stores/useAuthStore';
import { useCartStore } from './src/stores/useCartStore';
import { useWishlistStore } from './src/stores/useWishlistStore';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const loadCart = useCartStore((state) => state.loadCart);
    const loadWishlist = useWishlistStore((state) => state.loadWishlist);

    useEffect(() => {
        // Initialize app
        const initializeApp = async () => {
            await checkAuth();
            await loadCart();
            await loadWishlist();
        };

        initializeApp();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
                <StatusBar style="auto" />
                <AppNavigator />
            </NavigationContainer>
        </GestureHandlerRootView>
    );
}
