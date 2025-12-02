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
  lowStockThreshold?: number; // Alert when stock falls below this number (default: 10)
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
  name?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  alternatePhone?: string;
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
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt?: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  couponCode?: string;
  couponDiscount?: number;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  returnType: 'refund' | 'replace';
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  items: { productId: string; productName: string; quantity: number; price: number }[];
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
  adminNotes?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  count: number;
}
