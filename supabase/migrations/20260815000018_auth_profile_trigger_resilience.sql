-- Migration 0018: Auth Profile Trigger Resilience & Fallback Hardening
-- AuraFin Auth Recovery & Security Hardening
-- Guarantees that handle_new_user never fails on raw_user_meta_data or email edge cases

-- 1. Resilient Profile Creation Trigger Function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_full_name text;
  v_avatar_url text;
begin
  -- Resolve robust full_name with fallbacks
  v_full_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(split_part(new.email, '@', 1)), ''),
    'Usuário AuraFin'
  );

  v_avatar_url := nullif(trim(new.raw_user_meta_data->>'avatar_url'), '');

  insert into public.profiles (id, full_name, avatar_url, preferred_context, privacy_mode_default)
  values (
    new.id,
    v_full_name,
    v_avatar_url,
    'PF',
    false
  )
  on conflict (id) do update
  set
    full_name = coalesce(nullif(trim(excluded.full_name), ''), profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = timezone('utc'::text, now());

  return new;
exception
  when others then
    -- Log warning to postgres log without failing user creation
    raise warning '[handle_new_user] Error creating profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- 2. Strict Privilege Grants
revoke execute on function public.handle_new_user() from public, anon;
grant execute on function public.handle_new_user() to service_role;

-- 3. Ensure trigger is attached
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
