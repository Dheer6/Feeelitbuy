import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, Loader2 } from 'lucide-react';
import { Product } from '../../types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { productService, categoryService } from '../../lib/supabaseService';
import { productImageService } from '../../lib/supabaseEnhanced';
import { formatINR } from '../../lib/currency';
import type { Category } from '../../lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface AdminProductsProps {
  products: Product[];
  onProductsChange?: () => void;
}

export function AdminProducts({ products, onProductsChange }: AdminProductsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: '',
    brand: '',
    image_urls: [''],
    discountType: 'none' as 'none' | 'percentage' | 'amount',
    discountValue: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await categoryService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category_id: categories.length > 0 ? categories[0].id : '',
      brand: '',
      image_urls: [''],
      discountType: 'none',
      discountValue: 0,
    });
    setShowDialog(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);

    // Determine discount type and value from existing product
    let discountType: 'none' | 'percentage' | 'amount' = 'none';
    let discountValue = 0;

    if (product.discount && product.discount > 0) {
      discountType = 'percentage';
      discountValue = product.discount;
    } else if (product.originalPrice && product.originalPrice > product.price) {
      discountType = 'amount';
      discountValue = product.originalPrice - product.price;
    }

    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category_id: product.category_id || (categories.length > 0 ? categories[0].id : ''),
      brand: product.brand || '',
      image_urls: product.images.length > 0 ? product.images : [''],
      discountType,
      discountValue,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name || formData.price <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    // Calculate discount and original price based on discount type
    let discount = 0;
    let originalPrice = formData.price;

    if (formData.discountType === 'percentage' && formData.discountValue > 0) {
      discount = formData.discountValue;
      // Original price is calculated from current price + discount
      originalPrice = formData.price / (1 - discount / 100);
    } else if (formData.discountType === 'amount' && formData.discountValue > 0) {
      originalPrice = formData.price + formData.discountValue;
      // Calculate percentage for display
      discount = (formData.discountValue / originalPrice) * 100;
    }

    try {
      setSaving(true);
      let productId: string;

      if (editingProduct) {
        // Update existing product
        await productService.updateProduct(editingProduct.id, {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
          category_id: formData.category_id,
          brand: formData.brand,
          discount: discount > 0 ? discount : undefined,
          original_price: discount > 0 ? originalPrice : undefined,
        } as any);
        productId = editingProduct.id;

        // Delete all existing images for this product
        const existingImages = await productImageService.getProductImages(productId);
        for (const img of existingImages) {
          await productImageService.deleteProductImage(img.id);
        }
      } else {
        // Create new product
        const newProduct = await productService.createProduct({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
          category_id: formData.category_id,
          brand: formData.brand,
          is_featured: false,
          discount: discount > 0 ? discount : undefined,
          original_price: discount > 0 ? originalPrice : undefined,
        } as any);
        productId = newProduct.id;
      }

      // Save images to product_images table
      const validImageUrls = formData.image_urls.filter(url => url.trim() !== '');
      for (let i = 0; i < validImageUrls.length; i++) {
        await productImageService.createProductImageRecord({
          product_id: productId,
          image_url: validImageUrls[i],
          is_primary: i === 0, // First image is primary
          display_order: i,
          alt_text: `${formData.name} - Image ${i + 1}`,
        });
      }

      setShowDialog(false);
      if (onProductsChange) onProductsChange();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setDeleting(productId);

      // Delete all images associated with this product
      const images = await productImageService.getProductImages(productId);
      for (const img of images) {
        await productImageService.deleteProductImage(img.id);
      }

      // Delete the product
      await productService.deleteProduct(productId);
      if (onProductsChange) onProductsChange();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
          </select>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <ImageWithFallback
                        src={product.images?.[0] || ''}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.brand}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{formatINR(product.price)}</p>
                    {product.originalPrice && (
                      <p className="text-xs text-gray-500 line-through">
                        {formatINR(product.originalPrice)}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      product.stock === 0
                        ? 'bg-red-100 text-red-800'
                        : product.stock < 10
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                    }
                  >
                    {product.stock} units
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm">
                      {product.rating} ({product.reviewCount})
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      product.stock > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {product.stock > 0 ? 'Active' : 'Out of Stock'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                    >
                      {deleting === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found</p>
        </div>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog} modal={true}>
        <DialogContent
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product details below.' : 'Fill in the details to add a new product.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (INR) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">Final price after discount</p>
              </div>
              <div>
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Discount (Optional)</Label>
              <div className="flex gap-3">
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any, discountValue: 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="none">No Discount</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="amount">Fixed Amount (₹)</option>
                </select>
                {formData.discountType !== 'none' && (
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                      placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 500'}
                      min="0"
                      max={formData.discountType === 'percentage' ? '100' : undefined}
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
                    />
                  </div>
                )}
              </div>
              {formData.discountType !== 'none' && formData.discountValue > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Original Price: </span>
                    {formData.discountType === 'percentage'
                      ? formatINR(formData.price / (1 - formData.discountValue / 100))
                      : formatINR(formData.price + formData.discountValue)}
                  </p>
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Discounted Price: </span>
                    {formatINR(formData.price)}
                  </p>
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">You Save: </span>
                    {formData.discountType === 'percentage'
                      ? `${formData.discountValue}% (${formatINR(formData.price * formData.discountValue / (100 - formData.discountValue))})`
                      : `${formatINR(formData.discountValue)} (${((formData.discountValue / (formData.price + formData.discountValue)) * 100).toFixed(1)}%)`}
                  </p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Brand name"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Product Images</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, image_urls: [...formData.image_urls, ''] })}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Image
                </Button>
              </div>
              <div className="space-y-2">
                {formData.image_urls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...formData.image_urls];
                          newUrls[index] = e.target.value;
                          setFormData({ ...formData, image_urls: newUrls });
                        }}
                        placeholder={index === 0 ? "Primary image URL" : `Image ${index + 1} URL`}
                      />
                    </div>
                    {formData.image_urls.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newUrls = formData.image_urls.filter((_, i) => i !== index);
                          setFormData({ ...formData, image_urls: newUrls.length > 0 ? newUrls : [''] });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {formData.image_urls.some(url => url.trim() !== '') && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {formData.image_urls
                    .filter(url => url.trim() !== '')
                    .map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        {index === 0 && (
                          <Badge className="absolute top-1 left-1 text-xs" variant="default">
                            Primary
                          </Badge>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.name || formData.price <= 0}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingProduct ? (
                'Save Changes'
              ) : (
                'Add Product'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
