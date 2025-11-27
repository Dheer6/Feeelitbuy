import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { formatINR } from '../../utils/currency';

export default function WishlistScreen({ navigation }: any) {
    const { productIds } = useWishlistStore();

    if (productIds.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Your wishlist is empty</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Wishlist ({productIds.length} items)</Text>
            {/* Simplified - should fetch and display actual products */}
            <Text style={styles.subtitle}>Product details coming soon...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 16, color: '#6b7280' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#6b7280' },
});
