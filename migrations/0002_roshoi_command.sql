-- Roshoi Command (Window 4) — administration, operations, finance visibility.
-- Marketplace rows are organization-scoped. Employee identity is user_id TEXT
-- (Better Auth id). Audit logs are APPEND-ONLY — application code must never
-- UPDATE or DELETE them.

create table if not exists organizations (
  id text primary key,
  name text not null,
  legal_name text not null,
  tagline text not null default '',
  data_mode text not null default 'SIMULATED',
  created_at timestamptz not null default now()
);

create table if not exists workspace_meta (
  org_id text primary key references organizations(id),
  seed_version int not null default 0,
  seeded_at timestamptz,
  data_mode text not null default 'SIMULATED'
);

create table if not exists cities (
  id text primary key,
  org_id text not null references organizations(id),
  name text not null,
  state text not null,
  country text not null default 'IN',
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now()
);
create index if not exists cities_org_idx on cities (org_id);

create table if not exists zones (
  id text primary key,
  org_id text not null references organizations(id),
  city_id text not null references cities(id),
  name text not null,
  geometry_json text not null default '{}',
  delivery_fee_paise int not null default 0,
  min_order_paise int not null default 0,
  max_radius_km numeric not null default 6,
  eta_minutes int not null default 35,
  rider_requirement int not null default 2,
  restaurant_eligible int not null default 1,
  customer_available int not null default 1,
  status text not null default 'ACTIVE'
);
create index if not exists zones_city_idx on zones (city_id);
create index if not exists zones_org_idx on zones (org_id);

create table if not exists employees (
  id text primary key,
  org_id text not null references organizations(id),
  user_id text,
  email text not null,
  name text not null,
  role_key text not null,
  custom_permissions_json text,
  department text not null default '',
  city_id text,
  area_id text,
  status text not null default 'ACTIVE',
  mfa_ready int not null default 0,
  access_expires_at timestamptz,
  assumed_role_key text,
  last_active_at timestamptz,
  invited_by text,
  notes text,
  created_at timestamptz not null default now(),
  unique (org_id, email)
);
create index if not exists employees_user_idx on employees (user_id);
create index if not exists employees_org_idx on employees (org_id);
create index if not exists employees_city_idx on employees (city_id);

