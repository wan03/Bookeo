-- Add date_of_birth to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth date;

-- Add monthly_revenue_goal and flash sale fields to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS monthly_revenue_goal decimal(10, 2) DEFAULT 100000.00;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS flash_sale_active boolean DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS flash_sale_ends_at timestamptz;

-- Create Business Resources table
CREATE TABLE IF NOT EXISTS business_resources (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text NOT NULL, -- 'room', 'equipment', 'chair', etc.
    created_at timestamptz DEFAULT now()
);

-- Create Service Resources junction table
CREATE TABLE IF NOT EXISTS service_resources (
    service_id uuid REFERENCES services(id) ON DELETE CASCADE,
    resource_id uuid REFERENCES business_resources(id) ON DELETE CASCADE,
    PRIMARY KEY (service_id, resource_id)
);

-- Add resource_id to bookings (optional, as a booking might not need a specific resource or might need auto-assignment)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS resource_id uuid REFERENCES business_resources(id);

-- RLS Policies for new tables
ALTER TABLE business_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_resources ENABLE ROW LEVEL SECURITY;

-- Business Resources Policies
CREATE POLICY "Public resources are viewable by everyone" ON business_resources FOR SELECT USING (true);
CREATE POLICY "Owners can manage their resources" ON business_resources FOR ALL USING (
    auth.uid() IN (
        SELECT owner_id FROM businesses WHERE id = business_resources.business_id
    )
);

-- Service Resources Policies
CREATE POLICY "Public service resources are viewable by everyone" ON service_resources FOR SELECT USING (true);
CREATE POLICY "Owners can manage their service resources" ON service_resources FOR ALL USING (
    auth.uid() IN (
        SELECT owner_id FROM businesses WHERE id = (
            SELECT business_id FROM services WHERE id = service_resources.service_id
        )
    )
);
