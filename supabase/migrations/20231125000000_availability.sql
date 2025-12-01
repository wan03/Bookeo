-- Create Operating Hours table
create table business_operating_hours (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade not null,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0 = Sunday, 6 = Saturday
  open_time time not null default '09:00:00',
  close_time time not null default '18:00:00',
  is_closed boolean default false,
  created_at timestamptz default now(),
  unique(business_id, day_of_week)
);

-- Create Blocked Time table (for specific exceptions like holidays, breaks, etc.)
create table business_blocked_time (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  reason text,
  created_at timestamptz default now(),
  check (end_time > start_time)
);

-- Enable RLS
alter table business_operating_hours enable row level security;
alter table business_blocked_time enable row level security;

-- Policies for Operating Hours
create policy "Public operating hours are viewable by everyone" 
  on business_operating_hours for select using (true);

create policy "Businesses can manage their own operating hours" 
  on business_operating_hours for all using (
    auth.uid() in (
      select owner_id from businesses where id = business_id
    )
  );

-- Policies for Blocked Time
create policy "Public blocked times are viewable by everyone" 
  on business_blocked_time for select using (true);

create policy "Businesses can manage their own blocked times" 
  on business_blocked_time for all using (
    auth.uid() in (
      select owner_id from businesses where id = business_id
    )
  );

-- Insert default operating hours for existing businesses
do $$
declare
  b record;
  d int;
begin
  for b in select id from businesses loop
    for d in 0..6 loop
      insert into business_operating_hours (business_id, day_of_week, open_time, close_time, is_closed)
      values (
        b.id, 
        d, 
        '09:00:00', 
        '18:00:00', 
        case when d = 0 then true else false end -- Closed on Sundays by default
      )
      on conflict do nothing;
    end loop;
  end loop;
end $$;
