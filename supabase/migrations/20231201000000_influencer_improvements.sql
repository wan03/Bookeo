-- Influencer Improvements Migration

-- 1. Update barter_offers table
CREATE TYPE audience_type AS ENUM ('universal', 'influencer_only');

ALTER TABLE barter_offers 
ADD COLUMN audience_type audience_type DEFAULT 'influencer_only',
ADD COLUMN category_tags text[] DEFAULT '{}',
ADD COLUMN max_applications int DEFAULT 50,
ADD COLUMN expires_at timestamptz;

CREATE INDEX idx_barter_offers_audience ON barter_offers(audience_type);

-- 2. Create influencer_profiles table
CREATE TABLE influencer_profiles (
  id uuid REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  instagram_handle text,
  tiktok_handle text,
  instagram_followers int DEFAULT 0,
  tiktok_followers int DEFAULT 0,
  is_verified boolean DEFAULT false,
  reputation_score int DEFAULT 0,
  badges text[] DEFAULT '{}',
  niche_tags text[] DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE influencer_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access
CREATE POLICY "Influencer profiles are viewable by everyone" 
ON influencer_profiles FOR SELECT 
USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own influencer profile" 
ON influencer_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own influencer profile" 
ON influencer_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. Create content_submissions table
CREATE TYPE content_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'posted');

CREATE TABLE content_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid REFERENCES barter_applications(id) ON DELETE CASCADE,
  influencer_id uuid REFERENCES profiles(id),
  business_id uuid REFERENCES businesses(id),
  content_url text,
  platform text,
  status content_status DEFAULT 'draft',
  feedback text,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Influencers can view their own submissions
CREATE POLICY "Influencers can view own submissions" 
ON content_submissions FOR SELECT 
USING (auth.uid() = influencer_id);

-- Policy: Businesses can view submissions for their offers
CREATE POLICY "Businesses can view submissions for their offers" 
ON content_submissions FOR SELECT 
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Policy: Influencers can create submissions
CREATE POLICY "Influencers can create submissions" 
ON content_submissions FOR INSERT 
WITH CHECK (auth.uid() = influencer_id);

-- Policy: Influencers can update their own submissions (if not approved)
CREATE POLICY "Influencers can update own submissions" 
ON content_submissions FOR UPDATE 
USING (auth.uid() = influencer_id);

-- Policy: Businesses can update submissions (for approval/feedback)
CREATE POLICY "Businesses can update submissions" 
ON content_submissions FOR UPDATE 
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);
