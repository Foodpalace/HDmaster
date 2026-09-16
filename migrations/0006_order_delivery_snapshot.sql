-- Canonical delivery snapshot needed by customer/rider windows without creating a second order authority.
alter table orders add column if not exists delivery_address_json text;
alter table orders add column if not exists delivery_lat numeric;
alter table orders add column if not exists delivery_lng numeric;
alter table orders add column if not exists delivery_otp text;
create index if not exists orders_delivery_location_idx on orders (org_id, delivery_lat, delivery_lng);
