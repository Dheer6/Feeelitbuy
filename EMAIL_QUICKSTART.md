# Email Notification System - Quick Start Guide

## 🚀 Setup Instructions

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up
2. Create an API key
3. Copy the key (starts with `re_`)

### 2. Add Environment Variables

Add to your `.env` file:

```env
VITE_RESEND_API_KEY=re_your_api_key_here
VITE_FROM_EMAIL=orders@feelitbuy.com
```

### 3. Test Email Templates Locally

```bash
# Preview emails in browser
npm run email:dev
```

Add this script to `package.json`:

```json
{
  "scripts": {
    "email:dev": "email dev"
  }
}
```

### 4. Usage in Your Code

```typescript
import { emailService } from './lib/emailService';

// Send order confirmation
await emailService.sendOrderConfirmation({
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  orderNumber: 'ORD-12345',
  orderDate: '2025-12-08',
  items: [
    {
      name: 'Product Name',
      quantity: 2,
      price: 1999,
      image: 'https://example.com/image.jpg'
    }
  ],
  subtotal: 3998,
  shipping: 50,
  total: 4048,
  shippingAddress: {
    street: '123 Main St',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001'
  }
});

// Send shipping update
await emailService.sendShippingUpdate({
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  orderNumber: 'ORD-12345',
  trackingNumber: 'TRACK123456',
  carrier: 'Delhivery',
  estimatedDelivery: 'Dec 10, 2025',
  trackingUrl: 'https://delhivery.com/track/TRACK123456'
});

// Send delivery confirmation
await emailService.sendDeliveryConfirmation({
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  orderNumber: 'ORD-12345',
  deliveryDate: 'Dec 10, 2025'
});

// Send return status update
await emailService.sendReturnStatusUpdate({
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  returnNumber: 'RET-12345',
  orderNumber: 'ORD-12345',
  status: 'approved',
  statusMessage: 'Your return has been approved. Refund will be processed in 3-5 business days.'
});
```

## 📧 Email Templates Created

1. ✅ **OrderConfirmation.tsx** - Order confirmation with items, totals, and shipping address
2. ✅ **ShippingUpdate.tsx** - Shipping notification with tracking number
3. ✅ **DeliveryConfirmation.tsx** - Delivery confirmation with review CTA
4. ✅ **ReturnStatus.tsx** - Return request status updates

## 🔧 Next Steps

### Option 1: Manual Trigger (Quick Test)
Call `emailService` methods directly when orders are created/updated

### Option 2: Supabase Edge Functions (Recommended)
Set up automatic triggers using Supabase Edge Functions (see full implementation plan)

### Option 3: Backend Integration
Integrate with your existing backend API

## 📊 Monitoring

Check email delivery status in Resend dashboard:
- Delivery rate
- Open rate
- Click rate
- Bounces

## 💰 Pricing

**Resend:**
- Free: 3,000 emails/month
- Pro: $20/month for 50,000 emails

## ⚠️ Important Notes

1. **Test with real email** - Use your own email for testing
2. **Domain verification** - For production, verify your domain in Resend
3. **Rate limits** - Free tier has rate limits, upgrade if needed
4. **Error handling** - Always wrap email sends in try-catch

## 🐛 Troubleshooting

**Email not sending?**
- Check API key is correct
- Verify email address format
- Check Resend dashboard for errors
- Ensure environment variables are loaded

**Emails going to spam?**
- Verify your domain in Resend
- Add SPF/DKIM records
- Avoid spammy content

## 📚 Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email)
- Full implementation plan: `email_implementation_plan.md`
