-- Fix RLS recursion on profiles for admin
-- Create a helper function that uses SECURITY DEFINER to bypass RLS

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all businesses" ON businesses;
DROP POLICY IF EXISTS "Admins can update any business" ON businesses;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update any booking" ON bookings;
DROP POLICY IF EXISTS "Admins can view all barter offers" ON barter_offers;
DROP POLICY IF EXISTS "Admins can view all barter applications" ON barter_applications;
DROP POLICY IF EXISTS "Admins can update barter applications" ON barter_applications;
DROP POLICY IF EXISTS "Admins can view admin actions" ON admin_actions;
DROP POLICY IF EXISTS "Admins can insert admin actions" ON admin_actions;

-- Create a function to check if current user is admin (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Now recreate policies using the function

-- Profiles policies
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (is_admin() OR id = auth.uid());

CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
USING (is_admin() OR id = auth.uid());

-- Businesses policies
CREATE POLICY "Admins can view all businesses"
ON businesses FOR SELECT
USING (is_admin() OR true); -- businesses are public

CREATE POLICY "Admins can update any business"
ON businesses FOR UPDATE
USING (is_admin() OR owner_id = auth.uid());

-- Bookings policies
CREATE POLICY "Admins can view all bookings"
ON bookings FOR SELECT
USING (
  is_admin()
  OR customer_id = auth.uid()
  OR business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
);

CREATE POLICY "Admins can update any booking"
ON bookings FOR UPDATE
USING (
  is_admin()
  OR customer_id = auth.uid()
  OR business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
);

-- Barter offers policies
CREATE POLICY "Admins can view all barter offers"
ON barter_offers FOR SELECT
USING (is_admin() OR true); -- public

-- Barter applications policies
CREATE POLICY "Admins can view all barter applications"
ON barter_applications FOR SELECT
USING (
  is_admin()
  OR influencer_id = auth.uid()
  OR offer_id IN (SELECT id FROM barter_offers WHERE business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
);

CREATE POLICY "Admins can update barter applications"
ON barter_applications FOR UPDATE
USING (
  is_admin()
  OR influencer_id = auth.uid()
  OR offer_id IN (SELECT id FROM barter_offers WHERE business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
);

-- Admin actions policies
CREATE POLICY "Admins can view admin actions"
ON admin_actions FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can insert admin actions"
ON admin_actions FOR INSERT
WITH CHECK (is_admin());
