// API Route: Create Product
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole, type Product } from '@/types/database.types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    type UserData = { role: UserRole };

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const typedUserData = userData as UserData;

    if (typedUserData.role !== UserRole.ADMIN && typedUserData.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const { product, variants } = await request.json();

    // Insert product - cast to any to allow insert
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert(product as any)
      .select()
      .single();

    if (productError) {
      console.error('Product insert error:', productError);
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }

    if (!newProduct) {
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }

    // Type assertion after null check
    const typedProduct = newProduct as Product;

    // Insert variants if provided
    if (variants && variants.length > 0) {
      const variantsWithProductId = variants.map((v: any) => ({
        ...v,
        product_id: typedProduct.id,
      }));

      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantsWithProductId);

      if (variantsError) {
        console.error('Variants insert error:', variantsError);
        // Note: Product was created, but variants failed
        return NextResponse.json(
          {
            product: typedProduct,
            error: 'Product created but variants failed',
          },
          { status: 201 }
        );
      }
    }

    return NextResponse.json({ product: typedProduct }, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    type UserData = { role: UserRole };

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const typedUserData = userData as UserData;

    if (typedUserData.role !== UserRole.ADMIN && typedUserData.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Products fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
