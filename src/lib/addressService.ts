import { supabase } from './supabase';
import type { Address } from './supabase';

export const addressService = {
  // Get all addresses for current user
  async getUserAddresses() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Address[];
  },

  // Get default address
  async getDefaultAddress() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Address | null;
  },

  // Get single address by ID
  async getAddress(id: string) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Address;
  },

  // Create new address
  async createAddress(address: Omit<Address, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('addresses')
      .insert([{
        ...address,
        user_id: user.id,
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Address;
  },

  // Update address
  async updateAddress(id: string, updates: Partial<Omit<Address, 'id' | 'user_id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Address;
  },

  // Delete address
  async deleteAddress(id: string) {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Set address as default
  async setDefaultAddress(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // The trigger will handle unsetting other defaults
    const { data, error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Address;
  },

  // Geocode address to get coordinates
  async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      // Note: Add User-Agent and referer to comply with usage policy
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'FeelItBuy-App/1.0',
            'Referer': window.location.origin
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding failed:', error);
      // Return null instead of throwing, making geocoding optional
      return null;
    }
  },

  // Get current location coordinates
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve(null);
        }
      );
    });
  },

  // Reverse geocode coordinates to address
  async reverseGeocode(latitude: number, longitude: number): Promise<any> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      return data.address || null;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  },
};
