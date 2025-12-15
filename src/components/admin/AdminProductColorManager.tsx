import { useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

interface ColorVariant {
  name: string;
  hex: string;
  stock: number;
}

interface AdminProductEditorProps {
  productId: string;
  onSave: (colors: ColorVariant[], rotationImages: string[]) => Promise<void>;
}

export function AdminProductColorManager({ productId, onSave }: AdminProductEditorProps) {
  const [colors, setColors] = useState<ColorVariant[]>([]);
  const [rotationImages, setRotationImages] = useState<string[]>([]);
  const [newColor, setNewColor] = useState({ name: '', hex: '#000000', stock: 0 });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAddColor = () => {
    if (newColor.name && newColor.hex) {
      setColors([...colors, newColor]);
      setNewColor({ name: '', hex: '#000000', stock: 0 });
    }
  };

  const handleRemoveColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const handleRotationImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const { supabase } = await import('../../lib/supabase');

      for (const file of Array.from(files)) {
        // Upload to 360-rotations bucket
        const { data, error } = await supabase.storage
          .from('360-rotations')
          .upload(`${productId}/${Date.now()}_${file.name}`, file);

        if (error) {
          throw error;
        }

        if (data) {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('360-rotations')
            .getPublicUrl(data.path);

          setRotationImages([...rotationImages, publicUrl]);
        }
      }
    } catch (err) {
      alert('Upload failed: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setRotationImages(rotationImages.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(colors, rotationImages);
      alert('Product updated successfully!');
    } catch (err) {
      alert('Save failed: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Color Variants</h3>
        
        <div className="space-y-4">
          {/* Add New Color */}
          <div className="p-4 border-2 border-dashed rounded-lg">
            <div className="grid grid-cols-4 gap-4 mb-3">
              <div>
                <Label htmlFor="color-name" className="text-sm">Color Name</Label>
                <Input
                  id="color-name"
                  value={newColor.name}
                  onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                  placeholder="e.g., Black, Red"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="color-hex" className="text-sm">Hex Code</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    id="color-hex"
                    type="color"
                    value={newColor.hex}
                    onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                    className="w-12 h-9 border rounded cursor-pointer"
                  />
                  <Input
                    value={newColor.hex}
                    onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="color-stock" className="text-sm">Stock</Label>
                <Input
                  id="color-stock"
                  type="number"
                  value={newColor.stock}
                  onChange={(e) => setNewColor({ ...newColor, stock: Number(e.target.value) })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleAddColor}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Color List */}
          {colors.length > 0 && (
            <div className="space-y-2">
              {colors.map((color, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <p className="font-semibold">{color.name}</p>
                      <p className="text-xs text-gray-500">{color.hex} • {color.stock} in stock</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveColor(idx)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

     
      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button
          onClick={handleSave}
          disabled={saving || (colors.length === 0 && rotationImages.length === 0)}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
