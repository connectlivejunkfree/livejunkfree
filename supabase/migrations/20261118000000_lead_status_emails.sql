-- Live Junk Free: lead workflow (status + appointments), enquiry context and email log.
-- Batch 1 audit: G05 (service / city / page context on every enquiry), G14 / T10
-- (customer acknowledgement, internal notification, appointment confirmation).
--
-- Safe to run more than once. Run it in the Supabase SQL editor (or `supabase db push`).
-- Until it is run, the website still saves leads: src/app/actions/leads.ts retries
-- the insert without the new columns.

-- 1. Status values for the appointment workflow (old 'booked' / 'lost' stay valid).
alter type lead_status add value if not exists 'confirmed';
alter type lead_status add value if not exists 'completed';
alter type lead_status add value if not exists 'cancelled';

-- 2. Enquiry context + appointment fields.
alter table public.leads
  add column if not exists service_detail      text,
  add column if not exists city                text,
  add column if not exists page_id             text,
  add column if not exists pricing_selection   text,
  add column if not exists appointment_at      timestamptz,
  add column if not exists appointment_window  text,
  add column if not exists appointment_address text,
  add column if not exists appointment_notes   text,
  add column if not exists appointment_version integer not null default 0,
  add column if not exists confirmed_at        timestamptz,
  add column if not exists updated_at          timestamptz not null default now();

create index if not exists leads_appointment_at_idx on public.leads (appointment_at);

create or replace function public.leads_touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at before update on public.leads
  for each row execute function public.leads_touch_updated_at();

-- 3. Every email the site sends (or fails to send). `dedupe_key` makes each send
--    idempotent: the same action can never email the customer twice.
create table if not exists public.email_log (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  lead_id     uuid references public.leads (id) on delete set null,
  kind        text not null,          -- internal_notification | acknowledgement | confirmed | rescheduled | cancelled | completed
  dedupe_key  text not null unique,   -- e.g. "<lead id>:confirmed:v2"
  to_email    text not null,
  subject     text not null,
  status      text not null,          -- sent | failed | skipped
  test_mode   boolean not null default false,
  provider_id text,
  error       text
);
create index if not exists email_log_lead_idx on public.email_log (lead_id, created_at desc);

alter table public.email_log enable row level security;
revoke all on public.email_log from anon, authenticated;

-- 4. Backup trigger for status changes made directly in the Supabase dashboard
--    (not through /admin). Create a Database Webhook in Supabase:
--      Database → Webhooks → Create: table public.leads, event UPDATE,
--      type HTTP request, POST https://<site>/api/lead-status
--      header  x-ljf-webhook-secret: <LEAD_WEBHOOK_SECRET>
--    The endpoint sends the matching email only if email_log has no entry for it yet,
--    so changes made through /admin (which already emailed) are not sent twice.
--    See docs/EMAILS.md.
