-- Amazon HR & Finance foundation schema for Nhost (PostgreSQL + Hasura).
-- Run only on the NEW Nhost project after taking a database backup.
-- This migration creates schema only: no legacy data is modified or imported.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.app_user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('owner','admin','hr','finance','manager','employee','advance_giver','auditor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_no text not null unique,
  full_name text not null,
  phone text,
  email text,
  national_id text,
  department text,
  job_title text,
  hire_date date,
  employment_status text not null default 'active'
    check (employment_status in ('active','suspended','terminated')),
  address text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_assignments (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  assignment_name text not null,
  department text,
  job_title text,
  agreed_salary numeric(14,2) not null default 0 check (agreed_salary >= 0),
  salary_currency char(3) not null default 'USD' check (salary_currency in ('USD','IQD')),
  pay_frequency text not null default 'monthly' check (pay_frequency in ('monthly','weekly','daily')),
  starts_on date not null,
  ends_on date,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or ends_on >= starts_on)
);

create table if not exists public.advance_givers (
  id uuid primary key default gen_random_uuid(),
  giver_name text not null,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The giver's identity is tied to a real Nhost Auth user. Passwords are never stored here.
create table if not exists public.advance_giver_accounts (
  id uuid primary key default gen_random_uuid(),
  giver_id uuid not null unique references public.advance_givers(id) on delete restrict,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.advance_counters (
  period char(6) primary key,
  last_number integer not null default 0 check (last_number >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.advances (
  id uuid primary key default gen_random_uuid(),
  operation_no text not null unique,
  employee_id uuid not null references public.employees(id) on delete restrict,
  giver_id uuid not null references public.advance_givers(id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),
  currency char(3) not null default 'IQD' check (currency in ('IQD','USD')),
  advance_date date not null default current_date,
  status text not null default 'approved' check (status in ('draft','pending','approved','rejected','cancelled','settled')),
  notes text,
  created_by uuid not null references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payroll_periods (
  id uuid primary key default gen_random_uuid(),
  period_code char(6) not null unique,
  starts_on date not null,
  ends_on date not null,
  status text not null default 'draft' check (status in ('draft','review','approved','paid','closed')),
  created_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

-- Each payroll line belongs to one employee assignment. Amount/currency are explicit.
create table if not exists public.payroll_items (
  id uuid primary key default gen_random_uuid(),
  payroll_period_id uuid not null references public.payroll_periods(id) on delete restrict,
  employee_id uuid not null references public.employees(id) on delete restrict,
  assignment_id uuid not null references public.employee_assignments(id) on delete restrict,
  base_amount numeric(14,2) not null default 0,
  currency char(3) not null check (currency in ('USD','IQD')),
  bonus_amount numeric(14,2) not null default 0,
  deduction_amount numeric(14,2) not null default 0,
  net_amount numeric(14,2) not null default 0,
  status text not null default 'calculated' check (status in ('calculated','approved','paid','void')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (payroll_period_id, assignment_id)
);

create table if not exists public.deductions (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  assignment_id uuid references public.employee_assignments(id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),
  currency char(3) not null check (currency in ('USD','IQD')),
  deduction_date date not null default current_date,
  category text not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','applied','cancelled')),
  created_by uuid not null references auth.users(id),
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  assignment_id uuid references public.employee_assignments(id) on delete restrict,
  work_date date not null,
  check_in timestamptz,
  check_out timestamptz,
  status text not null default 'present' check (status in ('present','late','absent','excused','holiday')),
  source text not null default 'manual' check (source in ('manual','device','import')),
  notes text,
  recorded_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, assignment_id, work_date)
);

-- Overtime rate is explicitly configured by management per employee/assignment.
-- There is no automatic multiplier. Overtime is paid in IQD.
create table if not exists public.overtime_rates (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  assignment_id uuid references public.employee_assignments(id) on delete restrict,
  hourly_rate_iqd numeric(14,2) not null check (hourly_rate_iqd >= 0),
  effective_from date not null,
  effective_to date,
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from)
);

create table if not exists public.overtime_entries (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  assignment_id uuid references public.employee_assignments(id) on delete restrict,
  work_date date not null,
  hours numeric(8,2) not null check (hours > 0),
  hourly_rate_iqd numeric(14,2) not null check (hourly_rate_iqd >= 0),
  amount_iqd numeric(14,2) generated always as (round(hours * hourly_rate_iqd, 2)) stored,
  status text not null default 'pending' check (status in ('pending','approved','rejected','paid')),
  notes text,
  created_by uuid not null references auth.users(id),
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  leave_type text not null,
  starts_on date not null,
  ends_on date not null,
  reason text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  requested_by uuid not null references auth.users(id),
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

-- Central notification event. Recipient delivery/read status is stored separately.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  title text not null,
  body text not null,
  employee_id uuid references public.employees(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  entity_type text,
  entity_id uuid,
  amount numeric(14,2),
  currency char(3),
  status text not null default 'created' check (status in ('created','queued','sent','partial','failed','cancelled')),
  reason text,
  action_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_recipients (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  in_app_status text not null default 'unread' check (in_app_status in ('unread','read','archived')),
  push_status text not null default 'not_requested' check (push_status in ('not_requested','queued','sent','failed','expired')),
  read_at timestamptz,
  delivered_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  unique (notification_id, recipient_user_id)
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_secret text not null,
  device_label text,
  is_active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- WebAuthn stores public credential material only; never biometric images/templates.
create table if not exists public.webauthn_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credential_id text not null unique,
  public_key text not null,
  sign_count bigint not null default 0,
  transports text[] not null default '{}',
  device_label text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_employees_status on public.employees(employment_status);
create index if not exists idx_assignments_employee on public.employee_assignments(employee_id, is_active);
create index if not exists idx_advances_date on public.advances(advance_date desc);
create index if not exists idx_advances_employee on public.advances(employee_id);
create index if not exists idx_payroll_period_status on public.payroll_periods(period_code, status);
create index if not exists idx_attendance_date on public.attendance_records(work_date desc);
create index if not exists idx_notifications_created on public.notifications(created_at desc);
create index if not exists idx_notification_recipient_user on public.notification_recipients(recipient_user_id, in_app_status);
create index if not exists idx_push_subscriptions_user on public.push_subscriptions(user_id, is_active);

do $$
declare
  t text;
begin
  foreach t in array array[
    'app_user_profiles','employees','employee_assignments','advance_givers',
    'advance_giver_accounts','advances','payroll_periods','payroll_items',
    'deductions','attendance_records','overtime_entries','leave_requests',
    'push_subscriptions'
  ]
  loop
    execute format('drop trigger if exists trg_%I_updated_at on public.%I', t, t);
    execute format(
      'create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end $$;

-- IMPORTANT SECURITY CHECKLIST:
-- 1) Track these tables in Hasura/Nhost.
-- 2) Configure role/row/column permissions before exposing any table through GraphQL.
-- 3) Do NOT grant public/anonymous access to employee, payroll, advances, deductions,
--    notification, push_subscriptions, webauthn_credentials, or audit_logs.
-- 4) Restrict push_subscriptions to the owning user for select/insert/delete; keep push sending server-side.
-- 5) Map advance_giver_accounts.auth_user_id to the authenticated Nhost user and enforce
--    the mapping in a server-side action/function before inserting advances.
-- 6) Do not expose admin secrets, service credentials, VAPID private keys, or DB passwords
--    in the Vite frontend or GitHub repository.
