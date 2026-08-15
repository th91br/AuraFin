import { spawnSync } from 'node:child_process';

const CONTAINER = 'supabase_db_aurafin';
const USER_ID = '3f000000-0000-0000-0000-000000000001';
const ORGANIZATION_ID = '3f000000-0000-0000-0000-000000000002';
const CLIENT_ID = '3f000000-0000-0000-0000-000000000003';

const sql = String.raw`
\set ON_ERROR_STOP on
\pset pager off
\timing on

BEGIN;

INSERT INTO auth.users (
  id,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '${USER_ID}',
  'phase-3f-benchmark@local.invalid',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Phase 3F Synthetic User"}'::jsonb,
  now(),
  now()
);

INSERT INTO public.organizations (id, name, status, created_by)
VALUES ('${ORGANIZATION_ID}', 'Phase 3F Synthetic Organization', 'active', '${USER_ID}');

INSERT INTO public.organization_members (organization_id, user_id, role, status)
VALUES ('${ORGANIZATION_ID}', '${USER_ID}', 'owner', 'active');

INSERT INTO public.clients (id, organization_id, name, status)
VALUES ('${CLIENT_ID}', '${ORGANIZATION_ID}', 'Phase 3F Synthetic Client', 'ativo');

\echo === PF SMALL: 100 rows ===
INSERT INTO public.personal_transactions (
  user_id, type, title, amount_cents, transaction_date, category, notes
)
SELECT
  '${USER_ID}',
  CASE WHEN g % 4 = 0 THEN 'income' ELSE 'expense' END,
  'Synthetic PF ' || g,
  1000 + (g % 200000),
  date '2024-01-01' + (g % 730)::integer,
  CASE g % 5
    WHEN 0 THEN 'moradia'
    WHEN 1 THEN 'alimentacao'
    WHEN 2 THEN 'transporte'
    WHEN 3 THEN 'saude'
    ELSE 'outros'
  END,
  CASE WHEN g % 20 = 0 THEN repeat('synthetic-note-', 8) ELSE NULL END
FROM generate_series(1, 100) AS g;
ANALYZE public.personal_transactions;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"${USER_ID}","role":"authenticated","aal":"aal2"}';
SELECT 'pf_rows' AS metric, count(*)::bigint AS value
FROM public.personal_transactions
WHERE user_id = '${USER_ID}' AND deleted_at IS NULL;
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM public.personal_transactions
WHERE user_id = '${USER_ID}' AND deleted_at IS NULL
ORDER BY transaction_date DESC;
RESET ROLE;

\echo === PF MEDIUM: 5,000 rows ===
INSERT INTO public.personal_transactions (
  user_id, type, title, amount_cents, transaction_date, category, notes
)
SELECT
  '${USER_ID}',
  CASE WHEN g % 4 = 0 THEN 'income' ELSE 'expense' END,
  'Synthetic PF ' || g,
  1000 + (g % 200000),
  date '2024-01-01' + (g % 730)::integer,
  CASE g % 5
    WHEN 0 THEN 'moradia'
    WHEN 1 THEN 'alimentacao'
    WHEN 2 THEN 'transporte'
    WHEN 3 THEN 'saude'
    ELSE 'outros'
  END,
  CASE WHEN g % 20 = 0 THEN repeat('synthetic-note-', 8) ELSE NULL END
FROM generate_series(101, 5000) AS g;
ANALYZE public.personal_transactions;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"${USER_ID}","role":"authenticated","aal":"aal2"}';
SELECT 'pf_rows' AS metric, count(*)::bigint AS value
FROM public.personal_transactions
WHERE user_id = '${USER_ID}' AND deleted_at IS NULL;
SELECT 'pf_json_bytes' AS metric, pg_column_size(jsonb_agg(to_jsonb(t)))::bigint AS value
FROM public.personal_transactions AS t
WHERE user_id = '${USER_ID}' AND deleted_at IS NULL;
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM public.personal_transactions
WHERE user_id = '${USER_ID}' AND deleted_at IS NULL
ORDER BY transaction_date DESC;
RESET ROLE;

\echo === PF LARGE: 50,000 rows ===
INSERT INTO public.personal_transactions (
  user_id, type, title, amount_cents, transaction_date, category, notes
)
SELECT
  '${USER_ID}',
  CASE WHEN g % 4 = 0 THEN 'income' ELSE 'expense' END,
  'Synthetic PF ' || g,
  1000 + (g % 200000),
  date '2024-01-01' + (g % 730)::integer,
  CASE g % 5
    WHEN 0 THEN 'moradia'
    WHEN 1 THEN 'alimentacao'
    WHEN 2 THEN 'transporte'
    WHEN 3 THEN 'saude'
    ELSE 'outros'
  END,
  CASE WHEN g % 20 = 0 THEN repeat('synthetic-note-', 8) ELSE NULL END
FROM generate_series(5001, 50000) AS g;
ANALYZE public.personal_transactions;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"${USER_ID}","role":"authenticated","aal":"aal2"}';
SELECT 'pf_rows' AS metric, count(*)::bigint AS value
FROM public.personal_transactions
WHERE user_id = '${USER_ID}' AND deleted_at IS NULL;
SELECT 'pf_json_bytes' AS metric, pg_column_size(jsonb_agg(to_jsonb(t)))::bigint AS value
FROM public.personal_transactions AS t
WHERE user_id = '${USER_ID}' AND deleted_at IS NULL;
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM public.personal_transactions
WHERE user_id = '${USER_ID}' AND deleted_at IS NULL
ORDER BY transaction_date DESC;
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, type, title, amount_cents, transaction_date, category, account_id, credit_card_id
FROM public.personal_transactions
WHERE user_id = '${USER_ID}'
  AND deleted_at IS NULL
  AND (transaction_date, id) < (date '2025-12-31', 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid)
ORDER BY transaction_date DESC, id DESC
LIMIT 100;
EXPLAIN (ANALYZE, BUFFERS)
SELECT type, category, count(*)::bigint, sum(amount_cents)::bigint
FROM public.personal_transactions
WHERE user_id = '${USER_ID}'
  AND deleted_at IS NULL
  AND transaction_date >= date '2025-01-01'
  AND transaction_date < date '2026-01-01'
GROUP BY type, category;
RESET ROLE;

\echo === PJ SMALL: 500 rows ===
INSERT INTO public.business_transactions (
  organization_id, type, title, amount_cents, transaction_date, category,
  is_paid_by_pf, is_personal_expense_in_pj, notes
)
SELECT
  '${ORGANIZATION_ID}',
  CASE WHEN g % 3 = 0 THEN 'income' ELSE 'expense' END,
  'Synthetic PJ ' || g,
  5000 + (g % 500000),
  date '2024-01-01' + (g % 730)::integer,
  CASE g % 5
    WHEN 0 THEN 'operacional'
    WHEN 1 THEN 'software'
    WHEN 2 THEN 'impostos'
    WHEN 3 THEN 'servicos'
    ELSE 'outros'
  END,
  g % 97 = 0,
  g % 131 = 0,
  CASE WHEN g % 20 = 0 THEN repeat('synthetic-note-', 8) ELSE NULL END
FROM generate_series(1, 500) AS g;
ANALYZE public.business_transactions;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"${USER_ID}","role":"authenticated","aal":"aal2"}';
SELECT 'pj_rows' AS metric, count(*)::bigint AS value
FROM public.business_transactions
WHERE organization_id = '${ORGANIZATION_ID}' AND deleted_at IS NULL;
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM public.business_transactions
WHERE organization_id = '${ORGANIZATION_ID}' AND deleted_at IS NULL
ORDER BY transaction_date DESC;
RESET ROLE;

\echo === PJ MEDIUM: 25,000 rows ===
INSERT INTO public.business_transactions (
  organization_id, type, title, amount_cents, transaction_date, category,
  is_paid_by_pf, is_personal_expense_in_pj, notes
)
SELECT
  '${ORGANIZATION_ID}',
  CASE WHEN g % 3 = 0 THEN 'income' ELSE 'expense' END,
  'Synthetic PJ ' || g,
  5000 + (g % 500000),
  date '2024-01-01' + (g % 730)::integer,
  CASE g % 5
    WHEN 0 THEN 'operacional'
    WHEN 1 THEN 'software'
    WHEN 2 THEN 'impostos'
    WHEN 3 THEN 'servicos'
    ELSE 'outros'
  END,
  g % 97 = 0,
  g % 131 = 0,
  CASE WHEN g % 20 = 0 THEN repeat('synthetic-note-', 8) ELSE NULL END
FROM generate_series(501, 25000) AS g;
ANALYZE public.business_transactions;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"${USER_ID}","role":"authenticated","aal":"aal2"}';
SELECT 'pj_rows' AS metric, count(*)::bigint AS value
FROM public.business_transactions
WHERE organization_id = '${ORGANIZATION_ID}' AND deleted_at IS NULL;
SELECT 'pj_json_bytes' AS metric, pg_column_size(jsonb_agg(to_jsonb(t)))::bigint AS value
FROM public.business_transactions AS t
WHERE organization_id = '${ORGANIZATION_ID}' AND deleted_at IS NULL;
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM public.business_transactions
WHERE organization_id = '${ORGANIZATION_ID}' AND deleted_at IS NULL
ORDER BY transaction_date DESC;
RESET ROLE;

\echo === PJ LARGE: 100,000 rows ===
INSERT INTO public.business_transactions (
  organization_id, type, title, amount_cents, transaction_date, category,
  is_paid_by_pf, is_personal_expense_in_pj, notes
)
SELECT
  '${ORGANIZATION_ID}',
  CASE WHEN g % 3 = 0 THEN 'income' ELSE 'expense' END,
  'Synthetic PJ ' || g,
  5000 + (g % 500000),
  date '2024-01-01' + (g % 730)::integer,
  CASE g % 5
    WHEN 0 THEN 'operacional'
    WHEN 1 THEN 'software'
    WHEN 2 THEN 'impostos'
    WHEN 3 THEN 'servicos'
    ELSE 'outros'
  END,
  g % 97 = 0,
  g % 131 = 0,
  CASE WHEN g % 20 = 0 THEN repeat('synthetic-note-', 8) ELSE NULL END
FROM generate_series(25001, 100000) AS g;

INSERT INTO public.receivables (
  organization_id, client_id, title, original_amount_cents,
  received_amount_cents, balance_cents, issue_date, due_date, status
)
SELECT
  '${ORGANIZATION_ID}',
  '${CLIENT_ID}',
  'Synthetic receivable ' || g,
  100000,
  CASE WHEN g % 4 = 0 THEN 100000 ELSE 0 END,
  CASE WHEN g % 4 = 0 THEN 0 ELSE 100000 END,
  current_date - ((g % 365) + 31)::integer,
  current_date - ((g % 180) + 1)::integer,
  CASE WHEN g % 4 = 0 THEN 'recebido' ELSE 'atrasado' END
FROM generate_series(1, 100000) AS g;

ANALYZE public.business_transactions;
ANALYZE public.receivables;
ANALYZE public.clients;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"${USER_ID}","role":"authenticated","aal":"aal2"}';
SELECT 'pj_rows' AS metric, count(*)::bigint AS value
FROM public.business_transactions
WHERE organization_id = '${ORGANIZATION_ID}' AND deleted_at IS NULL;
SELECT 'pj_json_bytes' AS metric, pg_column_size(jsonb_agg(to_jsonb(t)))::bigint AS value
FROM public.business_transactions AS t
WHERE organization_id = '${ORGANIZATION_ID}' AND deleted_at IS NULL;
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM public.business_transactions
WHERE organization_id = '${ORGANIZATION_ID}' AND deleted_at IS NULL
ORDER BY transaction_date DESC;
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, type, title, amount_cents, transaction_date, category,
       account_id, corporate_card_id, client_id, supplier_id, project_id, cost_center_id
FROM public.business_transactions
WHERE organization_id = '${ORGANIZATION_ID}'
  AND deleted_at IS NULL
  AND (transaction_date, id) < (date '2025-12-31', 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid)
ORDER BY transaction_date DESC, id DESC
LIMIT 100;
EXPLAIN (ANALYZE, BUFFERS)
SELECT type, category, count(*)::bigint, sum(amount_cents)::bigint
FROM public.business_transactions
WHERE organization_id = '${ORGANIZATION_ID}'
  AND deleted_at IS NULL
  AND transaction_date >= date '2025-01-01'
  AND transaction_date < date '2026-01-01'
GROUP BY type, category;
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM public.v_defaulters
WHERE organization_id = '${ORGANIZATION_ID}'
ORDER BY due_date DESC
LIMIT 100;
RESET ROLE;

ROLLBACK;
`;

const result = spawnSync(
  'docker',
  ['exec', '-i', CONTAINER, 'psql', '-X', '-U', 'postgres', '-d', 'postgres'],
  {
    input: sql,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
  },
);

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

if (result.error) {
  console.error(`Unable to execute local benchmark: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
