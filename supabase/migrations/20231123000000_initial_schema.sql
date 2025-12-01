-- Enable PostGIS for coordinates
create extension if not exists postgis;

-- Create Profiles table
create type user_role as enum ('consumer', 'business_owner', 'staff', 'admin');

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  phone_number text,
  avatar_url text,
  role user_role default 'consumer',
  created_at timestamptz default now()
);

-- Create Businesses table
create type business_category as enum ('barber', 'salon', 'spa', 'tattoo', 'fitness', 'makeup', 'nails', 'brows', 'other');

create table businesses (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references profiles(id),
  name text not null,
  slug text unique,
  description text,
  address text,
  coordinates geography(Point),
  category business_category,
  is_verified boolean default false,
  has_generator boolean default false,
  image_url text,
  rating decimal(3, 2) default 0,
  review_count int default 0,
  created_at timestamptz default now()
);

-- Create Services table
create table services (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  description text,
  price decimal(10, 2) not null,
  duration_minutes int not null,
  is_active boolean default true,
  discount_ends_at timestamptz,
  created_at timestamptz default now()
);

-- Create Staff table
create table staff (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  profile_id uuid references profiles(id),
  name text not null,
  specialties text[],
  created_at timestamptz default now()
);

-- Create Bookings table
create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
create type payment_status as enum ('unpaid', 'paid', 'deposit_paid');

create table bookings (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id),
  customer_id uuid references profiles(id),
  service_id uuid references services(id),
  staff_id uuid references staff(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  status booking_status default 'pending',
  payment_status payment_status default 'unpaid',
  price decimal(10, 2) not null,
  created_at timestamptz default now()
);

-- Create Reviews table
create table reviews (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references bookings(id),
  business_id uuid references businesses(id),
  user_id uuid references profiles(id),
  rating int check (rating >= 1 and rating <= 5),
  comment text,
  video_url text,
  audio_url text,
  is_verified_purchase boolean default true,
  created_at timestamptz default now()
);

-- Marketing Configs
create table marketing_configs (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade unique,
  enable_sms_reminders boolean default false,
  enable_whatsapp_reviews boolean default false,
  reminder_hours_before int default 24,
  loyalty_program_enabled boolean default false
);

-- Marketing Campaigns
create type campaign_type as enum ('sms', 'email', 'whatsapp');
create type trigger_event as enum ('booking_completed', 'birthday', 'inactive_30d', 'manual_blast');

create table marketing_campaigns (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  type campaign_type not null,
  trigger_event trigger_event not null,
  trigger_condition jsonb,
  template_content text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Barter System
create type offer_status as enum ('active', 'filled', 'expired');

create table barter_offers (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  service_name text not null,
  description text,
  image_url text,
  value decimal(10, 2),
  min_followers int,
  platform text,
  tags text[],
  status offer_status default 'active',
  created_at timestamptz default now()
);

create type application_status as enum ('pending', 'approved', 'rejected', 'completed');

create table barter_applications (
  id uuid default gen_random_uuid() primary key,
  offer_id uuid references barter_offers(id) on delete cascade,
  influencer_id uuid references profiles(id),
  status application_status default 'pending',
  review_video_url text,
  created_at timestamptz default now()
);

-- RLS Policies (Basic Setup)
alter table profiles enable row level security;
alter table businesses enable row level security;
alter table services enable row level security;
alter table bookings enable row level security;

-- Public read access for businesses and services
create policy "Public businesses are viewable by everyone" on businesses for select using (true);
create policy "Public services are viewable by everyone" on services for select using (true);
