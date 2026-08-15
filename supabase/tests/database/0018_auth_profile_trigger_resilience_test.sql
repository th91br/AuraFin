-- ==============================================================================
-- AURAFIN — DATABASE TEST: 0018 AUTH PROFILE TRIGGER RESILIENCE
-- ==============================================================================

BEGIN;

SELECT plan(7);

-- Test 1: handle_new_user exists
SELECT has_function(
  'public',
  'handle_new_user',
  'Trigger function handle_new_user() must exist in public schema'
);

-- Test 2: handle_new_user is SECURITY DEFINER
SELECT is(
  (
    SELECT prosecdef
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'handle_new_user'
  ),
  true,
  'handle_new_user() must be SECURITY DEFINER'
);

-- Test 3: handle_new_user has search_path set to empty string
SELECT is(
  (
    SELECT array_to_string(p.proconfig, ',') ILIKE '%search_path=%'
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'handle_new_user'
  ),
  true,
  'handle_new_user() must have search_path set to empty string'
);

-- Test 4: PUBLIC has no execute permission on handle_new_user
SELECT is(
  has_function_privilege('public', 'public.handle_new_user()', 'EXECUTE'),
  false,
  'PUBLIC role must NOT have EXECUTE on handle_new_user()'
);

-- Test 5: anon has no execute permission on handle_new_user
SELECT is(
  has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE'),
  false,
  'anon role must NOT have EXECUTE on handle_new_user()'
);

-- Test 6: trigger on_auth_user_created exists on auth.users
SELECT has_trigger(
  'auth',
  'users',
  'on_auth_user_created',
  'Trigger on_auth_user_created must exist on auth.users'
);

-- Test 7: Profiles table has NOT NULL on full_name
SELECT col_not_null(
  'public',
  'profiles',
  'full_name',
  'profiles.full_name must have NOT NULL constraint'
);

SELECT * FROM finish();
ROLLBACK;
