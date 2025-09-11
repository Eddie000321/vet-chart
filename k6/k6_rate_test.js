// k6 constant-arrival-rate test for core APIs
// Usage:
//   k6 run -e BASE_URL=http://localhost:3001 -e RATE=200 -e DURATION=2m -e PRE_VUS=50 -e MAX_VUS=200 k6/k6_rate_test.js

import http from 'k6/http';
import { check, sleep } from 'k6';

const RATE = Number(__ENV.RATE || 200); // requests per second
const DURATION = __ENV.DURATION || '2m';
const PRE_VUS = Number(__ENV.PRE_VUS || 50);
const MAX_VUS = Number(__ENV.MAX_VUS || 200);

export const options = {
  scenarios: {
    rate: {
      executor: 'constant-arrival-rate',
      rate: RATE,
      timeUnit: '1s',
      duration: DURATION,
      preAllocatedVUs: PRE_VUS,
      maxVUs: MAX_VUS,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<200', 'p(99)<400'],
  },
};

export function setup() {
  const base = __ENV.BASE_URL || 'http://localhost:3001';
  const res = http.post(
    `${base}/api/auth/login`,
    JSON.stringify({ username: 'admin@vetchart.com', password: 'password' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  const token = (res.json() || {}).token;
  return { base, token };
}

export default function (data) {
  const headers = { Authorization: `Bearer ${data.token}` };
  const endpoints = [
    '/api/owners',
    '/api/patients',
    '/api/bills',
    '/api/appointments',
    '/api/records',
    '/api/dashboard/stats',
  ];
  const url = data.base + endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(url, { headers });
  check(res, { '200': (r) => r.status === 200 });
  sleep(0.01);
}

