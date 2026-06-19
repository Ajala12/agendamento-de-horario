-- ====================================================================
-- Schema do Sistema de Agendamento - Supabase (PostgreSQL)
-- ====================================================================
-- Execute este script inteiro no SQL Editor do seu projeto Supabase
-- (Supabase Dashboard > SQL Editor > New query > Run)
-- ====================================================================

-- Extensão para gerar UUIDs
create extension if not exists "pgcrypto";

-- ====================================================================
-- Tabela: users (usuários do sistema)
-- ====================================================================
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username varchar(100) unique not null,
  password text not null, -- ATENÇÃO: senha em texto puro (ver observação no final do arquivo)
  role varchar(20) not null check (role in ('comercial', 'suporte', 'admin')),
  name varchar(100) not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_username on users (username);
create index if not exists idx_users_role on users (role);

-- ====================================================================
-- Tabela: appointments (agendamentos)
-- ====================================================================
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  date varchar(10) not null,           -- formato YYYY-MM-DD
  time varchar(5) not null,            -- formato HH:mm
  client_name varchar(255) not null,
  client_group varchar(255) not null,
  client_phone varchar(20) not null,
  client_logins integer not null default 1,
  contract_plan_types text[] not null default '{}',
  contract_single_sub_type varchar(20),
  commercial_observation text,
  seller varchar(100) not null,
  support_person varchar(100) not null check (support_person in ('Clinton', 'Letícia')),
  support_observation text,
  status varchar(20) not null default 'pendente'
    check (status in ('pendente', 'confirmado', 'rejeitado', 'concluido', 'nao_ocorreu')),
  created_at timestamptz not null default now(),
  created_by varchar(100) not null
);

create index if not exists idx_appointments_date on appointments (date);
create index if not exists idx_appointments_date_time on appointments (date, time);
create index if not exists idx_appointments_support on appointments (support_person);
create index if not exists idx_appointments_status on appointments (status);

-- ====================================================================
-- Tabela: time_slots (horários disponíveis para agendamento)
-- ====================================================================
create table if not exists time_slots (
  id uuid primary key default gen_random_uuid(),
  time varchar(5) unique not null,
  active boolean not null default true
);

-- Horários padrão
insert into time_slots (time) values
  ('08:00'), ('08:30'), ('09:00'), ('09:30'),
  ('10:00'), ('10:30'), ('11:00'), ('11:30'),
  ('13:00'), ('13:30'), ('14:00'), ('14:30'),
  ('15:00'), ('15:30'), ('16:00'), ('16:30'),
  ('17:00'), ('17:30')
on conflict (time) do nothing;

-- ====================================================================
-- Usuários iniciais (mesmos do modo em memória do projeto)
-- ====================================================================
insert into users (username, password, role, name, active) values
  ('admin',     'admin123',     'admin',     'Administrador', true),
  ('pedro',     'pedro123',     'comercial', 'Pedro',         true),
  ('marcus',    'marcus123',    'comercial', 'Marcus',        true),
  ('gabrielli', 'gabrielli123', 'comercial', 'Gabrielli',     true),
  ('josue',     'josue123',     'comercial', 'Josue',         true),
  ('livia',     'livia123',     'comercial', 'Livia',         true),
  ('emily',     'emily123',     'comercial', 'Emily',         true),
  ('clinton',   'clinton123',   'suporte',   'Clinton',       true),
  ('leticia',   'leticia123',   'suporte',   'Letícia',       true)
on conflict (username) do nothing;

-- ====================================================================
-- Row Level Security
-- ====================================================================
-- Este projeto acessa o Supabase usando a service_role key, exclusivamente
-- no servidor (rotas /app/api), nunca no navegador. Por isso, mantemos o
-- RLS desligado por padrão. Caso você passe a acessar o Supabase também a
-- partir do navegador, ative o RLS e crie políticas adequadas antes disso:
--
-- alter table appointments enable row level security;
-- alter table users enable row level security;
-- alter table time_slots enable row level security;

-- ====================================================================
-- OBSERVAÇÃO IMPORTANTE SOBRE SENHAS
-- ====================================================================
-- As senhas estão sendo guardadas em texto puro, replicando o
-- comportamento original do projeto (lib/users-repository.ts). Isso é
-- aceitável apenas para testes. Para produção, o ideal é fazer hash das
-- senhas (ex: bcrypt) antes de gravar e comparar os hashes no login.
