import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Note: Supabase is not currently used in production.
// This client is created with placeholder values to avoid breaking the build.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          subscription_tier: string
          monthly_generations: number
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          subscription_tier?: string
          monthly_generations?: number
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          subscription_tier?: string
          monthly_generations?: number
        }
      }
      elements: {
        Row: {
          id: string
          user_id: string
          name: string
          image_url: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          image_url: string
          color: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          image_url?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      generations: {
        Row: {
          id: string
          user_id: string
          prompt: string
          generation_type: string
          dimensions: string
          image_url: string
          element_ids: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          generation_type: string
          dimensions: string
          image_url: string
          element_ids?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          generation_type?: string
          dimensions?: string
          image_url?: string
          element_ids?: string[]
          created_at?: string
        }
      }
    }
  }
}
