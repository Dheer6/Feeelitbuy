import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    TextInput,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { Search, ShoppingCart, Heart } from 'lucide-react-native';
import { productService } from '../../services/supabaseService';
import { useCartStore } from '../../stores/useCartStore';
import { Product } from '../../types';
import { formatINR } from '../../utils/currency';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
    const [products, setProducts] = useState<Product[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const cartItemCount = useCartStore((state) => state.getItemCount());

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const allProducts = await productService.getProducts();
            setProducts(allProducts);
            setFeaturedProducts(allProducts.filter(p => p.featured).slice(0, 6));
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadProducts();
        setRefreshing(false);
    };

    const renderProductCard = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        >
            <Image
                source={{ uri: item.images[0] || 'https://via.placeholder.com/200' }}
                style={styles.productImage}
                resizeMode="cover"
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                </Text>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>{formatINR(item.price)}</Text>
                    {item.originalPrice && (
                        <Text style={styles.originalPrice}>{formatINR(item.originalPrice)}</Text>
                    )}
                </View>
                <View style={styles.ratingRow}>
                    <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
                    <Text style={styles.reviews}>({item.reviewCount})</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const categories = [
        { id: '1', name: 'Electronics', icon: '📱', color: '#3b82f6' },
        { id: '2', name: 'Furniture', icon: '🛋️', color: '#ef4444' },
        { id: '3', name: 'Smartphones', icon: '📱', color: '#8b5cf6' },
        { id: '4', name: 'Laptops', icon: '💻', color: '#10b981' },
    ];

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome to</Text>
                    <Text style={styles.appName}>Feel It Buy</Text>
                </View>
                <TouchableOpacity
                    style={styles.cartButton}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <ShoppingCart color="#1f2937" size={24} />
                    {cartItemCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{cartItemCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Search color="#9ca3af" size={20} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Categories */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Shop by Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[styles.categoryCard, { backgroundColor: category.color + '20' }]}
                            onPress={() => navigation.navigate('ProductsTab')}
                        >
                            <Text style={styles.categoryIcon}>{category.icon}</Text>
                            <Text style={styles.categoryName}>{category.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Featured Products */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Featured Products</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('ProductsTab')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={featuredProducts}
                    renderItem={renderProductCard}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    scrollEnabled={false}
                    columnWrapperStyle={styles.productRow}
                />
            </View>

            {/* All Products */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>All Products</Text>
                <FlatList
                    data={products.slice(0, 10)}
                    renderItem={renderProductCard}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    scrollEnabled={false}
                    columnWrapperStyle={styles.productRow}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
    },
    greeting: {
        fontSize: 14,
        color: '#6b7280',
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    cartButton: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#ef4444',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 16,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    seeAll: {
        color: '#3b82f6',
        fontWeight: '600',
    },
    categoryCard: {
        padding: 16,
        borderRadius: 12,
        marginLeft: 16,
        alignItems: 'center',
        minWidth: 100,
    },
    categoryIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    productRow: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        width: (width - 48) / 2,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    productImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#f3f4f6',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3b82f6',
        marginRight: 8,
    },
    originalPrice: {
        fontSize: 12,
        color: '#9ca3af',
        textDecorationLine: 'line-through',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        fontSize: 12,
        color: '#f59e0b',
        marginRight: 4,
    },
    reviews: {
        fontSize: 12,
        color: '#6b7280',
    },
});
