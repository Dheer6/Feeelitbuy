# Admin Panel Setup Guide

## New Admin Features Added

Three new management pages have been added to the admin panel:

1. **Categories Management** - Manage product categories
2. **Bank Offers Management** - Manage card and bank offers
3. **Referrals Management** - Track and manage customer referrals

## Database Setup Required

### 1. Card Offers Table (REQUIRED)

The `card_offers` table needs to be created in Supabase. Run the SQL from `create_card_offers_table.sql`:

```bash
# Option 1: Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of create_card_offers_table.sql
4. Run the SQL query
```

### 2. Verify Existing Tables

Ensure these tables exist:
- ✅ `categories` - Already exists
- ✅ `referrals` - Already created
- ⚠️ `card_offers` - **Needs to be created** (see step 1)

## Admin Panel Navigation

Access the new pages from the Admin Dashboard tabs:

```
Admin Dashboard → Categories (🗂️ icon)
Admin Dashboard → Bank Offers (💳 icon)
Admin Dashboard → Referrals (🎁 icon)
```

## Features Overview

### Categories Management
- **View all categories** with images
- **Add new categories** with name, description, and image URL
- **Edit existing categories** 
- **Delete categories** (if no products associated)
- Grid layout with image previews

### Bank Offers Management
- **Create bank/card offers** with:
  - Bank name and card type
  - Discount type (percentage or flat amount)
  - Minimum purchase amount
  - Maximum discount cap
  - Terms & conditions
  - Validity period
  - Active/inactive toggle
- **Edit offers** - Update any field
- **Toggle active status** - Quick enable/disable
- **Delete offers**
- View all offers with formatted discount display

### Referrals Management
- **View all referrals** with referrer/referee details
- **Statistics dashboard**:
  - Total referrals
  - Pending/completed/expired counts
  - Total rewards vs credited rewards
- **Filter by status** (pending/completed/expired)
- **Search** by code or email
- **Manual reward crediting** for completed referrals
- **Status management** - Mark as completed/expired
- Automatic wallet credit when rewarding

## Using the Components

### AdminCategories
```typescript
import { AdminCategories } from './components/admin/AdminCategories';

// In AdminDashboard.tsx
<TabsContent value="categories">
  <AdminCategories />
</TabsContent>
```

### AdminBankOffers
```typescript
import { AdminBankOffers } from './components/admin/AdminBankOffers';

// In AdminDashboard.tsx
<TabsContent value="bankoffers">
  <AdminBankOffers />
</TabsContent>
```

### AdminReferrals
```typescript
import { AdminReferrals } from './components/admin/AdminReferrals';

// In AdminDashboard.tsx
<TabsContent value="referrals">
  <AdminReferrals />
</TabsContent>
```

## Database Schema

### Categories Table (Existing)
```sql
categories (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ
)
```

### Card Offers Table (New - To Be Created)
```sql
card_offers (
  id UUID PRIMARY KEY,
  card_type VARCHAR(100) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  discount_type VARCHAR(20) CHECK (percentage/flat),
  discount_value DECIMAL(10,2) NOT NULL,
  min_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  terms TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Referrals Table (Existing)
```sql
referrals (
  id UUID PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users,
  referee_id UUID REFERENCES auth.users,
  referral_code VARCHAR(50) UNIQUE,
  status VARCHAR(20) CHECK (pending/completed/expired),
  reward_amount DECIMAL(10,2) DEFAULT 100.00,
  reward_credited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)
```

## Next Steps

1. **Create card_offers table** in Supabase (see create_card_offers_table.sql)
2. **Test the admin pages**:
   - Add a test category
   - Create a bank offer
   - Check referrals management
3. **Customize as needed**:
   - Adjust reward amounts in referrals
   - Set default discount values
   - Update validation rules

## Troubleshooting

### "Table doesn't exist" error
- Make sure you've run the card_offers SQL migration
- Check Supabase table editor to verify tables exist

### "Permission denied" error
- Verify RLS policies are set up correctly
- Ensure your user has admin role in profiles table

### Images not loading in categories
- Verify image URLs are publicly accessible
- Check CORS settings if using external image hosts

## Files Modified

- `src/components/admin/AdminCategories.tsx` (NEW)
- `src/components/admin/AdminBankOffers.tsx` (NEW)
- `src/components/admin/AdminReferrals.tsx` (NEW)
- `src/components/AdminDashboard.tsx` (Updated with new tabs)
- `create_card_offers_table.sql` (NEW - Database migration)
