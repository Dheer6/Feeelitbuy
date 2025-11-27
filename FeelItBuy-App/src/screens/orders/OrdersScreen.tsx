import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { orderService } from '../../services/supabaseService';
import { Order } from '../../types';
import { formatINR } from '../../utils/currency';

export default function OrdersScreen({ navigation }: any) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await orderService.getOrders();
            setOrders(data as any);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderOrder = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
        >
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
                <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                    {item.status.toUpperCase()}
                </Text>
            </View>
            <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text style={styles.orderTotal}>{formatINR(item.total)}</Text>
        </TouchableOpacity>
    );

    const getStatusColor = (status: string) => {
        const colors: any = {
            pending: '#f59e0b',
            confirmed: '#3b82f6',
            processing: '#8b5cf6',
            shipped: '#10b981',
            delivered: '#059669',
            cancelled: '#ef4444',
        };
        return colors[status] || '#6b7280';
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (orders.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No orders yet</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 16, color: '#6b7280' },
    list: { padding: 16 },
    orderCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    orderId: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
    status: { fontSize: 14, fontWeight: '600' },
    orderDate: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
    orderTotal: { fontSize: 18, fontWeight: 'bold', color: '#3b82f6' },
});
