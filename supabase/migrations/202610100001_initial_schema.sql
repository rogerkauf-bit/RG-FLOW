-- RG Flow | Initial schema
-- Apply in Supabase SQL Editor. No application table is physically deletable.
create extension if not exists pgcrypto;

create type public.app_role as enum ('analista', 'coordenador', 'gerente');
create type public.task_status as enum ('a_fazer', 'em_andamento', 'em_revisao', 'concluida');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  organization_id uuid references public.organizations(id) on delete restrict,
  full_name text not null default '',
  role public.app_role not null default 'analista',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null,
  tax_id text,
  monthly_fee numeric(14,2) not null default 0 check (monthly_fee >= 0),
  notes text,
  created_by uuid not null default auth.uid() references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  archived_by uuid references public.profiles(id) on delete restrict
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  client_id uuid not null references public.clients(id) on delete restrict,
  title text not null,
  description text,
  category text not null default 'Contábil',
  status public.task_status not null default 'a_fazer',
  priority text not null default 'normal' check (priority in ('baixa','normal','alta','urgente')),
  assignee_id uuid references public.profiles(id) on delete restrict,
  due_date date,
  estimated_minutes integer not null default 60 check (estimated_minutes >= 0),
  created_by uuid not null default auth.uid() references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  archived_at timestamptz,
  archived_by uuid references public.profiles(id) on delete restrict
);

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  task_id uuid not null references public.tasks(id) on delete restrict,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete restrict,
  started_at timestamptz,
  ended_at timestamptz,
  minutes integer not null check (minutes > 0),
  note text,
  billable boolean not null default true,
  created_at timestamptz not null default now(),
  archived_at timestamptz,
  archived_by uuid references public.profiles(id) on delete restrict,
  constraint time_entry_dates check (ended_at is null or started_at is null or ended_at >= started_at)
);

create index tasks_org_due_idx on public.tasks (organization_id, due_date) where archived_at is null;
create index tasks_assignee_idx on public.tasks (assignee_id, status) where archived_at is null;
create index clients_org_idx on public.clients (organization_id) where archived_at is null;
create index time_entries_org_user_idx on public.time_entries (organization_id, user_id, created_at desc) where archived_at is null;

-- SECURITY DEFINER helpers avoid recursive profile RLS checks.
create or replace function public.current_role()
returns public.app_role
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles
  where id = auth.uid() and active = true and archived_at is null
  limit 1;
$$;

create or replace function public.current_org_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select organization_id from public.profiles
  where id = auth.uid() and active = true and archived_at is null
  limit 1;
$$;

create or replace function public.is_management()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(public.current_role() in ('coordenador'::public.app_role, 'gerente'::public.app_role), false);
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.tasks enable row level security;
alter table public.time_entries enable row level security;

create policy "members read their organization" on public.organizations
for select to authenticated
using (id = public.current_org_id());

create policy "profiles read self or organization by management" on public.profiles
for select to authenticated
using (
  id = auth.uid()
  or (organization_id = public.current_org_id() and public.is_management())
);

-- Role and organization assignment are intentionally not editable through client policies.
-- Provision users and change roles using a trusted admin workflow only.

create policy "clients read organization" on public.clients
for select to authenticated
using (organization_id = public.current_org_id());

create policy "management creates clients" on public.clients
for insert to authenticated
with check (
  organization_id = public.current_org_id()
  and public.is_management()
  and created_by = auth.uid()
);

create policy "management updates clients" on public.clients
for update to authenticated
using (organization_id = public.current_org_id() and public.is_management())
with check (organization_id = public.current_org_id() and public.is_management());

create policy "tasks read organization" on public.tasks
for select to authenticated
using (
  organization_id = public.current_org_id()
  and (public.is_management() or assignee_id = auth.uid() or created_by = auth.uid())
);

create policy "members create assigned tasks" on public.tasks
for insert to authenticated
with check (
  organization_id = public.current_org_id()
  and created_by = auth.uid()
  and (
    public.is_management()
    or assignee_id = auth.uid()
  )
);

create policy "management updates tasks or analyst updates own" on public.tasks
for update to authenticated
using (
  organization_id = public.current_org_id()
  and (public.is_management() or assignee_id = auth.uid() or created_by = auth.uid())
)
with check (
  organization_id = public.current_org_id()
  and (public.is_management() or assignee_id = auth.uid() or created_by = auth.uid())
);

create policy "time entries read own or management" on public.time_entries
for select to authenticated
using (
  organization_id = public.current_org_id()
  and (public.is_management() or user_id = auth.uid())
);

create policy "members create own time entries" on public.time_entries
for insert to authenticated
with check (
  organization_id = public.current_org_id()
  and user_id = auth.uid()
  and exists (
    select 1 from public.tasks t
    where t.id = task_id
      and t.organization_id = public.current_org_id()
      and t.archived_at is null
      and (public.is_management() or t.assignee_id = auth.uid() or t.created_by = auth.uid())
  )
);

create policy "own or management updates time entries" on public.time_entries
for update to authenticated
using (organization_id = public.current_org_id() and (public.is_management() or user_id = auth.uid()))
with check (organization_id = public.current_org_id() and (public.is_management() or user_id = auth.uid()));

-- Defense in depth: prevent physical DELETEs even if a broad grant/policy is added later.
create or replace function public.prevent_physical_delete()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'Exclusão física desabilitada. Arquive o registro usando archived_at.';
end;
$$;

create trigger no_delete_organizations before delete on public.organizations
for each row execute function public.prevent_physical_delete();
create trigger no_delete_profiles before delete on public.profiles
for each row execute function public.prevent_physical_delete();
create trigger no_delete_clients before delete on public.clients
for each row execute function public.prevent_physical_delete();
create trigger no_delete_tasks before delete on public.tasks
for each row execute function public.prevent_physical_delete();
create trigger no_delete_time_entries before delete on public.time_entries
for each row execute function public.prevent_physical_delete();

revoke delete on public.organizations, public.profiles, public.clients, public.tasks, public.time_entries from anon, authenticated;
grant select on public.organizations, public.profiles, public.clients, public.tasks, public.time_entries to authenticated;
grant insert, update on public.clients, public.tasks, public.time_entries to authenticated;

-- Keep updated_at current on mutable records.
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_touch_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
create trigger clients_touch_updated_at before update on public.clients for each row execute function public.touch_updated_at();
create trigger tasks_touch_updated_at before update on public.tasks for each row execute function public.touch_updated_at();

-- NOTE: create the first organization and provision manager profiles from a trusted admin
-- session / SQL editor. Never expose the Supabase service_role key to the browser.
