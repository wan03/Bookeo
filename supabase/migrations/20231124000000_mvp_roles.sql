-- Add 'influencer' to user_role enum
-- Note: This must be run separately if inside a transaction block in some environments, 
-- but Supabase SQL editor handles it.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'influencer';

-- RLS Policies for Businesses

-- Policy: Owners can update their own business
CREATE POLICY "Owners can update their own business"
ON businesses
FOR UPDATE
USING (auth.uid() = owner_id);

-- Policy: Owners can insert their own business
CREATE POLICY "Owners can insert their own business"
ON businesses
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- RLS Policies for Barter Offers

-- Enable RLS on barter_offers
ALTER TABLE barter_offers ENABLE ROW LEVEL SECURITY;

-- Policy: Public/Influencers can view active offers
CREATE POLICY "Anyone can view active offers"
ON barter_offers
FOR SELECT
USING (status = 'active');

-- Policy: Owners can manage their own offers
CREATE POLICY "Owners can manage their offers"
ON barter_offers
FOR ALL
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- RLS for Barter Applications
ALTER TABLE barter_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Influencers can view/create their own applications
CREATE POLICY "Influencers can manage own applications"
ON barter_applications
FOR ALL
USING (influencer_id = auth.uid());

-- Policy: Business owners can view applications for their offers
CREATE POLICY "Owners can view applications for their offers"
ON barter_applications
FOR SELECT
USING (
  offer_id IN (
    SELECT id FROM barter_offers 
    WHERE business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  )
);
