-- ==============================================================================
-- SCHEMA SUPABASE: SISTEMA DE INSTRUMENTOS AVALIATIVOS (COLÉGIO ADVENTISTA)
-- ==============================================================================

-- 1. TABELA DE PERFIS DE USUÁRIOS (PROFILES)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  role text not null check (role in ('SUPER_ADMIN', 'COORDENADOR', 'PROFESSOR')),
  avatar text,
  ativo boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TABELA DE TURMAS
create table if not exists public.turmas (
  id text primary key,
  nome text not null,
  serie text not null,
  nivel text not null,
  turno text not null,
  ano_letivo integer not null default 2026,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TABELA DE DISCIPLINAS
create table if not exists public.disciplinas (
  id text primary key,
  nome text not null,
  codigo text not null,
  ordem integer not null default 0,
  cor text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABELA DE ATRIBUIÇÕES (PROFESSOR -> DISCIPLINAS E TURMAS)
create table if not exists public.atribuicoes (
  id text primary key,
  professor_id text not null,
  professor_nome text not null,
  disciplina_ids jsonb not null default '[]'::jsonb,
  turma_ids jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TABELA DE CONFIGURAÇÕES GLOBAIS DO SISTEMA
create table if not exists public.system_settings (
  id text primary key default 'global',
  bimestre_atual integer not null default 3,
  status_edicao text not null default 'LIBERADO',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. TABELA DE INSTRUMENTOS AVALIATIVOS
create table if not exists public.instrumentos (
  id text primary key,
  numero integer not null,
  codigo_identificador text not null,
  tipo_nome text not null,
  etapa text,
  data text not null,
  peso numeric(5,2) not null,
  turma_id text not null,
  turma_nome text not null,
  turmas jsonb not null default '[]'::jsonb,
  disciplina_id text not null,
  disciplina_nome text not null,
  professor_id text,
  professor_nome text,
  bimestre integer not null,
  ano_letivo integer not null,
  conteudo text not null default '',
  fonte_estudo text not null default '',
  desenvolvimento text not null default '',
  criterios jsonb not null default '[]'::jsonb,
  habilidades jsonb not null default '[]'::jsonb,
  status text not null default 'RASCUNHO' check (status in ('RASCUNHO', 'ENVIADO', 'APROVADO', 'REJEITADO', 'LIBERADO_MODIFICACAO')),
  data_criacao text,
  data_envio text,
  data_aprovacao text,
  data_rejeicao text,
  coordenador_id text,
  coordenador_nome text,
  motivo_rejeicao text,
  historico jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- HABILITAR ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.turmas enable row level security;
alter table public.disciplinas enable row level security;
alter table public.atribuicoes enable row level security;
alter table public.system_settings enable row level security;
alter table public.instrumentos enable row level security;

-- POLÍTICAS RLS PARA PERFIS (PROFILES)
create policy "Perfis visíveis para usuários autenticados"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Usuários podem atualizar seus próprios perfis ou Super Admin pode atualizar qualquer um"
  on public.profiles for update
  to authenticated
  using (
    auth.uid() = id or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'SUPER_ADMIN'
    )
  );

create policy "Inserção de perfil autorizada para service_role ou no cadastro"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id or exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('SUPER_ADMIN', 'COORDENADOR')
  ));

create policy "Exclusão de perfil pelo Super Admin"
  on public.profiles for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'SUPER_ADMIN'
    )
  );

-- POLÍTICAS RLS PARA TURMAS E DISCIPLINAS
create policy "Turmas visíveis para autenticados" on public.turmas for select to authenticated using (true);
create policy "Turmas editáveis por coordenadores e admins" on public.turmas for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('SUPER_ADMIN', 'COORDENADOR'))
);

create policy "Disciplinas visíveis para autenticados" on public.disciplinas for select to authenticated using (true);
create policy "Disciplinas editáveis por coordenadores e admins" on public.disciplinas for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('SUPER_ADMIN', 'COORDENADOR'))
);

-- POLÍTICAS RLS PARA ATRIBUIÇÕES
create policy "Atribuições visíveis para autenticados" on public.atribuicoes for select to authenticated using (true);
create policy "Atribuições editáveis por coordenadores e admins" on public.atribuicoes for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('SUPER_ADMIN', 'COORDENADOR'))
);

-- POLÍTICAS RLS PARA CONFIGURAÇÕES DO SISTEMA
create policy "Configurações visíveis para autenticados" on public.system_settings for select to authenticated using (true);
create policy "Configurações editáveis por coordenadores e admins" on public.system_settings for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('SUPER_ADMIN', 'COORDENADOR'))
);

-- POLÍTICAS RLS PARA INSTRUMENTOS AVALIATIVOS
create policy "Instrumentos visíveis para usuários autenticados" on public.instrumentos for select to authenticated using (true);
create policy "Instrumentos inserção por usuários autenticados" on public.instrumentos for insert to authenticated with check (true);
create policy "Instrumentos atualização por usuários autenticados" on public.instrumentos for update to authenticated using (true);
create policy "Instrumentos exclusão por usuários autorizados" on public.instrumentos for delete to authenticated using (true);

-- TRIGGER AUTOMÁTICO PARA CRIAÇÃO DE PERFIL AO REGISTRAR NO AUTH.USERS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, email, role, avatar, ativo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'PROFESSOR'),
    new.raw_user_meta_data->>'avatar',
    true
  )
  on conflict (id) do update
  set nome = coalesce(new.raw_user_meta_data->>'nome', profiles.nome),
      role = coalesce(new.raw_user_meta_data->>'role', profiles.role),
      updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Associar trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
