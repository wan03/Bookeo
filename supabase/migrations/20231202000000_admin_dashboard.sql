-- Admin Dashboard Migration
-- This migration adds admin-specific policies, views, and helper functions

-- 1. Add admin-specific RLS policies

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin can update any profile
CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin can view all businesses
CREATE POLICY "Admins can view all businesses"
ON businesses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin can update any business
CREATE POLICY "Admins can update any business"
ON businesses FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin can view all bookings
CREATE POLICY "Admins can view all bookings"
ON bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin can update any booking
CREATE POLICY "Admins can update any booking"
ON bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin can view all barter offers
CREATE POLICY "Admins can view all barter offers"
ON barter_offers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin can view all barter applications
CREATE POLICY "Admins can view all barter applications"
ON barter_applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin can update barter applications
CREATE POLICY "Admins can update barter applications"
ON barter_applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 2. Create materialized view for dashboard stats (for performance)
CREATE MATERIALIZED VIEW admin_dashboard_stats AS
SELECT
  -- Platform Health
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM profiles WHERE role = 'business_owner') as total_business_owners,
  (SELECT COUNT(*) FROM businesses) as total_businesses,
  (SELECT COUNT(*) FROM businesses WHERE is_verified = true) as verified_businesses,
  (SELECT COUNT(*) FROM businesses WHERE is_verified = false) as pending_verifications,
  
  -- Booking Metrics
  (SELECT COUNT(*) FROM bookings) as total_bookings,
  (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
  (SELECT COUNT(*) FROM bookings WHERE status = 'cancelled') as cancelled_bookings,
  (SELECT COUNT(*) FROM bookings WHERE created_at >= NOW() - INTERVAL '30 days') as bookings_30d,
  (SELECT COALESCE(SUM(price), 0) FROM bookings WHERE status = 'completed') as total_revenue,
  (SELECT COALESCE(SUM(price), 0) FROM bookings WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '30 days') as revenue_30d,
  
  -- Influencer Metrics
  (SELECT COUNT(*) FROM barter_offers) as total_barter_offers,
  (SELECT COUNT(*) FROM barter_offers WHERE status = 'active') as active_barter_offers,
  (SELECT COUNT(*) FROM barter_applications) as total_barter_applications,
  (SELECT COUNT(*) FROM barter_applications WHERE status = 'pending') as pending_barter_applications,
  (SELECT COUNT(*) FROM content_submissions) as total_content_submissions,
  (SELECT COUNT(*) FROM content_submissions WHERE status = 'approved') as approved_content_submissions,
  
  -- Reviews
  (SELECT COUNT(*) FROM reviews) as total_reviews,
  (SELECT COALESCE(AVG(rating), 0) FROM reviews) as average_rating,
  
  -- Last updated timestamp
  NOW() as last_updated;

-- Create index for faster refresh
CREATE UNIQUE INDEX ON admin_dashboard_stats (last_updated);

-- Function to refresh stats (can be called manually or via cron)
CREATE OR REPLACE FUNCTION refresh_admin_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY admin_dashboard_stats;
END;
$$;

-- 3. Create view for recent activity feed
CREATE OR REPLACE VIEW admin_recent_activity AS
SELECT 
  'user_signup' as activity_type,
  p.id as entity_id,
  p.full_name as entity_name,
  p.created_at as timestamp,
  jsonb_build_object('email', p.email, 'role', p.role) as metadata
FROM profiles p
WHERE p.created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
  'business_created' as activity_type,
  b.id as entity_id,
  b.name as entity_name,
  b.created_at as timestamp,
  jsonb_build_object('category', b.category, 'is_verified', b.is_verified) as metadata
FROM businesses b
WHERE b.created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
  'booking_created' as activity_type,
  bk.id as entity_id,
  CONCAT('Booking #', SUBSTRING(bk.id::text, 1, 8)) as entity_name,
  bk.created_at as timestamp,
  jsonb_build_object('status', bk.status, 'price', bk.price) as metadata
FROM bookings bk
WHERE bk.created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
  'review_posted' as activity_type,
  r.id as entity_id,
  CONCAT('Review by ', p.full_name) as entity_name,
  r.created_at as timestamp,
  jsonb_build_object('rating', r.rating, 'business_id', r.business_id) as metadata
FROM reviews r
JOIN profiles p ON r.user_id = p.id
WHERE r.created_at >= NOW() - INTERVAL '7 days'

ORDER BY timestamp DESC
LIMIT 50;

-- 4. Create function to get user activity history
CREATE OR REPLACE FUNCTION get_user_activity(user_uuid UUID)
RETURNS TABLE (
  activity_type TEXT,
  details JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'booking'::TEXT as activity_type,
    jsonb_build_object(
      'id', b.id,
      'business_name', bus.name,
      'service_name', s.name,
      'status', b.status,
      'price', b.price,
      'start_time', b.start_time
    ) as details,
    b.created_at
  FROM bookings b
  LEFT JOIN businesses bus ON b.business_id = bus.id
  LEFT JOIN services s ON b.service_id = s.id
  WHERE b.customer_id = user_uuid
  
  UNION ALL
  
  SELECT 
    'review'::TEXT as activity_type,
    jsonb_build_object(
      'id', r.id,
      'business_name', bus.name,
      'rating', r.rating,
      'comment', r.comment
    ) as details,
    r.created_at
  FROM reviews r
  LEFT JOIN businesses bus ON r.business_id = bus.id
  WHERE r.user_id = user_uuid
  
  UNION ALL
  
  SELECT 
    'barter_application'::TEXT as activity_type,
    jsonb_build_object(
      'id', ba.id,
      'offer_id', ba.offer_id,
      'status', ba.status
    ) as details,
    ba.created_at
  FROM barter_applications ba
  WHERE ba.influencer_id = user_uuid
  
  ORDER BY created_at DESC
  LIMIT 100;
END;
$$;

-- 5. Add admin_notes table for tracking admin actions
CREATE TABLE admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id),
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_entity ON admin_actions(entity_type, entity_id);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at DESC);

-- Enable RLS on admin_actions
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin actions
CREATE POLICY "Admins can view admin actions"
ON admin_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can insert admin actions
CREATE POLICY "Admins can insert admin actions"
ON admin_actions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_action_id UUID;
BEGIN
  INSERT INTO admin_actions (admin_id, action_type, entity_type, entity_id, details)
  VALUES (auth.uid(), p_action_type, p_entity_type, p_entity_id, p_details)
  RETURNING id INTO v_action_id;
  
  RETURN v_action_id;
END;
$$;

-- Initial refresh of stats
SELECT refresh_admin_stats();
