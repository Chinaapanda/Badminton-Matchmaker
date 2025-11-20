// This file defines the TypeScript types for our Supabase database tables

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          role: 'user' | 'admin';
          is_banned: boolean;
          elo: number;
          wins: number;
          losses: number;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          role?: 'user' | 'admin';
          is_banned?: boolean;
          elo?: number;
          wins?: number;
          losses?: number;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          role?: 'user' | 'admin';
          is_banned?: boolean;
          elo?: number;
          wins?: number;
          losses?: number;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          name: string;
          elo: number;
          wins: number;
          losses: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          elo?: number;
          wins?: number;
          losses?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          elo?: number;
          wins?: number;
          losses?: number;
          created_by?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
