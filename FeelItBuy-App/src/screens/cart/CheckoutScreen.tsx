import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useCartStore } from '../../stores/useCartStore';
import { orderService, addressService } from '../../services/supabaseService';
import { formatINR } from '../../utils/currency';

export default function CheckoutScreen({ navigation }: any) {
    const { items, getTotal, clearCart } = useCartStore();
    const [loading, setLoading] = useState(false);

    const handlePlaceOrder = async () => {
        try {
            setLoading(true);

            // Get default address (simplified - should show address selection)
            const addresses = await addressService.getAddresses();
            const defaultAddress = addresses.find(a => a.is_default) || addresses[0];

            if (!defaultAddress) {
                Alert.alert('Error', 'Please add a delivery address');
                navigation.navigate('AddressList');
                return;
            }

            // Create order
            const orderData = {
                items: items.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
                shipping_address_id: defaultAddress.id!,
                payment_method: 'COD', // Simplified - should integrate Razorpay
            };

            await orderService.createOrder(orderData);
            await clearCart();

            Alert.alert('Success', 'Order placed successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('Orders') }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                {items.map((item) => (
                    <View key={item.product.id} style={styles.item}>
                        <Text style={styles.itemName}>{item.product.name}</Text>
                        <Text style={styles.itemDetails}>
                            {item.quantity} x {formatINR(item.product.price)}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <Text style={styles.paymentMethod}>Cash on Delivery</Text>
            </View>

            <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>{formatINR(getTotal())}</Text>
            </View>

            <TouchableOpacity
                style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
                onPress={handlePlaceOrder}
                disabled={loading}
            >
                <Text style={styles.placeOrderText}>
                    {loading ? 'Placing Order...' : 'Place Order'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
    section: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    item: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    itemName: { flex: 1, fontSize: 14, color: '#374151' },
    itemDetails: { fontSize: 14, color: '#6b7280' },
    paymentMethod: { fontSize: 16, color: '#374151' },
    totalSection: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    totalLabel: { fontSize: 18, fontWeight: '600' },
    totalAmount: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6' },
    placeOrderButton: {
        backgroundColor: '#3b82f6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 32,
    },
    buttonDisabled: { opacity: 0.6 },
    placeOrderText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
