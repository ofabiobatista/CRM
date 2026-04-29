-- Rodar no Supabase SQL Editor: https://supabase.com/dashboard/project/vhkpsfpkoxwekbtgqsdr/sql

create table contacts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text,
  phone text,
  company text,
  status text default 'lead',
  tags jsonb default '[]',
  created_at date default current_date
);

create table deals (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  contact_id uuid references contacts(id) on delete set null,
  value numeric default 0,
  stage text default 'prospeccao',
  probability integer default 0,
  closing_date date,
  notes text
);

create table activities (
  id uuid default gen_random_uuid() primary key,
  type text not null,
  contact_id uuid references contacts(id) on delete set null,
  deal_id uuid references deals(id) on delete set null,
  description text,
  date date,
  done boolean default false
);

create table tickets (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  contact_id uuid references contacts(id) on delete set null,
  category text,
  priority text default 'media',
  status text default 'novo',
  assignee text,
  description text,
  created_at date default current_date,
  updated_at date default current_date
);

create table leads (
  id uuid default gen_random_uuid() primary key,
  nome text,
  email text,
  telefone text,
  empresa text,
  servico text,
  mensagem text,
  origem text,
  lido boolean default false,
  data date default current_date
);

create table proposals (
  id uuid default gen_random_uuid() primary key,
  contact_id uuid references contacts(id) on delete set null,
  client_name text not null,
  company text not null,
  niche text,
  city text,
  slug text unique not null,
  status text default 'rascunho',
  platforms text,
  objective text,
  media_budget numeric default 0,
  agency_fee numeric default 0,
  total numeric default 0,
  total_contract numeric default 0,
  contract_period text,
  contract_months integer,
  services jsonb default '[]',
  expected_leads text,
  expected_cpl text,
  expected_roas text,
  expected_cpa text,
  url text,
  created_at timestamptz default now(),
  sent_at timestamptz
);
