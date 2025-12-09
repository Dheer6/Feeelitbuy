import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { deliveryService } from '../lib/deliveryService';
import { QRCodeScanner } from './QRCodeScanner';
import { Package, MapPin, Phone, Clock, CheckCircle, AlertCircle, Navigation, Battery, ListChecks } from 'lucide-react';
import { formatINR } from '../lib/currency';

export const DeliveryDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [battery, setBattery] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('active');
  const watchIdRef = useRef<number | null>(null);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadProfile();
    loadDeliveries();
    getBatteryLevel();
  }, []);

  useEffect(() => {
    if (isTracking && selectedDelivery) {
      startLocationTracking(selectedDelivery.id);
    } else {
      stopLocationTracking();
    }

    return () => stopLocationTracking();
  }, [isTracking, selectedDelivery]);

  const loadProfile = async () => {
    try {
      const data = await deliveryService.getDeliveryPersonProfile();
      setProfile(data);
      setIsAvailable(data?.is_available || false);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadDeliveries = async () => {
    try {
      const data = await deliveryService.getAssignedDeliveries();
      setDeliveries(data || []);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    }
  };

  const getBatteryLevel = async () => {
    if ('getBattery' in navigator) {
      try {
        const battery: any = await (navigator as any).getBattery();
        setBattery(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBattery(Math.round(battery.level * 100));
        });
      } catch (error) {
        console.error('Battery API not available');
      }
    }
  };

  const startLocationTracking = async (deliveryId: string) => {
    try {
      const watchId = deliveryService.watchPosition(
        async (position) => {
          try {
            await deliveryService.trackLocation(deliveryId, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed || undefined,
              bearing: position.coords.heading || undefined,
              batteryLevel: battery || undefined,
            });
          } catch (error) {
            console.error('Failed to track location:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsTracking(false);
        }
      );
      watchIdRef.current = watchId;
    } catch (error) {
      console.error('Failed to start tracking:', error);
      setIsTracking(false);
    }
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await deliveryService.toggleAvailability(!isAvailable);
      setIsAvailable(!isAvailable);
    } catch (error) {
      console.error('Failed to update availability:', error);
    }
  };

  const handleQRScan = async (qrCode: string) => {
    try {
      setLoading(true);
      const delivery = await deliveryService.getDeliveryByQR(qrCode);
      
      if (delivery.delivery_person_id !== profile?.id) {
        alert('This delivery is not assigned to you');
        return;
      }

      setSelectedDelivery(delivery);
      setShowScanner(false);
    } catch (error) {
      console.error('Failed to scan QR code:', error);
      alert('Invalid QR code or delivery not found');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedDelivery) return;

    try {
      setLoading(true);
      await deliveryService.updateDeliveryStatus(
        selectedDelivery.id,
        status as any,
        status === 'delivered' ? { deliveryNotes } : undefined
      );

      if (status === 'delivered') {
        setIsTracking(false);
      }

      await loadDeliveries();
      setSelectedDelivery(null);
      setDeliveryNotes('');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update delivery status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-500';
      case 'picked_up': return 'bg-yellow-500';
      case 'in_transit': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Delivery Dashboard</h1>
        <div className="flex items-center gap-4">
          {battery !== null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Battery className="w-4 h-4" />
              {battery}%
            </div>
          )}
          <div className="flex items-center gap-2">
            <Label htmlFor="availability">Available</Label>
            <Switch
              id="availability"
              checked={isAvailable}
              onCheckedChange={handleToggleAvailability}
            />
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.total_deliveries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.rating.toFixed(1)} ⭐</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveries.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {profile.vehicle_type || 'Not Set'}
              </div>
              {profile.vehicle_number && (
                <div className="text-sm text-muted-foreground">{profile.vehicle_number}</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button onClick={() => setShowScanner(true)} size="lg" className="w-full">
          <Package className="w-4 h-4 mr-2" />
          Scan Delivery QR
        </Button>
        <Button 
          onClick={() => loadDeliveries()} 
          variant="outline" 
          size="lg" 
          className="w-full"
        >
          <Clock className="w-4 h-4 mr-2" />
          Refresh Deliveries
        </Button>
        <Button 
          onClick={() => {
            const activeDelivery = deliveries.find(d => d.status === 'in_transit');
            if (activeDelivery) {
              setSelectedDelivery(activeDelivery);
              setIsTracking(true);
            }
          }} 
          variant="outline" 
          size="lg" 
          className="w-full"
          disabled={!deliveries.some(d => d.status === 'in_transit')}
        >
          <Navigation className="w-4 h-4 mr-2" />
          Start Tracking
        </Button>
      </div>

      {/* Deliveries Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            <ListChecks className="w-4 h-4 mr-2" />
            All ({deliveries.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Clock className="w-4 h-4 mr-2" />
            Pending ({deliveries.filter(d => d.status === 'pending' || d.status === 'assigned').length})
          </TabsTrigger>
          <TabsTrigger value="active">
            <Navigation className="w-4 h-4 mr-2" />
            Active ({deliveries.filter(d => d.status === 'picked_up' || d.status === 'in_transit').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="w-4 h-4 mr-2" />
            Completed ({deliveries.filter(d => d.status === 'delivered').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {filter === 'all' && 'All Deliveries'}
                {filter === 'pending' && 'Pending Deliveries'}
                {filter === 'active' && 'Active Deliveries'}
                {filter === 'completed' && 'Completed Deliveries'}
              </CardTitle>
              <CardDescription>
                {filter === 'all' && 'View all your deliveries'}
                {filter === 'pending' && 'Deliveries waiting to be picked up'}
                {filter === 'active' && 'Currently in progress'}
                {filter === 'completed' && 'Successfully delivered'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const filteredDeliveries = deliveries.filter(d => {
                  if (filter === 'all') return true;
                  if (filter === 'pending') return d.status === 'pending' || d.status === 'assigned';
                  if (filter === 'active') return d.status === 'picked_up' || d.status === 'in_transit';
                  if (filter === 'completed') return d.status === 'delivered';
                  return true;
                });

                if (filteredDeliveries.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      {filter === 'all' && 'No deliveries assigned. Toggle availability to receive new deliveries.'}
                      {filter === 'pending' && 'No pending deliveries.'}
                      {filter === 'active' && 'No active deliveries.'}
                      {filter === 'completed' && 'No completed deliveries yet.'}
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {filteredDeliveries.map((delivery) => (
                <Card key={delivery.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold mb-1">
                          Order #{delivery.order?.id.substring(0, 8)}
                        </div>
                        <Badge className={getStatusColor(delivery.status)}>
                          {delivery.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {formatINR(delivery.order?.total_amount || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(delivery.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {delivery.order?.shipping_address && (
                      <div className="flex items-start gap-2 mb-3 text-sm">
                        <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{delivery.order.shipping_address.label}</div>
                          <div className="text-muted-foreground">
                            {delivery.order.shipping_address.address_line1}
                            {delivery.order.shipping_address.address_line2 && (
                              <>, {delivery.order.shipping_address.address_line2}</>
                            )}
                          </div>
                          <div className="text-muted-foreground">
                            {delivery.order.shipping_address.city}, {delivery.order.shipping_address.state} {delivery.order.shipping_address.postal_code}
                          </div>
                        </div>
                      </div>
                    )}

                    {delivery.estimated_delivery_time && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Clock className="w-4 h-4" />
                        ETA: {new Date(delivery.estimated_delivery_time).toLocaleString()}
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {delivery.status === 'assigned' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedDelivery(delivery);
                            handleUpdateStatus('picked_up');
                          }}
                        >
                          Mark as Picked Up
                        </Button>
                      )}
                      {delivery.status === 'picked_up' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              handleUpdateStatus('in_transit');
                              setIsTracking(true);
                            }}
                          >
                            <Navigation className="w-4 h-4 mr-1" />
                            Start Delivery
                          </Button>
                        </>
                      )}
                      {delivery.status === 'in_transit' && (
                        <>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            Tracking Active
                          </Badge>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setSelectedDelivery(delivery);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark as Delivered
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        })()}
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>

      {/* QR Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Delivery QR Code</DialogTitle>
            <DialogDescription>
              Point your camera at the QR code on the delivery package
            </DialogDescription>
          </DialogHeader>
          <QRCodeScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
        </DialogContent>
      </Dialog>

      {/* Delivery Confirmation Dialog */}
      <Dialog open={!!selectedDelivery && selectedDelivery.status === 'in_transit'} onOpenChange={(open: boolean) => !open && setSelectedDelivery(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delivery</DialogTitle>
            <DialogDescription>
              Mark this delivery as completed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Delivery Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Any special notes about the delivery..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleUpdateStatus('delivered')}
                disabled={loading}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Delivery
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedDelivery(null)}
                disabled={loading}
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
