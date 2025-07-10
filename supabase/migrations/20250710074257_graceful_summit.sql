/*
  # Create multilingual hero content table

  1. New Tables
    - `hero_content`
      - `id` (uuid, primary key)
      - `title_en` (text, English title)
      - `title_hi` (text, Hindi title)
      - `title_gu` (text, Gujarati title)
      - `subtitle_en` (text, English subtitle)
      - `subtitle_hi` (text, Hindi subtitle)
      - `subtitle_gu` (text, Gujarati subtitle)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `hero_content` table
    - Add policy for public read access
    - Add policy for authenticated users to update

  3. Sample Data
    - Insert default content in all three languages
*/

-- Create the multilingual hero content table
CREATE TABLE IF NOT EXISTS hero_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL DEFAULT 'JV HELP',
  title_hi text NOT NULL DEFAULT 'जेवी_हेल्प',
  title_gu text NOT NULL DEFAULT 'જેવી_હેલ્પ',
  subtitle_en text NOT NULL DEFAULT 'Heal Help Protect',
  subtitle_hi text NOT NULL DEFAULT 'हील हेल्प प्रोटेक्ट',
  subtitle_gu text NOT NULL DEFAULT 'હીલ હેલ્પ પ્રોટેક્ટ',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access"
  ON hero_content
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to update"
  ON hero_content
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert"
  ON hero_content
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default multilingual content
INSERT INTO hero_content (
  title_en, title_hi, title_gu,
  subtitle_en, subtitle_hi, subtitle_gu
) VALUES (
  'JV HELP',
  'जेवी_हेल्प', 
  'જેવી_હેલ્પ',
  'Heal Help Protect',
  'हील हेल्प प्रोटेक्ट',
  'હીલ હેલ્પ પ્રોટેક્ટ'
) ON CONFLICT DO NOTHING;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_hero_content_updated_at
    BEFORE UPDATE ON hero_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();