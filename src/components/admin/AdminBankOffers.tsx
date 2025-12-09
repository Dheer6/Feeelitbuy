import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CreditCard, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { supabase } from '../../lib/supabase';

interface BankOffer {
  id: string;
  card_type: string;
  bank_name: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_amount: number;
  max_discount_amount?: number;
  terms: string;
  is_active: boolean;
  valid_from: string;
  valid_until?: string;
  created_at: string;
}

export function AdminBankOffers() {
  const [offers, setOffers] = useState<BankOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState<BankOffer | null>(null);
  const [formData, setFormData] = useState({
    card_type: '',
    bank_name: '',
    discount_type: 'percentage' as 'percentage' | 'flat',
    discount_value: '',
    min_amount: '',
    max_discount_amount: '',
    terms: '',
    is_active: true,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
  });

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('card_offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error('Failed to load bank offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingOffer(null);
    setFormData({
      card_type: '',
      bank_name: '',
      discount_type: 'percentage',
      discount_value: '',
      min_amount: '',
      max_discount_amount: '',
      terms: '',
      is_active: true,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
    });
    setShowDialog(true);
  };

  const handleEdit = (offer: BankOffer) => {
    setEditingOffer(offer);
    setFormData({
      card_type: offer.card_type,
      bank_name: offer.bank_name,
      discount_type: offer.discount_type,
      discount_value: offer.discount_value.toString(),
      min_amount: offer.min_amount.toString(),
      max_discount_amount: offer.max_discount_amount?.toString() || '',
      terms: offer.terms || '',
      is_active: offer.is_active,
      valid_from: offer.valid_from.split('T')[0],
      valid_until: offer.valid_until?.split('T')[0] || '',
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.card_type.trim() || !formData.bank_name.trim() || !formData.discount_value) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const offerData = {
        card_type: formData.card_type,
        bank_name: formData.bank_name,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_amount: parseFloat(formData.min_amount) || 0,
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        terms: formData.terms,
        is_active: formData.is_active,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until || null,
      };

      if (editingOffer) {
        const { error } = await supabase
          .from('card_offers')
          .update(offerData)
          .eq('id', editingOffer.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('card_offers')
          .insert([offerData]);

        if (error) throw error;
      }

      setShowDialog(false);
      loadOffers();
    } catch (error) {
      console.error('Failed to save offer:', error);
      alert('Failed to save offer');
    }
  };

  const handleToggleActive = async (offer: BankOffer) => {
    try {
      const { error } = await supabase
        .from('card_offers')
        .update({ is_active: !offer.is_active })
        .eq('id', offer.id);

      if (error) throw error;
      loadOffers();
    } catch (error) {
      console.error('Failed to toggle offer:', error);
      alert('Failed to toggle offer status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    try {
      const { error } = await supabase
        .from('card_offers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadOffers();
    } catch (error) {
      console.error('Failed to delete offer:', error);
      alert('Failed to delete offer');
    }
  };

  const formatDiscount = (offer: BankOffer) => {
    if (offer.discount_type === 'percentage') {
      return `${offer.discount_value}% off${offer.max_discount_amount ? ` (max ₹${offer.max_discount_amount})` : ''}`;
    }
    return `₹${offer.discount_value} off`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading bank offers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bank Offers</h2>
          <p className="text-gray-600">Manage card and bank offers</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Offer
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {offers.map((offer) => (
          <Card key={offer.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{offer.bank_name}</h3>
                    <Badge variant={offer.is_active ? 'default' : 'secondary'}>
                      {offer.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{offer.card_type}</p>
                  <div className="text-purple-600 font-semibold mb-2">
                    {formatDiscount(offer)}
                  </div>
                  {offer.min_amount > 0 && (
                    <p className="text-sm text-gray-600 mb-2">
                      Minimum purchase: ₹{offer.min_amount}
                    </p>
                  )}
                  {offer.terms && (
                    <p className="text-sm text-gray-500 mb-2">{offer.terms}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Valid from: {new Date(offer.valid_from).toLocaleDateString()}</span>
                    {offer.valid_until && (
                      <span>Until: {new Date(offer.valid_until).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(offer)}
                  className={offer.is_active ? 'text-green-600' : 'text-gray-400'}
                >
                  {offer.is_active ? (
                    <ToggleRight className="w-6 h-6" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(offer)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(offer.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {offers.length === 0 && (
        <Card className="p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No bank offers yet</h3>
          <p className="text-gray-600 mb-4">Create your first bank offer</p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Offer
          </Button>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingOffer ? 'Edit Bank Offer' : 'Add New Bank Offer'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-scroll max-h-[calc(85vh-180px)] space-y-4 pr-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank_name">Bank Name *</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  placeholder="e.g., HDFC Bank"
                />
              </div>
              <div>
                <Label htmlFor="card_type">Card Type *</Label>
                <Input
                  id="card_type"
                  value={formData.card_type}
                  onChange={(e) => setFormData({ ...formData, card_type: e.target.value })}
                  placeholder="e.g., Credit Card, Debit Card"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_type">Discount Type *</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value: 'percentage' | 'flat') =>
                    setFormData({ ...formData, discount_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="flat">Flat Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discount_value">
                  Discount Value * ({formData.discount_type === 'percentage' ? '%' : '₹'})
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_amount">Minimum Purchase Amount (₹)</Label>
                <Input
                  id="min_amount"
                  type="number"
                  step="0.01"
                  value={formData.min_amount}
                  onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="max_discount_amount">Max Discount Amount (₹)</Label>
                <Input
                  id="max_discount_amount"
                  type="number"
                  step="0.01"
                  value={formData.max_discount_amount}
                  onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                placeholder="Enter terms and conditions"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valid_from">Valid From</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="valid_until">Valid Until (Optional)</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active (visible to customers)
              </Label>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1">
              {editingOffer ? 'Update Offer' : 'Create Offer'}
            </Button>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
