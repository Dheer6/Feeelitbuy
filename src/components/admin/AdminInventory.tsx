import React, { useState } from 'react';
import { Product } from '../../types';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Edit,
  Plus,
  Minus,
  CheckCircle,
  XCircle,
  Palette,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface AdminInventoryProps {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number, lowStockThreshold?: number) => void;
  onUpdateColorStock?: (productId: string, colors: Array<{ name: string; hex: string; stock: number; images?: string[]; price?: number; discount?: number }>) => void;
}

export function AdminInventory({ products, onUpdateStock, onUpdateColorStock }: AdminInventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null as Product | null);
  const [stockAdjustment, setStockAdjustment] = useState(0);
  const [newStockValue, setNewStockValue] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all' as 'all' | 'low' | 'out' | 'healthy');
  const [editingColors, setEditingColors] = useState<Array<{ name: string; hex: string; stock: number; images?: string[]; price?: number; discount?: number }>>([]);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  // Calculate inventory metrics
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockProducts = products.filter(p => {
    const threshold = p.lowStockThreshold || 10;
    return p.stock > 0 && p.stock <= threshold;
  });
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  // Get stock status
  const getStockStatus = (product: Product): 'healthy' | 'low' | 'out' => {
    if (product.stock === 0) return 'out';
    const threshold = product.lowStockThreshold || 10;
    if (product.stock <= threshold) return 'low';
    return 'healthy';
  };

  // Filter and search products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === 'all') return matchesSearch;
      if (filterStatus === 'low') return matchesSearch && getStockStatus(product) === 'low';
      if (filterStatus === 'out') return matchesSearch && getStockStatus(product) === 'out';
      if (filterStatus === 'healthy') return matchesSearch && getStockStatus(product) === 'healthy';
      return matchesSearch;
    })
    .sort((a, b) => {
      // Sort: out of stock first, then low stock, then by stock level
      const statusA = getStockStatus(a);
      const statusB = getStockStatus(b);
      if (statusA === 'out' && statusB !== 'out') return -1;
      if (statusB === 'out' && statusA !== 'out') return 1;
      if (statusA === 'low' && statusB !== 'low') return -1;
      if (statusB === 'low' && statusA !== 'low') return 1;
      return a.stock - b.stock;
    });

  const handleEditStock = (product: Product) => {
    setEditingProduct(product);
    setNewStockValue(product.stock);
    setStockAdjustment(0);
    setLowStockThreshold(product.lowStockThreshold || 10);
    
    // Initialize color stocks if product has color variants
    if (product.colors && product.colors.length > 0) {
      setEditingColors(JSON.parse(JSON.stringify(product.colors)));
    } else {
      setEditingColors([]);
    }
  };

  const handleSaveStock = () => {
    if (editingProduct) {
      // If product has color variants, update color stocks
      if (editingColors.length > 0 && onUpdateColorStock) {
        // Calculate total stock from all colors
        const totalStock = editingColors.reduce((sum, color) => sum + color.stock, 0);
        onUpdateColorStock(editingProduct.id, editingColors);
      } else {
        // Update simple product stock
        const finalStock = Math.max(0, newStockValue + stockAdjustment);
        onUpdateStock(editingProduct.id, finalStock, lowStockThreshold);
      }
      setEditingProduct(null);
      setStockAdjustment(0);
      setEditingColors([]);
    }
  };

  const handleColorStockChange = (colorIndex: number, newStock: number) => {
    const updatedColors = [...editingColors];
    updatedColors[colorIndex].stock = Math.max(0, newStock);
    setEditingColors(updatedColors);
  };

  const handleQuickAdjust = (product: Product, adjustment: number) => {
    const newStock = Math.max(0, product.stock + adjustment);
    onUpdateStock(product.id, newStock, product.lowStockThreshold);
  };

  const toggleProductExpand = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Inventory Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Total Products</p>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-blue-600 mb-2" style={{ fontSize: '28px' }}>
            {totalProducts}
          </p>
          <p className="text-sm text-gray-600">{totalStock} units in stock</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Low Stock Items</p>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-orange-600 mb-2" style={{ fontSize: '28px' }}>
            {lowStockProducts.length}
          </p>
          <p className="text-sm text-gray-600">Need restocking soon</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Out of Stock</p>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-red-600 mb-2" style={{ fontSize: '28px' }}>
            {outOfStockProducts.length}
          </p>
          <p className="text-sm text-gray-600">Unavailable products</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Inventory Value</p>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-green-600 mb-2" style={{ fontSize: '28px' }}>
            ₹{totalValue.toFixed(0)}
          </p>
          <p className="text-sm text-gray-600">Total stock value</p>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'healthy' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('healthy')}
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Healthy
            </Button>
            <Button
              variant={filterStatus === 'low' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('low')}
              size="sm"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Low Stock
            </Button>
            <Button
              variant={filterStatus === 'out' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('out')}
              size="sm"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Out of Stock
            </Button>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Inventory List</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Current Stock</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Price</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Value</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Quick Actions</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const status = getStockStatus(product);
                const hasColors = product.colors && product.colors.length > 0;
                const isExpanded = expandedProducts.has(product.id);
                
                return (
                  <React.Fragment key={product.id}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {hasColors && (
                            <button
                              onClick={() => toggleProductExpand(product.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title={isExpanded ? "Collapse colors" : "Expand colors"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          )}
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.brand}</p>
                            {hasColors && (
                              <span className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                                <Palette className="w-3 h-3" />
                                {product.colors.length} colors
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="capitalize text-sm">{product.category}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-semibold text-lg">{product.stock}</span>
                        {hasColors && (
                          <span className="text-xs text-gray-500 block mt-1">Total</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {status === 'healthy' && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            In Stock
                          </Badge>
                        )}
                        {status === 'low' && (
                          <Badge variant="outline" className="bg-orange-500 text-white border-orange-600">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Low Stock
                          </Badge>
                        )}
                        {status === 'out' && (
                          <Badge variant="outline" className="bg-red-500 text-white border-red-600">
                            <XCircle className="w-3 h-3 mr-1" />
                            Out of Stock
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        ₹{product.price.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center font-semibold">
                        ₹{(product.price * product.stock).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickAdjust(product, -1)}
                            disabled={product.stock === 0}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickAdjust(product, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickAdjust(product, 10)}
                          >
                            +10
                          </Button>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleEditStock(product)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                    
                    {/* Expanded color variants row */}
                    {hasColors && isExpanded && (
                      <tr key={`${product.id}-colors`} className="bg-gray-50 border-b">
                        <td colSpan={8} className="py-4 px-8">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <Palette className="w-4 h-4" />
                              <span>Color Variant Stocks</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {product.colors.map((color, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border flex items-center gap-3">
                                  <div
                                    className="w-10 h-10 rounded border-2 border-gray-300 flex-shrink-0"
                                    style={{ backgroundColor: color.hex }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{color.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-gray-600">Stock:</span>
                                      <span className="font-semibold text-sm">{color.stock}</span>
                                      {color.price && (
                                        <span className="text-xs text-gray-500">
                                          • ₹{color.price.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No products found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Edit Stock Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Inventory - {editingProduct?.name}</DialogTitle>
            <DialogDescription>
              Adjust stock levels and manage inventory for this product
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img 
                  src={editingProduct.images[0]} 
                  alt={editingProduct.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold">{editingProduct.name}</p>
                  <p className="text-sm text-gray-600">{editingProduct.brand}</p>
                </div>
              </div>

              {editingColors.length > 0 ? (
                // Product with color variants
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Palette className="w-4 h-4" />
                    <span>Color Variant Stocks</span>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {editingColors.map((color, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-8 h-8 rounded border-2 border-gray-300"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{color.name}</p>
                            {color.price && (
                              <p className="text-sm text-gray-600">
                                ₹{color.price.toFixed(2)}
                                {color.discount && color.discount > 0 && (
                                  <span className="ml-2 text-green-600">
                                    {color.discount}% off
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleColorStockChange(index, color.stock - 10)}
                          >
                            -10
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleColorStockChange(index, color.stock - 1)}
                          >
                            -1
                          </Button>
                          <Input
                            type="number"
                            min="0"
                            value={color.stock}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              handleColorStockChange(index, parseInt(e.target.value) || 0)
                            }
                            className="text-center font-semibold"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleColorStockChange(index, color.stock + 1)}
                          >
                            +1
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleColorStockChange(index, color.stock + 10)}
                          >
                            +10
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Total Combined Stock:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {editingColors.reduce((sum, color) => sum + color.stock, 0)}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700">
                        ⓘ Each color variant has separate stock. Total is the sum of all color stocks.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Simple product without color variants
                <>
                  <div>
                    <Label>Current Stock</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          min="0"
                          value={newStockValue}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStockValue(parseInt(e.target.value) || 0)}
                          className="text-center text-lg font-semibold"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        Was: {editingProduct.stock}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Quick Adjustment</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        onClick={() => setStockAdjustment(stockAdjustment - 10)}
                      >
                        -10
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setStockAdjustment(stockAdjustment - 1)}
                      >
                        -1
                      </Button>
                      <Input
                        type="number"
                        value={stockAdjustment}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStockAdjustment(parseInt(e.target.value) || 0)}
                        className="text-center flex-1"
                        placeholder="0"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setStockAdjustment(stockAdjustment + 1)}
                      >
                        +1
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setStockAdjustment(stockAdjustment + 10)}
                      >
                        +10
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Low Stock Alert Threshold</Label>
                    <Input
                      type="number"
                      min="0"
                      value={lowStockThreshold}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLowStockThreshold(parseInt(e.target.value) || 10)}
                      className="mt-2"
                      placeholder="10"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Alert when stock falls below this number
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Final Stock:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {Math.max(0, newStockValue + stockAdjustment)}
                      </span>
                    </div>
                    {stockAdjustment !== 0 && (
                      <p className="text-sm text-gray-600">
                        {stockAdjustment > 0 ? '+' : ''}{stockAdjustment} adjustment
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingProduct(null);
                    setEditingColors([]);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveStock}
                  className="flex-1"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
