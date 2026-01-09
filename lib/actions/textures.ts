'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface HairTextureOption {
  value: string
  label: string
}

/**
 * Fetch all active hair textures from the lookup table
 */
export async function getHairTextures(): Promise<HairTextureOption[]> {
  try {
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('hair_textures')
      .select('value, label')
      .eq('is_active', true)
      .order('label')
    
    if (error) {
      console.error('Error fetching hair textures:', error)
      // Return default textures as fallback
      return getDefaultTextures()
    }
    
    return data || getDefaultTextures()
  } catch (error) {
    console.error('Failed to fetch hair textures:', error)
    return getDefaultTextures()
  }
}

/**
 * Create a new hair texture (admin only)
 */
export async function createHairTexture(label: string): Promise<{ success: boolean; value?: string; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // Check admin role
    const serviceClient = createServiceClient()
    const { data: roleData } = await serviceClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!roleData || !['ADMIN', 'SUPER_ADMIN'].includes(roleData.role)) {
      return { success: false, error: 'Forbidden' }
    }
    
    // Generate value from label (SCREAMING_SNAKE_CASE)
    const value = label.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
    
    // Insert the new texture
    const { error: insertError } = await serviceClient
      .from('hair_textures')
      .insert({
        value,
        label,
        is_active: true,
      })
    
    if (insertError) {
      // Check if it's a duplicate
      if (insertError.code === '23505') {
        return { success: false, error: 'A texture with this name already exists' }
      }
      console.error('Error creating hair texture:', insertError)
      return { success: false, error: insertError.message }
    }
    
    // Revalidate admin pages
    revalidatePath('/admin/products')
    
    return { success: true, value }
  } catch (error) {
    console.error('Failed to create hair texture:', error)
    return { success: false, error: 'Failed to create texture' }
  }
}

/**
 * Default textures as fallback when database is not available
 */
function getDefaultTextures(): HairTextureOption[] {
  return [
    { value: 'STRAIGHT', label: 'Straight' },
    { value: 'BODY_WAVE', label: 'Body Wave' },
    { value: 'LOOSE_WAVE', label: 'Loose Wave' },
    { value: 'DEEP_WAVE', label: 'Deep Wave' },
    { value: 'WATER_WAVE', label: 'Water Wave' },
    { value: 'KINKY_CURLY', label: 'Kinky Curly' },
    { value: 'JERRY_CURL', label: 'Jerry Curl' },
    { value: 'LOOSE_DEEP', label: 'Loose Deep' },
    { value: 'NATURAL_WAVE', label: 'Natural Wave' },
  ]
}
