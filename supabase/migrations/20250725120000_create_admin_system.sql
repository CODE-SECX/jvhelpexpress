
-- Create admin credentials table
CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username_hash text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  salt text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin sessions table for secure session management
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text NOT NULL UNIQUE,
  admin_id uuid REFERENCES admin_credentials(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_accessed timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies (very restrictive)
CREATE POLICY "No public access to admin credentials"
  ON admin_credentials
  FOR ALL
  TO public
  USING (false);

CREATE POLICY "No public access to admin sessions"
  ON admin_sessions
  FOR ALL
  TO public
  USING (false);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_credentials_updated_at
    BEFORE UPDATE ON admin_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert the admin credentials (hashed)
-- Username: jvhelpV1ZkU2RHRlhORDA9 (base64 encoded)
-- Password: VTI1YVpsTkZWazFWUlVKQ1drY3hjR0pzUW1oak0wNHpZak5LYXc9PQ (base64 encoded)
INSERT INTO admin_credentials (username_hash, password_hash, salt) 
VALUES (
  encode(digest('jvhelpV1ZkU2RHRlhORDA9' || 'jvhelp_salt_2025', 'sha256'), 'hex'),
  encode(digest('VTI1YVpsTkZWazFWUlVKQ1drY3hjR0pzUW1oak0wNHpZak5LYXc9PQ' || 'jvhelp_salt_2025', 'sha256'), 'hex'),
  'jvhelp_salt_2025'
);
