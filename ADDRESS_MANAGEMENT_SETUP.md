# Address Management Feature - Setup Guide

## Overview
Added comprehensive address management to user profiles with:
- Multiple saved addresses (Home, Office, Other)
- GPS location detection
- Address geocoding
- Default address selection
- Integration with checkout process

## Database Setup Required

### 1. Create Addresses Table

Run the SQL from `create_addresses_table.sql` in your Supabase SQL Editor:

```bash
# Go to Supabase Dashboard → SQL Editor → New Query
# Copy and run the SQL from create_addresses_table.sql
```

This creates:
- `addresses` table with all required fields
- Location coordinates support (latitude/longitude)
- Address labels (Home, Office, Other)
- Default address functionality
- RLS policies for user data security
- Automatic triggers for default address management

## Features Implemented

### 1. Address Manager Component (`AddressManager.tsx`)

**Features:**
- ✅ Add/Edit/Delete addresses
- ✅ Set default address
- ✅ Address labels (Home, Office, Other)
- ✅ GPS location detection
- ✅ Auto-fill address from current location
- ✅ Geocoding (convert address to coordinates)
- ✅ Reverse geocoding (convert coordinates to address)
- ✅ Clean card-based UI

**Location Detection:**
- Click "Detect" button to use GPS
- Automatically fills city, state, postal code
- Stores latitude/longitude for future use
- Falls back to manual entry if GPS fails

### 2. Address Service (`addressService.ts`)

**API Methods:**
```typescript
addressService.getUserAddresses()          // Get all user addresses
addressService.getDefaultAddress()         // Get default address
addressService.createAddress(data)         // Add new address
addressService.updateAddress(id, data)     // Update existing
addressService.deleteAddress(id)           // Delete address
addressService.setDefaultAddress(id)       // Set as default
addressService.getCurrentLocation()        // Get GPS coordinates
addressService.reverseGeocode(lat, lon)   // Coords → Address
addressService.geocodeAddress(address)     // Address → Coords
```

### 3. Updated User Profile

**New Tab Structure:**
- Orders Tab - View order history
- **Addresses Tab** - Manage delivery addresses

**Access:**
```
Profile → Addresses Tab → Add/Manage Addresses
```

## Database Schema

### Addresses Table
```sql
addresses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  label VARCHAR(50),              -- 'Home', 'Office', 'Other'
  full_name VARCHAR(255),
  phone VARCHAR(20),
  address_line1 TEXT,
  address_line2 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  latitude DECIMAL(10,8),         -- GPS coordinates
  longitude DECIMAL(11,8),        -- GPS coordinates
  is_default BOOLEAN,             -- Only one per user
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

## Usage in Checkout

### Integration Steps

1. **Import Service:**
```typescript
import { addressService } from '../lib/addressService';
```

2. **Load Addresses:**
```typescript
const [addresses, setAddresses] = useState<Address[]>([]);

useEffect(() => {
  loadAddresses();
}, []);

const loadAddresses = async () => {
  const data = await addressService.getUserAddresses();
  setAddresses(data);
};
```

3. **Use in Checkout:**
```typescript
const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

// Load default on mount
useEffect(() => {
  const loadDefault = async () => {
    const defaultAddr = await addressService.getDefaultAddress();
    setSelectedAddress(defaultAddr);
  };
  loadDefault();
}, []);

// In your checkout form
<select 
  value={selectedAddress?.id || ''} 
  onChange={(e) => {
    const addr = addresses.find(a => a.id === e.target.value);
    setSelectedAddress(addr);
  }}
>
  {addresses.map(addr => (
    <option key={addr.id} value={addr.id}>
      {addr.label} - {addr.address_line1}, {addr.city}
    </option>
  ))}
</select>
```

## Location Features

### GPS Detection
- Uses browser's Geolocation API
- Requires user permission
- Works on HTTPS sites
- Falls back to manual entry

### Geocoding
- Uses OpenStreetMap Nominatim API
- Free, no API key required
- Converts:
  - Address → Coordinates (geocoding)
  - Coordinates → Address (reverse geocoding)

### Privacy
- Location data stored securely
- RLS policies protect user data
- Optional feature (can skip GPS)

## UI Components

### Address Card Display
```
┌─────────────────────────────┐
│ 🏠 Home          [Default]  │
│ John Doe                    │
│ +91 98765 43210            │
│                             │
│ 123 Main Street            │
│ Apartment 4B               │
│ Mumbai, Maharashtra 400001 │
│ India                      │
│                             │
│ [Set Default] [Edit] [🗑️]  │
└─────────────────────────────┘
```

### Add/Edit Form
- Address label dropdown (Home/Office/Other)
- **Detect Location** button with GPS icon
- Full name and phone
- Address lines (1 & 2)
- City, State, Postal Code
- Country (default: India)
- Default address checkbox
- Coordinates display (when detected)

## Files Modified/Created

### New Files:
- `src/lib/addressService.ts` - Address CRUD operations
- `src/components/AddressManager.tsx` - Address management UI
- `create_addresses_table.sql` - Database migration

### Modified Files:
- `src/lib/supabase.ts` - Updated Address type
- `src/components/UserProfile.tsx` - Added Addresses tab

## Testing Checklist

- [ ] Create addresses table in Supabase
- [ ] Add first address (becomes default automatically)
- [ ] Test GPS location detection
- [ ] Add multiple addresses with different labels
- [ ] Set different address as default
- [ ] Edit existing address
- [ ] Delete address (not default)
- [ ] Verify only one default address exists
- [ ] Test address selection in checkout

## Next Steps

1. **Run Database Migration:**
   - Execute `create_addresses_table.sql` in Supabase

2. **Update Checkout Component:**
   - Import `addressService`
   - Add address selector
   - Use selected address for order

3. **Optional Enhancements:**
   - Add address validation
   - Integrate paid geocoding API for better accuracy
   - Add map preview of address
   - Support international addresses better

## Troubleshooting

### GPS Not Working
- Check HTTPS (required for geolocation)
- Verify browser permissions
- Test on different browser
- Use manual entry as fallback

### Geocoding Fails
- Check internet connection
- Verify address format
- Use manual coordinates entry
- Consider paid geocoding API

### Multiple Defaults
- Database trigger should prevent this
- If occurs, run:
  ```sql
  UPDATE addresses 
  SET is_default = FALSE 
  WHERE user_id = 'YOUR_USER_ID' 
  AND is_default = TRUE;
  
  UPDATE addresses 
  SET is_default = TRUE 
  WHERE id = 'DESIRED_DEFAULT_ID';
  ```

## API Limits

### OpenStreetMap Nominatim
- Free tier: No API key needed
- Rate limit: 1 request/second
- Attribution required (included in code)
- For production, consider:
  - Self-hosting Nominatim
  - Google Maps Geocoding API
  - Mapbox Geocoding API
