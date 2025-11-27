import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useCartStore } from '../../stores/useCartStore';
import { formatINR } from '../../utils/currency';

export default function CartScreen({ navigation }: any) {
    const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

    const handleCheckout = () => {
        if (items.length === 0) {
            Alert.alert('Cart Empty', 'Please add items to cart');
            return;
        }
        navigation.navigate('Checkout');
    };

    const renderCartItem = ({ item }: any) => (
        <View style={styles.cartItem}>
            <Image
                source={{ uri: item.product.images[0] || 'https://via.placeholder.com/80' }}
                style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                <Text style={styles.itemPrice}>{formatINR(item.product.price)}</Text>
                <View style={styles.quantityRow}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeItem(item.product.id)}
            >
                <Trash2 color="#ef4444" size={20} />
            </TouchableOpacity>
        </View>
    );

    if (items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <TouchableOpacity
                    style={styles.shopButton}
                    onPress={() => navigation.navigate('Main')}
                >
                    <Text style={styles.shopButtonText}>Start Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.product.id}
                contentContainerStyle={styles.list}
            />

            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalAmount}>{formatINR(getTotal())}</Text>
                </View>
                <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    emptyText: { fontSize: 18, color: '#6b7280', marginBottom: 16 },
    shopButton: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12 },
    shopButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    list: { padding: 16 },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
    },
    itemImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#f3f4f6' },
    itemInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
    itemName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
    itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#3b82f6' },
    quantityRow: { flexDirection: 'row', alignItems: 'center' },
    quantityButton: {
        backgroundColor: '#e5e7eb',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
    quantity: { marginHorizontal: 12, fontSize: 16, fontWeight: '600' },
    deleteButton: { justifyContent: 'center', padding: 8 },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    totalLabel: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
    totalAmount: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6' },
    checkoutButton: {
        backgroundColor: '#3b82f6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
