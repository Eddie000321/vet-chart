# Database Backup & Restore (PostgreSQL)

This guide documents logical backups and restores for the VetChart database. Tailored for regulated environments (HIPAA/SOC 2).

## Quick Start

- Full backup (custom format):
  - `DATABASE_URL=postgres://user:pass@localhost:5434/mydb ./scripts/db-backup.sh`
- Restore:
  - `DATABASE_URL=postgres://user:pass@localhost:5434/mydb ./scripts/db-restore.sh backups/pg_backup_YYYYmmdd_HHMMSS.dump --force`

## Policies (Recommended)
- Frequency: daily full logical backup; retain last 7–14 days in dev/stage; longer in prod
- Storage: offsite / immutable storage for prod; encrypt at rest (KMS/Key Vault)
- Access: least privilege; audit restore operations
- Validation: quarterly restore drills to verify RTO/RPO

## RTO / RPO
- Define targets per environment; record actuals during restore drills
- Track: start time, restore duration, data loss window

## Notes
- Scripts use `DATABASE_URL`. For SSL PG servers, set `PGSSLMODE=require`
- For large DBs consider physical/base backups + WAL archiving (PITR)

