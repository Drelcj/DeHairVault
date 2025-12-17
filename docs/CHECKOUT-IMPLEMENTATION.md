# Checkout Flow Implementation Guide

## Overview

This document provides comprehensive information about the checkout flow implementation in DeHair Vault, including setup, testing, and troubleshooting.

## Architecture

### Flow Diagram

```
Cart → Checkout Page → Payment Selection → Payment Gateway → Webhook → Order Confirmation
```

### Components

1. **Checkout Page** (`app/checkout/page.tsx`)
   - Server-side rendered page
   - Fetches cart data
   - Redirects to shop if cart is empty
   - Renders checkout form with order summary

2. **Checkout Form** (`components/checkout/checkout-form.tsx`)
   - Collects customer information
   - Validates form data with Zod
   - Applies coupon codes
   - Initiates payment process

3. **Order Summary** (`components/checkout/order-summary.tsx`)
   - Displays cart items
   - Shows pricing breakdown
   - Currency conversion display

4. **Payment Method Selector** (`components/checkout/payment-method.tsx`)
   - Stripe for international payments
   - Paystack for Nigerian/African payments

## Server Actions

### `lib/actions/checkout.ts`

#### `createOrder(formData, sessionId?)`
Creates a pending order in the database.

**Parameters:**
- `formData`: CheckoutFormData - Customer and order information
- `sessionId`: string (optional) - Guest session ID

**Returns:**
- `OrderResult` with `orderId`, `orderNumber`, or `error`

**Features:**
- Validates stock availability
- Calculates shipping costs based on country
- Generates unique order number (DHV-YYYY-XXXXXX)
- Stores product snapshots for historical accuracy
- Supports both guest and authenticated checkout

#### `getOrder(orderId)`
Fetches order details by ID, including order items.

#### `getOrderByNumber(orderNumber)`
Fetches order details by order number.

#### `applyCoupon(code, cartTotal)`
Validates and applies coupon codes.

**Validation:**
- Checks if coupon is active
- Validates expiry dates
- Checks minimum order value
- Verifies usage limits

#### `updateOrderStatus(orderId, status, paymentStatus, ...)`
Updates order status after payment (called by webhooks).

**Actions:**
- Updates order payment status
- Reduces product stock on successful payment
- Stores payment metadata

#### `clearCartAfterOrder(orderId)`
Clears the cart after successful payment.

#### `getExchangeRates()`
Fetches active exchange rates from database.

## Payment Integration

### Stripe Integration

#### Checkout Session (`app/api/checkout/stripe/route.ts`)

**Endpoint:** `POST /api/checkout/stripe`

**Request Body:**
```json
{
  "orderId": "uuid",
  "orderNumber": "DHV-2024-123456"
}
```

**Process:**
1. Fetches order details
2. Gets USD exchange rate from database
3. Converts NGN to USD
4. Creates Stripe Checkout Session with line items
5. Returns checkout URL

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

#### Webhook Handler (`app/api/webhooks/stripe/route.ts`)

**Endpoint:** `POST /api/webhooks/stripe`

**Events Handled:**
- `checkout.session.completed`: Confirms order and clears cart
- `checkout.session.expired`: Logs expiration
- `payment_intent.payment_failed`: Logs failure

**Security:**
- Verifies webhook signature using `STRIPE_WEBHOOK_SECRET`
- Only processes events with valid signatures

### Paystack Integration

#### Transaction Initialization (`app/api/checkout/paystack/route.ts`)

**Endpoint:** `POST /api/checkout/paystack`

**Request Body:**
```json
{
  "orderId": "uuid",
  "orderNumber": "DHV-2024-123456"
}
```

**Process:**
1. Fetches order details
2. Converts amount to kobo (multiply by 100)
3. Initializes Paystack transaction
4. Returns authorization URL

**Response:**
```json
{
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "...",
  "reference": "..."
}
```

#### Webhook Handler (`app/api/webhooks/paystack/route.ts`)

**Endpoint:** `POST /api/webhooks/paystack`

**Events Handled:**
- `charge.success`: Confirms order and clears cart
- `charge.failed`: Logs failure

**Security:**
- Verifies webhook signature using `x-paystack-signature` header
- Uses HMAC SHA512 verification

## Environment Variables

### Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Setup

### Required Tables

1. **orders** - Stores order information
2. **order_items** - Stores individual order items
3. **exchange_rates** - Currency exchange rates
4. **coupons** - Discount coupons (optional)

### Required Exchange Rate

Ensure USD exchange rate exists in `exchange_rates` table:

```sql
INSERT INTO exchange_rates (currency_code, rate_to_ngn, symbol, is_active)
VALUES ('USD', 1650, '$', true);
```

## Testing

### Test Stripe Payment

1. Add items to cart
2. Navigate to `/checkout`
3. Fill in shipping information
4. Select "International Cards" payment method
5. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

### Test Paystack Payment

1. Add items to cart
2. Navigate to `/checkout`
3. Fill in shipping information
4. Select "Nigerian/African Cards" payment method
5. Use Paystack test card: `4084 0840 8408 4081`
   - Expiry: Any future date
   - CVV: 408
   - PIN: 0000
   - OTP: 123456

