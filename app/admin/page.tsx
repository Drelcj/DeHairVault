// Admin Dashboard Landing Page
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard | DeHair Vault',
  description: 'Manage your DeHair Vault store',
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch dashboard statistics
  const [productsResult, ordersResult] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
  ]);

  const productCount = productsResult.count || 0;
  const orderCount = ordersResult.count || 0;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{productCount}</p>
          <Link
            href="/admin/products"
            className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
          >
            Manage products →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{orderCount}</p>
          <Link
            href="/admin/orders"
            className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
          >
            Manage orders →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            <Link
              href="/admin/products/new"
              className="block text-sm text-blue-600 hover:text-blue-800"
            >
              + Add new product
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Welcome to Admin Dashboard</h2>
        </div>
        <div className="px-6 py-4">
          <p className="text-gray-600">
            Use the navigation above to manage products, orders, and other store settings.
          </p>
        </div>
      </div>
    </div>
  );
}
