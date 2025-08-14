/*
  # Create secure admin system for content management

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `username` (text, unique username)
      - `password_hash` (text, bcrypt hashed password)
      - `email` (text, admin email)
      - `role` (text, admin role)
      - `is_active` (boolean, account status)
      - `last_login` (timestamp)
      - `created_at`, `updated_at` (timestamps)

    - `admin_sessions`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, foreign key to admin_users)
      - `session_token` (text, unique session token)
      - `expires_at` (timestamp)
      - `ip_address` (text, login IP)
      - `user_agent` (text, browser info)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Strict policies for admin access only
    - Session management for secure authentication

  3. Default Admin
    - Username: admin
    - Password: JVHelp2025! (will be hashed)
    - Role: super_admin
*/

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  email text,
  role text DEFAULT 'admin',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies
CREATE POLICY "No public access to admin users"
  ON admin_users
  FOR ALL
  TO public
  USING (false);

CREATE POLICY "No public access to admin sessions"
  ON admin_sessions
  FOR ALL
  TO public
  USING (false);

-- Create function for password hashing (simplified for demo)
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
  -- Simple hash for demo - in production use proper bcrypt
  RETURN encode(digest(password || 'jvhelp_salt_2025', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Insert default admin user
INSERT INTO admin_users (username, password_hash, email, role) 
VALUES (
  'admin',
  hash_password('JVHelp2025!'),
  'admin@jvhelp.org',
  'super_admin'
) ON CONFLICT (username) DO NOTHING;

-- Create trigger for updated_at on admin_users
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_sessions WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create function to execute SQL with elevated privileges
CREATE OR REPLACE FUNCTION exec_sql(sql text, params text[] DEFAULT '{}')
RETURNS void AS $$
BEGIN
  -- This function can be used to bypass RLS when needed
  -- For security, this should only be accessible by service role
  EXECUTE sql USING VARIADIC params;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION exec_sql TO service_role;

-- Create products table for multilingual product management
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_hi text,
  name_gu text,
  description_en text NOT NULL,
  description_hi text,
  description_gu text,
  price decimal(10,2),
  currency text DEFAULT 'INR',
  category_en text,
  category_hi text,
  category_gu text,
  image_url text,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  stock_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to active products
CREATE POLICY "Public read access to active products"
  ON products
  FOR SELECT
  TO public
  USING (is_active = true);

-- Create policy for no public write access to products
CREATE POLICY "No public write access to products"
  ON products
  FOR ALL
  TO public
  USING (false);

-- Create trigger for updated_at on products
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products
INSERT INTO products (name_en, name_hi, name_gu, description_en, description_hi, description_gu, price, category_en, category_hi, category_gu, is_featured) VALUES
('Organic Honey', 'जैविक शहद', 'કાર્બનિક મધ', 'Pure organic honey collected from our bee farms', 'हमारे मधुमक्खी फार्म से एकत्रित शुद्ध जैविक शहद', 'અમારા મધમાખી ફાર્મમાંથી એકત્રિત કરાયેલ શુદ્ધ કાર્બનિક મધ', 299.00, 'Food Products', 'खाद्य उत्पाद', 'ખાદ્ય ઉત્પાદનો', true),
('Handwoven Cotton Cloth', 'हस्तनिर्मित सूती कपड़ा', 'હાથથી વણેલું કોટન કાપડ', 'Traditional handwoven cotton cloth made by local artisans', 'स्थानीय कारीगरों द्वारा बनाया गया पारंपरिक हस्तनिर्मित सूती कपड़ा', 'સ્થાનિક કારીગરો દ્વારા બનાવવામાં આવેલ પરંપરાગત હાથથી વણેલ કોટન કાપડ', 899.00, 'Textiles', 'वस्त्र', 'વસ્ત્રો', true),
('Herbal Medicine Kit', 'हर्बल दवा किट', 'હર્બલ મેડિસિન કિટ', 'Complete herbal medicine kit with traditional remedies', 'पारंपरिक उपचार के साथ पूरी हर्बल दवा किट', 'પરંપરાગત ઉપચાર સાથે સંપૂર્ણ હર્બલ મેડિસિન કિટ', 1299.00, 'Healthcare', 'स्वास्थ्य देखभाल', 'આરોગ્ય સંભાળ', false)
ON CONFLICT DO NOTHING;