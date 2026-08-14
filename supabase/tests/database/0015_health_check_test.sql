-- ==============================================================================
-- AURAFIN — DATABASE TESTS: MIGRATION 0015 (HEALTH CHECK RPC)
-- ==============================================================================
-- Framework: pgTAP
-- Scope: Validação estrutural, de permissões, retorno jsonb e zero vazamento
-- ==============================================================================

BEGIN;
SELECT plan(8);

-- 1. Testar se a função public.health_check() existe
SELECT has_function(
  'public',
  'health_check',
  'A função public.health_check() deve existir no schema public'
);

-- 2. Testar tipo de retorno (jsonb)
SELECT function_returns(
  'public',
  'health_check',
  'jsonb',
  'A função public.health_check() deve retornar o tipo jsonb'
);

-- 3. Testar se a função não aceita argumentos (0 parâmetros)
SELECT function_args(
  'public',
  'health_check',
  ARRAY[]::text[],
  'A função public.health_check() não deve receber parâmetros'
);

-- 4. Testar se PUBLIC NÃO possui privilégio de execução
SELECT throws_matching(
  'SET ROLE none; SELECT public.health_check()',
  '.*permission denied.*|.*must be.*',
  'PUBLIC não deve ter permissão de execução implícita'
);

-- 5. Testar se anon pode executar e o status retornado é 'healthy'
SET ROLE anon;
SELECT is(
  (public.health_check()->>'status'),
  'healthy',
  'O papel anon deve conseguir executar public.health_check() e obter status = healthy'
);

-- 6. Testar se authenticated pode executar
SET ROLE authenticated;
SELECT is(
  (public.health_check()->>'status'),
  'healthy',
  'O papel authenticated deve conseguir executar public.health_check() e obter status = healthy'
);

-- 7. Testar se a versão retornada não é nula
SELECT is(
  (public.health_check()->>'version'),
  '1.0.0',
  'A versão retornada deve ser 1.0.0'
);

-- 8. Testar se campos proibidos NÃO existem no JSON de retorno
SET ROLE anon;
SELECT ok(
  NOT (public.health_check() ? 'project_ref') AND
  NOT (public.health_check() ? 'db_version') AND
  NOT (public.health_check() ? 'hostname') AND
  NOT (public.health_check() ? 'schema') AND
  NOT (public.health_check() ? 'row_count') AND
  NOT (public.health_check() ? 'secret'),
  'O retorno da RPC não deve expor nenhum campo sensível de infraestrutura'
);

SELECT * FROM finish();
ROLLBACK;
