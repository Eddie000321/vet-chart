// k6 load test for VetChart backend
// Usage examples:
//  - Local server (3001): k6 run -e BASE_URL=http://localhost:3001 k6/k6_test.js
//  - Docker backend (3002): k6 run -e BASE_URL=http://localhost:3002 k6/k6_test.js
//  - Adjust load: k6 run -e BASE_URL=http://localhost:3001 -e VUS=10 -e DURATION=1m k6/k6_test.js

import http from "k6/http";
import { check, sleep } from "k6";

const VUS = Number(__ENV.VUS || 20);
const DURATION = __ENV.DURATION || "2m";

export const options = {
  vus: VUS,
  duration: DURATION,
  thresholds: {
    http_req_duration: ["p(95)<300"],
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
  },
};

export function setup() {
  const base = __ENV.BASE_URL || "http://localhost:3001";

  const res = http.post(
    `${base}/api/auth/login`,
    JSON.stringify({ username: "admin@vetchart.com", password: "password" }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(res, {
    "login status 200": (r) => r.status === 200,
    "login has token": (r) => (r.json() || {}).token,
  });

  const body = res.json();
  const token = body && body.token;

  return { base, token };
}

export default function (data) {
  const headers = { Authorization: "Bearer " + data.token };
  const endpoints = [
    "/api/owners",
    "/api/patients",
    "/api/bills",
    "/api/appointments",
    "/api/records",
    "/api/dashboard/stats",
  ];

  const idx = Math.floor(Math.random() * endpoints.length);
  const url = data.base + endpoints[idx];
  const res = http.get(url, { headers });

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(0.2);
}

