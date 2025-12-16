// API Route: Get, Update, Delete Product by ID
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole, type ProductUpdate } from '@/types/database.types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    // Fetch product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch variants
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
      .order('length', { ascending: true });

    return NextResponse.json({ product, variants: variants || [] }, { status: 200 });
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    // Update product
    const updateData = product as ProductUpdate;
    const { data: updatedProduct, error: productError } = await supabase
      .from('products')
      // @ts-expect-error - Supabase type inference issue with Database types
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (productError) {
      console.error('Product update error:', productError);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    // Handle variants update
    if (variants && variants.length > 0) {
      // Delete existing variants
      await supabase.from('product_variants').delete().eq('product_id', id);

      // Insert new variants
      const variantsWithProductId = variants.map((v: any) => ({
        ...v,
        product_id: id,
      }));

      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantsWithProductId);

      if (variantsError) {
        console.error('Variants update error:', variantsError);
        return NextResponse.json(
          {
            product: updatedProduct,
            error: 'Product updated but variants failed',
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json({ product: updatedProduct }, { status: 200 });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    // Delete product (variants will be cascade deleted if foreign key is set)
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      console.error('Product delete error:', error);
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
