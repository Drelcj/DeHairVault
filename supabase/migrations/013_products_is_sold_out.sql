-- Manual "sold out" switch for products.
-- Independent of stock_quantity (the real count is preserved) and of is_active
-- (a sold-out product stays visible on the storefront, with add-to-cart disabled).

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_sold_out BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.products.is_sold_out IS
  'Admin override: show as "Sold out" and block add-to-cart/checkout, without hiding the product or changing stock_quantity.';
