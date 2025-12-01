-- Enable RLS (already enabled but good to be safe)
alter table profiles enable row level security;

-- Allow users to insert their own profile
create policy "Users can insert their own profile"
on profiles for insert
with check (auth.uid() = id);

-- Allow users to view their own profile
create policy "Users can view their own profile"
on profiles for select
using (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update their own profile"
on profiles for update
using (auth.uid() = id);

-- Allow public to view profiles (needed for bookings/reviews maybe? restrict if needed)
-- For now, let's keep it strict to own profile, or maybe allow reading basic info.
-- But wait, `getAvailableSlots` might need to read staff profiles?
-- Staff table references profiles.
-- Let's stick to "Users can view their own profile" for now to fix login.
-- If other parts break, we'll add more.
