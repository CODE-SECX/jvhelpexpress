/*
  # Create multilingual activities table

  1. New Tables
    - `activities`
      - `id` (uuid, primary key)
      - `title_en`, `title_hi`, `title_gu` (text, activity titles)
      - `description_en`, `description_hi`, `description_gu` (text, descriptions)
      - `icon_url` (text, icon/image URL)
      - `category` (text, activity category)
      - `display_order` (integer, for ordering)
      - `is_active` (boolean, to enable/disable activities)
      - `created_at`, `updated_at` (timestamps)

  2. Security
    - Enable RLS on `activities` table
    - Add policy for public read access
    - Add policy for authenticated users to manage

  3. Sample Data
    - Insert all current activities with multilingual content
*/

-- Create the multilingual activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_hi text NOT NULL,
  title_gu text NOT NULL,
  description_en text NOT NULL,
  description_hi text NOT NULL,
  description_gu text NOT NULL,
  icon_url text,
  category text DEFAULT 'general',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to active activities"
  ON activities
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage activities"
  ON activities
  FOR ALL
  TO authenticated
  USING (true);

-- Insert sample multilingual activities
INSERT INTO activities (
  title_en, title_hi, title_gu,
  description_en, description_hi, description_gu,
  category, display_order
) VALUES 
(
  'Winter Care',
  'सर्दी की देखभाल',
  'શિયાળાની સંભાળ',
  'Distribution of sweaters and blankets to underprivileged children during the winter season.',
  'सर्दी के मौसम में वंचित बच्चों को स्वेटर और कंबल का वितरण।',
  'શિયાળાની ઋતુ દરમિયાન વંચિત બાળકોને સ્વેટર અને ધાબળાનું વિતરણ.',
  'welfare', 1
),
(
  'Festival Joy',
  'त्योहार की खुशी',
  'તહેવારની ખુશી',
  'Distribution of sweets and snacks to children during the Diwali festival.',
  'दिवाली त्योहार के दौरान बच्चों को मिठाई और नाश्ते का वितरण।',
  'દિવાળી તહેવાર દરમિયાન બાળકોને મીઠાઈ અને નાસ્તાનું વિતરણ.',
  'festival', 2
),
(
  'Animal Welfare',
  'पशु कल्याण',
  'પશુ કલ્યાણ',
  'Free distribution of water bowls for animals and birds during the summer to ensure they stay hydrated.',
  'गर्मियों के दौरान जानवरों और पक्षियों को हाइड्रेटेड रखने के लिए पानी के कटोरे का मुफ्त वितरण।',
  'ઉનાળા દરમિયાન પ્રાણીઓ અને પક્ષીઓને હાઇડ્રેટેડ રાખવા માટે પાણીના વાટકાનું મફત વિતરણ.',
  'animal', 3
),
(
  'Wildlife Conservation',
  'वन्यजीव संरक्षण',
  'વન્યજીવન સંરક્ષણ',
  'Free distribution of birdhouses for sparrows to encourage wildlife conservation.',
  'वन्यजीव संरक्षण को प्रोत्साहित करने के लिए गौरैया के लिए पक्षीघरों का मुफ्त वितरण।',
  'વન્યજીવન સંરક્ષણને પ્રોત્સાહન આપવા માટે ચકલીઓ માટે પક્ષીઘરનું મફત વિતરણ.',
  'conservation', 4
),
(
  'Daily Feeding',
  'दैनिक भोजन',
  'રોજનું ખવડાવવું',
  'Daily feeding of grains to birds.',
  'पक्षियों को अनाज का दैनिक खिलाना।',
  'પક્ષીઓને અનાજનું દૈનિક ખવડાવવું.',
  'feeding', 5
),
(
  'Educational Support',
  'शैक्षिक सहायता',
  'શૈક્ષણિક સહાય',
  'Provision of free notebooks to underprivileged children in need of educational support.',
  'शैक्षिक सहायता की आवश्यकता वाले वंचित बच्चों को मुफ्त नोटबुक का प्रावधान।',
  'શૈક્ષણિક સહાયની જરૂર હોય તેવા વંચિત બાળકોને મફત નોટબુકની જોગવાઈ.',
  'education', 6
),
(
  'Animal Rescue',
  'पशु बचाव',
  'પશુ બચાવ',
  'Rescue and safe relocation of animals, birds, and snakes in distress.',
  'संकटग्रस्त जानवरों, पक्षियों और सांपों का बचाव और सुरक्षित पुनर्स्थापना।',
  'સંકટમાં પડેલા પ્રાણીઓ, પક્ષીઓ અને સાપનું બચાવ અને સુરક્ષિત પુનઃસ્થાપન.',
  'rescue', 7
),
(
  'Year-Round Support',
  'वर्ष भर सहायता',
  'વર્ષભર સહાય',
  '365-day distribution of birdhouses, bird feeders, and water bowls to promote animal welfare.',
  'पशु कल्याण को बढ़ावा देने के लिए पक्षीघरों, पक्षी फीडर और पानी के कटोरे का 365 दिन वितरण।',
  'પશુ કલ્યાણને પ્રોત્સાહન આપવા માટે પક્ષીઘર, પક્ષી ફીડર અને પાણીના વાટકાનું 365-દિવસનું વિતરણ.',
  'support', 8
);

-- Create trigger for updated_at
CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();