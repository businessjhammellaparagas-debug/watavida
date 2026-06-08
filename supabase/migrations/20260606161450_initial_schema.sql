-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  section TEXT NOT NULL,
  room_number TEXT,
  loyalty_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, section)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  room_number TEXT,
  section TEXT NOT NULL,
  seller_name TEXT,
  quantity INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'To Pay',
  notes TEXT,
  order_status TEXT DEFAULT 'To Pay',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Customers policies (public read for login, anyone can view)
CREATE POLICY "select_customers" ON customers FOR SELECT
  TO public USING (true);

CREATE POLICY "insert_customers" ON customers FOR INSERT
  TO public WITH CHECK (true);

-- Orders policies (public read, anyone can insert)
CREATE POLICY "select_orders" ON orders FOR SELECT
  TO public USING (true);

CREATE POLICY "insert_orders" ON orders FOR INSERT
  TO public WITH CHECK (true);

CREATE POLICY "update_orders" ON orders FOR UPDATE
  TO public USING (true) WITH CHECK (true);

-- Messages policies (public)
CREATE POLICY "select_messages" ON messages FOR SELECT
  TO public USING (true);

CREATE POLICY "insert_messages" ON messages FOR INSERT
  TO public WITH CHECK (true);
