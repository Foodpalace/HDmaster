-- Window 4 hardening: dispatch requests, marketing, settlements, idempotency.
-- Audit logs remain append-only. No update/delete grants are added for them.

create table if not exists dispatch_requests (
  id text primary key,
  org_id text not null,
  order_id text not null,
  requested_rider_id text,
  status text not null default 'REQUESTED',
  reason text,
  created_by_employee_id text,
  created_at timestamptz not null default now()
);
create index if not exists dispatch_requests_org_idx on dispatch_requests (org_id, created_at desc);

create table if not exists marketing_campaigns (
  id text primary key,
  org_id text not null,
  name text not null,
  channel text not null,
  status text not null default 'DRAFT',
  audience text not null default 'customers',
  budget_paise int not null default 0,
  spent_paise int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists marketing_campaigns_org_idx on marketing_campaigns (org_id, status);

create table if not exists settlement_batches (
  id text primary key,
  org_id text not null,
  party_type text not null,
  party_id text not null,
  party_name text not null,
  payable_paise int not null,
  status text not null default 'READY',
  approved_by text,
  approved_at timestamptz,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists settlement_batches_org_idx on settlement_batches (org_id, party_type, status);

create table if not exists idempotency_keys (
  key text primary key,
  org_id text not null,
  employee_id text,
  action text not null,
  response_json text not null,
  created_at timestamptz not null default now()
);
create index if not exists idempotency_org_idx on idempotency_keys (org_id, created_at desc);
