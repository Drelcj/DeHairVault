// Admin Layout with Authentication and Role-Based Access Control
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserRole } from '@/types/database.types';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  // Get user role from users table
  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  // Type guard to handle the userData
  type UserData = { role: UserRole };

  // Check if user has admin access
  if (error || !userData) {
    redirect('/');
  }

  const typedUserData = userData as UserData;

  if (typedUserData.role !== UserRole.ADMIN && typedUserData.role !== UserRole.SUPER_ADMIN) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                DeHair Vault Admin
              </Link>
            </div>
            <nav className="flex space-x-4">
              <Link
                href="/admin"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/products"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Products
              </Link>
              <Link
                href="/admin/orders"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Orders
              </Link>
              <Link
                href="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                View Site
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
