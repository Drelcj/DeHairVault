# Admin System - Quick Reference

## 🎯 What You Can Do

### Order Management (`/admin/orders`)
| Action | Route | Method | Auth |
|--------|-------|--------|------|
| View all orders | GET `/api/admin/orders` | GET | ADMIN |
| Filter by status | `?status=PENDING` | GET | ADMIN |
| Search customer | `?q=john@example.com` | GET | ADMIN |
| Filter by date | `?dateFrom=2025-12-01&dateTo=2025-12-31` | GET | ADMIN |
| View order details | GET `/api/admin/orders/:id` | GET | ADMIN |
| Update status | POST `/api/admin/orders/:id/status` | POST | ADMIN |
| Add admin notes | PATCH `/api/admin/orders/:id` | PATCH | ADMIN |

**Status Transitions** (enforced on client):
- PENDING → CONFIRMED, CANCELLED
- CONFIRMED → PROCESSING, CANCELLED
- PROCESSING → SHIPPED, CANCELLED
- SHIPPED → DELIVERED, CANCELLED
- DELIVERED → (terminal)
- CANCELLED → (terminal)

### Product Management (`/admin/products`)
| Action | Route | Method | Auth |
|--------|-------|--------|------|
| View all products | GET `/api/admin/products` | GET | ADMIN |
| Search by name/desc | `?q=braids` | GET | ADMIN |
| Sort products | `?sort=price:asc` | GET | ADMIN |
| View product details | GET `/api/admin/products/:id` | GET | ADMIN |
| Edit product | PATCH `/api/admin/products/:id` | PATCH | ADMIN |
| Create product | POST `/api/admin/products` | POST | ADMIN |
| Create variant | POST `/api/admin/products/:id/variants` | POST | ADMIN |

**Editable Fields**:
- name, description, category, sku, price_ngn, stock_quantity, is_available

---

## 🗂️ File Structure

```
app/
├── api/admin/
│   ├── orders/
│   │   ├── route.ts                    # GET list (filters, sort, pagination)
│   │   └── [id]/
│   │       ├── route.ts                # GET detail, PATCH notes
│   │       └── status/
│   │           └── route.ts            # POST status update
│   └── products/
│       ├── route.ts                    # GET list (search, sort, pagination)
│       └── [id]/
│           └── route.ts                # GET detail, PATCH edit
│
├── admin/
│   ├── orders/
│   │   ├── page.tsx                    # List view
│   │   └── [id]/
│   │       ├── page.tsx                # Detail view
│   │       └── _components/
│   │           └── order-status-actions.tsx   # Status form component
│   │
│   └── products/
│       ├── page.tsx                    # Catalog view
│       ├── new/
│       │   ├── page.tsx                # Create form (future)
│       │   └── _components/
│       │       └── product-form.tsx    # (future)
│       └── [id]/
│           └── edit/
│               ├── page.tsx            # Edit page
│               └── _components/
│                   └── product-edit-form.tsx  # Edit form
│
lib/
├── supabase/
│   ├── proxy.ts                        # Middleware auth (ADMIN role check)
│   └── server.ts                       # Service client for admin writes
│
supabase/
└── migrations/
    └── 002_admin_policies.sql          # RLS policies (ADMIN only)

docs/
├── Admin-Spec.md                       # Phase 2 specification
├── Migration-Guide.md                  # How to apply RLS migration
└── Phase-3-Completion-Report.md        # This phase's deliverables
```

---

## 🔧 API Examples

### Get orders with filters
```bash
curl "http://localhost:3000/api/admin/orders?status=PENDING&page=1&pageSize=20"
```

**Response:**
```json
{
  "products": [
    {
      "id": "ord-123",
      "order_number": "#ORD-001",
      "customer_name": "John Doe",
      "status": "PENDING",
      "total_ngn": 50000,
      "created_at": "2025-12-15T10:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

### Update order status
```bash
curl -X POST "http://localhost:3000/api/admin/orders/ord-123/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED",
    "tracking_number": "DHL123456789",
    "tracking_url": "https://tracking.dhl.com/...",
    "admin_notes": "Ready to ship"
  }'
```

**Response:**
```json
{
  "success": true
}
```

### Search products
```bash
curl "http://localhost:3000/api/admin/products?q=lace&sort=price:asc&pageSize=10"
```

### Update product
```bash
curl -X PATCH "http://localhost:3000/api/admin/products/prod-456" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "HD Lace Closure 4x4",
    "price_ngn": 35000,
    "stock_quantity": 15
  }'
```

---

## 🔐 Auth Flow

```
Request to /admin/orders
    ↓
1. Proxy middleware (proxy.ts)
    ├─ Check Supabase session exists
    ├─ Look up user.role in database
    └─ If role ≠ 'ADMIN' → 403 Forbidden
    ↓
2. API route (app/api/admin/orders/route.ts)
    ├─ Double-check auth.getUser() exists
    ├─ Double-check users.role === 'ADMIN'
    └─ If not → 401/403
    ↓
3. Database query with RLS
    ├─ Service client has full access (service role key)
    ├─ But RLS policies still apply
    └─ If role ≠ 'ADMIN' → empty result
    ↓
4. Response returned
```

---

## 📊 Pagination Example

**Default**: 20 items per page

```
Total items: 247
Page size: 20

Page 1: items 0-19
Page 2: items 20-39
...
Page 13: items 240-247
```

**URL**: `?page=2&pageSize=50` → items 50-99

---

## 🎨 UI Components

### Status Badge
- **PENDING**: Gray background
- **CONFIRMED**: Blue background
- **PROCESSING**: Orange background
- **SHIPPED**: Purple background
- **DELIVERED**: Green background
- **CANCELLED**: Red background

### Availability Badge
- **Available** (true): Green (`bg-green-500/20 text-green-700`)
- **Unavailable** (false): Red (`bg-red-500/20 text-red-700`)

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| 403 Forbidden on /admin/orders | Check user has `role='ADMIN'` in users table |
| Empty product list | Check RLS migration applied; search filter may be too specific |
| Can't update order status | Session may have expired; re-login |
| Tracking number field missing | Only appears when status is 'SHIPPED' |
| Save failed (500 error) | Check API logs; may be missing required field |

---

## ✨ Next Steps (Phase 4)

- [ ] Product creation page (`/admin/products/new`)
- [ ] Bulk import (CSV upload)
- [ ] Dashboard with KPIs (sales YTD, pending orders, inventory alerts)
- [ ] Review management (approve/reject/delete reviews)
- [ ] Coupon management (create, deactivate, view usage)

---

**Last Updated**: December 16, 2025  
**Status**: Phase 3 Complete (migration pending application)
