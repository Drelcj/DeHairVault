# Checkout Flow Quick Setup Guide

This guide will help you set up and test the checkout flow in 5 minutes.

## Prerequisites

- Node.js and npm installed
- Supabase project configured
- Stripe account (test mode)
- Paystack account (test mode)

## Step 1: Environment Variables

Create or update your `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 2: Database Setup

Run this SQL in your Supabase SQL editor:

```sql
-- Add USD exchange rate (required for Stripe)
INSERT INTO exchange_rates (currency_code, rate_to_ngn, symbol, is_active)
VALUES ('USD', 1650, '$', true)
ON CONFLICT (currency_code) DO UPDATE 
SET rate_to_ngn = 1650, is_active = true;

-- Optionally add a test coupon
INSERT INTO coupons (
  code, 
  discount_type, 
  discount_value, 
  is_active
) VALUES (
  'TEST10', 
  'percentage', 
  10, 
  true
);
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Step 5: Test the Checkout Flow

### Add Items to Cart
1. Browse products at http://localhost:3000/shop
2. Add items to your cart
3. Click cart icon to view items

### Complete Checkout
1. Click "Checkout" button
2. Fill in shipping information:
   - Name: Test User
   - Email: test@example.com
   - Phone: +2348012345678
   - Address: 123 Test Street
   - City: Lagos
   - State: Lagos State
   - Country: Nigeria

3. Choose payment method:
   - **Stripe (International)**: For testing international payments
   - **Paystack (Nigeria/Africa)**: For testing local payments

### Test Stripe Payment

Use these test cards:

**Success:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

**Declined:**
- Card: `4000 0000 0000 0002`

**Requires Authentication:**
- Card: `4000 0025 0000 3155`

### Test Paystack Payment

Use these test cards:

**Success:**
- Card: `5061 0101 0000 0000 185`
- Expiry: Any future date
- CVV: Any 3 digits
- PIN: 1111
- OTP: 123456

**Mastercard Success:**
- Card: `5399 8383 8383 8381`
- Expiry: Any future date
- CVV: Any 3 digits
- PIN: 1234
- OTP: 123456

## Step 6: Setup Webhooks (For Full Testing)

### Stripe Webhooks

**Option 1: Using Stripe CLI (Recommended for Development)**

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret and add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

**Option 2: Using ngrok (Alternative)**

1. Install ngrok: https://ngrok.com/download
2. Expose your local server:
   ```bash
   ngrok http 3000
   ```
3. In Stripe Dashboard, add webhook endpoint: `https://your-ngrok-url.ngrok.io/api/webhooks/stripe`
4. Select event: `checkout.session.completed`
5. Copy webhook signing secret to `.env.local`

### Paystack Webhooks

1. Get your webhook URL using ngrok (as above)
2. In Paystack Dashboard > Settings > Webhooks
3. Add webhook URL: `https://your-ngrok-url.ngrok.io/api/webhooks/paystack`
4. Paystack will send test events automatically

## Step 7: Verify Everything Works

After completing a test payment:

1. **Check Order Created**
   - Go to Supabase Dashboard
   - Check `orders` table for new order
   - Verify `order_items` table has items

2. **Check Order Status**
   - Order `status` should be `CONFIRMED`
   - `payment_status` should be `paid`
   - `payment_reference` should have transaction ID

3. **Check Cart Cleared**
   - `cart_items` table should be empty for that user/session

4. **Check Stock Reduced**
   - Product `stock_quantity` should be reduced

5. **Visit Success Page**
   - Should redirect to `/checkout/success?order_number=DHV-YYYY-XXXXXX`
   - Should display order details

## Common Issues

### "Cart is empty" error
- Add items to cart first
- Check cart expiration (7 days for guests, 30 days for users)

### "USD exchange rate not configured" error
- Run the SQL query in Step 2 to add USD rate

### Payment not redirecting
- Check browser console for errors
- Verify API keys in `.env.local`
- Ensure `NEXT_PUBLIC_APP_URL` is correct

### Webhook not firing
- For local development, use Stripe CLI or ngrok
- Check webhook endpoint is accessible
- Verify webhook secret in `.env.local`

### Order created but cart not clearing
- Check webhook handler logs in terminal
- Verify webhook secret is correct
- Test webhook manually using Stripe/Paystack dashboard

## Next Steps

Once basic testing works:

1. **Setup Production Webhooks**
   - Deploy to production
   - Configure webhooks in Stripe/Paystack dashboards
   - Use production webhook secrets

2. **Configure Email Notifications**
   - Setup Resend or SendGrid
   - Send order confirmation emails
   - Send shipping notifications

3. **Add Admin Order Management**
   - View orders in admin panel
   - Update order status
   - Process refunds

4. **Monitor Orders**
   - Track order success rates
   - Monitor webhook failures
   - Set up alerts

## Testing Checklist

Use this checklist to verify everything works:

- [ ] Can add items to cart
- [ ] Can view cart items
- [ ] Checkout page loads with cart items
- [ ] Form validation works
- [ ] Shipping cost calculates correctly
- [ ] Coupon code applies discount
- [ ] Stripe payment completes
- [ ] Paystack payment completes
- [ ] Order appears in database
- [ ] Cart clears after payment
- [ ] Stock reduces after payment
- [ ] Success page displays order details
- [ ] Cancel page shows on payment cancellation

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Paystack Documentation**: https://paystack.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Full Implementation Guide**: See `docs/CHECKOUT-IMPLEMENTATION.md`

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Review server terminal logs
3. Verify all environment variables are set
4. Test webhooks using CLI tools
5. Refer to the full implementation guide
