-- Live Junk Free: lead storage.
-- Leads are written only by the website's server (service role key) from
-- src/app/actions/leads.ts. The public (anon) key can never read them.

create extension if not exists "pgcrypto";

do $$ begin
  create type lead_status as enum ('new', 'contacted', 'booked', 'lost');
exception when duplicate_object then null; end $$;
do $$ begin
  create type lead_form_type as enum ('quote', 'booking', 'landing');
exception when duplicate_object then null; end $$;

create table if not exists public.leads (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  source_path    text not null,
  form_type      lead_form_type not null,
  name           text not null,
  phone          text not null,
  email          text,
  postal_code    text,
  address        text,
  service        text,
  preferred_date text,
  arrival_window text,
  details        text,
  utm_source     text,
  utm_medium     text,
  utm_campaign   text,
  utm_term       text,
  utm_content    text,
  gclid          text,
  gbraid         text,
  wbraid         text,
  landing_path   text,
  status         lead_status not null default 'new',
  notes          text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

create table if not exists public.lead_photos (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.leads (id) on delete cascade,
  path       text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists lead_photos_lead_idx on public.lead_photos (lead_id);

-- Row-level security: no public access at all. The server uses the service
-- role key, which bypasses RLS, to insert. Nobody can read leads with the anon key.
alter table public.leads enable row level security;
alter table public.lead_photos enable row level security;
revoke all on public.leads from anon, authenticated;
revoke all on public.lead_photos from anon, authenticated;

-- Private bucket for customer photos (max 10 MB each, images only).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lead-photos', 'lead-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif'])
on conflict (id) do nothing;

-- Browsers upload photos only through one-time signed upload URLs created by the
-- server (createSignedUploadUrl), so no storage policy for anon is needed.
-- The server records each photo path in lead_photos when it creates the URL
-- (src/app/actions/leads.ts); files live at lead-photos/<lead id>/<n>-<uuid>.
