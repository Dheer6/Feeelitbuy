import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '../../stores/useAuthStore';

export default function ProfileScreen({ navigation }: any) {
    const { user, signOut } = useAuthStore();

    const handleSignOut = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await signOut();
                },
            },
        ]);
    };

    const menuItems = [
        { title: 'My Orders', onPress: () => navigation.navigate('Orders') },
        { title: 'My Addresses', onPress: () => navigation.navigate('AddressList') },
        { title: 'Wishlist', onPress: () => navigation.navigate('WishlistTab') },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.menu}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={item.onPress}
                    >
                        <Text style={styles.menuItemText}>{item.title}</Text>
                        <Text style={styles.menuItemArrow}>›</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { backgroundColor: '#fff', padding: 24, alignItems: 'center', marginBottom: 16 },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    name: { fontSize: 20, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
    email: { fontSize: 14, color: '#6b7280' },
    menu: { backgroundColor: '#fff', marginBottom: 16 },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    menuItemText: { fontSize: 16, color: '#374151' },
    menuItemArrow: { fontSize: 24, color: '#9ca3af' },
    signOutButton: {
        backgroundColor: '#fff',
        padding: 16,
        alignItems: 'center',
        marginBottom: 32,
    },
    signOutText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
});
