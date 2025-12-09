import { supabase } from './supabase';

export interface DeliveryPerson {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  vehicle_type: string | null;
  vehicle_number: string | null;
  is_active: boolean;
  is_available: boolean;
  current_latitude: number | null;
  current_longitude: number | null;
  last_location_update: string | null;
  total_deliveries: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export { supabase };

export interface Delivery {
  id: string;
  order_id: string;
  delivery_person_id: string | null;
  qr_code: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
  assigned_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  delivery_notes: string | null;
  customer_signature: string | null;
  delivery_proof_image: string | null;
  estimated_delivery_time: string | null;
  actual_delivery_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryLocationTracking {
  id: string;
  delivery_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  bearing: number | null;
  battery_level: number | null;
  created_at: string;
}

export const deliveryService = {
  // ==================== DELIVERY PERSON MANAGEMENT ====================
  
  async getDeliveryPersonProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('delivery_persons')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as DeliveryPerson | null;
  },

  async updateDeliveryPersonProfile(updates: Partial<DeliveryPerson>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('delivery_persons')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as DeliveryPerson;
  },

  async toggleAvailability(isAvailable: boolean) {
    return this.updateDeliveryPersonProfile({ is_available: isAvailable });
  },

  // ==================== DELIVERY MANAGEMENT ====================

  async getAssignedDeliveries() {
    const profile = await this.getDeliveryPersonProfile();
    if (!profile) throw new Error('Not a delivery person');

    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        order:orders(
          id,
          total_amount,
          user_id,
          shipping_address_id,
          created_at,
          shipping_address:addresses(*)
        )
      `)
      .eq('delivery_person_id', profile.id)
      .in('status', ['assigned', 'picked_up', 'in_transit'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getDeliveryByQR(qrCode: string) {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        order:orders(
          id,
          total_amount,
          user_id,
          shipping_address_id,
          created_at,
          shipping_address:addresses(*),
          items:order_items(
            id,
            quantity,
            price,
            product:products(*)
          )
        )
      `)
      .eq('qr_code', qrCode)
      .single();

    if (error) throw error;
    return data;
  },

  async updateDeliveryStatus(
    deliveryId: string,
    status: Delivery['status'],
    additionalData?: {
      deliveryNotes?: string;
      customerSignature?: string;
      deliveryProofImage?: string;
    }
  ) {
    const updates: any = { status };

    if (status === 'picked_up') {
      updates.picked_up_at = new Date().toISOString();
    } else if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString();
      updates.actual_delivery_time = new Date().toISOString();
    }

    if (additionalData) {
      if (additionalData.deliveryNotes) updates.delivery_notes = additionalData.deliveryNotes;
      if (additionalData.customerSignature) updates.customer_signature = additionalData.customerSignature;
      if (additionalData.deliveryProofImage) updates.delivery_proof_image = additionalData.deliveryProofImage;
    }

    const { data, error } = await supabase
      .from('deliveries')
      .update(updates)
      .eq('id', deliveryId)
      .select()
      .single();

    if (error) throw error;
    return data as Delivery;
  },

  // ==================== LOCATION TRACKING ====================

  async trackLocation(
    deliveryId: string,
    location: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      speed?: number;
      bearing?: number;
      batteryLevel?: number;
    }
  ) {
    const { data, error } = await supabase
      .from('delivery_location_tracking')
      .insert([{
        delivery_id: deliveryId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        speed: location.speed,
        bearing: location.bearing,
        battery_level: location.batteryLevel,
      }])
      .select()
      .single();

    if (error) throw error;
    return data as DeliveryLocationTracking;
  },

  async getDeliveryLocations(deliveryId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('delivery_location_tracking')
      .select('*')
      .eq('delivery_id', deliveryId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as DeliveryLocationTracking[];
  },

  async getLatestDeliveryLocation(deliveryId: string) {
    const { data, error } = await supabase
      .from('delivery_location_tracking')
      .select('*')
      .eq('delivery_id', deliveryId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as DeliveryLocationTracking | null;
  },

  // Subscribe to location updates
  subscribeToDeliveryLocation(deliveryId: string, callback: (location: DeliveryLocationTracking) => void) {
    return supabase
      .channel(`delivery_location:${deliveryId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_location_tracking',
          filter: `delivery_id=eq.${deliveryId}`,
        },
        (payload) => {
          callback(payload.new as DeliveryLocationTracking);
        }
      )
      .subscribe();
  },

  // ==================== QR CODE GENERATION ====================

  generateQRCode(orderId: string): string {
    // Generate unique QR code
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `DEL-${orderId.substring(0, 8)}-${timestamp}-${random}`.toUpperCase();
  },

  async createDelivery(orderId: string, estimatedTime?: Date) {
    const qrCode = this.generateQRCode(orderId);

    const { data, error } = await supabase
      .from('deliveries')
      .insert([{
        order_id: orderId,
        qr_code: qrCode,
        status: 'pending',
        estimated_delivery_time: estimatedTime?.toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Delivery;
  },

  async assignDelivery(deliveryId: string, deliveryPersonId: string) {
    const { data, error } = await supabase
      .from('deliveries')
      .update({
        delivery_person_id: deliveryPersonId,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      })
      .eq('id', deliveryId)
      .select()
      .single();

    if (error) throw error;
    return data as Delivery;
  },

  // ==================== CUSTOMER TRACKING ====================

  async getCustomerDeliveryTracking(orderId: string) {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        delivery_person:delivery_persons(
          full_name,
          phone,
          vehicle_type,
          vehicle_number,
          current_latitude,
          current_longitude,
          last_location_update,
          rating
        ),
        latest_location:delivery_location_tracking(
          latitude,
          longitude,
          created_at
        )
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // ==================== ADMIN FUNCTIONS ====================

  async getAllDeliveryPersons() {
    const { data, error } = await supabase
      .from('delivery_persons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as DeliveryPerson[];
  },

  async getAvailableDeliveryPersons() {
    const { data, error } = await supabase
      .from('delivery_persons')
      .select('*')
      .eq('is_active', true)
      .eq('is_available', true)
      .order('total_deliveries', { ascending: true }); // Assign to person with fewer deliveries

    if (error) throw error;
    return data as DeliveryPerson[];
  },

  async createDeliveryPerson(userId: string, data: {
    full_name: string;
    phone: string;
    vehicle_type?: string;
    vehicle_number?: string;
  }) {
    const { data: person, error } = await supabase
      .from('delivery_persons')
      .insert([{
        user_id: userId,
        ...data,
      }])
      .select()
      .single();

    if (error) throw error;
    return person as DeliveryPerson;
  },

  // ==================== GEOLOCATION HELPERS ====================

  async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    });
  },

  watchPosition(callback: (position: GeolocationPosition) => void, errorCallback?: (error: GeolocationPositionError) => void) {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    return navigator.geolocation.watchPosition(callback, errorCallback, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  },

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula to calculate distance in km
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
};
