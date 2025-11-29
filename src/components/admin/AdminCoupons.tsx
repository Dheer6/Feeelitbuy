import { useEffect, useState } from 'react';
import { couponService } from '../../lib/supabaseEnhanced';
import type { Coupon } from '../../lib/supabase';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

interface EditableCoupon extends Partial<Coupon> {
  isNew?: boolean;
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<EditableCoupon>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_purchase_amount: 0,
    max_discount_amount: null,
    usage_limit: null,
    valid_from: new Date().toISOString(),
    valid_until: null,
    is_active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<EditableCoupon | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await couponService.getAllCoupons();
      setCoupons(rows);
    } catch (e: any) {
      setError(e.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const resetCreate = () => {
    setCreating({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_purchase_amount: 0,
      max_discount_amount: null,
      usage_limit: null,
      valid_from: new Date().toISOString(),
      valid_until: null,
      is_active: true,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creating.code) return alert('Coupon code required');
    setSavingCreate(true);
    try {
      const created = await couponService.createCoupon({
        code: creating.code.toUpperCase(),
        description: creating.description || null,
        discount_type: creating.discount_type as Coupon['discount_type'],
        discount_value: Number(creating.discount_value),
        min_purchase_amount: Number(creating.min_purchase_amount || 0),
        max_discount_amount: creating.max_discount_amount ? Number(creating.max_discount_amount) : null,
        usage_limit: creating.usage_limit ? Number(creating.usage_limit) : null,
        valid_from: creating.valid_from || new Date().toISOString(),
        valid_until: creating.valid_until || null,
        is_active: !!creating.is_active,
        applicable_categories: null,
        applicable_products: null,
      } as any);
      setCoupons([created, ...coupons]);
      resetCreate();
    } catch (e: any) {
      alert(e.message || 'Failed to create coupon');
    } finally {
      setSavingCreate(false);
    }
  };

  const beginEdit = (c: Coupon) => {
    setEditingId(c.id);
    setEditingData({ ...c });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editingData) return;
    setSavingEdit(true);
    try {
      const updated = await couponService.updateCoupon(editingId, {
        description: editingData.description || null,
        discount_type: editingData.discount_type as Coupon['discount_type'],
        discount_value: Number(editingData.discount_value),
        min_purchase_amount: Number(editingData.min_purchase_amount || 0),
        max_discount_amount: editingData.max_discount_amount ? Number(editingData.max_discount_amount) : null,
        usage_limit: editingData.usage_limit ? Number(editingData.usage_limit) : null,
        valid_from: editingData.valid_from || new Date().toISOString(),
        valid_until: editingData.valid_until || null,
        is_active: !!editingData.is_active,
      } as any);
      setCoupons((prev) => prev.map(c => c.id === updated.id ? updated : c));
      cancelEdit();
    } catch (e: any) {
      alert(e.message || 'Failed to update coupon');
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await couponService.deleteCoupon(id);
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (e: any) {
      alert(e.message || 'Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="mb-4">Create Coupon</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="code">Code</Label>
            <Input id="code" value={creating.code} onChange={(e) => setCreating({ ...creating, code: e.target.value })} placeholder="SAVE10" required />
          </div>
          <div>
            <Label htmlFor="discount_type">Type</Label>
            <select id="discount_type" className="w-full border rounded h-10 px-2" value={creating.discount_type} onChange={(e) => setCreating({ ...creating, discount_type: e.target.value as any })}>
              <option value="percentage">Percentage</option>
              <option value="fixed_amount">Fixed Amount</option>
            </select>
          </div>
          <div>
            <Label htmlFor="discount_value">Value</Label>
            <Input id="discount_value" type="number" value={creating.discount_value} onChange={(e) => setCreating({ ...creating, discount_value: Number(e.target.value) })} required />
          </div>
          <div>
            <Label htmlFor="min_purchase_amount">Min Purchase</Label>
            <Input id="min_purchase_amount" type="number" value={creating.min_purchase_amount} onChange={(e) => setCreating({ ...creating, min_purchase_amount: Number(e.target.value) })} />
          </div>
            <div>
              <Label htmlFor="max_discount_amount">Max Discount (optional)</Label>
              <Input id="max_discount_amount" type="number" value={creating.max_discount_amount ?? ''} onChange={(e) => setCreating({ ...creating, max_discount_amount: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div>
              <Label htmlFor="usage_limit">Usage Limit (optional)</Label>
              <Input id="usage_limit" type="number" value={creating.usage_limit ?? ''} onChange={(e) => setCreating({ ...creating, usage_limit: e.target.value ? Number(e.target.value) : null })} />
            </div>
          <div>
            <Label htmlFor="valid_from">Valid From</Label>
            <Input id="valid_from" type="datetime-local" value={creating.valid_from?.slice(0,16)} onChange={(e) => setCreating({ ...creating, valid_from: new Date(e.target.value).toISOString() })} />
          </div>
          <div>
            <Label htmlFor="valid_until">Valid Until (optional)</Label>
            <Input id="valid_until" type="datetime-local" value={creating.valid_until ? creating.valid_until.slice(0,16) : ''} onChange={(e) => setCreating({ ...creating, valid_until: e.target.value ? new Date(e.target.value).toISOString() : null })} />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Checkbox id="is_active" checked={!!creating.is_active} onCheckedChange={(checked) => setCreating({ ...creating, is_active: !!checked })} />
            <Label htmlFor="is_active">Active</Label>
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={creating.description || ''} onChange={(e) => setCreating({ ...creating, description: e.target.value })} placeholder="Short description" />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" disabled={savingCreate}>{savingCreate ? 'Creating...' : 'Create Coupon'}</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4">All Coupons</h2>
        {loading && <p>Loading coupons...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && coupons.length === 0 && <p className="text-gray-600">No coupons found.</p>}
        <div className="space-y-4">
          {coupons.map(c => (
            <div key={c.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {editingId === c.id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label>Type</Label>
                    <select className="w-full border rounded h-10 px-2" value={editingData?.discount_type} onChange={(e) => setEditingData(d => ({ ...d!, discount_type: e.target.value as any }))}>
                      <option value="percentage">Percentage</option>
                      <option value="fixed_amount">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <Label>Value</Label>
                    <Input type="number" value={editingData?.discount_value ?? ''} onChange={(e) => setEditingData(d => ({ ...d!, discount_value: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <Label>Min Purchase</Label>
                    <Input type="number" value={editingData?.min_purchase_amount ?? ''} onChange={(e) => setEditingData(d => ({ ...d!, min_purchase_amount: Number(e.target.value) }))} />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <Checkbox checked={!!editingData?.is_active} onCheckedChange={(checked) => setEditingData(d => ({ ...d!, is_active: !!checked }))} />
                    <span className="text-sm">Active</span>
                  </div>
                  <div className="md:col-span-4">
                    <Label>Description</Label>
                    <Input value={editingData?.description || ''} onChange={(e) => setEditingData(d => ({ ...d!, description: e.target.value }))} />
                  </div>
                  <div className="flex gap-2 md:col-span-4 justify-end">
                    <Button variant="outline" type="button" onClick={cancelEdit}>Cancel</Button>
                    <Button type="button" onClick={saveEdit} disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save'}</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="font-semibold">{c.code}</p>
                    <p className="text-sm text-gray-600">{c.description || 'No description'}</p>
                    <p className="text-xs mt-1">
                      {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`} off
                      {c.min_purchase_amount ? ` • Min ₹${c.min_purchase_amount}` : ''}
                      {c.is_active ? ' • Active' : ' • Inactive'}
                      {c.usage_limit ? ` • ${c.usage_count}/${c.usage_limit} used` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => beginEdit(c)}>Edit</Button>
                    <Button variant="destructive" onClick={() => deleteCoupon(c.id)}>Delete</Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default AdminCoupons;