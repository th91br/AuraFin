import { spawnSync } from 'node:child_process';

const CONTAINER = 'supabase_db_aurafin';
const USER_ID = '3f100000-0000-0000-0000-000000000001';
const ORGANIZATION_ID = '3f100000-0000-0000-0000-000000000002';

const sql = String.raw`
\set ON_ERROR_STOP on
\pset pager off
\timing on

BEGIN;

INSERT INTO auth.users (
  id, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '${USER_ID}',
  'phase-3f-rls-benchmark@local.invalid',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Phase 3F RLS User"}'::jsonb,
  now(),
  now()
);

INSERT INTO public.organizations (id, name, status, created_by)
VALUES ('${ORGANIZATION_ID}', 'Phase 3F RLS Organization', 'active', '${USER_ID}');

INSERT INTO public.organization_members (organization_id, user_id, role, status)
VALUES ('${ORGANIZATION_ID}', '${USER_ID}', 'owner', 'active');

INSERT INTO public.business_transactions (
  organization_id, type, title, amount_cents, transaction_date, category
)
SELECT
  '${ORGANIZATION_ID}',
  CASE WHEN g % 3 = 0 THEN 'income' ELSE 'expense' END,
  'Synthetic RLS ' || g,
  5000 + (g % 500000),
  date '2024-01-01' + (g % 730)::integer,
  CASE g % 5
    WHEN 0 THEN 'operacional'
    WHEN 1 THEN 'software'
    WHEN 2 THEN 'impostos'
    WHEN 3 THEN 'servicos'
    ELSE 'outros'
  END
FROM generate_series(1, 100000) AS g;

ANALYZE public.business_transactions;
ANALYZE public.organization_members;

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"${USER_ID}","role":"authenticated","aal":"aal2"}';

\echo === CURRENT POLICY: function call per row ===
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM public.business_transactions
WHERE organization_id = '${ORGANIZATION_ID}' AND deleted_at IS NULL
ORDER BY transaction_date DESC;

RESET ROLE;

\echo === CANDIDATE A: scalar SELECT wrapper ===
ALTER POLICY "Membros leem transacoes PJ"
  ON public.business_transactions
  USING ((SELECT public.is_organization_member(organization_id)));

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"${USER_ID}","role":"authenticated","aal":"aal2"}';
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM public.business_transactions
WHERE organization_id = '${ORGANIZATION_ID}' AND deleted_at IS NULL
ORDER BY transaction_date DESC;

RESET ROLE;

\echo === CANDIDATE B: cached organization set ===
CREATE FUNCTION public.phase3f_user_organization_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = (SELECT auth.uid())
    AND status = 'active';
$$;

REVOKE EXECUTE ON FUNCTION public.phase3f_user_organization_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.phase3f_user_organization_ids() TO authenticated;

ALTER POLICY "Membros leem transacoes PJ"
  ON public.business_transactions
  USING (organization_id IN (SELECT public.phase3f_user_organization_ids()));

SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub":"${USER_ID}","role":"authenticated","aal":"aal2"}';
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM public.business_transactions
WHERE organization_id = '${ORGANIZATION_ID}' AND deleted_at IS NULL
ORDER BY transaction_date DESC;

RESET ROLE;
ROLLBACK;
`;

const result = spawnSync(
  'docker',
  ['exec', '-i', CONTAINER, 'psql', '-X', '-U', 'postgres', '-d', 'postgres'],
  {
    input: sql,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true,
  },
);

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

if (result.error) {
  console.error(`Unable to execute local RLS benchmark: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
