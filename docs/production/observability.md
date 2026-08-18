# AuraFin — Manual de Observabilidade, Structured Logging, Error Tracking & Resposta a Incidentes

Este documento estabelece a arquitetura oficial de observabilidade, padrões de logs estruturados, regras rígidas de **Redaction de PII e Segredos**, monitoramento de saúde de dependências e runbooks de resposta a incidentes para o **AuraFin**.

---

## 🏛️ 1. Arquitetura de Observabilidade

```
+---------------------------------------------------------------------------------------------------+
|                                 ARQUITETURA DE OBSERVABILIDADE AURAFIN                            |
+------------------------------------+--------------------------------------------------------------+
| 1. Structured Logging              | Níveis (debug, info, warn, error, fatal) com schema JSON     |
|                                    | padronizado (timestamp, env, release, correlation_id, etc.)  |
+------------------------------------+--------------------------------------------------------------+
| 2. Recursive PII/Secret Redaction  | Sanitização recursiva mandatória (senhas, tokens, cards,    |
|                                    | query params sensíveis, payloads financeiros brutos).         |
+------------------------------------+--------------------------------------------------------------+
| 3. Resilient Error Boundaries      | Global & por área (AppShell, PF, PJ, Auth, Reports) com      |
|                                    | UI executiva, retry seguro e Support Error ID (ERR-XXXX).     |
+------------------------------------+--------------------------------------------------------------+
| 4. Health Checks & Diagnostics     | Verificação segura de liveness/readiness (Frontend, Auth, DB |
|                                    | via RPC pública mínima, Storage) sem expor service_role.     |
+------------------------------------+--------------------------------------------------------------+
| 5. Release Correlation & Tracing   | Identificação por Git SHA (`VITE_RELEASE_SHA`) e correlation |
|                                    | IDs operacionais para rastreamento de operações societárias.  |
+------------------------------------+--------------------------------------------------------------+
| 6. Incident Runbooks & Manual      | Procedimentos de triagem SEV-1/2/3, matriz de severidade e   |
|                                    | guia de auditoria em docs/production/observability.md.       |
+------------------------------------+--------------------------------------------------------------+
```

---

## 🚦 2. Os Quatro Sinais Dourados (Golden Signals)

| Sinal | O que medimos | Ferramenta / Mecanismo |
| :--- | :--- | :--- |
| **Latência (Latency)** | Tempo de carregamento de páginas, RPCs atômicas e queries do Dashboard PF/PJ | `AuraLogger` com campo `duration_ms` e Vercel Speed Insights |
| **Tráfego (Traffic)** | Volume de requisições de autenticação e operações financeiras registradas | Supabase API Logs e Vercel Analytics |
| **Erros (Errors)** | Taxa de falhas categorizadas (`NETWORK_ERROR`, `AUTH_ERROR`, `PERMISSION_ERROR`, `SERVER_ERROR`) | Error Boundaries, `AuraLogger.error()` e `normalizeError()` |
| **Saturação (Saturation)** | Utilização de conexões do pool Postgres, quota de Storage e limites de taxa (429) | Supabase Dashboard Metrics e alertas operacionais |

---

## 🔒 3. Política Rígida de Redaction & Privacidade de Dados

A observabilidade no AuraFin é governada pela regra fundamental: **Visibilidade Operacional sem Vazamento de Dados**.

### 🚫 Itens Estritamente Proibidos em Logs:
1. **Senhas & Credenciais**: `password`, `currentPassword`, `newPassword`, `smtpPassword`.
2. **Tokens & Assinaturas**: `token`, `access_token`, `refresh_token`, `authorization`, `apikey`, `service_role`, `jwt`.
3. **Fatores MFA**: `code` (TOTP), `qr_code`, segredos de autenticador.
4. **Identificadores Pessoais & Cartões**: CPF completo (`***.***.***-**`), número completo de cartão (`**** **** **** ****`), CVV.
5. **Payloads Financeiros Brutos**: Arrays completos de transações, extratos bancários, metadados confidenciais de faturamento e balanços brutos.

---

## ⚠️ 4. Matriz de Severidade de Incidentes

| Nível | Impacto Operacional | Critérios de Disparo | Tempo de Resposta Alvo |
| :---: | :--- | :--- | :---: |
| **SEV-1 (Crítico)** | Aplicação totalmente indisponível ou risco de integridade financeira | Auth indisponível para todos; falha generalizada de conexão com o banco; violação de invariante de isolamento de inquilino (Cross-Tenant Leak). | **Imediato (< 15 min)** |
| **SEV-2 (Alto)** | Módulo essencial com falha parcial ou degradação severa | Falha em RPCs societárias (`process_pro_labore_payout`, `process_profit_distribution_payout`); bucket de Storage indisponível; erro 500 recorrente no Dashboard PJ. | **< 1 hora** |
| **SEV-3 (Médio)** | Falha isolada com recuperação local disponível | Erro de renderização em widget secundário contido pelo ErrorBoundary; lentidão moderada em relatórios; aviso de taxa de rate limit (429). | **< 4 horas** |

---

## 🛠️ 5. Runbooks de Triagem e Resposta a Incidentes

### 5.1 Runbook: Falhas de Frontend & Render Crashes
1. Obtenha o código de suporte informado pelo usuário (ex: `ERR-A1B2C3`).
2. Localize o evento nos logs buscando por `support_reference: "ERR-A1B2C3"`.
3. Identifique a versão do deploy (`release`) para verificar se o bug foi introduzido em commit recente.
4. Caso o erro afete múltiplos usuários após deploy, execute o **Runbook de Rollback** da Fase 3A.

### 5.2 Runbook: Falhas de Autenticação & Rate Limit Spikes
1. Acesse o painel Supabase > Auth > Logs.
2. Filtre por eventos de `login_failed`, `refresh_token_failed` ou `429 Too Many Requests`.
3. Se houver spike de 429 em massa, investigue se há ataque de força bruta por IP específico ou falha de loop no frontend.

### 5.3 Runbook: Falhas em RPCs Societárias & Cross-Context
1. Localize o `correlation_id` da operação no log estruturado.
2. Inspecione o erro retornado pela RPC no Postgres (`permission denied`, `insufficient funds`, etc.).
3. Verifique se o rollback automático foi executado garantindo atomicidade nas duas pontas (PF e PJ).

### 5.4 Runbook: Detecção de Objetos Órfãos no Storage
1. Execute o script de reconciliação: `node scripts/audit/storage-reconciliation.mjs`.
2. Se houver objetos órfãos (`find_orphan_storage_objects()`), audite os arquivos e execute a limpeza segura.

---

## 📝 6. Modelo de Postmortem de Incidente (`INC-YYYYMMDD-XXX`)

```markdown
# Relatório de Incidente — INC-20260814-001

## 1. Sumário Executivo
- **Data do Incidente:** DD/MM/AAAA
- **Severidade:** SEV-1 / SEV-2 / SEV-3
- **Duração Total:** XX minutos
- **Módulos Afetados:** Dashboard PJ / Auth / Storage

## 2. Linha do Tempo (Horário de Brasília)
- **14:00** — Primeiro alerta de erro emitido pelo ErrorBoundary.
- **14:05** — Triagem identifica falha na RPC de pró-labore.
- **14:15** — Rollback para release anterior ou correção pontual aplicada.
- **14:20** — Serviços normalizados e validados via health check.

## 3. Causa Raiz
Explicação técnica da falha sem atribuição de culpa individual.

## 4. Ações Corretivas e Preventivas
- [ ] Adicionar teste automatizado de regressão no CI.
- [ ] Ajustar threshold de alerta de latência.
```
