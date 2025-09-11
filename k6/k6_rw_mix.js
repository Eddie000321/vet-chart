// k6 read/write mix scenario (API-level, app auth required)
// Usage:
//   k6 run -e BASE_URL=http://localhost:3001 -e RATE=50 -e DURATION=2m -e PRE_VUS=30 -e MAX_VUS=150 k6/k6_rw_mix.js

import http from 'k6/http';
import { check, sleep } from 'k6';

const RATE = Number(__ENV.RATE || 50);
const DURATION = __ENV.DURATION || '2m';
const PRE_VUS = Number(__ENV.PRE_VUS || 30);
const MAX_VUS = Number(__ENV.MAX_VUS || 150);

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
    http_req_duration: ['p(95)<300', 'p(99)<600'],
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

function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export default function (data) {
  const headers = { Authorization: `Bearer ${data.token}`, 'Content-Type': 'application/json' };
  const base = data.base;

  const ops = ['GET_LIST', 'CREATE_OWNER', 'CREATE_PATIENT'];
  const op = randChoice(ops);

  let res;
  if (op === 'GET_LIST') {
    res = http.get(`${base}/api/owners`, { headers });
    check(res, { '200 owners': (r) => r.status === 200 });
  } else if (op === 'CREATE_OWNER') {
    const body = JSON.stringify({
      firstName: 'Load', lastName: 'Tester', email: `lt_${Math.random().toString(36).slice(2)}@ex.com`,
      phone: '(555) 000-0000', address: '123 Test St', notes: 'k6 create'
    });
    res = http.post(`${base}/api/owners`, body, { headers });
    check(res, { '201 owner': (r) => r.status === 201 });
  } else if (op === 'CREATE_PATIENT') {
    // Need an owner id; fallback to list then create under first owner
    const list = http.get(`${base}/api/owners`, { headers });
    const owners = list.json();
    const ownerId = owners && owners[0] && owners[0].id;
    if (ownerId) {
      const body = JSON.stringify({
        name: 'Buddy', species: 'Dog', breed: 'Mixed', age: 4, gender: 'Male', weight: 20,
        ownerId, status: 'active'
      });
      res = http.post(`${base}/api/patients`, body, { headers });
      check(res, { '201 patient': (r) => r.status === 201 });
    }
  }

  sleep(0.02);
}

