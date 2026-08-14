-- ==============================================================================
-- AURAFIN — MIGRATION 0015: OBSERVABILITY HEALTH CHECK & DIAGNOSTICS
-- ==============================================================================
-- Descrição: Criação de RPC pública segura para verificação de liveness e
-- prontidão operacional do banco de dados sem expor tabelas, row counts ou secrets.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.health_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_timestamp timestamptz;
BEGIN
  v_timestamp := clock_timestamp();
  
  RETURN jsonb_build_object(
    'status', 'healthy',
    'timestamp', v_timestamp,
    'version', '1.0.0'
  );
END;
$$;

-- Revoga privilégio implícito de PUBLIC e concede explicitamente aos papéis necessários
REVOKE EXECUTE ON FUNCTION public.health_check() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.health_check() TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.health_check() IS 'RPC segura para health check e monitoramento de liveness sem expor topologia interna.';
