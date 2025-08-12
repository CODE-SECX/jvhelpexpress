
/*
  # Create user thoughts table

  1. New Tables
    - `user_thoughts`
      - `id` (uuid, primary key)
      - `name` (text, optional - for anonymity)
      - `contact_no` (text, optional - for anonymity)
      - `thought` (text, required - the main thought/feedback)
      - `language` (text, language in which thought was submitted)
      - `is_anonymous` (boolean, whether user chose to be anonymous)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_thoughts` table
    - Add policy for public read access
    - Add policy for public insert access
*/

-- Create the user thoughts table
CREATE TABLE IF NOT EXISTS user_thoughts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  contact_no text,
  thought text NOT NULL,
  language text DEFAULT 'en',
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_thoughts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to thoughts"
  ON user_thoughts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to thoughts"
  ON user_thoughts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage thoughts"
  ON user_thoughts
  FOR ALL
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_user_thoughts_updated_at
    BEFORE UPDATE ON user_thoughts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
