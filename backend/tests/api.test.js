const assert = require('assert');
const http = require('http');
const app = require('../src/server');

const PORT = 5001;
let server;
const baseUrl = `http://localhost:${PORT}`;

const request = async (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Starting Backend API Automated Test Suite...\n');
  server = app.listen(PORT);

  try {
    // 1. Health Check
    console.log('Test 1: Health check');
    const health = await request('GET', '/api/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.body.status, 'healthy');
    console.log('✅ Health check passed.');

    // 2. Signup Validation: Name < 20 chars
    console.log('Test 2: Validation - Name < 20 chars');
    const shortNameRes = await request('POST', '/api/auth/signup', {
      name: 'Short Name',
      email: 'shortname@test.com',
      password: 'Password@123',
      address: '123 Test Street, City',
    });
    assert.strictEqual(shortNameRes.status, 400);
    assert.match(shortNameRes.body.message, /20 and 60 characters/i);
    console.log('✅ Name validation correctly rejected short name.');

    // 3. Signup Validation: Password missing special character
    console.log('Test 3: Validation - Password missing special character');
    const weakPassRes = await request('POST', '/api/auth/signup', {
      name: 'Valid Name Longer Than Twenty Characters',
      email: 'weakpass@test.com',
      password: 'Password123',
      address: '123 Test Street, City',
    });
    assert.strictEqual(weakPassRes.status, 400);
    assert.match(weakPassRes.body.message, /special character/i);
    console.log('✅ Password validation correctly rejected password without special char.');

    // 4. Valid Signup
    console.log('Test 4: Valid user registration');
    const uniqueEmail = `testuser_${Date.now()}@roxiler.com`;
    const signupRes = await request('POST', '/api/auth/signup', {
      name: 'Automated Test User Full Name',
      email: uniqueEmail,
      password: 'TestUser@12345',
      address: '999 Automated Testing Boulevard, Suite 100, Testville, CA 90001',
    });
    assert.strictEqual(signupRes.status, 201);
    assert.ok(signupRes.body.data.token);
    assert.strictEqual(signupRes.body.data.user.role, 'NORMAL_USER');
    const testUserToken = signupRes.body.data.token;
    console.log('✅ User registered successfully with JWT and NORMAL_USER role.');

    // 5. Admin Login & Stats
    console.log('Test 5: Admin login & dashboard stats');
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@roxiler.com',
      password: 'Admin@12345',
    });
    assert.strictEqual(adminLogin.status, 200);
    assert.strictEqual(adminLogin.body.data.user.role, 'ADMIN');
    const adminToken = adminLogin.body.data.token;

    const statsRes = await request('GET', '/api/admin/dashboard-stats', null, adminToken);
    assert.strictEqual(statsRes.status, 200);
    assert.ok(statsRes.body.data.totalUsers >= 4);
    assert.ok(statsRes.body.data.totalStores >= 3);
    assert.ok(statsRes.body.data.totalRatings >= 6);
    console.log('✅ Admin login & stats returned valid metrics.');

    // 6. RBAC Protection
    console.log('Test 6: RBAC restriction on admin endpoints');
    const forbiddenRes = await request('GET', '/api/admin/dashboard-stats', null, testUserToken);
    assert.strictEqual(forbiddenRes.status, 403);
    console.log('✅ Normal user blocked from admin endpoint with 403 Forbidden.');

    // 7. Store Owner Dashboard
    console.log('Test 7: Store Owner dashboard');
    const ownerLogin = await request('POST', '/api/auth/login', {
      email: 'michael@dundermifflin.com',
      password: 'Owner@12345',
    });
    assert.strictEqual(ownerLogin.status, 200);
    assert.strictEqual(ownerLogin.body.data.user.role, 'STORE_OWNER');
    const ownerToken = ownerLogin.body.data.token;

    const ownerDash = await request('GET', '/api/owner/dashboard', null, ownerToken);
    assert.strictEqual(ownerDash.status, 200);
    assert.ok(ownerDash.body.data.store.name);
    assert.ok(ownerDash.body.data.metrics.averageRating > 0);
    console.log('✅ Store owner dashboard retrieved metrics and customer reviews.');

    // 8. Normal User Rating Submission & Modification
    console.log('Test 8: Store ratings listing & submission');
    const storesRes = await request('GET', '/api/stores', null, testUserToken);
    assert.strictEqual(storesRes.status, 200);
    const storeToRate = storesRes.body.data.stores[0];
    assert.ok(storeToRate);

    // Submit invalid rating (> 5)
    const invalidRate = await request(
      'POST',
      `/api/stores/${storeToRate.id}/rate`,
      { rating: 6 },
      testUserToken
    );
    assert.strictEqual(invalidRate.status, 400);

    // Submit valid rating (5)
    const validRate = await request(
      'POST',
      `/api/stores/${storeToRate.id}/rate`,
      { rating: 5 },
      testUserToken
    );
    assert.strictEqual(validRate.status, 200);
    assert.strictEqual(validRate.body.data.rating, 5);

    // Modify rating to 4
    const modRate = await request(
      'POST',
      `/api/stores/${storeToRate.id}/rate`,
      { rating: 4 },
      testUserToken
    );
    assert.strictEqual(modRate.status, 200);
    assert.strictEqual(modRate.body.data.rating, 4);
    console.log('✅ Rating submission, validation, and modification passed.');

    // 9. Password Update
    console.log('Test 9: Password update');
    const wrongPassUpdate = await request(
      'PATCH',
      '/api/auth/update-password',
      {
        currentPassword: 'WrongPassword@123',
        newPassword: 'NewPassword@12345',
      },
      testUserToken
    );
    assert.strictEqual(wrongPassUpdate.status, 400);

    const validPassUpdate = await request(
      'PATCH',
      '/api/auth/update-password',
      {
        currentPassword: 'TestUser@12345',
        newPassword: 'NewPass@1234',
      },
      testUserToken
    );
    assert.strictEqual(validPassUpdate.status, 200);
    console.log('✅ Password update verified.');

    console.log('\n🎉 ALL 9 BACKEND INTEGRATION & VALIDATION TESTS PASSED!\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
