-- Revenue path hardening: real gateway payment intents/webhooks, immutable double-entry journal,
-- settlement items, rider location pings and dispatch assignments. All money is integer paise.

create table if not exists payment_intents (
  id text primary key,
  org_id text not null references organizations(id),
  order_id text not null references orders(id),
  gateway text not null,
  gateway_order_id text not null,
  gateway_payment_id text,
  amount_paise int not null,
  currency text not null default 'INR',
  status text not null default 'CREATED',
  idempotency_key text not null,
  failure_code text,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gateway, gateway_order_id),
  unique (org_id, idempotency_key)
);
create index if not exists payment_intents_order_idx on payment_intents (order_id, created_at desc);
create index if not exists payment_intents_status_idx on payment_intents (org_id, status, created_at desc);

create table if not exists payment_webhook_events (
  id text primary key,
  gateway text not null,
  gateway_event_id text not null,
  event_type text not null,
  payload_json text not null,
  signature text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text,
  unique (gateway, gateway_event_id)
);

create table if not exists journal_entries (
  id text primary key,
  org_id text not null references organizations(id),
  order_id text references orders(id),
  source_type text not null,
  source_id text not null,
  description text not null,
  created_at timestamptz not null default now(),
  unique (org_id, source_type, source_id)
);
create index if not exists journal_entries_order_idx on journal_entries (order_id, created_at desc);

create table if not exists journal_lines (
  id text primary key,
  journal_id text not null references journal_entries(id),
  account text not null,
  direction text not null check (direction in ('DEBIT','CREDIT')),
  amount_paise int not null check (amount_paise > 0),
  party_type text,
  party_id text,
  created_at timestamptz not null default now()
);
create index if not exists journal_lines_journal_idx on journal_lines (journal_id);
create index if not exists journal_lines_party_idx on journal_lines (party_type, party_id, created_at desc);

-- 0003 already owns settlement_batches. Add revenue-path metadata without replacing it.
alter table settlement_batches add column if not exists gross_paise int not null default 0;
alter table settlement_batches add column if not exists fee_paise int not null default 0;
alter table settlement_batches add column if not exists net_paise int not null default 0;
alter table settlement_batches add column if not exists external_reference text;
alter table settlement_batches add column if not exists paid_at timestamptz;
create index if not exists settlement_batches_party_idx on settlement_batches (org_id, party_type, party_id, created_at desc);

create table if not exists settlement_items (
  id text primary key,
  batch_id text not null references settlement_batches(id),
  order_id text not null references orders(id),
  amount_paise int not null,
  created_at timestamptz not null default now(),
  unique (batch_id, order_id)
);

create table if not exists rider_location_pings (
  id text primary key,
  org_id text not null references organizations(id),
  rider_id text not null references riders(id),
  order_id text references orders(id),
  lat numeric not null,
  lng numeric not null,
  accuracy_m numeric,
  heading numeric,
  speed_mps numeric,
  recorded_at timestamptz not null default now()
);
create index if not exists rider_location_live_idx on rider_location_pings (org_id, rider_id, recorded_at desc);
create index if not exists rider_location_order_idx on rider_location_pings (order_id, recorded_at desc);

create table if not exists dispatch_assignments (
  id text primary key,
  org_id text not null references organizations(id),
  order_id text not null references orders(id),
  rider_id text not null references riders(id),
  score numeric not null default 0,
  distance_m numeric,
  eta_seconds int,
  status text not null default 'OFFERED',
  offered_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (order_id, rider_id, offered_at)
);
create index if not exists dispatch_order_idx on dispatch_assignments (order_id, status, offered_at desc);
create index if not exists dispatch_rider_idx on dispatch_assignments (rider_id, status, offered_at desc);

alter table notifications add column if not exists provider_message_id text;
alter table notifications add column if not exists delivered_at timestamptz;
create index if not exists notifications_status_idx on notifications (org_id, status, created_at desc);
