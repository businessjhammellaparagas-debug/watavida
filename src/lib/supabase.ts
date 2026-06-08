import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Customer = {
  id: string;
  name: string;
  section: string;
  room_number?: string;
  loyalty_count: number;
  created_at: string;
};

export type Order = {
  id: string;
  customer_id: string;
  customer_name: string;
  room_number?: string;
  section: string;
  seller_name?: string;
  quantity: number;
  total_price: number;
  payment_method: string;
  payment_status: string;
  notes?: string;
  order_status: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  order_id: string;
  customer_id: string;
  sender_type: 'customer' | 'admin';
  message: string;
  created_at: string;
};
