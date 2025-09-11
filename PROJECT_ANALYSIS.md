# VetChart EMR System – 저장된 리포지토리 분석

최종 업데이트: 2025-09-11

## 개요
- 목적: 수의병원 EMR(전자 의무기록) 시스템의 풀스택 예제. 프론트엔드(React/TS/Vite/Tailwind) + 백엔드(Node/Express)로 구성되며 인증/권한, 환자·보호자·진료기록·예약·청구 기능을 포함합니다.
- 현재 상태: 백엔드는 인메모리(Mock) 데이터로 구동되며, Prisma/PostgreSQL 스키마는 준비되어 있으나 런타임에 사용되지는 않습니다. 프론트 일부 API(청구 목록 등)는 아직 mock을 사용합니다.

## 기술 스택
- 프론트엔드: React 18, TypeScript, Vite, Tailwind CSS, lucide-react, date-fns, jsPDF/html2canvas(진료기록 PDF 생성)
- 백엔드: Node.js + Express, JWT 인증, bcrypt 비밀번호 해시
- DB: Prisma 스키마(PostgreSQL)가 존재하나, 서버 코드는 현재 인메모리 저장소 사용

## 구조(요약)
- 루트
  - package.json: dev, dev:backend, dev:full, build, preview
  - vite.config.ts: /api → http://localhost:3001 프록시 설정
  - src/: 컴포넌트, 컨텍스트, 서비스(API 래퍼), 타입, 유틸(PDF)
  - .env: Supabase 관련 값 존재(코드에서 사용되지 않음)
- 서버(server/)
  - index.js: Express 앱, JWT 미들웨어, CRUD 엔드포인트(인메모리 데이터)
  - prisma/schema.prisma: Owner/Patient/MedicalRecord/Appointment/Bill 모델 정의(PostgreSQL)
  - .env: DATABASE_URL 정의(현재 코드 경로에서 미사용)
  - Docker: server/Dockerfile, 루트 docker-compose.yml

## 프론트엔드 세부
- 인증 흐름: src/contexts/AuthContext.tsx에서 로컬 스토리지 토큰 확인 후 /api/auth/me로 세션 복원
- 서비스 레이어: src/services/api.ts에서 엔드포인트 래핑 및 공통 헤더/에러 처리
- UI: src/App.tsx 탭 기반 레이아웃(Header/Sidebar/메인). 대시보드/보호자/환자/기록/예약/멤버/청구 모듈
- PDF: src/utils/pdfGenerator.ts에서 jsPDF + html2canvas로 진료기록 PDF 생성/다운로드/인쇄

## 백엔드(API) 세부
- 인증: POST /api/auth/login, GET /api/auth/me (JWT)
- 보호자: GET/POST /api/owners, GET/PUT/DELETE /api/owners/:id
- 환자: GET/POST /api/patients, GET/PUT/DELETE /api/patients/:id
- 진료기록: GET/POST /api/records, GET /api/records/patient/:patientId, PUT /api/records/:id
- 예약: GET/POST /api/appointments, PUT/DELETE /api/appointments/:id
- 청구: GET/POST /api/bills, GET/PUT/DELETE /api/bills/:id, GET /api/bills/owner/:ownerId, GET /api/bills/patient/:patientId
- 통계: GET /api/dashboard/stats
- 데이터 보관: 서버 기동 시 initDB()로 더미 데이터 로드 후 메모리에 저장

## 실행
- 루트 의존성 설치: npm install
- 서버 의존성 설치: cd server && npm install
- 동시 실행: 루트에서 npm run dev:full (프론트 5173, 백엔드 3001)
- 프록시: 프론트 /api 요청은 vite.config.ts 설정으로 3001로 전달

## 주의/개선 포인트
1) 데이터 계층 불일치
- 서버는 인메모리 저장, Prisma/PostgreSQL 스키마는 미사용
- 프론트 billsAPI.getAll 등 일부 mock 사용 → 실제 API로 일원화 필요

2) 보안 및 설정
- JWT 시크릿 기본값 'your-secret-key' 하드코딩 → 환경변수 필수화
- CORS 전역 허용, 레이트리밋/브루트포스 방어 없음
- 루트 .env의 외부 서비스 키 존재(미사용) → 비노출/정리 필요

3) 의존성/버전/도커 구성
- 루트와 서버 간 Express/의존성 혼재(루트: express@^5, 서버: express@^4) → 일관화 권장
- server/Dockerfile EXPOSE 3000 vs 서버 포트 3001, compose는 3001:3001 → 포트 동기화 필요

4) 테스트 부재
- 단위/통합/계약 테스트 없음 → 핵심 API/서비스 테스트 도입 권장

## 제안 로드맵
- 백엔드 DB 연동: Prisma 적용(리포지토리 패턴), 인메모리 로직 → Prisma Client로 대체, 마이그레이션/시드 추가
- 프론트-백엔드 일관화: mock 제거, 실제 엔드포인트 사용, 에러/로딩/필터 표준화
- 보안 강화: 환경변수 강제, CORS 제한, 레이트리밋, 비밀번호 정책 적용
- 운영 구성: Dockerfile/compose 포트/헬스체크 정리, 스크립트 정돈
- 품질: ESLint/TS 유지, Vitest/Playwright 도입, CI에 lint/build/test 파이프라인 추가

## 다음 액션(옵션)
- Prisma 연결 작업 시작(모델 기준으로 각 엔드포인트 단계적 이관)
- billsAPI mock 제거 → 서버 /api/bills 연동
- Docker 포트/환경변수 정리 및 README 링크 업데이트

