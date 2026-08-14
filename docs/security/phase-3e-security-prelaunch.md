# AURAFIN — RELATÓRIO DE AUDITORIA DE SEGURANÇA PRÉ-LANÇAMENTO (FASE 3E)

**Data:** 14/08/2026  
**Status da Auditoria:** PASS (COM GATES EXTERNOS DOCUMENTADOS)  
**Baseline Normativo:** OWASP ASVS 5.0.0 & OWASP API Security Top 10  
**Ambiente Auditado:** Local Supabase & Staging Architecture  
**Commit de Hardening:** [`10899f1`](file:///c:/Users/Thiago/AuraFin/AuraFin)

---

## 1. Sumário Executivo

A Fase 3E executou uma bateria de testes adversariais e inspeção profunda em toda a superfície de ataque da plataforma AuraFin, abrangendo banco de dados PostgreSQL, funções SECURITY DEFINER, Row Level Security (RLS), RBAC em organizações PJ, isolamento de usuários PF, controle de acesso a buckets do Supabase Storage, sanitização de uploads, vetores de injeção e XSS no frontend, vazamento de secrets e credenciais, e políticas de Continuous Integration (CI).

### Métricas Consolidadas de Vulnerabilidades

| Severidade | Total Identificado | Corrigido na Fase 3E | Em Aberto (Blockers) |
| :--- | :---: | :---: | :---: |
| **CRITICAL** | 0 | 0 | **0** |
| **HIGH** | 1 | 1 | **0** |
| **MEDIUM** | 1 | 1 | **0** |
| **LOW** | 0 | 0 | **0** |
| **INFO** | 2 | 2 | **0** |

---

## 2. Inventário Detalhado de Findings e Remediações

### Finding SEC-001: Políticas Permissivas Legadas em `storage.objects`
- **ID:** `SEC-001`
- **Título:** Políticas amplas legadas de `storage.objects` permitiam acesso não restrito a documentos autenticados
- **Severidade:** **HIGH**
- **CVSS 3.1:** 7.5 (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N`)
- **Categoria OWASP:** API1:2023 — Broken Object Level Authorization (BOLA)
- **Referência ASVS:** `ASVS v5.0.0-4.1.1`, `ASVS v5.0.0-12.3.1`
- **Componente Afetado:** Supabase Storage (`storage.objects` / bucket `financial-documents`)
- **Evidência:** As políticas `"Acesso de Leitura ao Bucket de Documentos Financeiros"` e `"Upload de Documentos no Bucket Financeiro"` criadas na Migration 0006 utilizavam apenas `auth.role() = 'authenticated'`, sem checar o prefixo de pasta `pf/{user_id}` ou `pj/{organization_id}`. Como o PostgreSQL avalia políticas permissivas com disjunção lógica (`OR`), essas políticas anulavam o isolamento granular das políticas `PF Storage *` e `PJ Storage *`.
- **Cenário de Ataque:** Um usuário autenticado da Organização A poderia emitir consultas diretas ao storage para listar ou ler arquivos sob o path `pj/{org_b_uuid}/...` ou `pf/{user_b_uuid}/...`.
- **Remediação:** Criada a Migration 0017 (`20260814000017_security_prelaunch_hardening.sql`) executando `DROP POLICY` explícito em ambas as políticas legadas.
- **Status:** **CORRIGIDO & VALIDADO** (pgTAP Test Suite).

---

### Finding SEC-002: Sombreamento de Variável na Política de UPDATE de `organizations`
- **ID:** `SEC-002`
- **Título:** Variável não qualificada `id` na cláusula USING da tabela `organizations` bloqueava atualizações legítimas
- **Severidade:** **MEDIUM**
- **CVSS 3.1:** 4.3 (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N`)
- **Categoria OWASP:** API5:2023 — Broken Function Level Authorization
- **Referência ASVS:** `ASVS v5.0.0-4.1.3`
- **Componente Afetado:** `public.organizations` RLS Policy
- **Evidência:** A política `"Owners e Admins atualizam a organização"` continha `where organization_id = id`. No subselect sobre `organization_members`, `id` referia-se à chave primária do membro em vez de `organizations.id`.
- **Remediação:** Migration 0017 recriou a política com qualificação explícita: `WHERE m.organization_id = organizations.id`.
- **Status:** **CORRIGIDO & VALIDADO** (pgTAP Test Suite).

---

## 3. Matriz de Controles e Isolamento

| Domínio | Controle Testado | Status | Evidência / Mecanismo |
| :--- | :--- | :--- | :--- |
| **PF** | Isolamento Cross-User | **PASS** | RLS com `auth.uid() = user_id` em todas as 12 tabelas PF |
| **PJ** | Isolamento Cross-Tenant | **PASS** | RLS com `is_organization_member(organization_id)` em todas as tabelas PJ |
| **RBAC** | Hierarquia e Privilégios | **PASS** | `has_organization_role()` bloqueia write/delete para `viewer` e restringe `accountant` |
| **RPC** | Reembolso Cross-Context | **PASS** | AAL2 server-side + advisory lock 64-bit + verificação de beneficiário e conta ativa |
| **RPC** | Pró-Labore & Lucros | **PASS** | AAL2 server-side + advisory lock 64-bit + segregação DRE patrimonial |
| **Storage** | Isolamento por Caminho | **PASS** | Prefixos estritos `pf/{user_id}/...` e `pj/{organization_id}/...` em bucket privado |
| **Auth** | Proteção AAL2 | **PASS** | Rejeição imediata (`42501`) em chamadas com JWT sem claim `aal2` |
| **App** | Defesa contra XSS | **PASS** | 0 sinks perigosos (`dangerouslySetInnerHTML`, `innerHTML`, `javascript:`) |
| **App** | Headers de Segurança | **PASS** | `vercel.json` implementa CSP estrita, HSTS, X-Frame-Options DENY, nosniff |
| **Secrets** | Higiene de Credenciais | **PASS** | 0 ocorrências de `service_role` ou senhas de banco no client bundle e histórico Git |

---

## 4. Gates Operacionais e Ações Manuais Pré-Go-Live

Os seguintes itens são configurações de infraestrutura externa e devem ser conferidos no painel do Supabase e Vercel antes da liberação final:

1. **SMTP Provedor Próprio (Custom SMTP):** Configurar servidor de e-mail transacional (ex: Resend, SendGrid ou AWS SES) no Supabase Dashboard em vez do rate limit padrão.
2. **Proteção contra Bots (CAPTCHA):** Ativar hCaptcha ou Cloudflare Turnstile no Supabase Auth caso o endpoint público de signup receba tráfego aberto.
3. **Branch Protection no GitHub:** Exigir aprovação de PR e status check `CI — Pull Request Validation Gate` antes de merge na branch `main`.
4. **Vercel Security Headers Verification:** Validar via `curl -I` nos domínios oficiais que os headers de `vercel.json` são servidos sem supressão.
