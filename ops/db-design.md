# VetChart — Database Design (EN)

Purpose: capture data retention requirements (keep medical records even if owners are deleted), preserve integrity, and align server logic, schema, migrations, and operations.

## 1) Current State
- Runtime: server uses in-memory storage (`server/index.js`).
- Schema: PostgreSQL via Prisma exists (`server/prisma/schema.prisma`), several relations use `onDelete: Cascade`.
- Ops docs: backup/restore and DB maintenance docs exist under `ops/` and `sql/indexing/`.

## 2) Core Entities & Relationships
- Entities: Owner, Patient, MedicalRecord, Appointment, Bill.
- Relationships (target design intent):
  - Patient.ownerId → Owner.id
  - MedicalRecord.patientId → Patient.id
  - Appointment.patientId → Patient.id
  - Bill.ownerId → Owner.id
  - Bill.patientId → Patient.id
  - Bill ↔ MedicalRecord: join table (not an array) for many-to-many

## 3) Deletion & Retention Policy
Goal: deleting an owner must not remove medical records or financial records.

- Patient.ownerId: ON DELETE SET NULL (and make `ownerId` nullable). Patients remain even if owners are removed.
- MedicalRecord.patientId: ON DELETE RESTRICT (preferred), or ON DELETE SET NULL only if records are allowed to be fully detached. Records must be preserved.
- Appointment.patientId: ON DELETE RESTRICT to preserve appointment history; allow explicit archival if needed.
- Bill.ownerId / Bill.patientId: ON DELETE RESTRICT (preferred) or SET NULL; financial records must be preserved.
- Soft delete: add `deletedAt TIMESTAMP NULL` to major tables for business-level deletion without losing history. Default scopes exclude soft-deleted rows.
- Optionally snapshot presentational owner data into `MedicalRecord` (e.g., owner name/phone at time of visit) for audit readability while keeping normalization.

## 4) Normalize Bill ↔ MedicalRecord
Replace `Bill.medicalRecordIds: String[]` with a proper join table to enforce referential integrity.

- Table: `BillMedicalRecord (billId UUID FK, medicalRecordId UUID FK, PRIMARY KEY(billId, medicalRecordId))`
- Add FKs to `Bill(id)` and `MedicalRecord(id)` with `ON DELETE RESTRICT`.

## 5) Bill Numbering (Collision-Free)
Concurrent requests must not generate duplicate bill numbers.

- Use a DB sequence or `generated always as identity` column + formatting for display (e.g., `BILL-000001`).
- Enforce unique index on the business bill number.
- If generating in app: use `INSERT ... ON CONFLICT DO NOTHING` with retry or rely on the sequence value from the DB.

## 6) Constraints & Enums
- Enums:
  - Patient.gender: `male | female` (consider `unknown` if needed)
  - Patient.status: `active | inactive`
  - MedicalRecord.recordType: `vaccine | surgery | treatment | dental`
  - Bill.status: `draft | sent | paid | overdue | cancelled`
- Checks:
  - Patient.age >= 0
  - Patient.weight > 0
- Not-null and length constraints for required columns.
- Unique constraints:
  - Keep `Owner.email` unique for active rows; if soft delete is used, a partial unique index: `UNIQUE(email) WHERE deletedAt IS NULL`.

## 7) Indexing
- Add indexes for all FK columns: `Patient.ownerId`, `MedicalRecord.patientId`, `Appointment.patientId`, `Bill.ownerId`, `Bill.patientId`.
- Add indexes to match list sorting: commonly `createdAt DESC`.
- Maintain existing probe index example under `sql/indexing/` for `db_probes.created_at`.

## 8) Migration Plan (Phased)
1. Introduce enums and CHECK constraints; add indexes for FK columns.
2. Create `BillMedicalRecord` join table and migrate data from the array field.
3. Make `Patient.ownerId` nullable and change FK to `ON DELETE SET NULL`.
4. Change FKs to `RESTRICT` (or `SET NULL` where specified) for `MedicalRecord`, `Appointment`, and `Bill` relations.
5. Add `deletedAt` soft-delete columns and redefine unique indexes as partial where applicable.
6. Implement bill numbering via DB sequence/identity and update API logic accordingly.

## 9) Integrity & Concurrency Tests
- Deletion scenarios:
  - Delete Owner: Patients retained (ownerId null), MedicalRecords/Bills still present.
  - Attempt to delete Patient with records: rejected (RESTRICT) unless archival path is executed.
- Join integrity: cannot insert orphaned `BillMedicalRecord`; cascading rules behave as expected.
- Bill number race: hammer test concurrent creations; assert unique constraint holds and logic retries succeed.
- Constraint validation: invalid enum values or negative age/weight fail as expected.

## 10) Server Alignment
- Align deletion and validation flows to match DB rules (use transactions).
- Replace in-memory bill-number generation with DB-backed sequence.
- Replace array-based medicalRecordIds with join-table CRUD.

## 11) Operations & Security
- Connection pool tuning via `PGPOOL_MAX`, `PGPOOL_IDLE`, `PGPOOL_CONN_TIMEOUT`.
- Metrics: `/metrics` exposes Prometheus stats (including DB ping success/failure and latency).
- Backup/restore: use scripts in `ops/backup-restore.md`; perform quarterly restore drills to validate RTO/RPO.
- Security: enforce TLS in transit (`PGSSLMODE=require`), least privilege, and audit sensitive operations.

## 12) Risk Register
- Data loss from cascade deletes (Prisma schema defaults) — mitigate by revising `onDelete` policies.
- Bill number collisions from in-memory `count+1` generator — replace with DB sequence.
- Integrity gaps from array-based IDs on `Bill` — replace with join table and FKs.
- Schema vs runtime mismatch — align server behavior and add tests.
- Operational uniqueness on `Owner.email` — use partial unique index with soft delete.

## 13) TODO Checklist
- Revise FK `onDelete` policies and allow `ownerId` to be NULL on `Patient`.
- Add soft-delete fields (`deletedAt`) and partial unique indexes.
- Introduce `BillMedicalRecord` join table and migrate existing data.
- Implement safe bill number generation (sequence / conflict-safe insert).
- Add enums and CHECK constraints.
- Add FK and sort-order indexes.
- Align server logic to DB rules (deletes/validation/transactions).
- Write Prisma migrations and seeds.
- Add integrity and concurrency tests.
- Update ops docs (backup/restore, tuning, deletion policy, runbooks).

