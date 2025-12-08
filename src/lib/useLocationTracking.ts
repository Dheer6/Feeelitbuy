import { useEffect, useCallback } from 'react';

export function useLocationTracking(userId: string | null) {
  const updateUserLocation = useCallback(async (latitude: number, longitude: number) => {
    if (!userId) return;
    
    try {
      const { supabase } = await import('../lib/supabase');
      
      // Update current location and add to history (simplified approach)
      const historicalData = {
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      };

      // Update current location GEOGRAPHY point
      await supabase
        .from('profiles')
        .update({
          current_location: `POINT(${longitude} ${latitude})`,
          location_history: [historicalData], // Store as JSON array
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch (err) {
      console.error('Failed to update location:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Get current location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateUserLocation(latitude, longitude);
        },
        (error) => {
          console.log('Geolocation error:', error.message);
        }
      );

      // Watch location changes
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateUserLocation(latitude, longitude);
        },
        (error) => {
          console.log('Geolocation watch error:', error.message);
        },
        {
          enableHighAccuracy: false,
          maximumAge: 300000, // 5 minutes
          timeout: 10000,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [userId, updateUserLocation]);
}
