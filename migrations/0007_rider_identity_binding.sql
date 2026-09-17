-- Order King LIVE rider identity binding.
-- A rider's marketplace identity is bound to the authenticated Better Auth user
-- through a server-side mapping. LIVE dispatch endpoints must never trust a
-- caller-supplied rider id as identity.

alter table riders add column if not exists user_id text;
create unique index if not exists riders_org_user_uidx on riders (org_id, user_id) where user_id is not null;
create index if not exists riders_user_idx on riders (user_id);

comment on column riders.user_id is 'Better Auth user id bound to this rider; required for LIVE rider authorization.';
