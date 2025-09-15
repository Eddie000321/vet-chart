# 🏥 VetChart EMR System

> A full‑stack Electronic Medical Records (EMR) system for veterinary clinics

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

## Overview

https://github.com/user-attachments/assets/47b17f21-94da-4dab-8e8c-6eb4d71cba43

VetChart is a pragmatic full‑stack EMR example for clinics. It focuses on clean UI/UX, a simple Express API, and operational practices (health checks, metrics, backup/restore, performance probes).

> Current status
>
> - Backend stores clinic data in‑memory for demo. PostgreSQL is used for ops experiments (`/api/db/*`).
> - Prisma schema exists (`server/prisma/schema.prisma`) but is not wired into runtime yet.
> - Frontend uses TypeScript; backend is JavaScript (type‑safety end‑to‑end planned).

## 🚀 Features

### App Capabilities
- Appointment scheduling with daily/weekly views
- Patient and owner management with recent activity
- Medical records with PDF export
- Billing with itemized invoices
- Authentication (JWT) and role‑aware UI
- Dashboard with quick stats

### Technical Highlights
- Clean REST API with JWT auth and request logging
- Prometheus metrics (`/metrics`) and explicit DB health (`/api/db/health`)
- Vite dev server with proxy and fast HMR
- Docker Compose for repeatable local environments

## 🛠️ Stack

### Frontend
- React 18, TypeScript, Vite, Tailwind CSS, lucide-react

### Backend
- Node.js, Express, jsonwebtoken, bcryptjs, morgan, prom-client, pg
- Prisma schema prepared (not yet used at runtime)

### Infrastructure & Tooling
- PostgreSQL (Docker)
- Docker & Docker Compose
- ESLint, PostCSS, Concurrently

## Prerequisites

- Node.js (LTS recommended) and npm or Yarn
- Docker Desktop (includes Docker Compose)

## Installation

1) Clone

```bash
git clone https://github.com/Eddie000321/vet-chart.git
cd vet-chart
```

2) Backend deps

```bash
cd server
npm install
```

3) Start database (choose one)

- Local Compose (DB only for local Node server):

  ```bash
  cd ..
  docker compose up -d db
  ```

- Full Compose (server + db):

  ```bash
  cd ..
  docker compose up -d
  # server: container 3001 → host 3002
  ```

4) Frontend deps (project root)

```bash
npm install
```

5) Optional: Prisma migrations (schema only)

```bash
cd server
npx prisma migrate dev --name init
cd ..
```

## Running

- Full local dev (Node backend + frontend):

  ```bash
  npm run dev:full
  # backend: http://localhost:3001, frontend: http://localhost:5173
  ```

- Run separately:

  ```bash
  cd server && npm run dev   # backend only
  npm run dev                # frontend only (from project root)
  ```

### Default Login (demo)

- Username: `admin@vetchart.com`
- Password: `password`

### Environment

- `server/.env`
  - `JWT_SECRET=dev-change-me` (required; server aborts if missing)
  - `DATABASE_URL=postgresql://user:password@localhost:5434/mydb`
  - Optional pool tuning: `PGPOOL_MAX`, `PGPOOL_CONN_TIMEOUT`, `PGPOOL_IDLE`
- Frontend proxy
  - Local Node backend: default proxy `http://localhost:3001`
  - Docker server: set root `.env` → `VITE_API_TARGET=http://localhost:3002`

### Database-backed Mode (UI wired to Postgres)

- Toggle persistence by environment variable:
  - `PERSIST=prisma` to use Prisma/Postgres for owners, patients, medical records, appointments, and bills.
- One-time setup:
  ```bash
  cd server
  npm install
  npx prisma migrate dev --name init
  npm run seed:prisma   # optional small seed for UI
  ```
- Run with DB mode:
  ```bash
  # local
  PERSIST=prisma JWT_SECRET=dev-change-me DATABASE_URL=postgresql://user:password@localhost:5434/mydb npm run dev
  # or via docker compose (server only)
  PERSIST=prisma docker compose up -d server
  ```

### Docker (Server + DB)

- Build and run server + db:
  ```bash
  docker compose up -d --build db server
  ```
- Access:
  - Backend: http://localhost:3002
  - Health: http://localhost:3002/api/health
  - DB health: http://localhost:3002/api/db/health
  
