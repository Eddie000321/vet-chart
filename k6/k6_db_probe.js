// k6 DB probe scenario: health + write + scan (requires app auth for write/scan)
// Usage:
//   k6 run -e BASE_URL=http://localhost:3001 -e RATE=30 -e DURATION=1m -e PRE_VUS=20 -e MAX_VUS=100 k6/k6_db_probe.js

import http from 'k6/http';
import { check, sleep } from 'k6';

const RATE = Number(__ENV.RATE || 30);
const DURATION = __ENV.DURATION || '1m';
const PRE_VUS = Number(__ENV.PRE_VUS || 20);
const MAX_VUS = Number(__ENV.MAX_VUS || 100);

export const options = {
  scenarios: {
    mix: {
      executor: 'constant-arrival-rate',
      rate: RATE,
      timeUnit: '1s',
      duration: DURATION,
      preAllocatedVUs: PRE_VUS,
      maxVUs: MAX_VUS,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<300', 'p(99)<800'],
  },
};

export function setup() {
  const base = __ENV.BASE_URL || 'http://localhost:3001';
  const login = http.post(
    `${base}/api/auth/login`,
    JSON.stringify({ username: 'admin@vetchart.com', password: 'password' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  const token = (login.json() || {}).token;
  return { base, token };
}

function rand() { return Math.random(); }

export default function (data) {
  const base = data.base;
  const headers = { Authorization: `Bearer ${data.token}`, 'Content-Type': 'application/json' };

  // 50% health, 30% scan, 20% write
  const r = rand();
  if (r < 0.5) {
    const res = http.get(`${base}/api/db/health`);
    check(res, { '200 health': (x) => x.status === 200 });
  } else if (r < 0.8) {
    const res = http.get(`${base}/api/db/test-scan?limit=50`, { headers });
    check(res, { '200 scan': (x) => x.status === 200 });
  } else {
    const res = http.post(`${base}/api/db/test-write?count=5&payloadSize=128`, null, { headers });
    check(res, { '200 write': (x) => x.status === 200 });
  }
  sleep(0.02);
}

