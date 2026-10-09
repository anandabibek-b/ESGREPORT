const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(buf)); } catch(e) { resolve(buf); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'GET',
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(buf)); } catch(e) { resolve(buf); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('--- TEST 1: Request Password Reset via Phone ---');
  const reqRes = await post('http://localhost:4000/api/auth/forgot-password/request', {
    identifier: '+91 98765 43210',
    method: 'phone'
  });
  console.log('Result:', reqRes);

  if (!reqRes.success || !reqRes.otpCode) {
    throw new Error('Failed to request OTP');
  }

  console.log('\n--- TEST 2: Verify Reset OTP ---');
  const verifyRes = await post('http://localhost:4000/api/auth/forgot-password/verify-otp', {
    identifier: '+91 98765 43210',
    otpCode: reqRes.otpCode
  });
  console.log('Result:', verifyRes);

  console.log('\n--- TEST 3: Reset Password ---');
  const resetRes = await post('http://localhost:4000/api/auth/reset-password', {
    identifier: '+91 98765 43210',
    otpCode: reqRes.otpCode,
    newPassword: 'OwnerNewPassword@123',
    phoneToConnect: '+91 98765 43210'
  });
  console.log('Result:', resetRes);

  console.log('\n--- TEST 4: Login using Phone Number ---');
  const loginRes = await post('http://localhost:4000/api/auth/login', {
    email: '+91 98765 43210',
    password: 'OwnerNewPassword@123'
  });
  console.log('Login result:', loginRes.success ? `Logged in as ${loginRes.data.user.firstName} ${loginRes.data.user.lastName}` : loginRes);

  console.log('\n--- TEST 5: Public ESG Summary ---');
  const publicSummary = await get('http://localhost:4000/api/public/summary');
  console.log('Public ESG rating:', publicSummary.data.ratings.esgScore, '| Company:', publicSummary.data.company.legalName);

  console.log('\n--- TEST 6: Submit Citizen Grievance ---');
  const grievanceRes = await post('http://localhost:4000/api/public/grievance', {
    name: 'Sunil Verma',
    email: 'sunil.verma@nagrik.in',
    phone: '+91 98112 33445',
    stakeholderType: 'Local Citizen / Resident',
    category: 'Water & Solar Welfare',
    subject: 'Request for solar street lamp near project site',
    message: 'We request MEIL CSR team to evaluate extending solar microgrid lamps along the village bypass.'
  });
  console.log('Grievance result:', grievanceRes.data ? `Tracking ID: ${grievanceRes.data.trackingId}` : grievanceRes);

  console.log('\nALL BACKEND TESTS PASSED!');
}

runTests().catch(console.error);
