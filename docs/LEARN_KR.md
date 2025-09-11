# VetChart 학습/운영 가이드 (KR)

최종 업데이트: 2025-09-11

이 문서는 VetChart 레포에 적용된 개선 사항을 한글로 요약하고, 실행/측정/운영 관점에서 학습할 수 있도록 정리했습니다.

## 1) 개요
- 목적: 수의병원 EMR 시스템(풀스택 예제). 프론트(React/TS/Vite/Tailwind) + 백엔드(Node/Express).
- 인증: JWT(Bearer). 프록시: Vite가 `/api` → 백엔드로 전달.
- 데이터: 현재 인메모리(mock) 중심이나, DB 운영 실습용 도구/헬스체크/백업 스크립트까지 포함.

## 2) 이번에 적용된 핵심 개선
- 백엔드 관측성/안정성
  - Health 체크: `GET /api/health` (uptime/timestamp)
  - Prometheus 메트릭: `GET /metrics` (기본 메트릭 + HTTP 지연 히스토그램 `http_request_duration_seconds{method,code}`)
  - 요청 로깅: `morgan` 추가
  - 보안/환경: `JWT_SECRET` 미설정 시 기동 실패(오작동 예방), `dotenv` 로컬 로드
- DB 유지보수(규제/운영 포커스)
  - DB Health: `GET /api/db/health` (Postgres `SELECT 1`, 지연시간 ms 포함)
  - 백업/복구 스크립트: `scripts/db-backup.sh`, `scripts/db-restore.sh`
  - 운영 문서: `ops/backup-restore.md`, `ops/db-maintenance.md`
- 프론트/개발 DX
  - 포트 충돌 해소: Docker Compose는 컨테이너 3001 → 호스트 3002 매핑
  - 프록시 설정을 환경변수화: `VITE_API_TARGET`(기본 `http://localhost:3001`)
  - Billing API 일원화: `src/services/api.ts`에서 `billsAPI_MOCK` 유지, 실제 호출은 `billsAPI`로 서버 `/api/bills` 사용
- 컨테이너
  - `server/Dockerfile` 포트 노출 정정: `EXPOSE 3001`
- 문서/가이드
  - `README.md`: 헬스/메트릭/DB ops 사용법, 포트 전략, 프록시 환경변수 설명
  - `PROJECT_ANALYSIS.md`: 프로젝트 전반 분석(개요/개선안)

## 3) 실행 방법(로컬 vs Docker)
- 로컬 Node 백엔드(권장 개발 모드)
  - 백엔드: `cd server && npm install && npm run dev` (기본 포트 3001)
  - 프론트: 루트에서 `npm run dev` (프록시 기본 3001)
- Docker 백엔드 사용 시
  - `docker compose up -d server` (컨테이너 3001 → 호스트 3002)
  - 프론트 `.env`에 `VITE_API_TARGET=http://localhost:3002` 추가 후 `npm run dev`
- 필수 환경변수
  - `server/.env`: `JWT_SECRET=dev-change-me` (없으면 서버가 종료)

## 4) 헬스/메트릭 관측
- Endpoints
  - Health: `GET /api/health`
  - Metrics: `GET /metrics`
    - 주요 지표: `http_request_duration_seconds_bucket/count/sum`
    - 라벨: `method`, `code`
- Prometheus 예시 쿼리(도입 시 활용)
  - p95 지연: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))`
  - 오류율: `sum(rate(http_request_duration_seconds_count{code=~"5.."}[5m])) / sum(rate(http_request_duration_seconds_count[5m]))`
  - 가용성(근사): `1 - (위 오류율)`

## 5) 성능 측정(k6)
- 스크립트: `k6/k6_test.js`
  - 흐름: setup에서 로그인 → 루프에서 `/api/owners|patients|bills|appointments|records|dashboard/stats` 랜덤 GET
  - 임계값: `p95<300ms`, 실패율 `<1%`, 체크 성공률 `>99%`
  - 환경: `BASE_URL`(기본 `http://localhost:3001`), `VUS`(기본 20), `DURATION`(기본 `2m`)
