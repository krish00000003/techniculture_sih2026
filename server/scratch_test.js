const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING AUTOMATED API TESTS ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name} ${details ? '- ' + details : ''}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    assert(health.status === 200 && health.body.status === 'ok', 'Health Check endpoint returns status ok');

    // 2. Dev login for each role
    const roles = ['admin', 'employer', 'provider', 'trainee'];
    const tokens = {};
    for (const role of roles) {
      const res = await request(
        {
          hostname: 'localhost',
          port: 5000,
          path: '/api/auth/dev-login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { role }
      );
      assert(res.status === 200 && res.body.token && res.body.user.role === role, `Dev login as ${role}`);
      tokens[role] = res.body.token;
    }

    // 3. Auth me endpoint with JWT
    const meRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    assert(meRes.status === 200 && meRes.body.user.role === 'admin', 'Auth /me returns current user profile');

    // 4. Role Guard: Trainee trying to access Admin route should be rejected (403)
    const forbiddenRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokens.trainee}` },
    });
    assert(forbiddenRes.status === 403, 'Role guard rejects Trainee from Admin endpoints (403)');

    // 5. Unauthenticated request rejected (401)
    const unauthRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/stats',
      method: 'GET',
    });
    assert(unauthRes.status === 401, 'Unauthenticated request rejected with 401');

    // 6. Admin endpoints
    const adminStats = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    assert(adminStats.status === 200, 'Admin /stats endpoint');

    const rankings = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/rankings',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    assert(rankings.status === 200 && Array.isArray(rankings.body.rankings), 'Admin /rankings returns rankings list');

    const skillGaps = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/skill-gaps',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    assert(skillGaps.status === 200 && Array.isArray(skillGaps.body.gaps), 'Admin /skill-gaps returns gaps list');

    const alerts = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/alerts',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    assert(alerts.status === 200 && Array.isArray(alerts.body.alerts), 'Admin /alerts returns alerts list');

    const attrition = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/attrition',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    assert(attrition.status === 200 && Array.isArray(attrition.body.reasons), 'Admin /attrition returns reasons breakdown');

    const duplicates = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/duplicates',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    assert(duplicates.status === 200 && Array.isArray(duplicates.body.duplicates), 'Admin /duplicates returns duplicates');

    const settings = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/settings',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokens.admin}` },
    });
    assert(settings.status === 200 && settings.body.settings, 'Admin /settings returns system settings');

    // 7. Course listings
    const employerCourses = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/courses',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokens.employer}` },
    });
    assert(employerCourses.status === 200 && Array.isArray(employerCourses.body.courses), 'Employer /courses lists all courses');

    const providerCourses = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/courses',
      method: 'GET',
      headers: { Authorization: `Bearer ${tokens.provider}` },
    });
    assert(providerCourses.status === 200 && Array.isArray(providerCourses.body.courses), 'Provider /courses lists provider courses');

    // 8. Course completions & Trainee status
    if (employerCourses.body.courses.length > 0) {
      const courseId = employerCourses.body.courses[0]._id;
      const completionsRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/courses/${courseId}/completions`,
        method: 'GET',
        headers: { Authorization: `Bearer ${tokens.employer}` },
      });
      assert(completionsRes.status === 200 && completionsRes.body.course, 'Course completions returns course info');
      assert(Array.isArray(completionsRes.body.completions), 'Course completions returns completions array');

      if (completionsRes.body.completions.length > 0) {
        const firstComp = completionsRes.body.completions[0];
        assert(firstComp.traineeId, 'Completion record has traineeId');
        assert(firstComp.traineeStatus !== undefined, 'Completion record includes traineeStatus field');

        // Test public profile access
        const profileRes = await request({
          hostname: 'localhost',
          port: 5000,
          path: `/api/courses/trainee/${firstComp.traineeId}/profile`,
          method: 'GET',
          headers: { Authorization: `Bearer ${tokens.employer}` },
        });
        assert(profileRes.status === 200 && profileRes.body.trainee, 'Public profile endpoint returns trainee Digital CV');
      }
    }

  } catch (err) {
    console.error('Unexpected test error:', err);
    failed++;
  }

  console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
