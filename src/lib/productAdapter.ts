import { Product } from '../types';
import { productImageService } from './supabaseEnhanced';

interface DbProductRow {
  id: string;
  name: string;
  description?: string;
  price: number;
  rating?: number;
  reviews_count?: number;
  is_featured?: boolean;
  category_id?: string;
  // categories relationship when selected: categories?: { id: string; name: string };
  categories?: { id: string; name: string } | null;
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
  try {
    const imgRows = await productImageService.getProductImages(db.id);
    images = imgRows.map(r => r.image_url).filter(Boolean);
  } catch (_) {
    // ignore
  }
  if (images.length === 0) images = [PLACEHOLDER_IMAGE];

  const price = db.price;
  const originalPrice = price * 1.2; // synthetic discount baseline

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
    stock: 100, // placeholder until inventory integrated
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
        stock: 100,
        rating: row.rating || 0,
        reviewCount: row.reviews_count || 0,
        featured: !!row.is_featured,
        reviews: [],
      });
    }
  }
  return adapted;
}
