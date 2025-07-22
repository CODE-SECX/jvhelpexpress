/*
  # Create activities gallery table

  1. New Tables
    - `activities_gallery`
      - `id` (uuid, primary key)
      - `title_en`, `title_hi`, `title_gu` (text, multilingual titles)
      - `description_en`, `description_hi`, `description_gu` (text, multilingual descriptions)
      - `image` (text, main image URL)
      - `image_lm_1` through `image_lm_5` (text, additional image URLs)
      - `image_LM_1` through `image_LM_5` (text, additional image URLs - alternate naming)
      - `category_en`, `category_hi`, `category_gu` (text, multilingual categories)
      - `date` (date, activity date)
      - `quote_en`, `quote_hi`, `quote_gu` (text, multilingual quotes)
      - `display_order` (integer, for ordering)
      - `is_active` (boolean, to enable/disable activities)
      - `created_at`, `updated_at` (timestamps)

  2. Security
    - Enable RLS on `activities_gallery` table
    - Add policy for public read access to active items
    - Add policy for authenticated users to manage

  3. Sample Data
    - Insert sample gallery items with multiple images
*/

-- Create the activities gallery table
CREATE TABLE IF NOT EXISTS activities_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_hi text NOT NULL,
  title_gu text NOT NULL,
  description_en text NOT NULL,
  description_hi text NOT NULL,
  description_gu text NOT NULL,
  image text NOT NULL,
  image_lm_1 text,
  image_lm_2 text,
  image_lm_3 text,
  image_lm_4 text,
  image_lm_5 text,
  image_LM_1 text,
  image_LM_2 text,
  image_LM_3 text,
  image_LM_4 text,
  image_LM_5 text,
  category_en text NOT NULL DEFAULT 'GENERAL',
  category_hi text NOT NULL DEFAULT 'सामान्य',
  category_gu text NOT NULL DEFAULT 'સામાન્ય',
  date date DEFAULT CURRENT_DATE,
  quote_en text,
  quote_hi text,
  quote_gu text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE activities_gallery ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to active gallery items"
  ON activities_gallery
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage gallery items"
  ON activities_gallery
  FOR ALL
  TO authenticated
  USING (true);

-- Insert sample gallery data
INSERT INTO activities_gallery (
  title_en, title_hi, title_gu,
  description_en, description_hi, description_gu,
  image,
  image_lm_1, image_lm_2, image_lm_3, image_lm_4,
  category_en, category_hi, category_gu,
  date,
  quote_en, quote_hi, quote_gu,
  display_order
) VALUES 
(
  'Winter Blanket Distribution',
  'सर्दी में कंबल वितरण',
  'શિયાળામાં ધાબળાનું વિતરણ',
  'Our team distributed warm blankets to underprivileged families during the harsh winter months. This initiative helped over 500 families stay warm and comfortable during the cold season.',
  'हमारी टीम ने कठोर सर्दी के महीनों में वंचित परिवारों को गर्म कंबल वितरित किए। इस पहल से 500 से अधिक परिवारों को ठंड के मौसम में गर्म और आरामदायक रहने में मदद मिली।',
  'અમારી ટીમે કઠોર શિયાળાના મહિનાઓ દરમિયાન વંચિત પરિવારોને ગરમ ધાબળાનું વિતરણ કર્યું. આ પહેલથી 500 થી વધુ પરિવારોને ઠંડીની મોસમમાં ગરમ અને આરામદાયક રહેવામાં મદદ મળી.',
  'https://images.pexels.com/photos/6995247/pexels-photo-6995247.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6995248/pexels-photo-6995248.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6995249/pexels-photo-6995249.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6995250/pexels-photo-6995250.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6995251/pexels-photo-6995251.jpeg?auto=compress&cs=tinysrgb&w=800',
  'WELFARE', 'कल्याण', 'કલ્યાણ',
  '2024-01-15',
  'This initiative brought warmth not just to their bodies, but to their hearts as well.',
  'इस पहल ने न केवल उनके शरीर में बल्कि उनके दिलों में भी गर्माहट लाई।',
  'આ પહેલે માત્ર તેમના શરીરમાં જ નહીં, પરંતુ તેમના હૃદયમાં પણ હૂંફ લાવી.',
  1
),
(
  'Educational Support Program',
  'शैक्षिक सहायता कार्यक्रम',
  'શૈક્ષણિક સહાય કાર્યક્રમ',
  'We provided free notebooks, stationery, and educational materials to children from low-income families. This program has helped over 300 students continue their education without financial burden.',
  'हमने कम आय वाले परिवारों के बच्चों को मुफ्त नोटबुक, स्टेशनरी और शैक्षिक सामग्री प्रदान की। इस कार्यक्रम ने 300 से अधिक छात्रों को बिना वित्तीय बोझ के अपनी शिक्षा जारी रखने में मदद की है।',
  'અમે ઓછી આવક ધરાવતા પરિવારોના બાળકોને મફત નોટબુક, સ્ટેશનરી અને શૈક્ષણિક સામગ્રી પ્રદાન કરી. આ કાર્યક્રમે 300 થી વધુ વિદ્યાર્થીઓને નાણાકીય બોજ વિના તેમનું શિક્ષણ ચાલુ રાખવામાં મદદ કરી છે.',
  'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/8613090/pexels-photo-8613090.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/8613091/pexels-photo-8613091.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/8613092/pexels-photo-8613092.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/8613093/pexels-photo-8613093.jpeg?auto=compress&cs=tinysrgb&w=800',
  'EDUCATION', 'शिक्षा', 'શિક્ષણ',
  '2024-02-20',
  'Education is the most powerful weapon which you can use to change the world.',
  'शिक्षा सबसे शक्तिशाली हथियार है जिसका उपयोग आप दुनिया को बदलने के लिए कर सकते हैं।',
  'શિક્ષણ એ સૌથી શક્તિશાળી હથિયાર છે જેનો ઉપયોગ તમે વિશ્વને બદલવા માટે કરી શકો છો.',
  2
),
(
  'Animal Rescue Mission',
  'पशु बचाव मिशन',
  'પ્રાણી બચાવ મિશન',
  'Our dedicated team rescued and rehabilitated injured animals and birds. We have successfully rescued over 50 animals and provided them with proper medical care and safe shelter.',
  'हमारी समर्पित टीम ने घायल जानवरों और पक्षियों को बचाया और पुनर्वासित किया। हमने सफलतापूर्वक 50 से अधिक जानवरों को बचाया है और उन्हें उचित चिकित्सा देखभाल और सुरक्षित आश्रय प्रदान किया है।',
  'અમારી સમર્પિત ટીમે ઘાયલ પ્રાણીઓ અને પક્ષીઓને બચાવ્યા અને પુનર્વસન કર્યું. અમે સફળતાપૂર્વક 50 થી વધુ પ્રાણીઓને બચાવ્યા છે અને તેમને યોગ્ય તબીબી સંભાળ અને સુરક્ષિત આશ્રય પ્રદાન કર્યો છે.',
  'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1851165/pexels-photo-1851165.jpeg?auto=compress&cs=tinysrgb&w=800',
  'RESCUE', 'बचाव', 'બચાવ',
  '2024-03-10',
  'Every animal deserves a chance at life and happiness.',
  'हर जानवर जीवन और खुशी का मौका पाने का हकदार है।',
  'દરેક પ્રાણી જીવન અને ખુશીની તક મેળવવાને પાત્ર છે.',
  3
);

-- Create trigger for updated_at
CREATE TRIGGER update_activities_gallery_updated_at
    BEFORE UPDATE ON activities_gallery
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();