const http = require('http');

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, headers: res.headers, body: json, rawBody: body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: null, rawBody: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('  STARTING AUTOMATED RBAC & AUTH VERIFICATION SUITE  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // TEST 3: Unauthenticated checks
  console.log('\n--- TEST 3: Unauthenticated Access Protection ---');
  const unauthMe = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/me',
    method: 'GET'
  });
  assert(unauthMe.status === 401, 'Unauthenticated /api/auth/me returns 401 Unauthorized');

  const unauthSubmissions = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/submissions',
    method: 'GET'
  });
  assert(unauthSubmissions.status === 401, 'Unauthenticated /api/submissions returns 401 Unauthorized');

  // Frontend login page availability
  const loginPage = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/login',
    method: 'GET'
  });
  assert(loginPage.status === 200, 'Frontend /login page returns 200 OK');
  assert(loginPage.rawBody.includes('MEIL ESG Reporting Portal'), 'Login page renders MEIL portal branding');

  // TEST 1: Project Manager Flow
  console.log('\n--- TEST 1: Project Manager Authentication & Permissions ---');
  const pmLogin = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'project.manager@meil.demo',
    password: 'Project@123'
  });

  const pmToken = pmLogin.body?.data?.accessToken;
  const pmUser = pmLogin.body?.data?.user;
  assert(pmLogin.status === 200 && pmToken, 'Project Manager login succeeds with valid JWT token');
  assert(pmUser?.roles?.includes('PROJECT_MANAGER'), 'User role is correctly set to PROJECT_MANAGER');

  // Check /api/auth/me with PM token
  const pmMe = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${pmToken}` }
  });
  const pmMeUser = pmMe.body?.data || pmMe.body?.user || pmMe.body;
  assert(pmMe.status === 200 && pmMeUser?.email === 'project.manager@meil.demo', 'Session verification returns Project Manager user object');
  assert(pmMeUser?.assignedOrgUnit === 'PRJ-ZOJILA', 'Project Manager is assigned to PRJ-ZOJILA');

  // Check assigned projects for PM
  const pmOrgUnits = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/organizations',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${pmToken}` }
  });
  const pmUnitsList = pmOrgUnits.body?.data || pmOrgUnits.body || [];
  assert(pmOrgUnits.status === 200 && pmUnitsList.length === 1 && pmUnitsList[0].code === 'PRJ-ZOJILA',
    'Project Manager can ONLY see their assigned project (PRJ-ZOJILA) and no other projects');

  // Check submissions accessible to PM
  const pmSubmissions = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/submissions',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${pmToken}` }
  });
  const pmSubsList = pmSubmissions.body?.data || pmSubmissions.body?.submissions || [];
  const allPmSubsMatch = pmSubsList.every(s => s.orgUnit?.code === 'PRJ-ZOJILA' || s.orgUnitId === 'PRJ-ZOJILA' || s.orgUnit?.name?.includes('Zojila'));
  assert(pmSubmissions.status === 200 && pmSubsList.length > 0 && allPmSubsMatch, 'Project Manager only sees submissions for their assigned project');

  // TEST 4: PM forbidden actions (Cannot approve or review submissions)
  console.log('\n--- TEST 4: Project Manager Restricted Actions & ESG Protection ---');
  const zojilaSubId = pmSubsList[0]?.id;

  const pmReviewAttempt = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/submissions/${zojilaSubId}/review`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${pmToken}`, 'Content-Type': 'application/json' }
  }, {
    decision: 'approved',
    comments: 'Self-approval attempt'
  });
  assert(pmReviewAttempt.status === 403, 'Project Manager CANNOT approve/review submissions (returns 403 Forbidden)');

  const pmRejectAttempt = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/submissions/${zojilaSubId}/reject`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${pmToken}`, 'Content-Type': 'application/json' }
  }, { reason: 'Unauthorized reject attempt' });
  assert(pmRejectAttempt.status === 403, 'Project Manager CANNOT reject submissions (returns 403 Forbidden)');

  const pmUserMgmtAttempt = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/users',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${pmToken}` }
  });
  assert(pmUserMgmtAttempt.status === 403, 'Project Manager CANNOT access User Management / Admin API (returns 403 Forbidden)');

  // TEST 2: ESG Team Flow
  console.log('\n--- TEST 2: ESG Team Authentication & Permissions ---');
  const esgLogin = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'esg.team@meil.demo',
    password: 'ESG@123'
  });

  const esgToken = esgLogin.body?.data?.accessToken;
  const esgUser = esgLogin.body?.data?.user;
  assert(esgLogin.status === 200 && esgToken, 'ESG Team login succeeds with valid JWT token');
  assert(esgUser?.roles?.includes('ESG_TEAM'), 'User role is correctly set to ESG_TEAM');

  // Check ESG Team view of all projects
  const esgOrgUnits = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/organizations',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${esgToken}` }
  });
  const esgUnitsList = esgOrgUnits.body?.data || esgOrgUnits.body || [];
  assert(esgOrgUnits.status === 200 && esgUnitsList.length > 1, 'ESG Team can see all organization units/projects for review');

  // Check ESG Team view of all submissions
  const esgSubmissions = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/submissions',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${esgToken}` }
  });
  const esgSubsList = esgSubmissions.body?.data || esgSubmissions.body?.submissions || [];
  assert(esgSubmissions.status === 200 && esgSubsList.length >= 2, 'ESG Team can view all submitted projects across MEIL group');

  // Check that ESG Team CANNOT directly edit raw metric values (must follow review workflow)
  const esgDirectEditAttempt = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/submissions/${zojilaSubId}/values`,
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${esgToken}`, 'Content-Type': 'application/json' }
  }, {
    values: [{ metricCode: 'E1_P1_TOTAL_ENERGY', valueNumeric: 99999 }]
  });
  assert(esgDirectEditAttempt.status === 403, 'ESG Team CANNOT directly edit original submitted metric values without review workflow (returns 403)');

  // Invalid Login Check
  console.log('\n--- Error Handling: Invalid Credentials ---');
  const badLogin = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'project.manager@meil.demo',
    password: 'WrongPassword123'
  });
  assert(badLogin.status === 401 && (badLogin.body?.message?.includes('Invalid') || badLogin.body?.error?.includes('Invalid')), 'Invalid password returns clean error: "Invalid email or password."');

  console.log('\n====================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
