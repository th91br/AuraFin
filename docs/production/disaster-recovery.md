# AuraFin — Manual de Disaster Recovery, Backups e Resiliência Operacional

Este documento estabelece a política oficial de **Disaster Recovery (DR)**, estratégia de **Backups**, metas de **RPO / RTO**, integridade financeira e runbooks de restauração para a plataforma **AuraFin**.

---

## 🎯 1. Definição Formal de Metas de Recuperação (RPO / RTO)

| Componente | RPO Alvo (Perda Máx. de Dados) | RTO Alvo (Tempo Máx. de Retorno) | Estratégia Técnica |
| :--- | :--- | :--- | :--- |
| **PostgreSQL Database** | **1 a 6 horas** (Perfil B) | **1 a 2 horas** | Backups Gerenciados Supabase + Dumps Lógicos Periódicos + Migrations Git |
| **Supabase Storage** | **6 a 24 horas** (Perfil B) | **1 a 3 horas** | Sincronização de Objetos + Manifest com Checksum SHA-256 |
| **Aplicação Completa** | **1 a 6 horas** | **1 a 2 horas** | Rebuild Automatizado + Reconexão Vercel + Smoke Tests |

### Perfis de Recuperação:
- **Perfil A (Essencial / Free)**: RPO 24h / RTO 4–8h (adequado para DEV/Staging).
- **Perfil B (Recomendado AuraFin)**: RPO 1–6h / RTO 1–2h (Plano Supabase Pro $25/mês com backups diários gerenciados + retenção 7 dias).
- **Perfil C (Crítico / Enterprise)**: RPO < 5 min / RTO < 30 min (PITR contínuo via WAL + Add-on $100/mês).

---

## 🏛️ 2. Arquitetura de Proteção em 5 Camadas

1. **Camada 1 (Supabase Managed Backups)**: Backups automáticos diários gerenciados pela infraestrutura do Supabase.
2. **Camada 2 (Logical Database Backup)**: Rotinas automatizadas de dump lógico (`scripts/backup/backup-database.mjs`).
3. **Camada 3 (Storage Object Backup & Manifest)**: Backup dos objetos do bucket privado `financial-documents` com integridade validada via SHA-256 (`scripts/backup/backup-storage.mjs`).
4. **Camada 4 (Configuration & Schema as Code)**: Migrations imutáveis `0001` a `0014` e tipagens versionadas no Git.
5. **Camada 5 (Restore Drills & Runbooks)**: Testes periódicos de restauração a partir do zero (`scripts/restore/`).

---

## 🚨 3. Matriz de Resposta a Desastres (Cenários A a L)

| Cenário | Descrição do Incidente | Ação Imediata | Procedimento de Recuperação |
| :--- | :--- | :--- | :--- |
| **A** | Delete acidental de registro financeiro | Conter mutações | Recuperação seletiva via cópia lógica/log sem restore destrutivo global. |
| **B** | Delete acidental de documento no Storage | Identificar path | Restaurar objeto específico a partir do backup do Storage via `manifest.json`. |
| **C** | Migration com regra lógica incorreta | Interromper CD | Aplicar migration corretiva (**Forward-Fix**) `0015_fix_...`. |
| **D** | Migration destrutiva não autorizada | Interromper deploy | Avaliar impacto. Restaurar a partir do snapshot pré-migration se houver corrupção. |
| **E** | Corrupção lógica de dados em lote | Bloquear writes | Identificar momento exato do bug, extrair dados íntegros e aplicar correção. |
| **F** | Usuário malicioso ou ataque a dados | Revogar sessões | Isolar tenant, auditar logs de auditoria e restaurar dados afetados. |
| **G** | Credencial administrativa comprometida | Rotacionar chaves | Revogar `service_role`, rotacionar tokens Supabase/GitHub e auditar acessos. |
| **H** | Indisponibilidade temporária do Supabase | Monitorar status | Não executar restore destrutivo; aguardar restabelecimento do provedor. |
| **I** | Perda total ou exclusão do projeto Supabase | Acionar DR Geral | Provisionar novo projeto, aplicar migrations `0001`–`0014`, restaurar dados e storage. |
| **J** | Bucket de Storage esvaziado/danificado | Bloquear uploads | Restaurar objetos do bucket preservando hierarquia `pf/` e `pj/` via script de restore. |
| **K** | Deploy com bug que grava dados errados | Rollback Vercel | Instant Rollback do frontend e script de saneamento/correção no banco. |
| **L** | Perda do ambiente local de desenvolvimento | Clone Git | `git clone`, `npm ci`, `supabase start` e execução limpa das migrations. |

---

## 📖 4. Runbook Operacional de Restauração do Banco de Dados

1. **Declaração de Incidente**:
   - Classificar o nível de severidade (SEV-1 para indisponibilidade total, SEV-2 para impacto parcial, SEV-3 para impacto menor).
   - Bloquear temporariamente novas conexões de escrita caso haja risco de corrupção contínua.
2. **Definição do Ponto de Restauração**:
   - Identificar o timestamp exato ou o backup lógico/snapshot válido mais recente.
3. **Provisionamento do Ambiente Alvo**:
   - Criar ou limpar o banco de destino (ambiente de homologação/recuperação).
4. **Aplicação do Schema & Migrations**:
   - Executar sequencialmente as migrations `0001` a `0014+` para garantir integridade estrutural.
5. **Restauração de Dados & Validação de Invariantes**:
   - Importar os dados relacionais garantindo valores inteiros em centavos (`amount_cents`).
   - Validar se `profiles`, `organizations`, `personal_accounts` e `business_accounts` batem com as contagens de controle.
6. **Verificação de Segurança RLS / RBAC**:
   - Executar asserções de isolamento multi-tenant (usuário PF só enxerga seus dados, membro PJ só enxerga sua organização).
7. **Liberação para Produção (Cutover)**:
   - Apontar as variáveis de ambiente na Vercel e restabelecer o tráfego da aplicação.

---

## 📁 5. Runbook Operacional de Restauração do Supabase Storage

1. **Validação do Bucket Privado**:
   - Garantir a existência do bucket privado `financial-documents`.
2. **Execução do Script de Restauração**:
   - Executar o script de upload em lote a partir do diretório de backup:
     ```bash
     node scripts/restore/restore-storage-drill.mjs
     ```
3. **Preservação de Hierarquia e Paths**:
   - Manter rigorosamente os caminhos `pf/{user_id}/{document_id}/{filename}` e `pj/{organization_id}/{document_id}/{filename}`.
4. **Validação por Checksum SHA-256**:
   - Comparar o hash de cada arquivo restaurado com o `manifest.json`.
5. **Auditoria de Reconciliação**:
   - Executar o script de auditoria para garantir zero arquivos órfãos e zero documentos sem arquivo físico:
     ```bash
     node scripts/audit/storage-reconciliation.mjs
     ```

---

## 🔒 6. Política de Segurança e Retenção de Backups

- **Proibição de Dados no Git**: Nenhum arquivo `.dump`, `.sql.gz` ou `manifest.json` com dados reais pode ser commitado (bloqueado via `.gitignore`).
- **Criptografia**: Backups externos devem utilizar criptografia em repouso (AES-256) e em trânsito (TLS 1.3).
- **Retenção Recomendada**:
  - Dumps diários: retenção de 30 dias.
  - Dumps semanais: retenção de 90 dias.
  - Dumps mensais arquivados: retenção de 1 ano.
