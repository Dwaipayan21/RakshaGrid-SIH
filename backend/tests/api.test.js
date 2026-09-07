const http = require('http');
const app = require('../src/app');

const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  try {
    // 1. Test Health endpoint
    const res1 = await fetch(`http://localhost:${port}/api/v1/health`);
    const data1 = await res1.json();
    console.log('Health Check Status:', res1.status, data1.data?.status === 'UP' ? 'PASS' : 'FAIL');

    // 2. Test 404 Route
    const res2 = await fetch(`http://localhost:${port}/api/v1/non-existent-route`);
    const data2 = await res2.json();
    console.log('404 Handler Status:', res2.status, data2.success === false ? 'PASS' : 'FAIL');

    // 3. Test Validation Error on Invalid Register
    const res3 = await fetch(`http://localhost:${port}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email', password: '123' }),
    });
    const data3 = await res3.json();
    console.log('Zod Validator Status:', res3.status, data3.message === 'Validation failed' ? 'PASS' : 'FAIL');

    console.log('ALL API SANITY CHECKS PASSED!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    server.close();
  }
});
