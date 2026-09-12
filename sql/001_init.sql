-- YAADRI Connected-mode schema (documented, NOT executed against a live
-- Supabase project by this prototype — no credentials/network were
-- available in the environment that generated this project). Review
-- and run via `supabase db push` or the SQL editor. See DEPLOYMENT.md.

create extension if not exists "pgcrypto";

-- Caregiver/patient auth-linked profiles (one row per Supabase auth user).
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- A patient record. Not itself an auth user necessarily (patients may
-- be linked to their own auth account, or managed caregiver-only).
create table patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age int,
  location text,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- Explicit authorized caregiver<->patient membership. This table is the
-- ONLY source of truth for access — never trust a client-supplied
-- patient id or caregiver id alone.
create table memberships (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('caregiver','patient')),
  created_at timestamptz not null default now(),
  unique (patient_id, profile_id)
);

-- Server-validated invitations for linking a patient account.
create table invitations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  created_by uuid not null references profiles(id),
  token text not null unique,
  role text not null check (role in ('caregiver','patient')),
  expires_at timestamptz not null,
  redeemed_by uuid references profiles(id),
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create table entities (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  type text not null check (type in ('person','place','event')),
  name text not null,
  relationship_to_patient text,
  verified boolean not null default false,
  source_capsule_id uuid,
  created_at timestamptz not null default now()
);

create table relationships (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  from_entity_id uuid not null references entities(id) on delete cascade,
  to_entity_id uuid not null references entities(id) on delete cascade,
  kind text not null check (kind in ('FAMILY_OF','LOCATED_AT','OCCURRED_AT','PARTICIPANT_OF')),
  verified boolean not null default false,
  source_capsule_id uuid,
  created_at timestamptz not null default now()
);

