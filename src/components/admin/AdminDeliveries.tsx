import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { deliveryService, supabase } from '../../lib/deliveryService';
import { Package, User, MapPin, Phone, Star, QrCode, Truck, Clock } from 'lucide-react';
import { formatINR } from '../../lib/currency';
import { QRCodeSVG } from 'qrcode.react';

export const AdminDeliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadDeliveries();
    loadDeliveryPersons();
    autoCreateDeliveries();
  }, []);

  const autoCreateDeliveries = async () => {
    try {
      // Get all shipped orders that don't have deliveries yet
      const { data: ordersWithoutDeliveries } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          deliveries:deliveries(id)
        `)
        .in('status', ['shipped', 'processing']);

      if (!ordersWithoutDeliveries || ordersWithoutDeliveries.length === 0) return;

      // Filter orders that don't have deliveries
      const ordersNeedingDeliveries = ordersWithoutDeliveries.filter(
        (order: any) => !order.deliveries || order.deliveries.length === 0
      );

      if (ordersNeedingDeliveries.length === 0) return;

      // Create deliveries for all orders that need them
      for (const order of ordersNeedingDeliveries) {
        try {
          const estimatedTime = new Date();
          estimatedTime.setDate(estimatedTime.getDate() + 3);
          await deliveryService.createDelivery(order.id, estimatedTime);
        } catch (err) {
          console.error('Failed to create delivery for order:', order.id, err);
        }
      }

      // Reload deliveries after creating
      await loadDeliveries();
    } catch (error) {
      console.error('Auto-create deliveries failed:', error);
    }
  };

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          order:orders(
            id,
            total_amount,
            user_id,
            created_at,
            customer:profiles!orders_user_id_fkey(full_name, phone)
          ),
          delivery_person:delivery_persons(
            id,
            full_name,
            phone,
            vehicle_type,
            vehicle_number,
            is_available,
            rating
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveryPersons = async () => {
    try {
      const data = await deliveryService.getAllDeliveryPersons();
      setDeliveryPersons(data);
    } catch (error) {
      console.error('Failed to load delivery persons:', error);
    }
  };

  const handleAssignDelivery = async () => {
    if (!selectedDelivery || !selectedPersonId) return;

    try {
      setLoading(true);
      await deliveryService.assignDelivery(selectedDelivery.id, selectedPersonId);
      await loadDeliveries();
      setShowAssignDialog(false);
      setSelectedDelivery(null);
      setSelectedPersonId('');
    } catch (error) {
      console.error('Failed to assign delivery:', error);
      alert('Failed to assign delivery');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDeliveries = () => {
    if (filter === 'all') return deliveries;
    return deliveries.filter(d => d.status === filter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'assigned': return 'bg-blue-500';
      case 'picked_up': return 'bg-yellow-500';
      case 'in_transit': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-400';
      default: return 'bg-gray-500';
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `delivery-qr-${selectedDelivery?.id}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Delivery Management</h2>
          <p className="text-muted-foreground">Manage deliveries and delivery personnel</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deliveries.filter(d => d.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deliveries.filter(d => d.status === 'in_transit').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deliveries.filter(d => {
                if (d.status !== 'delivered' || !d.delivered_at) return false;
                const today = new Date().toDateString();
                return new Date(d.delivered_at).toDateString() === today;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'assigned', 'picked_up', 'in_transit', 'delivered'].map(status => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status.replace('_', ' ').toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deliveries</CardTitle>
          <CardDescription>All delivery orders</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : getFilteredDeliveries().length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deliveries found
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredDeliveries().map((delivery) => (
                <Card key={delivery.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">
                            Order #{delivery.order?.id.substring(0, 8)}
                          </span>
                          <Badge className={getStatusColor(delivery.status)}>
                            {delivery.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        {delivery.order?.customer && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <User className="w-3 h-3" />
                            {delivery.order.customer.full_name}
                            {delivery.order.customer.phone && (
                              <span className="ml-2">• {delivery.order.customer.phone}</span>
                            )}
                          </div>
                        )}

                        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3 mt-0.5" />
                          <div>
                            {delivery.order?.shipping_address ? 
                              JSON.stringify(delivery.order.shipping_address) : 
                              'No address provided'
                            }
                          </div>
                        </div>

                        {delivery.delivery_person && (
                          <div className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                            <Truck className="w-4 h-4" />
                            <span className="font-medium">{delivery.delivery_person.full_name}</span>
                            <span className="text-muted-foreground">
                              ({delivery.delivery_person.vehicle_type})
                            </span>
                            <div className="flex items-center gap-1 ml-2">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {delivery.delivery_person.rating.toFixed(1)}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-lg font-bold mb-1">
                          {formatINR(delivery.order?.total_amount || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(delivery.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {delivery.estimated_delivery_time && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Clock className="w-4 h-4" />
                        ETA: {new Date(delivery.estimated_delivery_time).toLocaleString()}
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setShowQRCode(true);
                        }}
                      >
                        <QrCode className="w-4 h-4 mr-1" />
                        View QR Code
                      </Button>

                      {delivery.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedDelivery(delivery);
                            setShowAssignDialog(true);
                          }}
                        >
                          Assign Delivery Person
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delivery QR Code</DialogTitle>
            <DialogDescription>
              Scan this code to mark the delivery as complete
            </DialogDescription>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-4">
              <div className="flex justify-center p-6 bg-white rounded-lg">
                <QRCodeSVG
                  id="qr-code-canvas"
                  value={selectedDelivery.qr_code}
                  size={256}
                  level="H"
                  includeMargin
                />
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">QR Code</div>
                <div className="font-mono text-lg font-semibold">{selectedDelivery.qr_code}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Order: </span>
                  <span className="font-medium">#{selectedDelivery.order?.id.substring(0, 8)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Status: </span>
                  <Badge className={getStatusColor(selectedDelivery.status)}>
                    {selectedDelivery.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              <Button onClick={downloadQRCode} className="w-full">
                Download QR Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Delivery Person Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Delivery Person</DialogTitle>
            <DialogDescription>
              Select a delivery person for this order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="delivery-person">Delivery Person</Label>
              <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                <SelectTrigger id="delivery-person">
                  <SelectValue placeholder="Select delivery person" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryPersons
                    .filter(p => p.is_active)
                    .map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        <div className="flex items-center gap-2">
                          <span>{person.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({person.vehicle_type})
                          </span>
                          {person.is_available && (
                            <Badge variant="outline" className="text-xs">Available</Badge>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{person.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAssignDelivery}
                disabled={!selectedPersonId || loading}
                className="flex-1"
              >
                Assign
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignDialog(false);
                  setSelectedDelivery(null);
                  setSelectedPersonId('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
