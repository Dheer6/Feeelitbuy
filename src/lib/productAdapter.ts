import { Product } from '../types';
import { productImageService } from './supabaseEnhanced';

interface DbProductRow {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  stock?: number;
  low_stock_threshold?: number;
  rating?: number;
  low_stock_threshold?: number;
  rating?: number;
  reviews_count?: number;
  is_featured?: boolean;
  category_id?: string;
  // categories relationship when selected: categories?: { id: string; name: string };
  categories?: { id: string; name: string } | null;
  product_images?: {
    id: string;
    image_url: string;
    is_primary: boolean;
    display_order: number;
  }[];
}

// Basic placeholder image if none exists
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x600.png?text=Product';

// Map category names to existing UI enum values
function mapCategory(db: string | undefined | null): 'electronics' | 'furniture' {
  const v = (db || '').toLowerCase();
  if (v.includes('elect')) return 'electronics';
  if (v.includes('furn')) return 'furniture';
  // default electronics
  return 'electronics';
}

export async function adaptDbProduct(db: DbProductRow): Promise<Product> {
  let images: string[] = [];

  if (db.product_images && db.product_images.length > 0) {
    // Use pre-fetched images
    images = db.product_images
      .sort((a, b) => {
        // Primary first
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        // Then by display order
        return (a.display_order || 0) - (b.display_order || 0);
      })
      .map(img => img.image_url)
      .filter(Boolean);
  } else {
    try {
      const imgRows = await productImageService.getProductImages(db.id);
      images = imgRows.map(r => r.image_url).filter(Boolean);
    } catch (_) {
      // ignore
    }
  }

  if (images.length === 0) images = [PLACEHOLDER_IMAGE];

  const price = db.price;
  // Prefer real original price from DB when available; fallback to price (no discount)
  const originalPrice = typeof db.original_price === 'number' ? db.original_price : db.price;

  const product: Product = {
    id: db.id,
    name: db.name,
    description: db.description || 'No description provided yet.',
    price,
    originalPrice,
    category: mapCategory(db.categories?.name),
    subcategory: 'general',
    brand: 'Generic',
    images,
    specifications: {},
    stock: db.stock ?? 100, // Use DB stock or fallback to 100
    lowStockThreshold: db.low_stock_threshold ?? 10, // Use DB threshold or default 10
    rating: db.rating || 0,
    reviewCount: db.reviews_count || 0,
    featured: !!db.is_featured,
    reviews: [],
  };
  return product;
}

export async function adaptDbProducts(rows: DbProductRow[]): Promise<Product[]> {
  // Parallel but limit concurrency to avoid overwhelming
  const adapted: Product[] = [];
  for (const row of rows) {
    try {
      const p = await adaptDbProduct(row);
      adapted.push(p);
    } catch (e) {
      // push minimal fallback
      adapted.push({
        id: row.id,
        name: row.name,
        description: row.description || '',
        price: row.price,
        originalPrice: row.price * 1.2,
        category: mapCategory(row.categories?.name),
        subcategory: 'general',
        brand: 'Generic',
        images: [PLACEHOLDER_IMAGE],
        specifications: {},
        stock: row.stock ?? 100,
        lowStockThreshold: row.low_stock_threshold ?? 10,
        rating: row.rating || 0,
        reviewCount: row.reviews_count || 0,
        featured: !!row.is_featured,
        reviews: [],
      });
    }
  }
  return adapted;
}
