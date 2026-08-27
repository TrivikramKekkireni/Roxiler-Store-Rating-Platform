const assert = require('assert');
const http = require('http');

const BASE_URL = 'http://127.0.0.1:5050';

const apiCall = async (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
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
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function verifyLiveSystem() {
  console.log('🚀 Running Full-Stack Live Verification on Port 5050...\n');

  // 1. Health
  console.log('1. Checking Server Health...');
  const health = await apiCall('GET', '/api/health');
  assert.strictEqual(health.status, 200);
  console.log('✅ Backend API is online and healthy.\n');

  // 2. Admin Authentication & Dashboard
  console.log('2. Verifying Admin Flow...');
  const adminLogin = await apiCall('POST', '/api/auth/login', {
    email: 'admin@roxiler.com',
    password: 'Admin@12345',
  });
  assert.strictEqual(adminLogin.status, 200);
  assert.strictEqual(adminLogin.body.data.user.role, 'ADMIN');
  const adminToken = adminLogin.body.data.token;
  console.log(`✅ Admin logged in: ${adminLogin.body.data.user.name}`);

  const adminStats = await apiCall('GET', '/api/admin/dashboard-stats', null, adminToken);
  assert.strictEqual(adminStats.status, 200);
  console.log(`✅ Admin Stats: Total Users=${adminStats.body.data.totalUsers}, Total Stores=${adminStats.body.data.totalStores}, Total Ratings=${adminStats.body.data.totalRatings}`);

  const usersList = await apiCall('GET', '/api/admin/users?role=STORE_OWNER', null, adminToken);
  assert.strictEqual(usersList.status, 200);
  assert.ok(usersList.body.data.users.length > 0);
  console.log(`✅ Store Owners listed with rating: ${usersList.body.data.users[0].name} (Store Rating: ${usersList.body.data.users[0].storeRating}/5)\n`);

  // 3. Normal User Registration & Store Rating
  console.log('3. Verifying Normal User Flow...');
  const timestamp = Date.now();
  const signupRes = await apiCall('POST', '/api/auth/signup', {
    name: `Test Registered User ${timestamp}`.slice(0, 30),
    email: `testuser_${timestamp}@example.com`,
    password: 'Password@2026',
    address: '742 Evergreen Terrace, Springfield, OR 97477',
  });
  assert.strictEqual(signupRes.status, 201);
  const userToken = signupRes.body.data.token;
  console.log(`✅ Normal User signed up: ${signupRes.body.data.user.email}`);

  // Fetch stores
  const storesRes = await apiCall('GET', '/api/stores?search=Dunder', null, userToken);
  assert.strictEqual(storesRes.status, 200);
  const dunderStore = storesRes.body.data.stores[0];
  assert.ok(dunderStore);
  console.log(`✅ Found store: "${dunderStore.name}" (Current Overall Rating: ${dunderStore.overallRating})`);

  // Rate store 5 stars
  const rate5 = await apiCall('POST', `/api/stores/${dunderStore.id}/rate`, { rating: 5 }, userToken);
  assert.strictEqual(rate5.status, 200);
  console.log(`✅ User rated store 5 stars. Updated Store Avg: ${rate5.body.data.overallRating}`);

  // Modify rating to 4 stars
  const rate4 = await apiCall('POST', `/api/stores/${dunderStore.id}/rate`, { rating: 4 }, userToken);
  assert.strictEqual(rate4.status, 200);
  console.log(`✅ User modified rating to 4 stars. Updated Store Avg: ${rate4.body.data.overallRating}\n`);

  // 4. Store Owner Dashboard Verification
  console.log('4. Verifying Store Owner Flow...');
  const ownerLogin = await apiCall('POST', '/api/auth/login', {
    email: 'michael@dundermifflin.com',
    password: 'Owner@12345',
  });
  assert.strictEqual(ownerLogin.status, 200);
  assert.strictEqual(ownerLogin.body.data.user.role, 'STORE_OWNER');
  const ownerToken = ownerLogin.body.data.token;

  const ownerDashboard = await apiCall('GET', '/api/owner/dashboard', null, ownerToken);
  assert.strictEqual(ownerDashboard.status, 200);
  console.log(`✅ Store Owner Dashboard: Store="${ownerDashboard.body.data.store.name}", Avg Rating=${ownerDashboard.body.data.metrics.averageRating}/5, Total Reviews=${ownerDashboard.body.data.metrics.totalReviews}`);
  console.log(`✅ Customer Reviews count: ${ownerDashboard.body.data.customerRatings.length}\n`);

  console.log('🎉 ALL LIVE FULL-STACK E2E VERIFICATIONS PASSED SUCCESSFULLY!');
}

verifyLiveSystem().catch((e) => {
  console.error('❌ Verification failed:', e);
  process.exit(1);
});
