-- Create function to increment loyalty count
CREATE OR REPLACE FUNCTION increment_loyalty(cust_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE customers
  SET loyalty_count = loyalty_count + 1
  WHERE id = cust_id;
END;
$$ LANGUAGE plpgsql;
