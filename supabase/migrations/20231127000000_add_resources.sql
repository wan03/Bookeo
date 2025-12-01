-- Create Business Resources table
create table if not exists business_resources (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  type text not null,
  created_at timestamptz default now()
);

-- Create Service Resources junction table
create table if not exists service_resources (
  service_id uuid references services(id) on delete cascade,
  resource_id uuid references business_resources(id) on delete cascade,
  primary key (service_id, resource_id)
);

-- Enable RLS
alter table business_resources enable row level security;
alter table service_resources enable row level security;

-- Policies (simplified for now)
create policy "Public resources viewable" on business_resources for select using (true);
create policy "Public service resources viewable" on service_resources for select using (true);

-- Allow owners to manage their resources (simplified, assuming owner check on business_id)
create policy "Owners can manage resources" on business_resources for all using (
    exists (
        select 1 from businesses
        where businesses.id = business_resources.business_id
        and businesses.owner_id = auth.uid()
    )
);

create policy "Owners can manage service resources" on service_resources for all using (
    exists (
        select 1 from services
        join businesses on businesses.id = services.business_id
        where services.id = service_resources.service_id
        and businesses.owner_id = auth.uid()
    )
);
