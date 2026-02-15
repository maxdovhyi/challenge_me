-- CONTROL app initial schema
create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists actions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  unit text not null,
  value_type text not null check (value_type in ('count', 'duration', 'boolean')),
  category text not null,
  suggested_quick_add int[] default '{}',
  created_at timestamptz default now()
);

create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  timezone text not null default 'Europe/Kiev',
  status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'archived')),
  rule_type text not null check (rule_type in ('abstinence', 'count', 'duration')),
  action_id uuid not null references actions(id),
  min_per_day int,
  checkin_deadline_local time default '23:59:00',
  verification_mode text not null default 'self_report',
  jokers_per_period int not null default 2,
  created_at timestamptz default now()
);

create table if not exists challenge_members (
  challenge_id uuid references challenges(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner', 'participant', 'follower')),
  joined_at timestamptz default now(),
  primary key (challenge_id, user_id)
);

create table if not exists action_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  challenge_id uuid references challenges(id) on delete cascade,
  action_id uuid references actions(id),
  value int not null,
  logged_at timestamptz not null default now(),
  local_date date not null,
  note text,
  created_at timestamptz default now()
);

create table if not exists jokers_used (
  challenge_id uuid references challenges(id) on delete cascade,
  user_id uuid not null,
  date date not null,
  created_at timestamptz default now(),
  primary key (challenge_id, user_id, date)
);

create table if not exists money_ledger (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references challenges(id) on delete cascade,
  user_id uuid not null,
  type text not null check (type in ('deposit', 'fine_miss', 'fine_fail', 'payout', 'adjustment')),
  amount_uah int not null,
  note text,
  created_at timestamptz default now()
);

create table if not exists achievement_defs (
  id uuid primary key default gen_random_uuid(),
  action_id uuid references actions(id),
  kind text not null check (kind in ('milestone_total', 'milestone_year', 'milestone_month', 'personal_record_month', 'personal_record_week')),
  threshold int,
  title text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  achievement_def_id uuid references achievement_defs(id),
  earned_at timestamptz default now(),
  meta jsonb default '{}'::jsonb
);

create table if not exists challenge_invites (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references challenges(id) on delete cascade,
  role text not null check (role in ('participant', 'follower')),
  token text unique not null,
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table challenges enable row level security;
alter table challenge_members enable row level security;
alter table action_logs enable row level security;
alter table money_ledger enable row level security;
alter table user_achievements enable row level security;

create policy "profiles_public_read" on profiles for select using (true);
create policy "profiles_update_self" on profiles for update using (auth.uid() = id);

create policy "members_can_read_challenges" on challenges for select using (
  exists (select 1 from challenge_members m where m.challenge_id = id and m.user_id = auth.uid())
);
create policy "owner_can_write_challenges" on challenges for all using (owner_id = auth.uid());

create policy "members_read_members" on challenge_members for select using (
  exists (select 1 from challenge_members m where m.challenge_id = challenge_id and m.user_id = auth.uid())
);

create policy "self_logs_crud" on action_logs for all using (auth.uid() = user_id);

create policy "members_read_ledger" on money_ledger for select using (
  exists (select 1 from challenge_members m where m.challenge_id = challenge_id and m.user_id = auth.uid())
);

create policy "self_read_achievements" on user_achievements for select using (user_id = auth.uid());
