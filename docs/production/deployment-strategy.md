# AuraFin — Estratégia de Deployment, CI/CD e Arquitetura de Ambientes

Este documento estabelece as diretrizes oficiais de engenharia de software para o ciclo de vida, integração contínua (CI), entrega contínua (CD), governança de banco de dados (Supabase PostgreSQL), hospedagem (Vercel) e procedimentos de rollback do **AuraFin**.

---

## 🏛️ 1. Arquitetura de Ambientes

```
+---------------------------------------------------------------------------------------------------+
|                                      ARQUITETURA DE AMBIENTES                                     |
+------------------------------------+--------------------------------+-----------------------------+
| DEVELOPMENT (Local)                | STAGING (Homologação)          | PRODUCTION (Produção)       |
+------------------------------------+--------------------------------+-----------------------------+
| • Supabase CLI Local (Docker)      | • Projeto Supabase Staging     | • Projeto Supabase Prod     |
| • Frontend: localhost:3000         | • Frontend: Vercel Staging/Prv | • Frontend: Vercel Prod     |
| • Dados 100% sintéticos/mock       | • Dados sintéticos de teste    | • Dados reais dos clientes  |
| • Sem acesso a secrets de Prod     | • Migrations homologadas em PR | • Zero seeds fictícias      |
| • Branch: feature/*, fix/*         | • Branch: develop              | • Branch: main (Protegida)  |
+------------------------------------+--------------------------------+-----------------------------+
```

---

## 🌿 2. Estratégia Git & Branch Protection

### Estrutura de Branches
- **`main`**: Branch de produção. Código estável, homologado e ativo em produção.
- **`develop`**: Branch de integração contínua e staging.
- **`feature/*`**: Desenvolvimento de novos módulos e melhorias.
- **`fix/*`**: Correções de bugs identificados em staging ou desenvolvimento.
- **`hotfix/*`**: Correções críticas de produção com esteira prioritária.

### Regras de Proteção de Branch (`main` e `develop`)
1. **Pull Request Obrigatório**: Proibido push direto em `main` e `develop`.
2. **CI Gates Obrigatórios**: O merge só é liberado se todos os checks do CI passarem com status **PASS** (TypeScript, Build e Validação de Migrations).
3. **Bloqueio de Force Push**: `git push --force` desabilitado permanentemente.
4. **Preservação de Histórico**: Proibida a exclusão acidental de branches principais.

---

## 🤖 3. Pipelines de CI/CD (GitHub Actions)

### A. Pull Request Gate (`.github/workflows/ci.yml`)
Disparado em qualquer Pull Request para `develop` ou `main`:
- **Instalação Determinística**: `npm ci` utilizando o `package-lock.json`.
- **TypeScript Check**: `npm run lint` (`tsc --noEmit`) garantindo **0 erros** de tipagem.
- **Production Build**: `npm run build` garantindo empacotamento completo do Vite.
- **Auditoria de Migrations**: Validação da ordem sequencial (`0001` → `0014+`) e detecção de comandos destrutivos não autorizados.

### B. CD Staging (`.github/workflows/cd-staging.yml`)
Disparado no push/merge para `develop`:
- Executa verificação completa de tipos e build com as variáveis de Staging.
- Aplica migrations pendentes no Supabase Staging via `supabase db push`.
- Aciona preview/deployment na Vercel.

### C. CD Production (`.github/workflows/cd-production.yml`)
Disparado no push/merge para `main`:
- Protegido pelo GitHub Environment `production` (exige aprovação manual).
- Concorrência restrita (`concurrency: production-deploy`): apenas 1 deploy executado por vez.
- Aplica migrations no Supabase Production e publica o bundle oficial na Vercel.

---

## 🛡️ 4. Governança de Migrations PostgreSQL

### Política Zero Manual SQL em Produção
- **Proibição Estrita**: Nenhuma alteração estrutural ou de DDL pode ser feita diretamente pelo SQL Editor do Dashboard de produção.
- **Versionamento Sequencial**: Toda alteração de schema deve ser registrada em um arquivo SQL numerado sequencialmente em `supabase/migrations/` (ex: `20260815000015_...sql`).

### Padrão Expand-Migrate-Contract
Para garantir deploys sem downtime e permitir rollbacks imediatos de frontend:
1. **Expand**: Cria novas colunas, tabelas ou funções de forma não destrutiva (mantendo compatibilidade com o frontend atual).
2. **Migrate**: Lança a nova versão do frontend que consome a nova estrutura.
3. **Contract**: Em release posterior, remove de forma segura colunas ou tabelas depreciadas.

---

## 🔄 5. Matriz de Tratamento de Falhas (Failure Matrix)

| Cenário | Ponto de Falha | Ação Imediata do Pipeline | Ação Operacional do Engenheiro |
| :--- | :--- | :--- | :--- |
| **Caso A** | CI falha no Pull Request | Bloqueia merge no GitHub | Corrigir erros de lint/build na feature branch. |
| **Caso B** | Migration falha no Staging | Interrompe pipeline de Staging | Corrigir migration via novo commit antes de retestar. |
| **Caso C** | Frontend falha no Staging | Bloqueia release candidate | Analisar logs de build/renderização na Vercel Staging. |
| **Caso D** | Migration falha na Produção | Interrompe release imediatamente | Investigar erro no log. O PostgreSQL efetua rollback transacional da migration. |
| **Caso E** | Frontend novo com bug crítico | N/A | Executar **Instant Rollback** na Vercel para o deployment anterior. |
| **Caso F** | Bug em migration aplicada | N/A | **NÃO aplicar DROP manual**. Criar migration corretiva (**Forward-Fix**) `0015_fix_...`. |

---

## 📖 6. Runbook Operacional

### Release Normal (Passo a Passo)
1. Desenvolver a funcionalidade em uma branch `feature/nome-da-feature`.
2. Criar Pull Request para `develop`.
3. Aguardar aprovação do CI Gate (`ci.yml`).
4. Realizar merge em `develop` ➔ Deploy automático no **Staging**.
5. Executar testes exploratórios (Smoke Tests) no ambiente de Staging.
6. Abrir Pull Request de `develop` para `main` (Release Candidate).
7. Aprovar o deploy no GitHub Environment `production`.
8. O pipeline aplica as migrations em Produção e publica o frontend na Vercel.
9. Validar a saúde do sistema em produção.

### Runbook de Rollback (Emergência)
1. **Rollback de Frontend (Vercel)**:
   - Acessar o Dashboard da Vercel no projeto `aurafin`.
   - Navegar até **Deployments**.
   - Localizar o último deployment estável anterior e clicar em **Promote to Production** (Instant Rollback).
   - Validar retorno do sistema ao ar.
2. **Rollback de Banco de Dados (PostgreSQL)**:
   - Devido ao padrão *Expand-Migrate-Contract*, a versão anterior do frontend continua compatível com o banco.
   - Para reverter uma regra ou ajuste de banco, criar uma nova migration de correção (**Forward-Fix**) e promover via pipeline normal.
