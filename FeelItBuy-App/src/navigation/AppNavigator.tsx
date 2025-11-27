import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShoppingBag, Heart, User } from 'lucide-react-native';
import { useAuthStore } from '../stores/useAuthStore';

// Screens (will be imported as they're created)
import HomeScreen from '../screens/home/HomeScreen';
import ProductListScreen from '../screens/products/ProductListScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import WishlistScreen from '../screens/wishlist/WishlistScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import AddressListScreen from '../screens/profile/AddressListScreen';
import AddAddressScreen from '../screens/profile/AddAddressScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#3b82f6',
                tabBarInactiveTintColor: '#9ca3af',
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="ProductsTab"
                component={ProductListScreen}
                options={{
                    tabBarLabel: 'Products',
                    tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="WishlistTab"
                component={WishlistScreen}
                options={{
                    tabBarLabel: 'Wishlist',
                    tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
}

// Main App Navigator
export function AppNavigator() {
    const user = useAuthStore((state) => state.user);

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#3b82f6',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            {!user ? (
                // Auth Stack
                <>
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Register"
                        component={RegisterScreen}
                        options={{ headerShown: false }}
                    />
                </>
            ) : (
                // Main App Stack
                <>
                    <Stack.Screen
                        name="Main"
                        component={BottomTabNavigator}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="ProductDetail"
                        component={ProductDetailScreen}
                        options={{ title: 'Product Details' }}
                    />
                    <Stack.Screen
                        name="Cart"
                        component={CartScreen}
                        options={{ title: 'Shopping Cart' }}
                    />
                    <Stack.Screen
                        name="Checkout"
                        component={CheckoutScreen}
                        options={{ title: 'Checkout' }}
                    />
                    <Stack.Screen
                        name="Orders"
                        component={OrdersScreen}
                        options={{ title: 'My Orders' }}
                    />
                    <Stack.Screen
                        name="OrderDetail"
                        component={OrderDetailScreen}
                        options={{ title: 'Order Details' }}
                    />
                    <Stack.Screen
                        name="AddressList"
                        component={AddressListScreen}
                        options={{ title: 'My Addresses' }}
                    />
                    <Stack.Screen
                        name="AddAddress"
                        component={AddAddressScreen}
                        options={{ title: 'Add Address' }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}
