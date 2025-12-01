# Database Schema Design

## Core Tables

### `profiles`
- `id` (uuid, PK, refs auth.users)
- `email` (text)
- `full_name` (text)
- `phone_number` (text)
- `avatar_url` (text)
- `role` (enum: 'consumer', 'business_owner', 'staff', 'admin')
- `created_at` (timestamptz)

### `businesses`
- `id` (uuid, PK)
- `owner_id` (uuid, refs profiles.id)
- `name` (text)
- `slug` (text, unique)
- `description` (text)
- `address` (text)
- `coordinates` (geography point)
- `category` (enum: 'barber', 'salon', 'spa', etc.)
- `is_verified` (boolean)
- `has_generator` (boolean) -- "Planta Full"

### `services`
- `id` (uuid, PK)
- `business_id` (uuid, refs businesses.id)
- `name` (text)
- `description` (text)
- `price` (decimal)
- `duration_minutes` (int)
- `is_active` (boolean)
- `discount_ends_at` (timestamptz) -- Flash Deal

### `staff`
- `id` (uuid, PK)
- `business_id` (uuid, refs businesses.id)
- `profile_id` (uuid, refs profiles.id, nullable - staff might not have account initially)
- `name` (text)
- `specialties` (text[])

### `bookings`
- `id` (uuid, PK)
- `business_id` (uuid, refs businesses.id)
- `customer_id` (uuid, refs profiles.id)
- `service_id` (uuid, refs services.id)
- `staff_id` (uuid, refs staff.id)
- `start_time` (timestamptz)
- `end_time` (timestamptz)
- `status` (enum: 'pending', 'confirmed', 'completed', 'cancelled', 'no_show')
- `payment_status` (enum: 'unpaid', 'paid', 'deposit_paid')

### `reviews`
- `id` (uuid, PK)
- `booking_id` (uuid, refs bookings.id)
- `rating` (int, 1-5)
- `comment` (text)
- `video_url` (text, nullable)
- `audio_url` (text, nullable) -- Voice Note
- `is_verified_purchase` (boolean, default true)

## Marketing Automation

### `marketing_configs`
- `id` (uuid, PK)
- `business_id` (uuid, refs businesses.id)
- `enable_sms_reminders` (boolean)
- `enable_whatsapp_reviews` (boolean)
- `reminder_hours_before` (int)
- `loyalty_program_enabled` (boolean)

### `marketing_campaigns`
- `id` (uuid, PK)
- `business_id` (uuid)
- `name` (text)
- `type` (enum: 'sms', 'email', 'whatsapp')
- `trigger_event` (enum: 'booking_completed', 'birthday', 'inactive_30d', 'manual_blast')
- `trigger_condition` (jsonb) -- e.g. {"days_inactive": 30}
- `template_content` (text)
- `is_active` (boolean)

## Influencer / Barter System

### `barter_offers`
- `id` (uuid, PK)
- `business_id` (uuid, refs businesses.id)
- `service_id` (uuid, refs services.id)
- `description` (text)
- `required_social_score` (int)
- `status` (enum: 'active', 'filled', 'expired')

### `barter_applications`
- `id` (uuid, PK)
- `offer_id` (uuid, refs barter_offers.id)
- `influencer_id` (uuid, refs profiles.id)
- `status` (enum: 'pending', 'approved', 'rejected', 'completed')
- `review_video_url` (text) -- Mandatory for completion
