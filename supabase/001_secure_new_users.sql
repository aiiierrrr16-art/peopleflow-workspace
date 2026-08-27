-- New accounts must be approved before they can read HR data.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles alter column role set default 'pending';
alter table public.profiles
  add constraint profiles_role_check check (role in ('pending', 'hr', 'leader'));
