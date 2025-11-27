import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { ShoppingCart, Heart } from 'lucide-react-native';
import { productService } from '../../services/supabaseService';
import { useCartStore } from '../../stores/useCartStore';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { Product } from '../../types';
import { formatINR } from '../../utils/currency';

export default function ProductDetailScreen({ route, navigation }: any) {
    const { productId } = route.params;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const addToCart = useCartStore((state) => state.addItem);
    const { isInWishlist, toggleWishlist } = useWishlistStore();

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        try {
            const data = await productService.getProduct(productId);
            setProduct(data as any);
        } catch (error) {
            console.error('Error loading product:', error);
            Alert.alert('Error', 'Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (product) {
            await addToCart(product);
            Alert.alert('Success', 'Added to cart!');
        }
    };

    const handleToggleWishlist = async () => {
        if (product) {
            await toggleWishlist(product.id);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <Text>Product not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Image
                source={{ uri: product.images[0] || 'https://via.placeholder.com/400' }}
                style={styles.image}
            />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name}>{product.name}</Text>
                    <TouchableOpacity onPress={handleToggleWishlist}>
                        <Heart
                            color={isInWishlist(product.id) ? '#ef4444' : '#9ca3af'}
                            fill={isInWishlist(product.id) ? '#ef4444' : 'none'}
                            size={24}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>{formatINR(product.price)}</Text>
                    {product.originalPrice && (
                        <Text style={styles.originalPrice}>{formatINR(product.originalPrice)}</Text>
                    )}
                </View>

                <Text style={styles.rating}>
                    ⭐ {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                </Text>

                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{product.description}</Text>

                <Text style={styles.sectionTitle}>Brand</Text>
                <Text style={styles.brand}>{product.brand}</Text>

                <Text style={styles.sectionTitle}>Category</Text>
                <Text style={styles.category}>{product.category}</Text>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                        <ShoppingCart color="#fff" size={20} />
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    image: { width: '100%', height: 300, backgroundColor: '#f3f4f6' },
    content: { padding: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    name: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', flex: 1, marginRight: 12 },
    priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    price: { fontSize: 28, fontWeight: 'bold', color: '#3b82f6', marginRight: 12 },
    originalPrice: { fontSize: 18, color: '#9ca3af', textDecorationLine: 'line-through' },
    rating: { fontSize: 16, color: '#f59e0b', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginTop: 16, marginBottom: 8 },
    description: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
    brand: { fontSize: 16, color: '#374151' },
    category: { fontSize: 16, color: '#374151', textTransform: 'capitalize' },
    footer: { marginTop: 24, marginBottom: 32 },
    addToCartButton: {
        backgroundColor: '#3b82f6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    addToCartText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
