-- Live Junk Free: client answers of 18 Nov 2026 (LJF_Akshat_Point_by_Point_Answers_18_Nov_2026.pdf).
--   A3.4 / A3.6: forms ask for a preferred CALLBACK time (not a pickup booking) → leads.callback_time
--   Internal statuses New / Contacted / Confirmed / Closed → add 'closed'
-- Safe to run more than once. Run after 20261118000000_lead_status_emails.sql.

alter type lead_status add value if not exists 'closed';

alter table public.leads
  add column if not exists callback_time text;
