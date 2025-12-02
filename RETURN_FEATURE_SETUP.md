# Return Product Feature - Setup Guide

## Overview
This feature allows customers to request returns for delivered orders with two options:
- **Refund**: Get money back
- **Replace**: Get a new product

## Database Setup

### 1. Apply the Migration

Run the SQL migration file in your Supabase SQL Editor:

```bash
# Location: supabase_migrations/create_return_requests_table.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

### 2. What the Migration Creates

- **return_requests table** with the following columns:
  - `id` (UUID): Primary key
  - `order_id` (UUID): Reference to orders table
  - `user_id` (UUID): Reference to auth.users
  - `return_type` (TEXT): 'refund' or 'replace'
  - `reason` (TEXT): Customer's reason for return
  - `items` (JSONB): Array of items being returned
  - `total_amount` (DECIMAL): Total refund/replacement value
  - `status` (TEXT): pending, approved, rejected, processing, completed
  - `admin_notes` (TEXT): Optional notes from admin
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

- **Row Level Security (RLS) Policies**:
  - Users can view and create their own return requests
  - Admins can view and update all return requests

- **Indexes** for optimized queries on:
  - order_id, user_id, status, created_at

## Features

### Customer Features

1. **Request Return**
   - Available for delivered orders only
   - Select items to return (can be partial)
   - Choose return type (refund or replace)
   - Provide reason for return
   - See total refund/replacement amount

2. **Track Return Status**
   - View return request status in order tracking
   - Receive updates when admin processes the request

### Admin Features

1. **Review Return Requests**
   - View all pending return requests
   - See customer details and order information
   - Review items and reasons

2. **Process Returns**
   - Approve or reject requests
   - Add admin notes
   - Update status through workflow:
     - Pending → Approved/Rejected
     - Approved → Processing
     - Processing → Completed

3. **Automatic Actions**
   - On completion:
     - Refunds: Order payment status → 'refunded'
     - Both types: Order status → 'returned'
     - Stock returned to inventory automatically

## Usage

### Customer Workflow

1. Go to "Order Tracking" page
2. Select a delivered order
3. Click "Return Order" button
4. Select return type (Refund or Replace)
5. Choose items to return
6. Enter reason for return
7. Submit request
8. Wait for admin review (24-48 hours)

### Admin Workflow

1. Go to Admin Dashboard
2. Click "Returns" tab
3. Review pending requests
4. Add admin notes (optional)
5. Approve or Reject
6. For approved returns:
   - Mark as "Processing" when arranging pickup
   - Mark as "Completed" when refund/replacement is done

## API Integration

### Create Return Request
```typescript
import { returnService } from './lib/supabaseEnhanced';

await returnService.createReturnRequest({
  orderId: 'order-uuid',
  returnType: 'refund', // or 'replace'
  reason: 'Product damaged',
  items: [
    {
      productId: 'product-uuid',
      productName: 'Product Name',
      quantity: 1,
      price: 1999
    }
  ],
  totalAmount: 1999
});
```

### Get User Returns
```typescript
const returns = await returnService.getUserReturnRequests();
```

### Update Return Status (Admin)
```typescript
await returnService.updateReturnStatus(
  returnId,
  'approved',
  'Return approved. Pickup scheduled for tomorrow.'
);
```

## Stock Management

When a return is completed:
- Stock is automatically returned to inventory
- Inventory transaction is created with type 'return'
- Reference ID links to the order

## Email Notifications (Future Enhancement)

You can add email notifications for:
- Return request submitted → Customer
- Return approved/rejected → Customer
- Return completed → Customer
- New return request → Admin

## Testing

1. **Create a test order**
   - Add products to cart
   - Complete checkout
   - Manually update order status to 'delivered' in database

2. **Request return**
   - Go to order tracking
   - Click return button
   - Fill in return form
   - Submit

3. **Admin review**
   - Login as admin
   - Go to Returns tab
   - Process the return request

4. **Verify**
   - Check order status updated
   - Check stock returned
   - Check payment status (for refunds)

## Troubleshooting

### Returns not showing
- Check RLS policies are enabled
- Verify user is authenticated
- Check order status is 'delivered'

### Stock not updating
- Verify inventory_transactions table exists
- Check adjust_product_stock function exists
- Review error logs

### Admin can't update returns
- Verify user has admin role in profiles table
- Check RLS policies for admin access

## Security Notes

- Returns can only be created by authenticated users
- Users can only see their own returns
- Only admins can update return status
- RLS policies enforce all access controls

## Database Queries

### Get return statistics
```sql
SELECT 
  return_type,
  status,
  COUNT(*) as count,
  SUM(total_amount) as total_value
FROM return_requests
GROUP BY return_type, status;
```

### Get pending returns
```sql
SELECT * FROM return_requests
WHERE status = 'pending'
ORDER BY created_at DESC;
```
