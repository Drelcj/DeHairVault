export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_activity_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          selected_length: number
          unit_price_ngn: number
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          selected_length: number
          unit_price_ngn: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          selected_length?: number
          unit_price_ngn?: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applicable_categories:
            | Database["public"]["Enums"]["hair_category"][]
            | null
          applicable_grades: Database["public"]["Enums"]["hair_grade"][] | null
          code: string
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          maximum_discount_ngn: number | null
          minimum_order_ngn: number | null
          starts_at: string | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          usage_limit_per_user: number | null
        }
        Insert: {
          applicable_categories?:
            | Database["public"]["Enums"]["hair_category"][]
            | null
          applicable_grades?: Database["public"]["Enums"]["hair_grade"][] | null
          code: string
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          maximum_discount_ngn?: number | null
          minimum_order_ngn?: number | null
          starts_at?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          usage_limit_per_user?: number | null
        }
        Update: {
          applicable_categories?:
            | Database["public"]["Enums"]["hair_category"][]
            | null
          applicable_grades?: Database["public"]["Enums"]["hair_grade"][] | null
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          maximum_discount_ngn?: number | null
          minimum_order_ngn?: number | null
          starts_at?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          usage_limit_per_user?: number | null
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          currency_code: string
          id: string
          is_active: boolean | null
          rate_from_gbp: number
          symbol: string | null
          updated_at: string | null
        }
        Insert: {
          currency_code: string
          id?: string
          is_active?: boolean | null
          rate_from_gbp: number
          symbol?: string | null
          updated_at?: string | null
        }
        Update: {
          currency_code?: string
          id?: string
          is_active?: boolean | null
          rate_from_gbp?: number
          symbol?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hair_textures: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          label: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          fulfilled_quantity: number | null
          id: string
          order_id: string
          product_grade: string | null
          product_id: string | null
          product_image_url: string | null
          product_name: string
          product_origin: string
          product_snapshot: Json | null
          product_texture: string
          quantity: number
          selected_length: number
          total_price_ngn: number
          unit_price_ngn: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          fulfilled_quantity?: number | null
          id?: string
          order_id: string
          product_grade?: string | null
          product_id?: string | null
          product_image_url?: string | null
          product_name: string
          product_origin: string
          product_snapshot?: Json | null
          product_texture: string
          quantity: number
          selected_length: number
          total_price_ngn: number
          unit_price_ngn: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          fulfilled_quantity?: number | null
          id?: string
          order_id?: string
          product_grade?: string | null
          product_id?: string | null
          product_image_url?: string | null
          product_name?: string
          product_origin?: string
          product_snapshot?: Json | null
          product_texture?: string
          quantity?: number
          selected_length?: number
          total_price_ngn?: number
          unit_price_ngn?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          billing_address_line1: string | null
          billing_address_line2: string | null
          billing_city: string | null
          billing_country: string | null
          billing_postal_code: string | null
          billing_same_as_shipping: boolean | null
          billing_state: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          coupon_code: string | null
          coupon_discount_type: string | null
          coupon_discount_value: number | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_notes: string | null
          customer_phone: string | null
          delivered_at: string | null
          discount_ngn: number | null
          display_currency: string | null
          estimated_delivery_date: string | null
          exchange_rate: number | null
          expected_availability_date: string | null
          id: string
          is_preorder: boolean | null
          order_number: string
          order_type: Database["public"]["Enums"]["order_type"] | null
          paid_at: string | null
          payment_metadata: Json | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          shipped_at: string | null
          shipping_address_line1: string
          shipping_address_line2: string | null
          shipping_city: string
          shipping_cost_ngn: number | null
          shipping_country: string
          shipping_method: string | null
          shipping_postal_code: string | null
          shipping_state: string
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal_ngn: number
          tax_ngn: number | null
          total_display_currency: number | null
          total_ngn: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_postal_code?: string | null
          billing_same_as_shipping?: boolean | null
          billing_state?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          coupon_code?: string | null
          coupon_discount_type?: string | null
          coupon_discount_value?: number | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_notes?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          discount_ngn?: number | null
          display_currency?: string | null
          estimated_delivery_date?: string | null
          exchange_rate?: number | null
          expected_availability_date?: string | null
          id?: string
          is_preorder?: boolean | null
          order_number: string
          order_type?: Database["public"]["Enums"]["order_type"] | null
          paid_at?: string | null
          payment_metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          shipped_at?: string | null
          shipping_address_line1: string
          shipping_address_line2?: string | null
          shipping_city: string
          shipping_cost_ngn?: number | null
          shipping_country: string
          shipping_method?: string | null
          shipping_postal_code?: string | null
          shipping_state: string
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal_ngn: number
          tax_ngn?: number | null
          total_display_currency?: number | null
          total_ngn: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_postal_code?: string | null
          billing_same_as_shipping?: boolean | null
          billing_state?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          coupon_code?: string | null
          coupon_discount_type?: string | null
          coupon_discount_value?: number | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          discount_ngn?: number | null
          display_currency?: string | null
          estimated_delivery_date?: string | null
          exchange_rate?: number | null
          expected_availability_date?: string | null
          id?: string
          is_preorder?: boolean | null
          order_number?: string
          order_type?: Database["public"]["Enums"]["order_type"] | null
          paid_at?: string | null
          payment_metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          shipped_at?: string | null
          shipping_address_line1?: string
          shipping_address_line2?: string | null
          shipping_city?: string
          shipping_cost_ngn?: number | null
          shipping_country?: string
          shipping_method?: string | null
          shipping_postal_code?: string | null
          shipping_state?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal_ngn?: number
          tax_ngn?: number | null
          total_display_currency?: number | null
          total_ngn?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          admin_responded_at: string | null
          admin_response: string | null
          content: string | null
          created_at: string | null
          id: string
          images: string[] | null
          is_approved: boolean | null
          is_featured: boolean | null
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_responded_at?: string | null
          admin_response?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_responded_at?: string | null
          admin_response?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          length: number
          price_override_ngn: number | null
          product_id: string
          sku: string | null
          stock_quantity: number | null
          updated_at: string | null
          weight_grams: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          length: number
          price_override_ngn?: number | null
          product_id: string
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          weight_grams?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          length?: number
          price_override_ngn?: number | null
          product_id?: string
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_stock"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_backorder: boolean | null
          available_lengths: number[]
          base_price_gbp: number
          category: Database["public"]["Enums"]["hair_category"]
          compare_at_price_gbp: number | null
          cost_price_gbp: number | null
          created_at: string | null
          description: string | null
          draw_type: Database["public"]["Enums"]["draw_type"] | null
          features: string[] | null
          grade: Database["public"]["Enums"]["hair_grade"] | null
          grade_details: Json | null
          hls_output_key: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_bestseller: boolean | null
          is_featured: boolean | null
          is_new_arrival: boolean | null
          is_preorder_only: boolean | null
          length_price_modifiers: Json | null
          low_stock_threshold: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          origin: Database["public"]["Enums"]["hair_origin"]
          preorder_message: string | null
          published_at: string | null
          short_description: string | null
          slug: string
          stock_quantity: number | null
          texture: string
          thumbnail_url: string | null
          track_inventory: boolean | null
          transcoding_status: string | null
          updated_at: string | null
          video_url: string | null
          video_urls: string[] | null
        }
        Insert: {
          allow_backorder?: boolean | null
          available_lengths?: number[]
          base_price_gbp: number
          category: Database["public"]["Enums"]["hair_category"]
          compare_at_price_gbp?: number | null
          cost_price_gbp?: number | null
          created_at?: string | null
          description?: string | null
          draw_type?: Database["public"]["Enums"]["draw_type"] | null
          features?: string[] | null
          grade?: Database["public"]["Enums"]["hair_grade"] | null
          grade_details?: Json | null
          hls_output_key?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          is_preorder_only?: boolean | null
          length_price_modifiers?: Json | null
          low_stock_threshold?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          origin: Database["public"]["Enums"]["hair_origin"]
          preorder_message?: string | null
          published_at?: string | null
          short_description?: string | null
          slug: string
          stock_quantity?: number | null
          texture: string
          thumbnail_url?: string | null
          track_inventory?: boolean | null
          transcoding_status?: string | null
          updated_at?: string | null
          video_url?: string | null
          video_urls?: string[] | null
        }
        Update: {
          allow_backorder?: boolean | null
          available_lengths?: number[]
          base_price_gbp?: number
          category?: Database["public"]["Enums"]["hair_category"]
          compare_at_price_gbp?: number | null
          cost_price_gbp?: number | null
          created_at?: string | null
          description?: string | null
          draw_type?: Database["public"]["Enums"]["draw_type"] | null
          features?: string[] | null
          grade?: Database["public"]["Enums"]["hair_grade"] | null
          grade_details?: Json | null
          hls_output_key?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          is_preorder_only?: boolean | null
          length_price_modifiers?: Json | null
          low_stock_threshold?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          origin?: Database["public"]["Enums"]["hair_origin"]
          preorder_message?: string | null
          published_at?: string | null
          short_description?: string | null
          slug?: string
          stock_quantity?: number | null
          texture?: string
          thumbnail_url?: string | null
          track_inventory?: boolean | null
          transcoding_status?: string | null
          updated_at?: string | null
          video_url?: string | null
          video_urls?: string[] | null
        }
        Relationships: []
      }
      users: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string
          email_verified_at: string | null
          full_name: string
          id: string
          phone: string | null
          postal_code: string | null
          preferred_currency: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          email_verified_at?: string | null
          full_name: string
          id?: string
          phone?: string | null
          postal_code?: string | null
          preferred_currency?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          email_verified_at?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          postal_code?: string | null
          preferred_currency?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_order_summary: {
        Row: {
          avg_order_value: number | null
          delivered_orders: number | null
          order_date: string | null
          pending_orders: number | null
          total_orders: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      v_products_with_stock: {
        Row: {
          allow_backorder: boolean | null
          available_lengths: number[] | null
          base_price_gbp: number | null
          category: Database["public"]["Enums"]["hair_category"] | null
          compare_at_price_gbp: number | null
          cost_price_gbp: number | null
          created_at: string | null
          description: string | null
          draw_type: Database["public"]["Enums"]["draw_type"] | null
          features: string[] | null
          grade: Database["public"]["Enums"]["hair_grade"] | null
          grade_details: Json | null
          highest_price_gbp: number | null
          id: string | null
          images: string[] | null
          is_active: boolean | null
          is_bestseller: boolean | null
          is_featured: boolean | null
          is_new_arrival: boolean | null
          is_preorder_only: boolean | null
          length_price_modifiers: Json | null
          low_stock_threshold: number | null
          lowest_price_gbp: number | null
          meta_description: string | null
          meta_title: string | null
          name: string | null
          origin: Database["public"]["Enums"]["hair_origin"] | null
          preorder_message: string | null
          published_at: string | null
          short_description: string | null
          slug: string | null
          stock_quantity: number | null
          texture: string | null
          thumbnail_url: string | null
          total_stock: number | null
          track_inventory: boolean | null
          updated_at: string | null
          variant_count: number | null
          video_url: string | null
          video_urls: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_product_price: {
        Args: { p_length: number; p_product_id: string }
        Returns: number
      }
    }
    Enums: {
      draw_type: "SINGLE_DRAWN" | "DOUBLE_DRAWN" | "SUPER_DOUBLE_DRAWN"
      hair_category:
        | "BUNDLES"
        | "CLOSURE"
        | "FRONTAL"
        | "WIG"
        | "PONYTAIL"
        | "CLIP_INS"
      hair_grade: "GRADE_A" | "GRADE_B" | "GRADE_C" | "GRADE_D" | "GRADE_E"
      hair_origin:
        | "VIETNAM"
        | "PHILIPPINES"
        | "INDIA"
        | "BURMA"
        | "CAMBODIA"
        | "CHINA"
      hair_texture:
        | "STRAIGHT"
        | "BODY_WAVE"
        | "LOOSE_WAVE"
        | "DEEP_WAVE"
        | "WATER_WAVE"
        | "KINKY_CURLY"
        | "JERRY_CURL"
        | "LOOSE_DEEP"
        | "NATURAL_WAVE"
      order_status:
        | "PENDING"
        | "CONFIRMED"
        | "PROCESSING"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELLED"
        | "REFUNDED"
      order_type: "REGULAR" | "PRE_ORDER" | "WHOLESALE"
      user_role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      draw_type: ["SINGLE_DRAWN", "DOUBLE_DRAWN", "SUPER_DOUBLE_DRAWN"],
      hair_category: [
        "BUNDLES",
        "CLOSURE",
        "FRONTAL",
        "WIG",
        "PONYTAIL",
        "CLIP_INS",
      ],
      hair_grade: ["GRADE_A", "GRADE_B", "GRADE_C", "GRADE_D", "GRADE_E"],
      hair_origin: [
        "VIETNAM",
        "PHILIPPINES",
        "INDIA",
        "BURMA",
        "CAMBODIA",
        "CHINA",
      ],
      hair_texture: [
        "STRAIGHT",
        "BODY_WAVE",
        "LOOSE_WAVE",
        "DEEP_WAVE",
        "WATER_WAVE",
        "KINKY_CURLY",
        "JERRY_CURL",
        "LOOSE_DEEP",
        "NATURAL_WAVE",
      ],
      order_status: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
      ],
      order_type: ["REGULAR", "PRE_ORDER", "WHOLESALE"],
      user_role: ["CUSTOMER", "ADMIN", "SUPER_ADMIN"],
    },
  },
} as const
