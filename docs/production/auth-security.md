# AuraFin — Manual de Segurança de Autenticação, MFA / TOTP e Governança de Sessão

Este documento estabelece as diretrizes de segurança, endurecimento de autenticação (**Auth Hardening**), políticas de senha, **MFA / TOTP (AAL2)**, governança de sessão e runbooks de resposta a incidentes para o **AuraFin**.

---

## 🏛️ 1. Arquitetura de Autenticação

```
+---------------------------------------------------------------------------------------------------+
|                                 ARQUITETURA DE AUTHENTICATION & MFA                               |
+------------------------------------+--------------------------------------------------------------+
| 1. Signup / Cadastro Forte         | E-mail normalizado, Nome, Senha forte (mín. 12 caracteres,   |
|                                    | maiúsculas, minúsculas, números e símbolos) e aceite LGPD.  |
+------------------------------------+--------------------------------------------------------------+
| 2. Confirmação de E-mail           | Acesso financeiro bloqueado até verificação de e-mail com    |
|                                    | reenvio protegido por cooldown de 60 segundos.               |
+------------------------------------+--------------------------------------------------------------+
| 3. Login & Rate Limiting           | Respostas genéricas sem account enumeration, prevenção de    |
|                                    | brute force e UX humanizada para HTTP 429.                   |
+------------------------------------+--------------------------------------------------------------+
| 4. Password Recovery               | Link seguro temporário para redefinição sem expor existência |
|                                    | de contas para terceiros.                                    |
+------------------------------------+--------------------------------------------------------------+
| 5. MFA / TOTP (AAL1 ➔ AAL2)        | Suporte nativo a TOTP (RFC 6238), QR code seguro em memória, |
|                                    | challenge no login e step-up em ações críticas.              |
+------------------------------------+--------------------------------------------------------------+
| 6. Account Security View           | Gestão de fatores MFA ativos/inativos, alteração de senha e  |
|                                    | purga completa de cache no logout.                           |
+------------------------------------+--------------------------------------------------------------+
```

---

## 🔒 2. Política de Senhas & UX Segura

- **Requisitos Obrigatórios**:
  - Comprimento mínimo de **12 caracteres**.
  - Pelo menos uma letra maiúscula (`[A-Z]`).
  - Pelo menos uma letra minúscula (`[a-z]`).
  - Pelo menos um dígito numérico (`[0-9]`).
  - Pelo menos um caractere especial (`[^A-Za-z0-9]`).
- **Privacidade & Higiene**:
  - Senhas nunca são logadas, transmitidas em URLs ou salvas em estado global não criptografado.
  - Indicador visual dinâmico com 4 níveis de força sem promessas absolutas enganosas.

---

## 🛡️ 3. MFA / TOTP & Authenticator Assurance Levels (AAL)

- **AAL1**: Login padrão por e-mail e senha.
- **AAL2**: Autenticação reforçada com verificação de código TOTP de 6 dígitos.
- **Operações Críticas com AAL2**:
  - Distribuição de lucros societária (`process_profit_distribution_payout`).
  - Pró-labore societário (`process_pro_labore_payout`).
  - Reembolso societário cross-context (`process_cross_context_reimbursement`).
  - Alteração e desativação de fatores de segurança da conta.

---

## 🧹 4. Clean Slate & Isolamento Rigoroso de Sessão

- **Zero Mocks / Demo em Produção**:
  - Novos usuários e empresas iniciam com saldo R$ 0,00 e listas vazias.
  - Todos os valores exibidos derivam de consultas reais ao Supabase PostgreSQL.
- **Prevenção de Vazamento de Dados (User A ➔ User B)**:
  - No evento `SIGNED_OUT`, todos os arrays e estados em memória são resetados para `[]` e `null`.
  - Nenhuma informação de perfil, contas ou transações permanece no DOM ou na memória da SPA.

---

## 📖 5. Runbook Operacional de Resposta a Incidentes de Auth

| Incidente | Sintoma / Alerta | Ação de Contenção | Ação de Resolução |
| :--- | :--- | :--- | :--- |
| **Bloqueio por Brute Force** | HTTP 429 ou múltiplos logs `invalid_credentials` | O rate limit do Supabase Auth bloqueia automaticamente o IP | Orientar o usuário a aguardar a expiração do cooldown. |
| **Falha no Envio de E-mails** | Usuário não recebe confirmação de signup | Verificar quota e status do SMTP no Supabase Dashboard | Reenviar link via botão de reenvio com cooldown ou usar SMTP corporativo. |
| **Bloqueio por Perda de MFA** | Usuário perdeu acesso ao app autenticador TOTP | Validar identidade do usuário por canal de suporte seguro | Administrador com papel autorizado pode desativar o fator via Supabase Dashboard. |
| **Sessão Comprometida** | Suspeita de acesso não autorizado | Executar `supabase.auth.admin.signOut(userId, 'global')` | Forçar expiração de todos os refresh tokens e exigir redefinição de senha. |
