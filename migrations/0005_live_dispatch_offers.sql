-- LIVE dispatch bridge: READY orders create real offers for eligible online riders in the canonical core.
-- No simulated rider path is involved. Matching remains conservative until zone-level scoring is expanded.

create or replace function create_live_dispatch_offers()
returns trigger
language plpgsql
as $$
begin
  if new.data_mode <> 'PRODUCTION' or new.status <> 'READY' or old.status = 'READY' then
    return new;
  end if;

  insert into dispatch_assignments (id, org_id, order_id, rider_id, score, distance_m, eta_seconds, status, offered_at)
  select
    'offer_' || substr(md5(new.id || r.id || clock_timestamp()::text), 1, 20),
    new.org_id,
    new.id,
    r.id,
    0,
    null,
    null,
    'OFFERED',
    now()
  from riders r
  where r.org_id = new.org_id
    and r.city_id = new.city_id
    and r.zone_id = new.zone_id
    and r.status = 'ACTIVE'
    and r.online = 1
    and r.data_mode = 'PRODUCTION'
    and r.active_order_id is null
    and not exists (
      select 1 from dispatch_assignments da
      where da.order_id = new.id
        and da.rider_id = r.id
        and da.status in ('OFFERED', 'ACCEPTED')
    )
  order by r.rating_x10 desc, r.created_at asc
  limit 5;

  return new;
end;
$$;

drop trigger if exists orders_ready_dispatch_trigger on orders;
create trigger orders_ready_dispatch_trigger
after update of status on orders
for each row
execute function create_live_dispatch_offers();
