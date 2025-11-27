export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    category: 'electronics' | 'furniture';
    subcategory: string;
    brand: string;
    images: string[];
    specifications: Record<string, string>;
    stock: number;
    rating: number;
    reviewCount: number;
    reviews?: Review[];
    featured?: boolean;
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'customer' | 'admin';
    createdAt: string;
    address?: Address;
}

export interface Address {
    id?: string;
    name?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    isDefault?: boolean;
}

export interface CartItem {
    product: Product;
    quantity: number;
    itemId?: string;
}

export interface Order {
    id: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    items: CartItem[];
    total: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress: Address;
    paymentMethod: string;
    paymentStatus: 'pending' | 'completed' | 'paid' | 'failed' | 'refunded';
    createdAt: string;
    updatedAt?: string;
    estimatedDelivery: string;
    trackingNumber?: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    image: string;
    count: number;
}
