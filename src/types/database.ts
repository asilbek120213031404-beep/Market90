/**
 * Supabase ma'lumotlar bazasi turlari.
 *
 * Bu fayl hozircha qo'lda yozilgan (koddagi so'rovlar asosida).
 * Haqiqiy sxemadan avtomatik yaratish uchun:
 *   npx supabase login
 *   npm run gen:types
 * Buyruq shu faylni to'liq qayta yozadi.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          role: "ega" | "pro_admin" | "admin" | "mehmon";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email?: string | null;
          role?: "ega" | "pro_admin" | "admin" | "mehmon";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          role?: "ega" | "pro_admin" | "admin" | "mehmon";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: number;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          category: string;
          image_url: string | null;
          cost_price: number;
          selling_price: number;
          created_at: string;
          updated_by: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          category: string;
          image_url?: string | null;
          cost_price: number;
          selling_price: number;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          category?: string;
          image_url?: string | null;
          cost_price?: number;
          selling_price?: number;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      products_public: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          category: string;
          image_url: string | null;
          selling_price: number;
          created_at: string;
          updated_by: string | null;
          updated_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      app_role: { Args: Record<PropertyKey, never>; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
