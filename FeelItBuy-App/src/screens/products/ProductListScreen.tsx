import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { productService } from '../../services/supabaseService';
import { Product } from '../../types';
import { formatINR } from '../../utils/currency';

const { width } = Dimensions.get('window');

export default function ProductListScreen({ navigation }: any) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await productService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        >
            <Image
                source={{ uri: item.images[0] || 'https://via.placeholder.com/200' }}
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>{formatINR(item.price)}</Text>
                <Text style={styles.rating}>⭐ {item.rating.toFixed(1)} ({item.reviewCount})</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16 },
    row: { justifyContent: 'space-between', marginBottom: 16 },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        width: (width - 48) / 2,
        elevation: 2,
    },
    productImage: { width: '100%', height: 150 },
    productInfo: { padding: 12 },
    productName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    price: { fontSize: 16, fontWeight: 'bold', color: '#3b82f6', marginBottom: 4 },
    rating: { fontSize: 12, color: '#6b7280' },
});
