begin;

-- Phase 1 only: agreed policy defaults, never provider capabilities or user data.
create table public.platform_settings (
  singleton boolean primary key default true check (singleton),
  requirements_version text not null check (length(requirements_version) > 0),
  base_currency text not null default 'SAR' check (base_currency = 'SAR'),
  display_time_zone text not null default 'Asia/Riyadh' check (display_time_zone = 'Asia/Riyadh'),
  minimum_booking_notice_minutes integer not null check (minimum_booking_notice_minutes > 0),
  guide_response_minutes integer not null check (guide_response_minutes > 0),
  payment_window_minutes integer not null check (payment_window_minutes > 0),
  tour_buffer_minutes integer not null check (tour_buffer_minutes >= 0),
  commission_basis_points integer not null check (commission_basis_points between 0 and 10000),
  payout_objection_window_minutes integer not null check (payout_objection_window_minutes > 0),
  chat_after_completion_minutes integer not null check (chat_after_completion_minutes >= 0),
  no_show_reporting_delay_minutes integer not null check (no_show_reporting_delay_minutes >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.platform_settings is
  'Agreed defaults from PROJECT_REQUIREMENTS.md 1.1. No pricing, booking, payment, or payout execution exists in phase 1. Future bookings must snapshot applicable policy.';
comment on column public.platform_settings.commission_basis_points is
  '1000 basis points = 10%. Provider fees, taxes, and retained cancellation funds are unresolved and must not be inferred from this value.';
comment on column public.platform_settings.payout_objection_window_minutes is
  'An eligibility waiting window, not a scheduled payout or a guarantee of bank settlement.';

alter table public.platform_settings enable row level security;
alter table public.platform_settings force row level security;
revoke all on table public.platform_settings from public, anon, authenticated;
-- No API policies in phase 1. Privileged server access needs a separate phase-2 design.

insert into public.platform_settings (
  requirements_version,
  minimum_booking_notice_minutes,
  guide_response_minutes,
  payment_window_minutes,
  tour_buffer_minutes,
  commission_basis_points,
  payout_objection_window_minutes,
  chat_after_completion_minutes,
  no_show_reporting_delay_minutes
) values ('1.1', 1440, 720, 30, 30, 1000, 1440, 1440, 30);

commit;
