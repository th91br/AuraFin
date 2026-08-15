// ==============================================================================
// AURAFIN — COMPREHENSIVE AUTH FULL LIFECYCLE VALIDATION SUITE
// ==============================================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

function getClient(authToken) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: authToken
      ? {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      : undefined,
  });
}

async function runAuthSuite() {
  console.log('🚀 [AURAFIN AUTH SUITE] Starting comprehensive auth validation...');

  const timestamp = Date.now();
  const userA_Email = `user_a_${timestamp}@aurafin.local`;
  const userB_Email = `user_b_${timestamp}@aurafin.local`;
  const passwordA = 'AuraFin#2026@Security!';
  const passwordB = 'Partner#Safe2026$PJ!';
  const newPasswordA = 'AuraFin#Updated2026@NewKey!';

  const clientAnon = getClient();

  // ----------------------------------------------------------------------------
  // STEP 1: Weak Password Rejection
  // ----------------------------------------------------------------------------
  console.log('\n[1/10] Testing Weak Password Rejection...');
  const { data: weakData, error: weakError } = await clientAnon.auth.signUp({
    email: `weak_${timestamp}@aurafin.local`,
    password: '123',
  });
  if (!weakError) {
    throw new Error('FAILED: Weak password was accepted when it should be rejected');
  }
  console.log('✅ Weak password rejected successfully:', weakError.message, `(code: ${weakError.code})`);

  // ----------------------------------------------------------------------------
  // STEP 2: User A Signup (SIGNUP -> Profile Creation Trigger)
  // ----------------------------------------------------------------------------
  console.log('\n[2/10] Testing User A Signup and Profile Trigger...');
  const { data: signupA, error: signupErrorA } = await clientAnon.auth.signUp({
    email: userA_Email,
    password: passwordA,
    options: {
      data: {
        full_name: 'Executivo AuraFin Alpha',
      },
    },
  });
  if (signupErrorA) {
    throw new Error(`FAILED: Signup User A error: ${signupErrorA.message}`);
  }
  if (!signupA.user) {
    throw new Error('FAILED: User object not returned on signup');
  }
  console.log('✅ User A created successfully:', signupA.user.id, signupA.user.email);

  // ----------------------------------------------------------------------------
  // STEP 3: Duplicate Email Rejection
  // ----------------------------------------------------------------------------
  console.log('\n[3/10] Testing Duplicate Email Rejection...');
  const { data: dupData, error: dupError } = await clientAnon.auth.signUp({
    email: userA_Email,
    password: passwordA,
    options: {
      data: { full_name: 'Impostor' },
    },
  });
  const isDuplicateRejected = dupError !== null || (dupData.user && dupData.user.identities && dupData.user.identities.length === 0);
  if (!isDuplicateRejected) {
    throw new Error('FAILED: Duplicate email was not properly detected');
  }
  console.log('✅ Duplicate email detected and prevented correctly');

  // ----------------------------------------------------------------------------
  // STEP 4: User A Login (SignIn with Password)
  // ----------------------------------------------------------------------------
  console.log('\n[4/10] Testing User A Login and JWT Issuance...');
  const clientA = getClient();
  const { data: loginA, error: loginErrorA } = await clientA.auth.signInWithPassword({
    email: userA_Email,
    password: passwordA,
  });
  if (loginErrorA) {
    throw new Error(`FAILED: Login User A error: ${loginErrorA.message}`);
  }
  const tokenA = loginA.session.access_token;
  console.log('✅ User A login successful. JWT issued.');

  // ----------------------------------------------------------------------------
  // STEP 5: Profile RLS Verification (Authenticated User Reads Own Profile)
  // ----------------------------------------------------------------------------
  console.log('\n[5/10] Testing User A Profile RLS and Trigger Data...');
  const authedClientA = getClient(tokenA);
  const { data: profileA, error: profileErrA } = await authedClientA
    .from('profiles')
    .select('*')
    .eq('id', signupA.user.id)
    .single();

  if (profileErrA) {
    throw new Error(`FAILED: Read own profile error: ${profileErrA.message}`);
  }
  if (profileA.full_name !== 'Executivo AuraFin Alpha') {
    throw new Error(`FAILED: Profile full_name mismatch: expected "Executivo AuraFin Alpha", got "${profileA.full_name}"`);
  }
  console.log('✅ Profile read successfully with exact full_name:', profileA);

  // ----------------------------------------------------------------------------
  // STEP 6: Organization Creation & Role Assignment
  // ----------------------------------------------------------------------------
  console.log('\n[6/10] Testing Organization Creation via RPC...');
  const { data: orgIdA, error: orgErrA } = await authedClientA.rpc('create_organization_with_owner', {
    org_name: 'Holding AuraFin Alpha SA',
    legal_name: 'Holding AuraFin Alpha SA',
    tax_id: '12.345.678/0001-90',
  });
  if (orgErrA) {
    throw new Error(`FAILED: create_organization_with_owner error: ${orgErrA.message}`);
  }
  console.log('✅ Organization created successfully:', orgIdA);

  // Verify membership
  const { data: membersA, error: memErrA } = await authedClientA
    .from('organization_members')
    .select('*')
    .eq('organization_id', orgIdA);
  if (memErrA || !membersA || membersA.length === 0 || membersA[0].role !== 'owner') {
    throw new Error('FAILED: Organization member owner role not found');
  }
  console.log('✅ Organization owner role verified in organization_members');

  // ----------------------------------------------------------------------------
  // STEP 7: User B Signup and Cross-Tenant / Cross-User Isolation
  // ----------------------------------------------------------------------------
  console.log('\n[7/10] Testing Cross-Tenant and Cross-User Isolation with User B...');
  const { data: signupB, error: signupErrB } = await clientAnon.auth.signUp({
    email: userB_Email,
    password: passwordB,
    options: {
      data: { full_name: 'Diretor Beta PJ' },
    },
  });
  if (signupErrB) {
    throw new Error(`FAILED: User B signup: ${signupErrB.message}`);
  }
  const clientB = getClient();
  const { data: loginB } = await clientB.auth.signInWithPassword({
    email: userB_Email,
    password: passwordB,
  });
  const tokenB = loginB.session.access_token;
  const authedClientB = getClient(tokenB);

  // User B tries to read User A's profile
  const { data: userBReadsAProfile, error: bReadErr } = await authedClientB
    .from('profiles')
    .select('*')
    .eq('id', signupA.user.id);

  if (userBReadsAProfile && userBReadsAProfile.length > 0) {
    throw new Error('FAILED: User B was able to read User A profile!');
  }
  console.log('✅ User B cannot read User A profile (RLS isolated)');

  // User B tries to access User A's organization
  const { data: userBReadsAOrg } = await authedClientB
    .from('organizations')
    .select('*')
    .eq('id', orgIdA);

  if (userBReadsAOrg && userBReadsAOrg.length > 0) {
    throw new Error('FAILED: User B was able to read User A organization!');
  }
  console.log('✅ User B cannot read User A organization (RLS isolated)');

  // ----------------------------------------------------------------------------
  // STEP 8: Password Update Flow
  // ----------------------------------------------------------------------------
  console.log('\n[8/10] Testing Password Update...');
  const { data: updatePwdData, error: updatePwdErr } = await clientA.auth.updateUser({
    password: newPasswordA,
  });
  if (updatePwdErr) {
    throw new Error(`FAILED: Password update error: ${updatePwdErr.message}`);
  }
  console.log('✅ Password updated successfully');

  // Verify login with old password fails
  const { error: oldPwdLoginErr } = await clientAnon.auth.signInWithPassword({
    email: userA_Email,
    password: passwordA,
  });
  if (!oldPwdLoginErr) {
    throw new Error('FAILED: Old password still worked after password update!');
  }
  console.log('✅ Old password correctly rejected');

  // Verify login with new password succeeds
  const { data: newPwdLogin, error: newPwdLoginErr } = await clientAnon.auth.signInWithPassword({
    email: userA_Email,
    password: newPasswordA,
  });
  if (newPwdLoginErr || !newPwdLogin.session) {
    throw new Error('FAILED: Login with new password failed');
  }
  console.log('✅ Login with new password succeeded');

  // ----------------------------------------------------------------------------
  // STEP 9: Logout & Token Invalidation
  // ----------------------------------------------------------------------------
  console.log('\n[9/10] Testing SignOut (Logout)...');
  const clientNewA = getClient();
  await clientNewA.auth.setSession({
    access_token: newPwdLogin.session.access_token,
    refresh_token: newPwdLogin.session.refresh_token,
  });
  const { error: logoutErr } = await clientNewA.auth.signOut();
  if (logoutErr) {
    throw new Error(`FAILED: Logout error: ${logoutErr.message}`);
  }
  console.log('✅ Logout completed successfully');

  // ----------------------------------------------------------------------------
  // STEP 10: Invalid Credentials Rejection
  // ----------------------------------------------------------------------------
  console.log('\n[10/10] Testing Invalid Credentials Rejection...');
  const { data: invalidData, error: invalidErr } = await clientAnon.auth.signInWithPassword({
    email: userA_Email,
    password: 'WrongPassword#999',
  });
  if (!invalidErr) {
    throw new Error('FAILED: Invalid credentials was accepted');
  }
  console.log('✅ Invalid credentials rejected with appropriate error:', invalidErr.message);

  console.log('\n================================================================');
  console.log('🎉 ALL 10 AUTH LIFECYCLE TESTS PASSED WITH 100% SUCCESS!');
  console.log('================================================================\n');
}

runAuthSuite().catch((err) => {
  console.error('\n❌ AUTH SUITE FAILED:', err);
  process.exit(1);
});
