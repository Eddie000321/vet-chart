**DBRE 실습 증빙 / DBRE Evidence (KR/EN)**

— KR —

**목적(Purpose)**
- 교과서 개념(커넥션 풀 최적점, 인덱스 효과, 백업/복구 RTO·RPO)을 로컬 환경에서 소규모로 검증한다.
- 결과 수치를 통해 원리(큐잉/컨텐션, 인덱스 스캔 전환, 복구 시간/데이터 손실 창)를 학습한다.

**환경(Environment)**
- App: Node.js/Express, PostgreSQL 14 (Docker Compose), Prometheus metrics
- k6: constant-arrival-rate 기반
- Vars: `PGPOOL_MAX`, `PGPOOL_CONN_TIMEOUT`, `PGPOOL_IDLE`
- BASE_URL: `http://localhost:3001` (or compose mapping)

**시나리오(Scenarios)**
- Baseline: `k6/scenarios/probe_base.js` (RATE=30, 2m)
- Small Pool: `k6/scenarios/probe_pool_small.js` (PGPOOL_MAX~3)
- Large Pool: `k6/scenarios/probe_pool_large.js` (PGPOOL_MAX~30)
- Indexing: `sql/indexing/*.sql` (created_at 정렬 인덱스 전/후)
- Backup/Restore: `scripts/db-backup.sh` / `scripts/db-restore.sh`

**실행(How to Run)**
- Baseline: `k6 run -e BASE_URL=... -e RATE=30 -e DURATION=2m k6/scenarios/probe_base.js`
- Small Pool: 서버 `PGPOOL_MAX=3`로 구동 후 `probe_pool_small.js`
- Large Pool: 서버 `PGPOOL_MAX=30`로 구동 후 `probe_pool_large.js`
- Indexing:
  - 전: `psql $DATABASE_URL -f sql/indexing/explain_scan_before.sql`
  - 생성: `psql $DATABASE_URL -f sql/indexing/create_idx_db_probes_created_at.sql`
  - 후: `psql $DATABASE_URL -f sql/indexing/explain_scan_after.sql`
  - 정리: `psql $DATABASE_URL -f sql/indexing/drop_idx_db_probes_created_at.sql`
- Backup: `DATABASE_URL=... ./scripts/db-backup.sh`
- Restore: `DATABASE_URL=... ./scripts/db-restore.sh backups/pg_backup_YYYYmmdd_HHMMSS.dump --force`

**결과(Results) [기입]**
- Baseline: p50=?, p95=?, fail_rate=?
- Small Pool: p50=?, p95=?, fail_rate=? (증감 분석)
- Large Pool: p50=?, p95=?, fail_rate=? (증감 분석)
- Indexing: EXPLAIN 전/후 요약(Seq Scan→Index Scan), 실행시간 전/후
- Backup/Restore: Backup=?, Restore=? → RTO=?, RPO=?

**해석(Interpretation)**
- 풀 축소 시 큐잉과 타임아웃 증가 → p95/실패율 악화
- 풀 확대 시 개선되나 일정 구간 이후 체감 한계
- 정렬 키 인덱스 적용 시 ORDER BY+LIMIT가 인덱스 스캔으로 전환되어 레이턴시 하락
- 백업/복구 측정으로 RTO/RPO 개념 체화

**한계/다음(Limitations/Next)**
- 로컬 단일 노드/컨테이너 환경의 한계
- 다음: pgbouncer 도입, 장기 Soak(10–15분), 라우트/테넌트 레이블 메트릭 추가

— EN —

**Purpose**
- Validate textbook ideas (pool sizing, index benefit, backup/restore RTO-RPO) via small local experiments.
- Use numbers to link causes to effects (queuing/contention, index scan switch, recovery time/data loss window).

**Environment**
- App: Node.js/Express, PostgreSQL 14 (Docker Compose), Prometheus metrics
- k6: constant-arrival-rate based
- Vars: `PGPOOL_MAX`, `PGPOOL_CONN_TIMEOUT`, `PGPOOL_IDLE`
- BASE_URL: `http://localhost:3001`

**Scenarios**
- Baseline: `k6/scenarios/probe_base.js` (RATE=30, 2m)
- Small Pool: `k6/scenarios/probe_pool_small.js` (PGPOOL_MAX~3)
- Large Pool: `k6/scenarios/probe_pool_large.js` (PGPOOL_MAX~30)
- Indexing: `sql/indexing/*.sql` (created_at sort index before/after)
- Backup/Restore: `scripts/db-backup.sh` / `scripts/db-restore.sh`

**How to Run**
- Baseline: `k6 run -e BASE_URL=... -e RATE=30 -e DURATION=2m k6/scenarios/probe_base.js`
- Small Pool: run server with `PGPOOL_MAX=3`, then `probe_pool_small.js`
- Large Pool: run server with `PGPOOL_MAX=30`, then `probe_pool_large.js`
- Indexing:
  - Before: `psql $DATABASE_URL -f sql/indexing/explain_scan_before.sql`
  - Create:  `psql $DATABASE_URL -f sql/indexing/create_idx_db_probes_created_at.sql`
  - After:  `psql $DATABASE_URL -f sql/indexing/explain_scan_after.sql`
  - Cleanup: `psql $DATABASE_URL -f sql/indexing/drop_idx_db_probes_created_at.sql`
- Backup: `DATABASE_URL=... ./scripts/db-backup.sh`
- Restore: `DATABASE_URL=... ./scripts/db-restore.sh backups/pg_backup_YYYYmmdd_HHMMSS.dump --force`

**Results [fill in]**
- Baseline: p50=?, p95=?, fail_rate=?
- Small Pool: p50=?, p95=?, fail_rate=? (delta)
- Large Pool: p50=?, p95=?, fail_rate=? (delta)
- Indexing: EXPLAIN before/after summary (Seq Scan→Index Scan), runtime delta
- Backup/Restore: Backup=?, Restore=? → RTO=?, RPO=?

**Interpretation**
- Small pool → queuing/timeout ↑ → p95/error worsens
- Larger pool → improves up to a point, diminishing returns
- Proper index on sort key enables index scan for ORDER BY+LIMIT → lower latency
- RTO/RPO quantified via backup/restore

**Limitations/Next**
- Local single-node/container limitations
- Next: add pgbouncer, 10–15m soak, route/tenant labels on metrics

