# DB Maintenance Playbook (PostgreSQL)

Operational checklist for routine DB care in regulated healthcare environments.

## Routine Tasks
- VACUUM/ANALYZE: ensure autovacuum is enabled; schedule off-peak manual `VACUUM (ANALYZE)` as needed
- Index hygiene: review bloat; rebuild only when necessary
- Long-running queries: monitor > 1m; terminate if blocking critical paths
- Connection pooling: size pool to CPU x N; avoid connection storms
- Disk/CPU/Memory thresholds: set alerts with sensible headroom (e.g., 80%)
- Error budgets: incorporate DB SLOs into burn-rate alerts

## Monitoring Queries
- Top slow statements: enable `pg_stat_statements`
- Blocking activity:
  ```sql
  SELECT bl.pid AS blocked_pid, ka.query AS blocking_query, now() - ka.query_start AS blocking_age
  FROM pg_locks bl
  JOIN pg_locks kl ON bl.locktype = kl.locktype AND bl.DATABASE IS NOT DISTINCT FROM kl.DATABASE AND bl.relation IS NOT DISTINCT FROM kl.relation AND bl.page IS NOT DISTINCT FROM kl.page AND bl.tuple IS NOT DISTINCT FROM kl.tuple AND bl.virtualxid IS NOT DISTINCT FROM kl.virtualxid AND bl.transactionid IS NOT DISTINCT FROM kl.transactionid AND bl.classid IS NOT DISTINCT FROM kl.classid AND bl.objid IS NOT DISTINCT FROM kl.objid AND bl.objsubid IS NOT DISTINCT FROM kl.objsubid AND bl.pid <> kl.pid
  JOIN pg_stat_activity ka ON ka.pid = kl.pid
  WHERE NOT bl.granted;
  ```

## Security & Compliance
- Enforce TLS in transit (set `PGSSLMODE=require`)
- Least-privilege DB roles; rotate credentials; audit access
- PII/PHI handling: no sensitive data in logs; masking where applicable

## Incident Playbooks
- High latency: capture EXPLAIN ANALYZE, check locks, CPU/IO, cache hit ratios
- Error spikes: verify connection saturation, auth failures, storage pressure
- Restore drill: document RTO/RPO results after each exercise

