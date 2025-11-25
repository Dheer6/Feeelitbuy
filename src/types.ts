export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number; // Discount percentage (0-100)
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
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  itemId?: string; // Supabase cart_items row id when synced
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
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
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