### Webhook Testing with Stripe CLI

1. Install Stripe CLI
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to http://localhost:3000/api/webhooks/stripe`
4. Trigger test event: `stripe trigger checkout.session.completed`

### Webhook Testing with Paystack

Use Paystack's webhook testing tools in the dashboard.

## Troubleshooting

### Order Not Created

**Possible Causes:**
- Cart is empty
- Stock not available
- Validation errors in form data

**Solution:**
- Check browser console for errors
- Verify cart has items
- Check product stock levels

### Payment Not Processing

**Stripe Issues:**
- Verify `STRIPE_SECRET_KEY` is correct
- Check if exchange rate exists in database
- Ensure success/cancel URLs are configured

**Paystack Issues:**
- Verify `PAYSTACK_SECRET_KEY` is correct
- Ensure callback URL is accessible
- Check if amount is correctly converted to kobo

### Webhook Not Firing

**Common Issues:**
- Webhook endpoint not accessible
- Incorrect webhook secret
- Signature verification failing

**Solutions:**
- Test webhook endpoint manually
- Verify webhook secret in environment variables
- Check server logs for signature verification errors
- Use Stripe CLI or Paystack test tools

### Cart Not Clearing

**Possible Causes:**
- Webhook not firing
- Order status not updating
- Cart clearing function failing

**Solution:**
- Check webhook handler logs
- Verify order status in database
- Test `clearCartAfterOrder` function manually

### Exchange Rate Error

**Error:** "USD exchange rate not configured"

**Solution:**
1. Add USD to exchange_rates table:
```sql
INSERT INTO exchange_rates (currency_code, rate_to_ngn, symbol, is_active)
VALUES ('USD', 1650, '$', true);
```

## Security Considerations

### Implemented Security Measures

1. **Webhook Signature Verification**
   - All webhooks verify signatures before processing
   - Prevents unauthorized webhook calls

2. **Server-Side Order Creation**
   - Orders created on server to prevent tampering
   - Prices fetched from database, not client

3. **Stock Validation**
   - Checks stock before order creation
   - Reduces stock only after payment confirmation

4. **Session Management**
   - Guest carts use secure session IDs
   - Authenticated users linked to user_id

5. **Input Validation**
   - Form validation with Zod
   - Server-side validation of all inputs

### Security Best Practices

1. **Never expose secret keys** - Keep all secret keys in environment variables
2. **Use HTTPS in production** - Ensure all payment redirects use HTTPS
3. **Validate webhook signatures** - Always verify webhook authenticity
4. **Sanitize user inputs** - Validate all form inputs on server
5. **Monitor webhook failures** - Set up alerts for failed webhooks

## Monitoring and Logging

### Key Metrics to Monitor

1. **Order Creation Rate** - Track successful vs failed order creations
2. **Payment Success Rate** - Monitor payment completion rates
3. **Webhook Processing** - Track webhook successes and failures
4. **Cart Abandonment** - Monitor checkout starts vs completions
5. **Stock Issues** - Track out-of-stock incidents during checkout

### Logging

All critical operations are logged:
- Order creation
- Payment processing
- Webhook events
- Stock updates
- Cart clearing

Check server logs for debugging:
```bash
npm run dev
```

## API Reference

### POST /api/checkout/stripe
Creates a Stripe Checkout Session.

**Authentication:** None (uses orderId)

**Request:**
```typescript
{
  orderId: string;
  orderNumber: string;
}
```

**Response:**
```typescript
{
  url: string; // Stripe Checkout URL
}
```

### POST /api/checkout/paystack
Initializes a Paystack transaction.

**Authentication:** None (uses orderId)

**Request:**
```typescript
{
  orderId: string;
  orderNumber: string;
}
```

**Response:**
```typescript
{
  authorization_url: string;
  access_code: string;
  reference: string;
}
```

### POST /api/webhooks/stripe
Handles Stripe webhook events.

**Authentication:** Webhook signature

**Headers:**
- `stripe-signature`: Webhook signature

### POST /api/webhooks/paystack
Handles Paystack webhook events.

**Authentication:** Webhook signature

**Headers:**
- `x-paystack-signature`: Webhook signature

## Future Enhancements

### Planned Features

1. **Multiple Currency Support**
   - Allow customers to select display currency
   - Dynamic exchange rate fetching

2. **Saved Addresses**
   - Store shipping addresses for authenticated users
   - Quick checkout with saved information

3. **Order Tracking**
   - Real-time order status updates
   - Email notifications

4. **Alternative Payment Methods**
   - Bank transfer
   - Mobile money
   - Cryptocurrency

5. **Advanced Coupon System**
   - Buy X get Y free
   - Product-specific discounts
   - User-specific coupons

6. **Shipping Zones**
   - Zone-based shipping costs
   - Multiple shipping methods
   - Delivery time estimates

## Support

For issues or questions:
1. Check this documentation
2. Review server logs
3. Test webhooks with CLI tools
4. Contact development team

## Version History

### v1.0.0 (Current)
- Initial checkout flow implementation
- Stripe and Paystack integration
- Order management
- Coupon support
- Guest and authenticated checkout
