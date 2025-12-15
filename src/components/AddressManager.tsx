import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, Home, Briefcase, Navigation, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { addressService } from '../lib/addressService';
import type { Address } from '../lib/supabase';

export function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [formData, setFormData] = useState({
    label: 'Home',
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    latitude: null as number | null,
    longitude: null as number | null,
    is_default: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getUserAddresses();
      setAddresses(data);
    } catch (error) {
      console.error('Failed to load addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAddress(null);
    setFormData({
      label: 'Home',
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India',
      latitude: null,
      longitude: null,
      is_default: addresses.length === 0, // First address is default
    });
    setShowDialog(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      latitude: address.latitude,
      longitude: address.longitude,
      is_default: address.is_default,
    });
    setShowDialog(true);
  };

  const handleFetchCurrentLocation = async () => {
    setFetchingLocation(true);
    try {
      const coords = await addressService.getCurrentLocation();
      if (!coords) {
        alert('Unable to get current location. Please enable location services.');
        return;
      }

      // Reverse geocode to get address details
      const addressData = await addressService.reverseGeocode(coords.latitude, coords.longitude);
      
      if (addressData) {
        setFormData(prev => ({
          ...prev,
          address_line1: addressData.road || addressData.suburb || '',
          city: addressData.city || addressData.town || addressData.village || '',
          state: addressData.state || '',
          postal_code: addressData.postcode || '',
          country: addressData.country || 'India',
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));
      } else {
        // Just set coordinates
        setFormData(prev => ({
          ...prev,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));
        alert('Location detected! Please fill in the address details manually.');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      alert('Failed to fetch location');
    } finally {
      setFetchingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.phone || !formData.address_line1 || !formData.city || !formData.state || !formData.postal_code) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Try to geocode if we don't have coordinates (optional, won't block saving)
      if (!formData.latitude || !formData.longitude) {
        try {
          const fullAddress = `${formData.address_line1}, ${formData.city}, ${formData.state}, ${formData.postal_code}, ${formData.country}`;
          const coords = await addressService.geocodeAddress(fullAddress);
          if (coords) {
            formData.latitude = coords.latitude;
            formData.longitude = coords.longitude;
          }
        } catch (geocodeError) {
          // Geocoding failed, but continue saving address without coordinates
          console.warn('Geocoding failed, saving address without coordinates:', geocodeError);
        }
      }

      if (editingAddress) {
        await addressService.updateAddress(editingAddress.id, formData);
      } else {
        await addressService.createAddress(formData);
      }

      setShowDialog(false);
      loadAddresses();
    } catch (error: any) {
      console.error('Failed to save address:', error);
      
      // Provide helpful error messages
      if (error.message?.includes('label')) {
        alert('Database error: The addresses table is not set up correctly. Please run the create_addresses_table.sql migration in Supabase.');
      } else if (error.code === 'PGRST204') {
        alert('Database error: The addresses table schema is outdated. Please run the latest migration in Supabase.');
      } else {
        alert(`Failed to save address: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await addressService.deleteAddress(id);
      loadAddresses();
    } catch (error) {
      console.error('Failed to delete address:', error);
      alert('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefaultAddress(id);
      loadAddresses();
    } catch (error) {
      console.error('Failed to set default address:', error);
      alert('Failed to set default address');
    }
  };

  const getLabelIcon = (label: string) => {
    if (!label) return <MapPin className="w-4 h-4" />;
    
    switch (label.toLowerCase()) {
      case 'home':
        return <Home className="w-4 h-4" />;
      case 'office':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Saved Addresses</h2>
          <p className="text-sm text-gray-600">Manage your delivery addresses</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
          <p className="text-gray-600 mb-4">Add your first delivery address</p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address.id} className="p-4 relative">
              {address.is_default && (
                <Badge className="absolute top-4 right-4 bg-green-500">Default</Badge>
              )}
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  {getLabelIcon(address.label)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{address.label}</h3>
                  <p className="text-sm text-gray-600">{address.full_name}</p>
                  <p className="text-sm text-gray-600">{address.phone}</p>
                </div>
              </div>
              <div className="text-sm text-gray-700 mb-4">
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>{address.city}, {address.state} {address.postal_code}</p>
                <p>{address.country}</p>
              </div>
              <div className="flex gap-2">
                {!address.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                    className="flex-1"
                  >
                    Set as Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(address)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(address.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl p-0 gap-0 max-h-[90vh]">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto px-6 py-4 space-y-4" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            <div>
              <Label htmlFor="label">Address Label *</Label>
              <select
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-sm text-blue-900">Use Current Location</p>
                  <p className="text-xs text-blue-700">Auto-fill address from GPS</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFetchCurrentLocation}
                disabled={fetchingLocation}
              >
                {fetchingLocation ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Detect
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address_line1">Address Line 1 *</Label>
              <Input
                id="address_line1"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                placeholder="House no., Street name"
              />
            </div>

            <div>
              <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
              <Input
                id="address_line2"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                placeholder="Apartment, Suite, Building"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Mumbai"
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Maharashtra"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postal_code">Postal Code *</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  placeholder="400001"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="India"
                />
              </div>
            </div>

            {(formData.latitude && formData.longitude) && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-900">
                  <span className="font-semibold">📍 Location coordinates saved: </span>
                  {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="is_default" className="cursor-pointer">
                Set as default address
              </Label>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingAddress ? 'Update Address' : 'Save Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