If you enable DB-backed mode:
  ```bash
  # run migrations + optional seed once
  cd server && npx prisma migrate deploy && npm run seed:prisma
  # start server using DB
  cd .. && PERSIST=prisma docker compose up -d server
  ```

## Observability

- Health: `GET /api/health`
- Metrics (Prometheus): `GET /metrics`
- DB health: `GET /api/db/health`

Prometheus tip

- Scrape `http://localhost:3001/metrics` (or `3002` if Docker server). Example metrics include `http_request_duration_seconds` (by method/code) and DB ping histograms.

## Operations

- Backup: `DATABASE_URL=postgres://user:password@localhost:5434/mydb ./scripts/db-backup.sh`
- Restore: `DATABASE_URL=postgres://user:password@localhost:5434/mydb ./scripts/db-restore.sh backups/<file>.dump --force`
- Guides: `ops/backup-restore.md`, `ops/db-maintenance.md`

## Performance & DB Experiments

- k6 scenarios: `k6/scenarios/*.js` (baseline/pool‑small/pool‑large)
  - Example: `k6 run -e BASE_URL=http://localhost:3001 -e RATE=30 -e DURATION=2m k6/scenarios/probe_base.js`
- Indexing exercise (created_at sort): see `sql/indexing/`
  - Before: `psql $DATABASE_URL -f sql/indexing/explain_scan_before.sql`
  - Create:  `psql $DATABASE_URL -f sql/indexing/create_idx_db_probes_created_at.sql`
  - After:  `psql $DATABASE_URL -f sql/indexing/explain_scan_after.sql`
  - Cleanup: `psql $DATABASE_URL -f sql/indexing/drop_idx_db_probes_created_at.sql`
- Summary template: `docs/DBRE_EVIDENCE.md`

## Project Structure

```
vet-chart/
├── server/              # Backend (Express, PG; Prisma schema present)
│  └── prisma/           # Prisma schema and migrations
├── src/                 # Frontend (React + TS)
├── k6/                  # Load/perf tests
├── sql/indexing/        # SQL for EXPLAIN/index experiments
├── ops/                 # Ops guides (backup/restore, maintenance)
├── docs/                # Learning notes and DBRE evidence
└── docker-compose.yml   # Compose config (db + optional server)
```

## Limitations & Roadmap

- Backend uses in‑memory storage for clinic data (demo). Prisma/Postgres integration is planned.
- Some frontend APIs still use mock paths; will consolidate to real endpoints.
- Add tests (unit/integration), rate limiting, stronger CORS, and CI.

## Contributing & License

- See `CONTRIBUTING.md` for guidelines.
- Licensed under the terms in `LICENSE`.

## Database Schema Note

- Current runtime: in‑memory store; Prisma schema lives at `server/prisma/schema.prisma` for future DB wiring. ER diagram and image will be updated when integration lands.


## 🎯 Development Experience & Learning Outcomes

This project demonstrates proficiency in:

### **Full-Stack Development**
- **Frontend Architecture**: Component-based design with React hooks and context patterns
- **Backend API Design**: RESTful endpoints with proper error handling and validation
- **Database Management**: Schema design, relationships, and query optimization
- **Authentication Flow**: Secure user sessions with JWT and role-based permissions

### **Modern Development Practices**
- **Type Safety**: Comprehensive TypeScript implementation across frontend and backend
- **Code Quality**: ESLint configuration and consistent code standards
- **Version Control**: Git workflow with meaningful commit messages
- **Containerization**: Docker setup for consistent development environments

### **Problem-Solving & Architecture**
- **Data Modeling**: Designed normalized database schema for complex healthcare relationships
- **State Management**: Implemented efficient state patterns for user authentication and data flow
- **API Integration**: Created centralized service layer for clean separation of concerns
- **Performance Optimization**: Implemented lazy loading and optimized bundle splitting

### **Industry-Relevant Skills**
- **Healthcare Domain Knowledge**: Understanding of EMR requirements and compliance considerations
- **Scalable Architecture**: Monorepo structure with clear separation between frontend and backend
- **Production Readiness**: Docker containerization and environment configuration
- **User Experience**: Responsive design with intuitive workflows for healthcare professionals

## 🔗 Links & Contact

- **Live Demo**: 
- **Portfolio**: 
- **LinkedIn**: 
- **Email**: 

---

## Contributing

Contributions are welcome! Please see the `CONTRIBUTING.md` for details on how to contribute.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