create table if not exists employee_logins (
  id text primary key,
  org_id text not null,
  employee_id text not null references employees(id),
  user_id text not null,
  event text not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists employee_logins_emp_idx on employee_logins (employee_id, created_at desc);

create table if not exists restaurants (
  id text primary key,
  org_id text not null references organizations(id),
  city_id text not null references cities(id),
  zone_id text not null references zones(id),
  name text not null,
  slug text not null,
  cuisine text not null,
  address text not null,
  phone_masked text not null,
  legal_name text,
  kyc_status text not null default 'PENDING',
  payout_status text not null default 'PENDING',
  status text not null default 'DRAFT',
  commission_bps int not null default 1000,
  rating_x10 int not null default 45,
  prep_minutes int not null default 18,
  hours_json text not null default '{}',
  data_mode text not null default 'SIMULATED',
  created_at timestamptz not null default now()
);
create index if not exists restaurants_org_status_idx on restaurants (org_id, status);
create index if not exists restaurants_city_idx on restaurants (city_id);

create table if not exists menu_items (
  id text primary key,
  org_id text not null,
  restaurant_id text not null references restaurants(id),
  category text not null,
  name text not null,
  price_paise int not null,
  available int not null default 1,
  veg int not null default 1
);
create index if not exists menu_items_rst_idx on menu_items (restaurant_id);

create table if not exists riders (
  id text primary key,
  org_id text not null references organizations(id),
  city_id text not null references cities(id),
  zone_id text not null references zones(id),
  name text not null,
  phone_masked text not null,
  vehicle text not null,
  kyc_status text not null default 'PENDING',
  status text not null default 'PENDING',
  online int not null default 0,
  active_order_id text,
  lat numeric,
  lng numeric,
  rating_x10 int not null default 48,
  cash_collected_paise int not null default 0,
  cash_reconciled_paise int not null default 0,
  data_mode text not null default 'SIMULATED',
  created_at timestamptz not null default now()
);
create index if not exists riders_org_status_idx on riders (org_id, status);
create index if not exists riders_city_idx on riders (city_id);

create table if not exists customers (
  id text primary key,
  org_id text not null references organizations(id),
  city_id text not null references cities(id),
  display_ref text not null,
  phone_masked text not null,
  status text not null default 'ACTIVE',
  loyalty_tier text not null default 'NONE',
  order_count int not null default 0,
  last_order_at timestamptz,
  risk_score int not null default 0,
  data_mode text not null default 'SIMULATED',
  created_at timestamptz not null default now()
);
create index if not exists customers_org_idx on customers (org_id);
create index if not exists customers_city_idx on customers (city_id);

create table if not exists orders (
  id text primary key,
  org_id text not null references organizations(id),
  city_id text not null references cities(id),
  zone_id text not null references zones(id),
  restaurant_id text not null references restaurants(id),
  customer_id text not null references customers(id),
  rider_id text,
  status text not null,
  payment_status text not null,
  payment_method text not null,
  food_paise int not null,
  restaurant_discount_paise int not null default 0,
  platform_discount_paise int not null default 0,
  delivery_fee_paise int not null default 0,
  service_fee_paise int not null default 0,
  tax_paise int not null default 0,
  total_paise int not null,
  commission_paise int not null default 0,
  payment_fee_paise int not null default 0,
  rider_payout_paise int not null default 0,
  refund_paise int not null default 0,
  promised_at timestamptz,
  placed_at timestamptz not null,
  confirmed_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  data_mode text not null default 'SIMULATED',
  created_at timestamptz not null default now()
);
create index if not exists orders_org_status_idx on orders (org_id, status);
create index if not exists orders_city_idx on orders (city_id);
create index if not exists orders_rst_idx on orders (restaurant_id);
create index if not exists orders_rider_idx on orders (rider_id);
create index if not exists orders_placed_idx on orders (org_id, placed_at desc);

create table if not exists order_items (
  id text primary key,
  org_id text not null,
  order_id text not null references orders(id),
  menu_item_id text,
  name text not null,
  qty int not null,
  unit_paise int not null
);
create index if not exists order_items_order_idx on order_items (order_id);

create table if not exists order_events (
  id text primary key,
  org_id text not null,
  order_id text not null references orders(id),
  actor_employee_id text,
  from_status text,
  to_status text,
  action text not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on order_events (order_id, created_at);

create table if not exists tickets (
  id text primary key,
  org_id text not null references organizations(id),
  city_id text,
  queue text not null,
  category text not null,
  status text not null default 'OPEN',
  priority text not null default 'MEDIUM',
  subject text not null,
  customer_id text,
  restaurant_id text,
  rider_id text,
  order_id text,
  assigned_employee_id text,
  sla_minutes int not null default 30,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution_code text,
  data_mode text not null default 'SIMULATED'
);
create index if not exists tickets_org_status_idx on tickets (org_id, status);
create index if not exists tickets_queue_idx on tickets (org_id, queue, status);

create table if not exists ticket_messages (
  id text primary key,
  ticket_id text not null references tickets(id),
  org_id text not null,
  visibility text not null,
  author_type text not null,
  author_employee_id text,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists ticket_messages_tkt_idx on ticket_messages (ticket_id, created_at);

create table if not exists ledger_entries (
  id text primary key,
  org_id text not null,
  order_id text,
  restaurant_id text,
  rider_id text,
  party text not null,
  kind text not null,
  source text not null,
  rule_key text not null,
  amount_paise int not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists ledger_order_idx on ledger_entries (order_id);
create index if not exists ledger_party_idx on ledger_entries (org_id, party, created_at desc);

create table if not exists promotions (
  id text primary key,
  org_id text not null references organizations(id),
  name text not null,
  kind text not null,
  funding text not null,
  percent_bps int,
  fixed_paise int,
  min_order_paise int not null default 0,
  max_discount_paise int,
  first_order_only int not null default 0,
  zone_id text,
  restaurant_id text,
  category text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'DRAFT',
  estimated_cost_paise int not null default 0,
  actual_cost_paise int not null default 0,
  usage_count int not null default 0,
  cap_count int,
  created_at timestamptz not null default now()
);
create index if not exists promotions_org_idx on promotions (org_id, status);

create table if not exists loyalty_programs (
  id text primary key,
  org_id text not null references organizations(id),
  name text not null,
  kind text not null,
  earn_bps int not null default 0,
  cap_paise int,
  status text not null default 'ACTIVE',
  rules_json text not null default '{}'
);

create table if not exists cms_entries (
  id text primary key,
  org_id text not null references organizations(id),
  surface text not null,
  slot text not null,
  title text not null,
  body text,
  image_url text,
  link_url text,
  sponsored int not null default 0,
  sort_order int not null default 0,
  status text not null default 'PUBLISHED',
  updated_at timestamptz not null default now()
);
create index if not exists cms_org_idx on cms_entries (org_id, surface, slot);

create table if not exists branding (
  org_id text primary key references organizations(id),
  app_name text not null,
  logo_svg text,
  favicon_svg text,
  color_bg text not null,
  color_fg text not null,
  color_primary text not null,
  color_primary_fg text not null,
  color_accent text not null,
  font_display text,
  font_body text,
  domain text,
  tagline text,
  app_store_name text,
  notification_sender text,
  invoice_branding text,
  customer_branding text,
  restaurant_branding text,
  rider_branding text,
  admin_branding text,
  legal_company_name text,
  support_email text,
  support_phone text,
  updated_at timestamptz not null default now()
);

create table if not exists feature_flags (
  id text primary key,
  org_id text not null references organizations(id),
  key text not null,
  state text not null default 'OFF',
  rollout_pct int not null default 0,
  city_id text,
  notes text,
  unique (org_id, key)
);

create table if not exists platform_settings (
  org_id text primary key references organizations(id),
  settings_json text not null,
  updated_at timestamptz not null default now(),
  updated_by_employee_id text
);

create table if not exists audit_logs (
  id text primary key,
  org_id text not null,
  employee_id text,
  user_id text,
  role_key text,
  action text not null,
  target_type text,
  target_id text,
  previous_json text,
  new_json text,
  reason text,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists audit_org_idx on audit_logs (org_id, created_at desc);
create index if not exists audit_action_idx on audit_logs (org_id, action);

create table if not exists kyc_cases (
  id text primary key,
  org_id text not null,
  subject_type text not null,
  subject_id text not null,
  status text not null default 'PENDING',
  reviewer_employee_id text,
  notes text,
  document_refs_json text not null default '[]',
  updated_at timestamptz not null default now()
);
create index if not exists kyc_org_idx on kyc_cases (org_id, status);

create table if not exists risk_signals (
  id text primary key,
  org_id text not null,
  subject_type text not null,
  subject_id text not null,
  signal_key text not null,
  score int not null,
  status text not null default 'OPEN',
  summary text not null,
  created_at timestamptz not null default now()
);
create index if not exists risk_org_idx on risk_signals (org_id, status);

create table if not exists notifications (
  id text primary key,
  org_id text not null,
  channel text not null,
  template_key text not null,
  audience text not null,
  status text not null,
  provider text not null default 'ADAPTER',
  provider_confirmed int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists alerts (
  id text primary key,
  org_id text not null,
  severity text not null,
  kind text not null,
  title text not null,
  body text not null,
  status text not null default 'OPEN',
  city_id text,
  created_at timestamptz not null default now()
);
create index if not exists alerts_org_idx on alerts (org_id, status, created_at desc);

create table if not exists custom_roles (
  id text primary key,
  org_id text not null references organizations(id),
  key text not null,
  name text not null,
  permissions_json text not null,
  unique (org_id, key)
);