- 실행 예시
  - 로컬: `k6 run -e BASE_URL=http://localhost:3001 k6/k6_test.js`
  - Docker: `k6 run -e BASE_URL=http://localhost:3002 k6/k6_test.js`
  - 포트 경고 시: `--address 127.0.0.1:6566` 또는 `--address 127.0.0.1:0`
- 결과 해석 팁
  - 이번 측정: 20 VU/2m 기준 약 ~98 RPS, p95 9.65–14.96ms, 실패율 0%
  - 스크립트의 `sleep(0.2)`로 인해 서버 한계가 아닌 “여유 상태” 성능 지표임
- 고정 도착률(임계 RPS 파악)으로 확장(권장)
  - `executor: constant-arrival-rate`로 100→200→400 RPS 등 단계적으로 올려 p95/p99 붕괴 지점 탐색

## 6) 데이터베이스 운영
- DB 헬스: `GET /api/db/health` → 연결성/지연(ms)
- 백업/복구
  - 백업: `DATABASE_URL=postgres://user:password@localhost:5434/mydb ./scripts/db-backup.sh`
  - 복구: `DATABASE_URL=... ./scripts/db-restore.sh backups/<file>.dump --force`
  - 정책/가이드: `ops/backup-restore.md` 참고(RTO/RPO, 보존, 암호화, 복구 연습)
- 정기 유지보수: `ops/db-maintenance.md` (VACUUM/ANALYZE, 인덱스, 장기 쿼리, 풀링, 알림 임계치, 보안/컴플라이언스)
- 보안 권장
  - 전송 암호화: `PGSSLMODE=require` (TLS)
  - 최소 권한/자격증명 로테이션/접근 감사, PII/PHI 로그 마스킹

## 7) SLO/런북(제안)
- SLO(초안)
  - 레이턴시: p95 < 300ms(현재 여유 큼), 오류율 < 1%, 가용성 ≥ 99.9%
- 알림 정책(예)
  - Burn-rate 경보(단기/중기 이중 윈도): 5분/30분 윈도 기준 오류율·지연 임계 초과 시 슬랙/팀즈 통지
- 런북(예)
  - 고지연, 오류율 급증, DB 연결 실패, 이미지 롤백 체크리스트

## 8) 레주메/포트폴리오에 담을 포인트
- “관측성”: `/api/health`, `/metrics`(Prometheus), 요청 로깅 도입 → MTTR 개선 스토리
- “성능”: k6 임계값 통과(p95, 오류율), RPS/지연 수치 제시(20 VU/2m: ~98 RPS, p95 9.65–14.96ms, 0% 오류)
- “운영 위생”: 포트 충돌 제거, 프록시 환경변수화, 시크릿 강제
- “DBRE”: DB 헬스, 백업/복구 스크립트, 유지보수/규제 문서, RTO/RPO 실습 계획
- “프로덕션 동등성”: Billing API mock 제거 → 실서버 REST 일원화

## 9) 다음 단계(선택)
- Kubernetes 준비: Deployment/Service/Ingress + `liveness/readinessProbe`(`/api/health`), HPA/PDB, 리소스 제한
- 알림/대시보드: Grafana 대시보드 JSON, Alertmanager/슬랙 웹훅 규칙
- CI/CD: GitHub Actions(린트/빌드/테스트/도커/배포), 실패 시 롤백
- DB 실전 전환: Prisma/Postgres 연결 및 마이그레이션/시드, 인덱스/쿼리 최적화, PITR
- 트레이싱: OpenTelemetry로 분산 트레이스(요청 상관관계/병목 파악)

---
이 문서는 학습용 요약이며, 더 자세한 구조/분석은 루트의 `PROJECT_ANALYSIS.md`를 참고하세요. 질문이나 확장 작업이 필요하면 요청해 주세요.