create table capsules (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  title text not null,
  story text not null,
  status text not null default 'draft' check (status in ('draft','verified','archived')),
  reviewer_id uuid references profiles(id),
  reviewed_at timestamptz,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

alter table entities add constraint entities_source_capsule_fk
  foreign key (source_capsule_id) references capsules(id) on delete set null;
alter table relationships add constraint relationships_source_capsule_fk
  foreign key (source_capsule_id) references capsules(id) on delete set null;

create table capsule_entities (
  capsule_id uuid not null references capsules(id) on delete cascade,
  entity_id uuid not null references entities(id) on delete cascade,
  primary key (capsule_id, entity_id)
);

-- Media metadata only; actual bytes live in private Supabase Storage.
create table media_assets (
  id uuid primary key default gen_random_uuid(),
  capsule_id uuid not null references capsules(id) on delete cascade,
  kind text not null check (kind in ('photo','audio')),
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null,
  uploaded_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- "Teach YAADRI About Me" extraction review queue. Nothing here is
-- verified/usable until a human confirms it (see extraction_reviews.decision).
create table extraction_reviews (
  id uuid primary key default gen_random_uuid(),
  capsule_id uuid not null references capsules(id) on delete cascade,
  kind text not null check (kind in ('person','place','event','relationship')),
  proposed_label text not null,
  source_span jsonb not null,
  confidence text not null check (confidence in ('high','medium','low')),
  ambiguous boolean not null default false,
  decision text not null default 'pending' check (decision in ('pending','confirmed','corrected','rejected')),
  corrected_label text,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table game_sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  game_id text not null check (game_id in ('face-name','connect-memory','memory-puzzle')),
  started_at timestamptz not null,
  ended_at timestamptz,
  outcome text check (outcome in ('completed','abandoned'))
);

create table game_events (
  id text primary key, -- idempotent client-generated event id
  session_id uuid not null references game_sessions(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  game_id text not null,
  entity_id uuid references entities(id),
  started_at timestamptz not null,
  ended_at timestamptz,
  outcome text not null check (outcome in ('completed','abandoned')),
  attempts int not null default 0,
  rescue_log jsonb not null default '[]',
  category text check (category in ('independent_recall','light_cue','multiple_cues','revealed_no_recall')),
  correct boolean not null default false,
  puzzle_completed boolean,
  created_at timestamptz not null default now()
);

create table reminders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  title text not null,
  time text not null,
  timezone text not null,
  days_of_week int[] not null default '{0,1,2,3,4,5,6}',
  completed_dates date[] not null default '{}',
  snoozed_until timestamptz,
  created_at timestamptz not null default now()
);

-- Optional AI usage tracking, for per-user/global caps enforced atomically
-- inside the Edge Function (see supabase/functions/*/index.ts).
create table ai_usage (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id),
  feature text not null check (feature in ('extraction','copilot_summary')),
  used_at timestamptz not null default now(),
  cache_key text
);

create index on ai_usage (profile_id, feature, used_at);
create index on game_events (patient_id, started_at);

-- === Row Level Security ===
alter table profiles enable row level security;
alter table patients enable row level security;
alter table memberships enable row level security;
alter table invitations enable row level security;
alter table entities enable row level security;
alter table relationships enable row level security;
alter table capsules enable row level security;
alter table capsule_entities enable row level security;
alter table media_assets enable row level security;
alter table extraction_reviews enable row level security;
alter table game_sessions enable row level security;
alter table game_events enable row level security;
alter table reminders enable row level security;
alter table ai_usage enable row level security;

create or replace function is_member_of_patient(p_patient_id uuid, p_role text default null)
returns boolean language sql stable as $$
  select exists (
    select 1 from memberships m
    where m.patient_id = p_patient_id
      and m.profile_id = auth.uid()
      and (p_role is null or m.role = p_role)
  );
$$;

create policy profiles_self on profiles for select using (id = auth.uid());
create policy profiles_self_update on profiles for update using (id = auth.uid());

create policy patients_member_select on patients for select
  using (is_member_of_patient(id));
create policy patients_caregiver_insert on patients for insert
  with check (created_by = auth.uid());
create policy patients_caregiver_update on patients for update
  using (is_member_of_patient(id, 'caregiver'));

create policy memberships_member_select on memberships for select
  using (is_member_of_patient(patient_id));
-- Memberships are only ever written by the invitation-redemption Edge
-- Function using the service role key; no direct client insert policy.

create policy entities_member_select on entities for select
  using (is_member_of_patient(patient_id));
create policy entities_caregiver_write on entities for insert
  with check (is_member_of_patient(patient_id, 'caregiver'));
create policy entities_caregiver_update on entities for update
  using (is_member_of_patient(patient_id, 'caregiver'));
-- Patients can never edit verification status: enforced by only granting
-- UPDATE to caregiver role above; there is no patient update policy.

create policy relationships_member_select on relationships for select
  using (is_member_of_patient(patient_id));
create policy relationships_caregiver_write on relationships for insert
  with check (is_member_of_patient(patient_id, 'caregiver'));
create policy relationships_caregiver_update on relationships for update
  using (is_member_of_patient(patient_id, 'caregiver'));

create policy capsules_member_select on capsules for select
  using (is_member_of_patient(patient_id));
create policy capsules_caregiver_write on capsules for insert
  with check (is_member_of_patient(patient_id, 'caregiver'));
create policy capsules_caregiver_update on capsules for update
  using (is_member_of_patient(patient_id, 'caregiver'));

create policy capsule_entities_member_select on capsule_entities for select
  using (exists (select 1 from capsules c where c.id = capsule_id and is_member_of_patient(c.patient_id)));
create policy capsule_entities_caregiver_write on capsule_entities for insert
  with check (exists (select 1 from capsules c where c.id = capsule_id and is_member_of_patient(c.patient_id, 'caregiver')));

create policy media_member_select on media_assets for select
  using (exists (select 1 from capsules c where c.id = capsule_id and is_member_of_patient(c.patient_id)));
create policy media_caregiver_write on media_assets for insert
  with check (exists (select 1 from capsules c where c.id = capsule_id and is_member_of_patient(c.patient_id, 'caregiver')));

create policy extraction_member_select on extraction_reviews for select
  using (exists (select 1 from capsules c where c.id = capsule_id and is_member_of_patient(c.patient_id)));
create policy extraction_caregiver_write on extraction_reviews for update
  using (exists (select 1 from capsules c where c.id = capsule_id and is_member_of_patient(c.patient_id, 'caregiver')));

create policy sessions_member_select on game_sessions for select
  using (is_member_of_patient(patient_id));
create policy sessions_member_write on game_sessions for insert
  with check (is_member_of_patient(patient_id));

create policy events_member_select on game_events for select
  using (is_member_of_patient(patient_id));
create policy events_member_write on game_events for insert
  with check (is_member_of_patient(patient_id));

create policy reminders_member_select on reminders for select
  using (is_member_of_patient(patient_id));
create policy reminders_caregiver_write on reminders for insert
  with check (is_member_of_patient(patient_id, 'caregiver'));
create policy reminders_member_update on reminders for update
  using (is_member_of_patient(patient_id));

create policy ai_usage_self on ai_usage for select using (profile_id = auth.uid());
-- ai_usage rows are inserted only by Edge Functions via service role.

-- Storage policies (documented; apply via Supabase Dashboard or
-- `supabase storage` — bucket "capsule-media", private).
-- Example policy logic (pseudocode, adapt in Dashboard SQL editor for storage.objects):
--   allow select/insert where the object path is prefixed
--   "{patient_id}/" AND is_member_of_patient(patient_id::uuid) is true.
