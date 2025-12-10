import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, Loader2, X, Upload, RotateCw } from 'lucide-react';
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
    colors: [] as Array<{ name: string; hex: string; stock: number; images?: string[]; price?: number }>,
    rotation_images: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [uploadingRotation, setUploadingRotation] = useState(false);
  const [newColor, setNewColor] = useState({ name: '', hex: '#000000', stock: 0, images: [] as string[], price: undefined as number | undefined });
  const [uploadingColorImages, setUploadingColorImages] = useState(false);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);

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
      colors: [],
      rotation_images: [],
    });
    setNewColor({ name: '', hex: '#000000', stock: 0, images: [], price: undefined });
    setEditingColorIndex(null);
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
      colors: product.colors || [],
      rotation_images: product.rotation_images || [],
    });
    setNewColor({ name: '', hex: '#000000', stock: 0, images: [], price: undefined });
    setShowDialog(true);
  };

  const handleAddColor = () => {
    if (!newColor.name || !newColor.hex) {
      alert('Please provide color name and hex value');
      return;
    }

    if (editingColorIndex !== null) {
      // Update existing color
      setFormData(prev => ({
        ...prev,
        colors: prev.colors.map((color, idx) => 
          idx === editingColorIndex ? { ...newColor } : color
        ),
      }));
      setEditingColorIndex(null);
      setNewColor({ name: '', hex: '#000000', stock: 0, images: [], price: undefined });
    } else {
      // Add new color and keep it in edit mode for image upload
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, { ...newColor }],
      }));
      // Set the newly added color as editing to allow image upload
      setEditingColorIndex(formData.colors.length);
    }
  };

  const handleEditColor = (index: number) => {
    const color = formData.colors[index];
    setNewColor({ ...color, images: color.images || [], price: color.price });
    setEditingColorIndex(index);
  };

  const handleRemoveColor = (index: number) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index),
    });
    if (editingColorIndex === index) {
      setNewColor({ name: '', hex: '#000000', stock: 0, images: [], price: undefined });
      setEditingColorIndex(null);
    }
  };

  const handleColorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || editingColorIndex === null) return;

    setUploadingColorImages(true);
    try {
      const { supabase } = await import('../../lib/supabase');
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (error) throw error;

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(data.path);
          uploadedUrls.push(publicUrl);
        }
      }

      // Add images to the color being edited
      setNewColor(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }));
    } catch (err) {
      alert('Upload failed: ' + (err as Error).message);
    } finally {
      setUploadingColorImages(false);
    }
  };

  const handleRemoveColorImage = (imageIndex: number) => {
    setNewColor(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== imageIndex),
    }));
  };

  const handleRotationImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingRotation(true);
    try {
      const { supabase } = await import('../../lib/supabase');
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('360-rotations')
          .upload(fileName, file);

        if (error) throw error;

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('360-rotations')
            .getPublicUrl(data.path);
          uploadedUrls.push(publicUrl);
        }
      }

      setFormData({
        ...formData,
        rotation_images: [...formData.rotation_images, ...uploadedUrls],
      });
    } catch (err) {
      alert('Upload failed: ' + (err as Error).message);
    } finally {
      setUploadingRotation(false);
    }
  };

  const handleRemoveRotationImage = (index: number) => {
    setFormData({
      ...formData,
      rotation_images: formData.rotation_images.filter((_, i) => i !== index),
    });
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

      // Prepare colors with default selection
      const colorsWithDefault = formData.colors.length > 0 
        ? formData.colors.map((color, idx) => ({
            ...color,
            isDefault: idx === 0, // First color is default
          }))
        : undefined;

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
          colors: colorsWithDefault,
          rotation_images: formData.rotation_images.length > 0 ? formData.rotation_images : undefined,
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
          colors: colorsWithDefault,
          rotation_images: formData.rotation_images.length > 0 ? formData.rotation_images : undefined,
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
          className="max-w-4xl p-0 gap-0 max-h-[90vh]"
          onEscapeKeyDown={(e: any) => e.preventDefault()}
          onPointerDownOutside={(e: any) => e.preventDefault()}
          onInteractOutside={(e: any) => e.preventDefault()}
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product details below.' : 'Fill in the details to add a new product.'}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-6 py-4 space-y-4" style={{ maxHeight: 'calc(90vh - 180px)' }}>
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

            {/* Color Variants Section */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-semibold">Color Variants (Optional)</Label>
              
              {/* Add/Edit Color Form */}
              <div className="p-3 border-2 border-dashed rounded-lg bg-gray-50">
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-3">
                    <div>
                      <Label htmlFor="color-name" className="text-xs">Color Name</Label>
                      <Input
                        id="color-name"
                        value={newColor.name}
                        onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                        placeholder="e.g., Black"
                        className="mt-1 h-9"
                      />
                    </div>

                    <div>
                      <Label htmlFor="color-hex" className="text-xs">Hex Code</Label>
                      <div className="flex gap-1 mt-1">
                        <input
                          id="color-hex"
                          type="color"
                          value={newColor.hex}
                          onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                          className="w-9 h-9 border rounded cursor-pointer"
                        />
                        <Input
                          value={newColor.hex}
                          onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                          placeholder="#000000"
                          className="flex-1 h-9"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="color-stock" className="text-xs">Stock</Label>
                      <Input
                        id="color-stock"
                        type="number"
                        value={newColor.stock}
                        onChange={(e) => setNewColor({ ...newColor, stock: Number(e.target.value) })}
                        placeholder="0"
                        className="mt-1 h-9"
                      />
                    </div>

                    <div>
                      <Label htmlFor="color-price" className="text-xs">Price (Optional)</Label>
                      <Input
                        id="color-price"
                        type="number"
                        value={newColor.price || ''}
                        onChange={(e) => setNewColor({ ...newColor, price: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="Base price"
                        className="mt-1 h-9"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={handleAddColor}
                        disabled={!newColor.name}
                        className="w-full h-9"
                        size="sm"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {editingColorIndex !== null ? 'Update' : 'Add'}
                      </Button>
                    </div>
                  </div>

                  {/* Color Images Upload - Only show when editing */}
                  {editingColorIndex !== null && (
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold">Images for {newColor.name}</Label>
                        <label htmlFor="color-image-upload">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploadingColorImages}
                            onClick={() => document.getElementById('color-image-upload')?.click()}
                            asChild
                          >
                            <span>
                              <Upload className="w-3 h-3 mr-1" />
                              {uploadingColorImages ? 'Uploading...' : 'Upload Images'}
                            </span>
                          </Button>
                        </label>
                        <input
                          id="color-image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleColorImageUpload}
                          className="hidden"
                        />
                      </div>

                      {/* Color Image Previews */}
                      {newColor.images && newColor.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {newColor.images.map((url, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={url}
                                alt={`${newColor.name} ${idx + 1}`}
                                className="w-full h-20 object-cover rounded border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                onClick={() => handleRemoveColorImage(idx)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Color List */}
              {formData.colors.length > 0 && (
                <div className="space-y-2">
                  {formData.colors.map((color, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white border rounded-lg">
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-6 h-6 rounded border-2 border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <p className="font-semibold text-sm">{color.name}</p>
                          <p className="text-xs text-gray-500">
                            {color.hex} • {color.stock} in stock
                            {color.price && (
                              <> • {formatINR(color.price)}</>
                            )}
                            {color.images && color.images.length > 0 && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {color.images.length} image{color.images.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditColor(idx)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveColor(idx)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 360° Rotation Images Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <RotateCw className="w-5 h-5 text-indigo-600" />
                <Label className="text-base font-semibold">360° Product Viewer (Optional)</Label>
              </div>
              <p className="text-xs text-gray-600">Upload 24+ images for smooth 360° rotation</p>
              
              {/* Upload Button */}
              <div className="border-2 border-dashed rounded-lg p-4 text-center bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-semibold text-sm">Upload Rotation Images</p>
                    <p className="text-xs text-gray-500">Select multiple images</p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleRotationImageUpload}
                      disabled={uploadingRotation}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingRotation}
                      as="span"
                    >
                      {uploadingRotation ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Select Images'
                      )}
                    </Button>
                  </label>
                </div>
              </div>

              {/* Uploaded Images Grid */}
              {formData.rotation_images.length > 0 && (
                <div className="space-y-2">
                  <p className="font-semibold text-sm">{formData.rotation_images.length} images uploaded</p>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                    {formData.rotation_images.map((image, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={image}
                          alt={`360-${idx}`}
                          className="w-full h-16 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRotationImage(idx)}
                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition text-red-600 hover:bg-red-50 p-1 h-auto"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <Badge variant="outline" className="absolute bottom-1 left-1 text-xs px-1 py-0">
                          {idx + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
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
