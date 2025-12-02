import { useState, useMemo } from 'react';
import { Heart, Star, SlidersHorizontal, Package, AlertTriangle } from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatINR } from '../lib/currency';

interface ProductCatalogProps {
  category: string;
  products: Product[];
  onViewProduct: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onCategoryChange?: (category: string) => void;
}

export function ProductCatalog({
  category,
  products,
  onViewProduct,
  wishlist,
  onToggleWishlist,
  onCategoryChange,
}: ProductCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);

  // Electronics-specific filters
  const [selectedScreenSizes, setSelectedScreenSizes] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [selectedProcessors, setSelectedProcessors] = useState<string[]>([]);

  // Furniture-specific filters
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Filter by brand
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => selectedBrands.includes(p.brand));
    }

    // Filter by rating
    if (selectedRating > 0) {
      filtered = filtered.filter((p) => p.rating >= selectedRating);
    }

    // Filter by stock availability
    if (inStock) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    // Filter by sale/discount
    if (onSale) {
      filtered = filtered.filter((p) => p.originalPrice && p.originalPrice > p.price);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Featured - show featured first
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return filtered;
  }, [products, category, searchQuery, sortBy, priceRange, selectedBrands, selectedRating, inStock, onSale]);

  const brands = useMemo(() => {
    const categoryProducts =
      category === 'all' ? products : products.filter((p) => p.category === category);
    return Array.from(new Set(categoryProducts.map((p) => p.brand)));
  }, [products, category]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Electronics filter options
  const screenSizes = ['13"', '15"', '24"', '32"', '43"', '55"', '65"'];
  const storageOptions = ['128GB', '256GB', '512GB', '1TB', '2TB'];
  const processors = ['Intel i3', 'Intel i5', 'Intel i7', 'AMD Ryzen 5', 'AMD Ryzen 7'];

  // Furniture filter options
  const materials = ['Wood', 'Metal', 'Fabric', 'Leather', 'Glass', 'Plastic'];
  const colors = ['Black', 'White', 'Brown', 'Gray', 'Beige', 'Blue', 'Red'];
  const roomTypes = ['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Kitchen', 'Outdoor'];

  const clearAllFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 2000]);
    setSelectedBrands([]);
    setSelectedRating(0);
    setInStock(false);
    setOnSale(false);
    setSelectedScreenSizes([]);
    setSelectedStorage([]);
    setSelectedProcessors([]);
    setSelectedMaterials([]);
    setSelectedColors([]);
    setSelectedRoomTypes([]);
    if (onCategoryChange) {
      onCategoryChange('all');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-4">
          {category === 'all'
            ? 'All Products'
            : category === 'electronics'
              ? 'Electronics'
              : 'Furniture'}
        </h1>
        <p className="text-gray-600">
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="name">Name: A to Z</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="sm:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
          <Card className="p-6 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {/* Category Filter */}
              {onCategoryChange && (
                <div className="pb-6 border-b">
                  <Label className="mb-3 block font-semibold">Category</Label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="cat-all"
                        checked={category === 'all'}
                        onCheckedChange={() => onCategoryChange('all')}
                      />
                      <label htmlFor="cat-all" className="ml-2 text-sm cursor-pointer">
                        All Products
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="cat-electronics"
                        checked={category === 'electronics'}
                        onCheckedChange={() => onCategoryChange('electronics')}
                      />
                      <label htmlFor="cat-electronics" className="ml-2 text-sm cursor-pointer">
                        Electronics
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="cat-furniture"
                        checked={category === 'furniture'}
                        onCheckedChange={() => onCategoryChange('furniture')}
                      />
                      <label htmlFor="cat-furniture" className="ml-2 text-sm cursor-pointer">
                        Furniture
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="pb-6 border-b">
                <Label className="mb-3 block font-semibold">Availability</Label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="inStock"
                      checked={inStock}
                      onCheckedChange={(checked) => setInStock(!!checked)}
                    />
                    <label htmlFor="inStock" className="ml-2 text-sm cursor-pointer">
                      In Stock Only
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="onSale"
                      checked={onSale}
                      onCheckedChange={(checked) => setOnSale(!!checked)}
                    />
                    <label htmlFor="onSale" className="ml-2 text-sm cursor-pointer">
                      On Sale
                    </label>
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div className="pb-6 border-b">
                <Label className="mb-3 block font-semibold">Price Range</Label>
                <div className="space-y-2">
                  <Input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatINR(priceRange[0])}</span>
                    <span>{formatINR(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="pb-6 border-b">
                <Label className="mb-3 block font-semibold">Customer Rating</Label>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center">
                      <Checkbox
                        id={`rating-${rating}`}
                        checked={selectedRating === rating}
                        onCheckedChange={(checked) => setSelectedRating(checked ? rating : 0)}
                      />
                      <label
                        htmlFor={`rating-${rating}`}
                        className="ml-2 text-sm cursor-pointer flex items-center"
                      >
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-300 text-gray-300'
                              }`}
                          />
                        ))}
                        <span className="ml-1">& Up</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div className="pb-6 border-b">
                  <Label className="mb-3 block font-semibold">Brand</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center">
                        <Checkbox
                          id={brand}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => toggleBrand(brand)}
                        />
                        <label htmlFor={brand} className="ml-2 text-sm cursor-pointer">
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Electronics-specific filters */}
              {category === 'electronics' && (
                <>
                  {/* Screen Size */}
                  <div className="pb-6 border-b">
                    <Label className="mb-3 block font-semibold">Screen Size</Label>
                    <div className="space-y-2">
                      {screenSizes.map((size) => (
                        <div key={size} className="flex items-center">
                          <Checkbox
                            id={`screen-${size}`}
                            checked={selectedScreenSizes.includes(size)}
                            onCheckedChange={() => {
                              setSelectedScreenSizes((prev) =>
                                prev.includes(size)
                                  ? prev.filter((s) => s !== size)
                                  : [...prev, size]
                              );
                            }}
                          />
                          <label
                            htmlFor={`screen-${size}`}
                            className="ml-2 text-sm cursor-pointer"
                          >
                            {size}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="pb-6 border-b">
                    <Label className="mb-3 block font-semibold">Storage Capacity</Label>
                    <div className="space-y-2">
                      {storageOptions.map((storage) => (
                        <div key={storage} className="flex items-center">
                          <Checkbox
                            id={`storage-${storage}`}
                            checked={selectedStorage.includes(storage)}
                            onCheckedChange={() => {
                              setSelectedStorage((prev) =>
                                prev.includes(storage)
                                  ? prev.filter((s) => s !== storage)
                                  : [...prev, storage]
                              );
                            }}
                          />
                          <label
                            htmlFor={`storage-${storage}`}
                            className="ml-2 text-sm cursor-pointer"
                          >
                            {storage}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Processor */}
                  <div className="pb-6 border-b">
                    <Label className="mb-3 block font-semibold">Processor</Label>
                    <div className="space-y-2">
                      {processors.map((processor) => (
                        <div key={processor} className="flex items-center">
                          <Checkbox
                            id={`processor-${processor}`}
                            checked={selectedProcessors.includes(processor)}
                            onCheckedChange={() => {
                              setSelectedProcessors((prev) =>
                                prev.includes(processor)
                                  ? prev.filter((p) => p !== processor)
                                  : [...prev, processor]
                              );
                            }}
                          />
                          <label
                            htmlFor={`processor-${processor}`}
                            className="ml-2 text-sm cursor-pointer"
                          >
                            {processor}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Furniture-specific filters */}
              {category === 'furniture' && (
                <>
                  {/* Material */}
                  <div className="pb-6 border-b">
                    <Label className="mb-3 block font-semibold">Material</Label>
                    <div className="space-y-2">
                      {materials.map((material) => (
                        <div key={material} className="flex items-center">
                          <Checkbox
                            id={`material-${material}`}
                            checked={selectedMaterials.includes(material)}
                            onCheckedChange={() => {
                              setSelectedMaterials((prev) =>
                                prev.includes(material)
                                  ? prev.filter((m) => m !== material)
                                  : [...prev, material]
                              );
                            }}
                          />
                          <label
                            htmlFor={`material-${material}`}
                            className="ml-2 text-sm cursor-pointer"
                          >
                            {material}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Color */}
                  <div className="pb-6 border-b">
                    <Label className="mb-3 block font-semibold">Color</Label>
                    <div className="space-y-2">
                      {colors.map((color) => (
                        <div key={color} className="flex items-center">
                          <Checkbox
                            id={`color-${color}`}
                            checked={selectedColors.includes(color)}
                            onCheckedChange={() => {
                              setSelectedColors((prev) =>
                                prev.includes(color)
                                  ? prev.filter((c) => c !== color)
                                  : [...prev, color]
                              );
                            }}
                          />
                          <label
                            htmlFor={`color-${color}`}
                            className="ml-2 text-sm cursor-pointer flex items-center gap-2"
                          >
                            <span
                              className="w-4 h-4 rounded-full border"
                              style={{
                                backgroundColor: color.toLowerCase(),
                              }}
                            />
                            {color}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Room Type */}
                  <div className="pb-6 border-b">
                    <Label className="mb-3 block font-semibold">Room Type</Label>
                    <div className="space-y-2">
                      {roomTypes.map((room) => (
                        <div key={room} className="flex items-center">
                          <Checkbox
                            id={`room-${room}`}
                            checked={selectedRoomTypes.includes(room)}
                            onCheckedChange={() => {
                              setSelectedRoomTypes((prev) =>
                                prev.includes(room)
                                  ? prev.filter((r) => r !== room)
                                  : [...prev, room]
                              );
                            }}
                          />
                          <label
                            htmlFor={`room-${room}`}
                            className="ml-2 text-sm cursor-pointer"
                          >
                            {room}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">No products found matching your criteria.</p>
              <Button
                variant="outline"
                onClick={clearAllFilters}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden transition-all hover:shadow-lg group cursor-pointer"
                >
                  <div
                    className="relative h-56 overflow-hidden bg-gray-100"
                    onClick={() => onViewProduct(product)}
                  >
                    <ImageWithFallback
                      src={product.images?.[0] || ''}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-sm">
                        {Math.round(
                          ((product.originalPrice - product.price) / product.originalPrice) * 100
                        )}
                        % OFF
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product.id);
                      }}
                      className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${wishlist.includes(product.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-600'
                          }`}
                      />
                    </button>
                    {product.stock === 0 ? (
                      <Badge variant="outline" className="absolute bottom-3 left-3 bg-red-600 text-white border-red-600">
                        <Package className="w-3 h-3 mr-1" />
                        Out of Stock
                      </Badge>
                    ) : product.stock <= (product.lowStockThreshold || 10) ? (
                      <Badge variant="outline" className="absolute bottom-3 left-3 bg-orange-500 text-white border-orange-500">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Only {product.stock} left
                      </Badge>
                    ) : null}
                  </div>
                  <div className="p-4" onClick={() => onViewProduct(product)}>
                    <p className="text-indigo-600 text-sm mb-1">{product.brand}</p>
                    <h3 className="mb-2 line-clamp-2" style={{ fontSize: '16px' }}>
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-300 text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-500 text-sm">
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-indigo-600">{formatINR(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-gray-400 line-through text-sm">
                          {formatINR(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <Button className="w-full" size="sm">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
