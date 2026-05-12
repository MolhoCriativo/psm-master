# PSM Master — Plataforma de Preparação PSM I

Plataforma SaaS mobile-first para preparação à certificação **PSM I (Scrum.org)**, com IA integrada via Claude (Anthropic), banco de dados Supabase e deploy no Vercel.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React.js (CRA) |
| State | Zustand |
| Roteamento | React Router v6 |
| Banco de dados | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| IA | Anthropic Claude (claude-sonnet-4) |
| Deploy | Vercel |

---

## Setup Local

### 1. Clone e instale dependências

```bash
git clone <repo>
cd psm-master
npm install
```

### 2. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor**, execute o arquivo `supabase/migrations/001_initial_schema.sql`
3. Copie a **URL** e a **Anon Key** em Settings → API

### 3. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local`:

```env
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-anon-key

# Opcional: para IA diretamente no browser (dev only)
# Em produção, use a Edge Function
REACT_APP_ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Rode localmente

```bash
npm start
```

Acesse: http://localhost:3000

---

## Deploy no Vercel

### 1. Push para GitHub

```bash
git init && git add . && git commit -m "feat: initial PSM Master"
git remote add origin https://github.com/seu-user/psm-master.git
git push -u origin main
```

### 2. Importe no Vercel

1. [vercel.com/new](https://vercel.com/new) → Import do GitHub
2. Framework: **Create React App**
3. Adicione as **Environment Variables**:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_ANTHROPIC_API_KEY` *(ou use Edge Function para maior segurança)*
4. Deploy!

---

## IA em Produção (recomendado)

Para não expor a API key Anthropic no browser, use a **Supabase Edge Function**:

```bash
# Instale Supabase CLI
npm install -g supabase

# Login
supabase login

# Configure o secret
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Deploy a function
supabase functions deploy ai-explanation --project-ref seu-project-ref
```

Depois, altere `getAIExplanation` em `src/lib/supabase.js` para chamar a Edge Function em vez da API diretamente.

---

## Estrutura do Projeto

```
psm-master/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── AppLayout.js       # Bottom nav, wrapper
│   ├── lib/
│   │   └── supabase.js            # Client + todos os helpers de DB
│   ├── pages/
│   │   ├── AuthPage.js            # Login / Signup
│   │   ├── DashboardPage.js       # Home com stats e progress
│   │   ├── TrailPage.js           # Trilha de aprendizado
│   │   ├── ExamPage.js            # Motor de simulado com timer + IA
│   │   ├── ResultPage.js          # Resultado e breakdown por tópico
│   │   └── ProfilePage.js         # Perfil e histórico
│   ├── store/
│   │   └── index.js               # Zustand: auth + exam state
│   ├── App.js                     # Router e auth listener
│   ├── index.js
│   └── index.css                  # Design system tokens
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql # Schema completo + seed de questões
│   └── functions/
│       └── ai-explanation/        # Edge Function segura para Anthropic
├── vercel.json
├── .env.example
└── README.md
```

---

## Banco de Dados — Tabelas

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfil do usuário (extends auth.users) |
| `questions` | Banco de questões PSM I |
| `exam_sessions` | Sessões de simulado |
| `exam_answers` | Respostas individuais por sessão |
| `trail_progress` | Progresso na trilha por tópico |
| `user_stats` | Estatísticas agregadas (atualizado por trigger) |
| `topic_performance` | Acurácia por tópico por usuário |
| `review_queue` | Fila de revisão espaçada (spaced repetition) |

---

## Métricas de Sucesso (V1)

- [x] Taxa de conclusão de simulados implementada
- [x] Tracking de D7/D30 via Supabase (last_exam_at)
- [x] Média de simulados por usuário
- [x] Feedback de IA em respostas incorretas
- [x] Sistema de revisão espaçada (review_queue)

---

## Roadmap V2

- [ ] Modo de revisão via spaced repetition
- [ ] Notifications / push (PWA)
- [ ] Simulado adaptativo por performance
- [ ] Leaderboard / ranking
- [ ] Outros níveis (PSM II, PSPO)
- [ ] App nativo (React Native)
- [ ] Pagamento único por nível (Stripe)
