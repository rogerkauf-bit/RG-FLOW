# RG Flow

Aplicação web para gestão de tarefas, apontamento de horas e rentabilidade de um escritório contábil.

## Stack
- React + TypeScript + Vite
- Tailwind CSS, componentes no padrão shadcn/ui e ícones Lucide
- Supabase preparado para Auth, PostgreSQL e Row Level Security (RLS)

## MVP incluído
- Painel operacional com indicadores demonstrativos.
- Lista de tarefas com busca, filtros, criação e arquivamento/restauração sem exclusão física.
- Visões iniciais de horas, rentabilidade, equipe e clientes.
- UI responsiva em pt-BR, datas `dd/mm/aaaa`, valores em `R$` e paleta RG: `#204B8F`, `#264677`, `#EEF9FD`, `#A1B6D5`, `#5171A5`.
- Primitivos de UI no padrão shadcn em `src/components/ui`.

## Desenvolvimento
```bash
npm install
cp .env.example .env.local
npm run dev
```

Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env.local` para preparar o cliente Supabase. **Importante:** neste MVP, a interface ainda usa dados de demonstração; autenticação, consultas reais e gravação no Supabase não estão integradas ainda.

## Banco de dados e permissões
Aplique `supabase/migrations/202610100001_initial_schema.sql` no SQL Editor do Supabase. A migration cria organizações, perfis, clientes, tarefas e apontamentos de horas, habilita RLS e cria políticas baseadas em perfil/organização. Também bloqueia exclusões físicas por trigger e permissões SQL; arquive registros usando `archived_at`.

O primeiro registro de organização e a atribuição inicial de gerente devem ser provisionados por um fluxo administrativo confiável no Supabase. A migration não oferece cadastro público de organizações ou edição de cargos pelo frontend.

## Segurança
- Perfis previstos: analista, coordenador e gerente.
- RLS é a camada de autorização real no banco; o seletor “Perfil demo” na interface é apenas ilustrativo e não concede permissões.
- Nunca exponha a chave `service_role` no frontend.
- Revise e teste as políticas RLS com usuários de cada perfil antes de usar dados reais.
