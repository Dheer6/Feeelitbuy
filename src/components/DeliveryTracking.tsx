import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { deliveryService } from '../lib/deliveryService';
import { MapPin, Phone, Clock, Package, Navigation, Star } from 'lucide-react';

interface DeliveryTrackingProps {
  orderId: string;
}

export const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({ orderId }) => {
  const [delivery, setDelivery] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDeliveryTracking();
    const interval = setInterval(loadDeliveryTracking, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    if (!delivery?.id) return;

    // Subscribe to real-time location updates
    const subscription = deliveryService.subscribeToDeliveryLocation(
      delivery.id,
      (location) => {
        setLocations((prev) => [location, ...prev].slice(0, 50));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [delivery?.id]);

  const loadDeliveryTracking = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await deliveryService.getCustomerDeliveryTracking(orderId);
      setDelivery(data);

      if (data?.id) {
        const locationData = await deliveryService.getDeliveryLocations(data.id, 50);
        setLocations(locationData);
      }
    } catch (err: any) {
      console.error('Failed to load delivery tracking:', err);
      setError(err.message || 'Failed to load delivery tracking');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'assigned': return 'bg-blue-500';
      case 'picked_up': return 'bg-yellow-500';
      case 'in_transit': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusTimeline = () => {
    const statuses = [
      { key: 'pending', label: 'Order Placed', time: delivery?.created_at },
      { key: 'assigned', label: 'Assigned to Delivery Person', time: delivery?.assigned_at },
      { key: 'picked_up', label: 'Picked Up', time: delivery?.picked_up_at },
      { key: 'in_transit', label: 'Out for Delivery', time: null },
      { key: 'delivered', label: 'Delivered', time: delivery?.delivered_at },
    ];

    const currentIndex = statuses.findIndex(s => s.key === delivery?.status);

    return statuses.map((status, index) => ({
      ...status,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  const calculateETA = () => {
    if (!delivery?.delivery_person || !delivery?.estimated_delivery_time) return null;

    const eta = new Date(delivery.estimated_delivery_time);
    const now = new Date();
    const diff = eta.getTime() - now.getTime();

    if (diff < 0) return 'Delayed';

    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  if (loading && !delivery) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading delivery information...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !delivery) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {error || 'Delivery information not available for this order'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Delivery Status</CardTitle>
              <CardDescription>Track your order delivery</CardDescription>
            </div>
            <Badge className={getStatusColor(delivery.status)}>
              {delivery.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Timeline */}
          <div className="space-y-4">
            {getStatusTimeline().map((status, index) => (
              <div key={status.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      status.completed
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {status.completed ? '✓' : index + 1}
                  </div>
                  {index < getStatusTimeline().length - 1 && (
                    <div
                      className={`w-0.5 h-12 ${
                        status.completed ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className={`font-medium ${status.active ? 'text-primary' : ''}`}>
                    {status.label}
                  </div>
                  {status.time && (
                    <div className="text-sm text-muted-foreground">
                      {new Date(status.time).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Person Card */}
      {delivery.delivery_person && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Person</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{delivery.delivery_person.full_name}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {delivery.delivery_person.rating.toFixed(1)} Rating
                </div>
              </div>
              {delivery.delivery_person.phone && (
                <a
                  href={`tel:${delivery.delivery_person.phone}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </a>
              )}
            </div>

            {delivery.delivery_person.vehicle_type && (
              <div className="text-sm">
                <span className="text-muted-foreground">Vehicle: </span>
                <span className="font-medium">{delivery.delivery_person.vehicle_type}</span>
                {delivery.delivery_person.vehicle_number && (
                  <span className="text-muted-foreground ml-2">
                    ({delivery.delivery_person.vehicle_number})
                  </span>
                )}
              </div>
            )}

            {delivery.status === 'in_transit' && calculateETA() && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm font-medium">Estimated Arrival</div>
                  <div className="text-lg font-bold text-primary">{calculateETA()}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live Location Map */}
      {delivery.status === 'in_transit' && locations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Live Tracking
            </CardTitle>
            <CardDescription>
              Last updated: {new Date(locations[0]?.created_at).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
              {/* Simple map placeholder - integrate with Google Maps/Mapbox in production */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Delivery person is on the way
                  </p>
                  {locations[0] && (
                    <div className="mt-2 space-y-1 text-xs">
                      <div>Lat: {locations[0].latitude.toFixed(6)}</div>
                      <div>Lng: {locations[0].longitude.toFixed(6)}</div>
                      {locations[0].speed && (
                        <div>Speed: {(locations[0].speed * 3.6).toFixed(1)} km/h</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* In production, add actual map here */}
              {/* Example: Google Maps, Mapbox, or Leaflet integration */}
            </div>
            
            <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Navigation className="w-4 h-4" />
                <span>
                  {locations.length} location update{locations.length !== 1 ? 's' : ''} received
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Notes */}
      {delivery.delivery_notes && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{delivery.delivery_notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
