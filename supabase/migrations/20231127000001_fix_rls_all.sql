-- Enable RLS on staff if not already enabled
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Staff Policies
CREATE POLICY "Public staff viewable" ON staff FOR SELECT USING (true);

CREATE POLICY "Owners can manage staff" ON staff FOR ALL USING (
    exists (
        select 1 from businesses
        where businesses.id = staff.business_id
        and businesses.owner_id = auth.uid()
    )
);

-- Services Policies (ensure owners can manage)
CREATE POLICY "Owners can manage services" ON services FOR ALL USING (
    exists (
        select 1 from businesses
        where businesses.id = services.business_id
        and businesses.owner_id = auth.uid()
    )
);

-- Ensure businesses update policy exists (might be missing or restrictive)
DROP POLICY IF EXISTS "Owners can update their own business" ON businesses;
CREATE POLICY "Owners can update their own business" ON businesses FOR UPDATE USING (auth.uid() = owner_id);
