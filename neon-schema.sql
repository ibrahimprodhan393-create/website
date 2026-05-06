create table if not exists app_store (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists app_store_updated_at_idx
  on app_store (updated_at);
