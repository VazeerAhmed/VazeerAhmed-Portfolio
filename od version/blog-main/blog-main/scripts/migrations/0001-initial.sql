create table page_views_daily (
  id bigserial primary key,
  page text not null,
  view_date date not null,
  views integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page, view_date)
);
