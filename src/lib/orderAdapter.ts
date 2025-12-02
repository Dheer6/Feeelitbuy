import { Order, CartItem, Address, Product } from '../types';

interface DbOrderRow {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  tracking_number?: string;
  created_at: string;
  updated_at?: string;
  estimated_delivery?: string;
  order_items?: any[];
  addresses?: any;
  profiles?: { full_name?: string; email?: string };
  coupon_usage?: any[];
}

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x600.png?text=Product';

function adaptOrderProduct(p: any): Product {
  return {
    id: p.id || 'unknown',
    name: p.name || 'Unknown Product',
    description: p.description || '',
    price: p.price || 0,
    originalPrice: (p.price || 0) * 1.2,
    category: 'electronics',
    subcategory: 'general',
    brand: 'Generic',
    images: p.images?.length ? p.images : [PLACEHOLDER_IMAGE],
    specifications: {},
    stock: 100,
    rating: p.rating || 0,
    reviewCount: p.reviews_count || 0,
    featured: false,
  };
}

function adaptAddress(addr: any): Address {
  if (!addr) {
    return {
      street: 'N/A',
      city: 'N/A',
      state: 'N/A',
      zipCode: '00000',
      country: 'Unknown',
    };
  }
  return {
    street: addr.address_line1 || addr.street || '',
    city: addr.city || '',
    state: addr.state || '',
    zipCode: addr.postal_code || addr.zipCode || '',
    country: addr.country || 'USA',
  };
}

export function adaptDbOrder(row: DbOrderRow): Order {
  const items: CartItem[] = (row.order_items || []).map((oi: any) => ({
    product: adaptOrderProduct(oi.products || {}),
    quantity: oi.quantity || 0,
  }));

  // Extract coupon information if available
  const couponUsage = Array.isArray(row.coupon_usage) && row.coupon_usage.length > 0 ? row.coupon_usage[0] : null;
  const couponCode = couponUsage?.coupons?.code || undefined;
  const couponDiscount = couponUsage?.discount_amount || undefined;

  return {
    id: row.id,
    userId: row.user_id,
    userName: row.profiles?.full_name || undefined,
    userEmail: row.profiles?.email || undefined,
    items,
    total: row.total_amount || 0,
    status: row.status as Order['status'],
    shippingAddress: adaptAddress(row.addresses),
    paymentMethod: row.payment_method || 'card',
    paymentStatus: row.payment_status as Order['paymentStatus'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    estimatedDelivery: row.estimated_delivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    trackingNumber: row.tracking_number,
    couponCode,
    couponDiscount,
  };
}

export function adaptDbOrders(rows: DbOrderRow[]): Order[] {
  return rows.map(adaptDbOrder);
}
