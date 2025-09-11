# VetChart 테스트 설계 (KR)

이 문서는 현재 레포 기능을 기준으로 성능·관측성·DB 유지보수 테스트를 설계하고, 실행·판정 기준을 제시합니다. 검증은 사용자가 실행하며, 스크립트/엔드포인트는 레포에 포함되어 있습니다.

## 0) 사전 준비
- 백엔드(로컬): `cd server && npm install && npm run dev` (포트 3001)
- 또는 백엔드(Docker): `docker compose up -d server` (호스트 3002)
- 프론트(선택): 루트 `.env`에 `VITE_API_TARGET`로 백엔드 포트 지정 후 `npm run dev`
- DB: `docker compose up -d db` (포트 5434)

## 1) 관측성·헬스
- Health: `GET /api/health` → 200 + uptime/timestamp
- Metrics: `GET /metrics` → Prometheus 포맷, `http_request_duration_seconds{method,code}` 노출
- DB Health: `GET /api/db/health` → 200 + `latencyMs`; 실패 시 503
- Prometheus 추가 지표: `db_ping_duration_ms`, `db_ping_success_total`, `db_ping_failure_total`

## 2) k6 성능 테스트
### 2.1 기본 부하(k6_test.js)
- 목적: API 지연/실패율 기본 임계값 검증
- 명령(로컬): `k6 run -e BASE_URL=http://localhost:3001 k6/k6_test.js`
- 판정: `p95<300ms`, `error<1%` 통과

### 2.2 고정 RPS 한계 탐색(k6_rate_test.js)
- 목적: 임계 RPS·p99 붕괴 지점 식별
- 명령 예시: `k6 run -e BASE_URL=http://localhost:3001 -e RATE=200 -e DURATION=2m -e PRE_VUS=50 -e MAX_VUS=200 k6/k6_rate_test.js`
- 판정: `http_req_failed<1%`, `p95<200ms`, `p99<400ms` 유지 구간 기록

### 2.3 읽기/쓰기 믹스(k6_rw_mix.js)
- 목적: 현실 트래픽(생성+조회)에서 응답 품질 확인
- 명령: `k6 run -e BASE_URL=http://localhost:3001 -e RATE=50 -e DURATION=2m k6/k6_rw_mix.js`
- 판정: `p95<300ms`, `error<2%` 통과, owners/patients 생성 2xx 확인

### 2.4 DB 프로브(k6_db_probe.js)
- 목적: DB 헬스/읽기/쓰기 경로 지연·성공률 확인
- 명령: `k6 run -e BASE_URL=http://localhost:3001 -e RATE=30 -e DURATION=1m k6/k6_db_probe.js`
- 판정: health/scan/write 각각 2xx 비율 ≥ 98%, p95<300ms

- 참고: 포트가 Docker(3002)일 때는 `BASE_URL=http://localhost:3002`로 변경

## 3) DB 유지보수 테스트
### 3.1 백업/복구 드릴(RTO/RPO)
- 환경: `export DATABASE_URL=postgres://user:password@localhost:5434/mydb`
- 백업: `time ./scripts/db-backup.sh` → 소요 시간 기록
- 복구 전 초기화(주의): `psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`
- 복구: `time ./scripts/db-restore.sh backups/<파일>.dump --force` → RTO 기록
- RPO: 마지막 백업 시각 기준 데이터 손실 창 계산

### 3.2 풀/동시성 튜닝(옵션)
- 환경변수: `PGPOOL_MAX`, `PGPOOL_IDLE`, `PGPOOL_CONN_TIMEOUT`
- 시나리오: `k6 run -e BASE_URL=... -e RATE=... k6/k6_db_probe.js` 반복 실행하며 p95/에러율 추이 관찰

### 3.3 장애 복원력
- DB 중지: `docker compose stop db` → `/api/db/health` 503 확인
- 재가동: `docker compose start db` → 200 복귀, 로그/메트릭 정상화 확인

## 4) 산출물(문서화 제안)
- 요약/지표: `k6 run --summary-export=reports/summary.json ...`
- 타임시리즈: `k6 run -o json=reports/metrics.json ...`
- 보고서: k6 결과(p95/p99/에러율/RPS), DB RTO/RPO, 풀 튜닝 전후 비교 그래프 첨부

## 5) 수용 기준(샘플)
- SLO 후보 충족: p95<300ms, error<1% (RW 믹스는 error<2%)
- DB 프로브 안정: health/scan/write 2xx≥98%, p95<300ms
- 백업/복구: RTO ≤ X분, RPO ≤ Y분(팀 기준에 맞게 설정)

---
부가 자료: `docs/LEARN_KR.md`, `ops/backup-restore.md`, `ops/db-maintenance.md`.

