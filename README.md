# RG Flow

Aplicação web para gestão de tarefas, apontamento de horas e rentabilidade de um escritório contábil.

## Stack
- React + TypeScript + Vite
- Tailwind CSS e componentes no padrão shadcn/ui
- Supabase Auth, PostgreSQL e Row Level Security (RLS)

## Requisitos
- Interface em pt-BR, datas `dd/mm/aaaa` e valores em `R$`.
- Perfis: analista, coordenador e gerente.
- Dados nunca são excluídos fisicamente: registros são arquivados.
- Primeiro recorte: MVP simples com painel, tarefas, horas e indicadores de rentabilidade.

## Desenvolvimento
```bash
npm install
cp .env.example .env.local
npm run dev
```
Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` para ativar o Supabase. Sem configuração, o app usa dados demonstrativos locais.

## Banco de dados
Aplique `supabase/migrations/202610100001_initial_schema.sql` no projeto Supabase. A migration habilita RLS, funções de autorização por perfil e arquivamento lógico.

## Segurança
Nunca use `service_role` no frontend. O controle de acesso deve ser imposto no banco via RLS; a seleção de perfil na interface é apenas para demonstração e não concede privilégios reais.
