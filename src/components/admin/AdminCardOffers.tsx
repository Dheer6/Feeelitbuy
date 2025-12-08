import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { formatINR } from '../../lib/currency';

export function AdminCardOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    card_type: 'HDFC',
    discount_type: 'percentage',
    discount_value: 10,
    min_amount: 1000,
    max_discount_amount: 500,
    terms: '',
  });

  // Fetch card offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { cardOffersService } = await import('../../lib/supabaseService');
        const data = await cardOffersService.getActiveOffers();
        setOffers(data || []);
      } catch (err) {
        console.error('Failed to load card offers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const handleAddNew = () => {
    setEditingOffer(null);
    setFormData({
      card_type: 'HDFC',
      discount_type: 'percentage',
      discount_value: 10,
      min_amount: 1000,
      max_discount_amount: 500,
      terms: '',
    });
    setShowDialog(true);
  };

  const handleEdit = (offer: any) => {
    setEditingOffer(offer);
    setFormData({
      card_type: offer.card_type,
      discount_type: offer.discount_type,
      discount_value: offer.discount_value,
      min_amount: offer.min_amount,
      max_discount_amount: offer.max_discount_amount,
      terms: offer.terms,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      const { cardOffersService } = await import('../../lib/supabaseService');
      
      if (editingOffer) {
        // Update - would need backend support
        alert('Update functionality coming soon');
      } else {
        // Create
        const { cardOffersService } = await import('../../lib/supabaseService');
        const newOffer = await cardOffersService.createOffer({
          card_type: formData.card_type,
          discount_type: formData.discount_type as 'percentage' | 'flat',
          discount_value: formData.discount_value,
          min_amount: formData.min_amount,
          max_discount_amount: formData.max_discount_amount,
          terms: formData.terms
        });
        
        if (newOffer) {
          setOffers([...offers, newOffer]);
          setShowDialog(false);
        }
      }
    } catch (err) {
      alert('Error saving offer: ' + (err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this offer?')) return;
    
    try {
      // Would need backend delete function
      alert('Delete functionality coming soon');
    } catch (err) {
      alert('Error deleting offer');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Card Offers Management</h1>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          New Offer
        </Button>
      </div>

      {/* Card Types Info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">Supported Cards:</p>
            <p>HDFC, ICICI, Axis, IndusInd, SBI, Kotak, YES Bank</p>
          </div>
        </div>
      </Card>

      {/* Offers List */}
      <div className="grid gap-4">
        {offers.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No offers created yet. Click "New Offer" to create one.
          </Card>
        ) : (
          offers.map((offer) => (
            <Card key={offer.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{offer.card_type} Card</h3>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Discount</p>
                      <p className="text-lg font-bold">
                        {offer.discount_type === 'percentage'
                          ? `${offer.discount_value}%`
                          : formatINR(offer.discount_value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Min Amount</p>
                      <p className="text-lg font-bold">{formatINR(offer.min_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Max Discount</p>
                      <p className="text-lg font-bold">{formatINR(offer.max_discount_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="text-lg font-bold">
                        {new Date(offer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {offer.terms && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      <strong>Terms:</strong> {offer.terms}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(offer)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(offer.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingOffer ? 'Edit Offer' : 'Create New Offer'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="card_type">Card Type</Label>
              <select
                id="card_type"
                value={formData.card_type}
                onChange={(e) => setFormData({ ...formData, card_type: e.target.value })}
                className="w-full mt-1 border rounded px-3 py-2"
              >
                <option>HDFC</option>
                <option>ICICI</option>
                <option>Axis</option>
                <option>IndusInd</option>
                <option>SBI</option>
                <option>Kotak</option>
                <option>YES Bank</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_type">Discount Type</Label>
                <select
                  id="discount_type"
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  className="w-full mt-1 border rounded px-3 py-2"
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat Amount</option>
                </select>
              </div>

              <div>
                <Label htmlFor="discount_value">Discount Value</Label>
                <Input
                  id="discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                  placeholder={formData.discount_type === 'percentage' ? '10' : '500'}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_amount">Min Purchase Amount</Label>
                <Input
                  id="min_amount"
                  type="number"
                  value={formData.min_amount}
                  onChange={(e) => setFormData({ ...formData, min_amount: Number(e.target.value) })}
                  placeholder="1000"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="max_discount">Max Discount Amount</Label>
                <Input
                  id="max_discount"
                  type="number"
                  value={formData.max_discount_amount}
                  onChange={(e) => setFormData({ ...formData, max_discount_amount: Number(e.target.value) })}
                  placeholder="500"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                placeholder="Enter terms..."
                className="w-full mt-1 border rounded px-3 py-2 h-20"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingOffer ? 'Update' : 'Create'} Offer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
