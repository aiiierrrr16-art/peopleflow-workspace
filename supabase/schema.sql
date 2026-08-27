-- PeopleFlow Supabase schema
-- Run once in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'pending' check (role in ('pending', 'hr', 'leader')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_positions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null default '',
  city text not null default '',
  status text not null default '招聘中',
  description text not null default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  matched_position_id uuid references public.job_positions(id) on delete set null,
  matched_position text not null default '',
  city text not null default '',
  stage text not null default '待初试',
  work_years integer,
  current_company text not null default '',
  source text not null default '',
  tags text[] not null default '{}',
  contact text not null default '',
  resume_path text,
  notes text not null default '',
  last_contact_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interview_records (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  round text not null,
  interview_at timestamptz,
  result text not null default '待反馈',
  reason text not null default '',
  feedback text not null default '',
  interviewer text not null default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  department text not null default '',
  joined_on date,
  status text not null default '在职',
  abilities text[] not null default '{}',
  notes text not null default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_reviews (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employee_profiles(id) on delete cascade,
  review_period text not null,
  rating numeric(3,1),
  evaluation text not null default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.industry_intelligence (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  industry text not null default '',
  region text not null default '',
  source_url text,
  summary text not null default '',
  tags text[] not null default '{}',
  collected_on date not null default current_date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.current_role()
returns text
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

alter table public.profiles enable row level security;
alter table public.job_positions enable row level security;
alter table public.candidates enable row level security;
alter table public.interview_records enable row level security;
alter table public.employee_profiles enable row level security;
alter table public.employee_reviews enable row level security;
alter table public.industry_intelligence enable row level security;

drop policy if exists "profile_self_read" on public.profiles;
create policy "profile_self_read" on public.profiles
for select to authenticated using (id = auth.uid());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'job_positions', 'candidates', 'interview_records',
    'employee_profiles', 'employee_reviews', 'industry_intelligence'
  ] loop
    execute format('drop policy if exists "staff_read" on public.%I', table_name);
    execute format(
      'create policy "staff_read" on public.%I for select to authenticated using (public.current_role() in (''hr'', ''leader''))',
      table_name
    );
    execute format('drop policy if exists "hr_insert" on public.%I', table_name);
    execute format(
      'create policy "hr_insert" on public.%I for insert to authenticated with check (public.current_role() = ''hr'')',
      table_name
    );
    execute format('drop policy if exists "hr_update" on public.%I', table_name);
    execute format(
      'create policy "hr_update" on public.%I for update to authenticated using (public.current_role() = ''hr'') with check (public.current_role() = ''hr'')',
      table_name
    );
    execute format('drop policy if exists "hr_delete" on public.%I', table_name);
    execute format(
      'create policy "hr_delete" on public.%I for delete to authenticated using (public.current_role() = ''hr'')',
      table_name
    );
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do update set public = false;

drop policy if exists "staff_resume_read" on storage.objects;
create policy "staff_resume_read" on storage.objects
for select to authenticated
using (bucket_id = 'resumes' and public.current_role() in ('hr', 'leader'));

drop policy if exists "hr_resume_insert" on storage.objects;
create policy "hr_resume_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'resumes' and public.current_role() = 'hr');

drop policy if exists "hr_resume_update" on storage.objects;
create policy "hr_resume_update" on storage.objects
for update to authenticated
using (bucket_id = 'resumes' and public.current_role() = 'hr')
with check (bucket_id = 'resumes' and public.current_role() = 'hr');

drop policy if exists "hr_resume_delete" on storage.objects;
create policy "hr_resume_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'resumes' and public.current_role() = 'hr');
