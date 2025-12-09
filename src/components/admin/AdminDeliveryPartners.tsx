import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { deliveryService, supabase } from '../../lib/deliveryService';
import { CreateDeliveryPartnerDialog } from './CreateDeliveryPartnerDialog';
import { User, Phone, Truck, MapPin, Star, Clock, Package, UserPlus, Copy, CheckCircle } from 'lucide-react';

export const AdminDeliveryPartners: React.FC = () => {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const signupUrl = `${window.location.origin}/delivery-signup`;

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const data = await deliveryService.getAllDeliveryPersons();
      setPartners(data);
    } catch (error) {
      console.error('Failed to load partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePartnerStatus = async (partnerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('delivery_persons')
        .update({ is_active: !currentStatus })
        .eq('id', partnerId);

      if (error) throw error;
      await loadPartners();
    } catch (error) {
      console.error('Failed to update partner status:', error);
    }
  };

  const filteredPartners = partners.filter(partner => 
    partner.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.phone.includes(searchQuery) ||
    partner.vehicle_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copySignupUrl = () => {
    navigator.clipboard.writeText(signupUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Delivery Partners</h2>
          <p className="text-muted-foreground">Manage delivery personnel</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copySignupUrl}>
            {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Signup Link'}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Partner
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partners.filter(p => p.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partners.filter(p => p.is_available && p.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partners.reduce((sum, p) => sum + p.total_deliveries, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partners.length > 0 
                ? (partners.reduce((sum, p) => sum + p.rating, 0) / partners.length).toFixed(1)
                : '0.0'
              } ⭐
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder="Search by name, phone, or vehicle number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Partners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12">Loading...</div>
        ) : filteredPartners.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {partners.length === 0 
                ? 'No delivery partners yet.'
                : 'No partners found matching your search.'
              }
            </p>
            {partners.length === 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Share signup link:</p>
                <div className="flex items-center gap-2 max-w-md mx-auto">
                  <Input value={signupUrl} readOnly className="text-xs" />
                  <Button size="sm" onClick={copySignupUrl}>
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Or create manually above</p>
              </div>
            )}
          </div>
        ) : (
          filteredPartners.map((partner) => (
            <Card key={partner.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{partner.full_name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {partner.rating.toFixed(1)} Rating
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge variant={partner.is_active ? 'default' : 'secondary'}>
                      {partner.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {partner.is_available && partner.is_active && (
                      <Badge variant="outline" className="text-green-600">
                        Available
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {partner.phone}
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Truck className="w-4 h-4" />
                    {partner.vehicle_type}
                    {partner.vehicle_number && (
                      <span className="font-mono">({partner.vehicle_number})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="w-4 h-4" />
                    {partner.total_deliveries} deliveries
                  </div>

                  {partner.last_location_update && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      Last seen: {new Date(partner.last_location_update).toLocaleString()}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Joined: {new Date(partner.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <Label htmlFor={`status-${partner.id}`} className="text-sm">
                    {partner.is_active ? 'Deactivate' : 'Activate'}
                  </Label>
                  <Switch
                    id={`status-${partner.id}`}
                    checked={partner.is_active}
                    onCheckedChange={() => togglePartnerStatus(partner.id, partner.is_active)}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Partner Dialog */}
      <CreateDeliveryPartnerDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadPartners}
      />
    </div>
  );
};
