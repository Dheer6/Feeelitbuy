import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, Eye, EyeOff, MoveUp, MoveDown } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { bannerService } from '../../lib/supabaseService';
import type { HeroBanner } from '../../lib/supabase';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function AdminBanners() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    cta_text: 'Shop Now',
    cta_link: '/catalog',
    bg_gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    offer_badge: '',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    try {
      setLoading(true);
      const data = await bannerService.getAllBanners();
      setBanners(data);
    } catch (error) {
      console.error('Failed to load banners:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      cta_text: 'Shop Now',
      cta_link: '/catalog',
      bg_gradient: 'from-indigo-600 via-purple-600 to-pink-600',
      offer_badge: '',
      is_active: true,
      display_order: banners.length + 1,
    });
    setShowDialog(true);
  };

  const handleEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image_url: banner.image_url || '',
      cta_text: banner.cta_text,
      cta_link: banner.cta_link,
      bg_gradient: banner.bg_gradient,
      offer_badge: banner.offer_badge || '',
      is_active: banner.is_active,
      display_order: banner.display_order,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, formData);
      } else {
        await bannerService.createBanner(formData as any);
      }
      setShowDialog(false);
      loadBanners();
    } catch (error) {
      console.error('Failed to save banner:', error);
      alert('Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      setDeleting(id);
      await bannerService.deleteBanner(id);
      loadBanners();
    } catch (error) {
      console.error('Failed to delete banner:', error);
      alert('Failed to delete banner');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (banner: HeroBanner) => {
    try {
      setToggling(banner.id);
      await bannerService.toggleBannerActive(banner.id, !banner.is_active);
      loadBanners();
    } catch (error) {
      console.error('Failed to toggle banner:', error);
      alert('Failed to toggle banner status');
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Hero Banners</h2>
          <p className="text-gray-600">Manage homepage carousel banners</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Banner
        </Button>
      </div>

      {/* Banners Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((banner) => (
              <TableRow key={banner.id}>
                <TableCell>
                  <div className="w-32 h-20 rounded overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={banner.image_url || ''}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{banner.title}</p>
                    <p className="text-sm text-gray-600">{banner.subtitle}</p>
                    {banner.offer_badge && (
                      <Badge className="mt-1 bg-orange-100 text-orange-800 text-xs">
                        {banner.offer_badge}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono">{banner.display_order}</span>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      banner.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(banner)}
                      disabled={toggling === banner.id}
                    >
                      {toggling === banner.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : banner.is_active ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(banner)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(banner.id)}
                      disabled={deleting === banner.id}
                    >
                      {deleting === banner.id ? (
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

      {banners.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No banners found. Add your first banner!</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Mega Summer Sale"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g., Up to 50% Off"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Shop the hottest deals..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cta_text">CTA Text</Label>
                <Input
                  id="cta_text"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  placeholder="Shop Now"
                />
              </div>
              <div>
                <Label htmlFor="cta_link">CTA Link</Label>
                <Input
                  id="cta_link"
                  value={formData.cta_link}
                  onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                  placeholder="/catalog"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="offer_badge">Offer Badge</Label>
                <Input
                  id="offer_badge"
                  value={formData.offer_badge}
                  onChange={(e) => setFormData({ ...formData, offer_badge: e.target.value })}
                  placeholder="e.g., 50% OFF"
                />
              </div>
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bg_gradient">Background Gradient (Tailwind classes)</Label>
              <Input
                id="bg_gradient"
                value={formData.bg_gradient}
                onChange={(e) => setFormData({ ...formData, bg_gradient: e.target.value })}
                placeholder="from-indigo-600 via-purple-600 to-pink-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active">Active (show on homepage)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.title}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Banner'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
