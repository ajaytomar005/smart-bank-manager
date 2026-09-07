# Smart Bank Manager

A full-stack digital banking platform serving two audiences from one codebase: **bank staff** (Manager, Loan Officer, Teller, Compliance Officer, Admin) running branch operations from a unified dashboard, and **customers** self-servicing their own accounts through a separate portal.

It replaces the "many disconnected legacy tools" problem described in the original spec ([`Smart_Bank_Manager_PID.md`](./Smart_Bank_Manager_PID.md)) with one system covering account/customer management, loans, transfers, fraud/compliance, staff administration, and reporting — plus features added during development beyond the original spec: fund transfers with IMPS/NEFT/RTGS/UPI simulation, an ATM finder, KYC document upload with a full teller/manager approval workflow, and customer self-registration.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder & File Structure](#folder--file-structure)
- [Core Features & Modules](#core-features--modules)
- [Data Model](#data-model)
- [API Surface](#api-surface)
- [Configuration & Environment](#configuration--environment)
- [Notable Dependencies & Why](#notable-dependencies--why)
- [How to Run It](#how-to-run-it)
- [Entry Points & Control Flow](#entry-points--control-flow)
- [Notable Patterns & Design Decisions](#notable-patterns--design-decisions)
- [Gaps, Risks & Fragile Areas](#gaps-risks--fragile-areas)

---

## Tech Stack

**Backend** — Spring Boot **4.1.1**, Java **21**, Maven. Spring Data JPA (Hibernate 7) on **PostgreSQL 16**, Flyway for migrations, Spring Security 7 (JWT via `jjwt` 0.13.0), Spring Data Redis (cache-aside for ATM search), springdoc-openapi 3.1.1 (Swagger UI), Apache POI 5.5.1 (Excel export), Lombok, Testcontainers + JUnit 5 + AssertJ + Mockito for tests.

**Frontend** — React **19.2**, Vite **8**, TypeScript **~6.0**, Tailwind CSS **4.3** (via `@tailwindcss/vite`), TanStack React Query 5, React Router 7, React Hook Form + Zod, Zustand (auth/theme state), Axios, Recharts, Leaflet + react-leaflet (ATM map).

**Infra** — PostgreSQL and Redis run locally via Homebrew in dev. No Docker, no message queue, no cloud services — kept out deliberately until an actual requirement needs them.

---

## Architecture

Two independent apps talking over REST:

```mermaid
flowchart LR
    subgraph Client["React SPA (Vite) :5173"]
        Staff["Staff shell\n/dashboard, /customers, /loans ..."]
        Portal["Customer portal\n/portal/*"]
    end

    subgraph API["Spring Boot API :8080/api"]
        Filter["JwtAuthenticationFilter\n+ SecurityConfig (RBAC)"]
        Ctrl["Controller"]
        Svc["Service"]
        Repo["Repository (Spring Data JPA)"]
        Filter --> Ctrl --> Svc --> Repo
    end

    DB[("PostgreSQL 16\nsystem of record")]
    Cache[("Redis\nATM nearby-search cache")]
    Disk[("Local disk\nKYC documents")]

    Client -- "HTTPS / JSON, Bearer JWT" --> Filter
    Repo --> DB
    Svc -. "cache-aside, 45s TTL" .-> Cache
    Svc -. "store/stream files" .-> Disk
```

Backend follows strict **package-by-feature**, not layer-by-layer at the top level: each domain (`account`, `loan`, `transfer`, `atm`, `onboarding`, etc.) is its own Java package containing its entity, repository, service, controller, and DTOs together. Within each package, the classic layering still holds: `Controller → Service → Repository`, with DTOs at the boundary — entities are never returned directly from controllers.

Two parallel auth flows share one JWT mechanism: staff (`Employee`) and customers (`Customer`) are different entities with different login endpoints (`/auth/login` vs `/auth/customer/login`), but both produce JWTs carrying a `principalType` claim (`STAFF`/`CUSTOMER`), which a single `JwtAuthenticationFilter` uses to load the right principal type. `SecurityConfig` then gates by URL: `/me/**` is customer-only, everything else requires a staff role — this is the actual authorization boundary, enforced before any controller code runs.

The frontend mirrors this split: `Layout` / `CustomerLayout` are two shells sharing one base `Layout` component (nav items differ), routed under `/` (staff) vs `/portal/*` (customer), each behind a `ProtectedRoute` with an `audience` prop.

---

## Folder & File Structure

```
Smart bank manager/
├── Smart_Bank_Manager_PID.md       # Original spec — source of truth for scope decisions
├── backend/
│   ├── pom.xml                     # All backend deps
│   └── src/main/java/com/smartbank/manager/
│       ├── SmartBankManagerApplication.java   # @SpringBootApplication entry point
│       ├── account/          # Account entity, CRUD, freeze/unfreeze
│       ├── atm/               # ATM finder: entity, Haversine geo search, Redis cache, scheduled offline-sweep
│       ├── audit/              # Immutable audit log (dual actor: staff or customer)
│       ├── auth/                # Login/refresh/register DTOs + services, both principal types
│       ├── common/               # ApiError, exceptions, GlobalExceptionHandler, PageResponse
│       ├── config/                 # SchedulingConfig (@EnableScheduling)
│       ├── customer/                # Customer entity, KYC status, staff CRUD
│       ├── dashboard/                 # KPI summary endpoint
│       ├── dispute/                    # Customer-raised, staff-resolved disputes
│       ├── employee/                     # Staff entity + admin-managed CRUD
│       ├── fraud/                         # Fraud alerts + resolution workflow
│       ├── loan/                           # Loan, EMI, Approval entities; amortization calculator
│       ├── onboarding/                       # Account-opening request/review/approve + KYC doc upload
│       ├── portal/                            # Customer-facing controllers (My*Controller pattern)
│       ├── report/                             # Excel export via Apache POI
│       ├── role/                                # Role entity (5 fixed roles) + lookup endpoint
│       ├── security/                             # JWT service/filter, dual UserDetailsService, RBAC entry points
│       ├── transaction/                           # Deposit/withdrawal/transfer ledger rows
│       └── transfer/                               # FundTransfer + Beneficiary (IMPS/NEFT/RTGS/UPI simulation)
│   └── src/main/resources/
│       ├── application.properties     # All config, env-var-overridable
│       └── db/migration/               # V1–V9 Flyway scripts (schema + seed data, in order)
└── frontend/
    ├── src/
    │   ├── App.tsx              # All routes defined here
    │   ├── main.tsx               # React root, QueryClientProvider, BrowserRouter
    │   ├── components/              # Layout, CustomerLayout, Logo, ProtectedRoute, AtmMap
    │   ├── pages/                     # Staff pages (flat) + pages/portal/ (customer pages)
    │   ├── api/                        # One file per domain, React Query hooks wrapping Axios
    │   ├── types/                       # TS interfaces mirroring backend DTOs, one file per domain
    │   └── lib/                          # authStore, themeStore, apiClient (axios + refresh interceptor), useGeolocation
    └── package.json
```

---

## Core Features & Modules

| Module | What it does | Backend package | Frontend pages |
|---|---|---|---|
| Auth (dual) | JWT login/refresh for staff and customers; customer self-registration | `auth`, `security` | `LoginPage`, `CustomerLoginPage`, `LandingPage` |
| Customers & Accounts | CRUD, KYC status, freeze/unfreeze | `customer`, `account` | `CustomersPage`, `AccountsPage`, `PortalAccountsPage` |
| Account Opening | Request → teller review → manager approval, with KYC document upload (local disk storage) | `onboarding` | `AccountRequestsPage` (staff), `PortalAccountRequestsPage` |
| Loans | Apply → officer/manager approval (amount-gated) → amortized EMI schedule | `loan` | `LoansPage`, `PortalLoansPage` |
| Transactions | Deposit/withdrawal with balance + frozen-account checks | `transaction` | `TransactionsPage` |
| Fund Transfers | Internal + simulated IMPS/NEFT (batched)/RTGS (min ₹2L)/UPI, beneficiary management with 30-min activation cooldown | `transfer` | `PortalTransferPage`, `PortalBeneficiariesPage` |
| Fraud & Disputes | Fraud alert raise/resolve, Fraud Freeze Button; customer disputes with staff resolution | `fraud`, `dispute` | `FraudAlertsPage`, `DisputesPage`, `PortalDisputesPage` |
| ATM Finder | Bounding-box + Haversine nearby search, live availability rule (heartbeat freshness, hours, cash status), Redis-cached, offline-sweep scheduled job | `atm` | `ATMsNearMePage` (Leaflet map) |
| Staff/HR | Admin creates employees, assigns roles, activates/deactivates | `employee`, `role` | `StaffPage` |
| Reports | Excel export (customers/accounts/loans/transactions) | `report` | `ReportsPage` |
| Audit Log | Every state-changing action logged, dual actor (staff or customer) | `audit` | `AuditLogPage` |
| Dashboard | Live KPI counts | `dashboard` | `DashboardPage`, `PortalOverviewPage` |

---

## Data Model

```mermaid
erDiagram
    ROLE ||--o{ EMPLOYEE : assigned_to
    CUSTOMER ||--o{ ACCOUNT : owns
    CUSTOMER ||--o{ LOAN : applies_for
    CUSTOMER ||--o{ BENEFICIARY : manages
    CUSTOMER ||--o{ DISPUTE : raises
    CUSTOMER ||--o{ ACCOUNT_OPENING_REQUEST : submits
    ACCOUNT ||--o{ TRANSACTION : has
    LOAN ||--o{ EMI : generates
    LOAN ||--o{ APPROVAL : requires
    EMPLOYEE ||--o{ APPROVAL : makes
    ACCOUNT ||--o{ FRAUD_ALERT : triggers
    ACCOUNT_OPENING_REQUEST ||--o{ KYC_DOCUMENT : has
    ACCOUNT_OPENING_REQUEST }o--|| ACCOUNT : creates_on_approval
    FUND_TRANSFER }o--|| ACCOUNT : source
    FUND_TRANSFER }o--o| ACCOUNT : destination
    FUND_TRANSFER }o--o| BENEFICIARY : to
    EMPLOYEE ||--o{ AUDIT_LOG : records
    CUSTOMER ||--o{ AUDIT_LOG : records
```

Key relationships and notes (see `V1`–`V9` migrations for exact DDL):

- `Role` 1—* `Employee` (5 fixed roles: MANAGER, LOAN_OFFICER, TELLER, COMPLIANCE_OFFICER, ADMIN)
- `FundTransfer` references source/destination `Account` + optional `Beneficiary`; each transfer produces **two linked `Transaction` rows** (DEBIT/CREDIT, sharing a `transferId`)
- `AccountOpeningRequest` 1—* `KycDocument`; on manager approval, creates an `Account`
- `AuditLog` has **nullable** `employee_id` **and** `customer_id`, with a DB check constraint enforcing exactly one is set (dual-actor design)
- `Atm` has a `Set<AtmServiceType>` via `@ElementCollection` (separate `atm_services` join table)

---

## API Surface

Base path: `/api`. Full interactive contract at `/api/swagger-ui.html` (ATM endpoints are OpenAPI-annotated; the rest follow consistent REST conventions but aren't formally documented).

Representative routes:

```
POST   /auth/login                          Staff login
POST   /auth/customer/login                  Customer login
POST   /auth/customer/register               Customer self-registration (auto-login)
POST   /auth/refresh | /auth/customer/refresh

GET/POST /customers                          Staff: list/create customers
PATCH  /customers/{id}/kyc-status

GET/POST /accounts                           Staff: list/open accounts
PATCH  /accounts/{id}/freeze | /unfreeze     Manager-only

GET/POST /loans                              Apply / list
POST   /loans/{id}/approve                   Amount-gated (officer vs manager)
GET    /loans/{id}/emis

GET/POST /me/accounts, /me/loans, /me/transfers,
         /me/beneficiaries, /me/disputes,
         /me/account-requests                Customer-scoped mirrors, ownership-checked,
                                              404 (not 403) on IDOR attempts

GET    /atms/nearby | /atms/nearby/count      Haversine search, Redis-cached
PATCH  /atms/{id}/status
POST   /atms/{id}/heartbeat

PATCH  /account-requests/{id}/teller-review
PATCH  /account-requests/{id}/manager-approve
GET    /account-requests/{id}/documents/{id}/file   Streamed file download

GET    /reports/export?type=                  Excel export
GET    /audit-logs
GET    /dashboard/summary
```

All `/me/**` endpoints require `ROLE_CUSTOMER`; everything else requires a staff role; specific mutations are further gated by `@PreAuthorize` (e.g., account freeze is Manager-only).

---

## Configuration & Environment

Everything lives in `backend/src/main/resources/application.properties`, all overridable via env vars with dev-safe defaults:

| Variable | Default | Purpose |
|---|---|---|
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | `smart_bank_manager` / `smart_bank_app` / `smart_bank_dev_pw` | Postgres (host is currently hardcoded to `localhost:5432`) |
| `JWT_SECRET` | dev placeholder | JWT signing key — **override for anything beyond local dev** |
| `JWT_ACCESS_EXPIRATION_MS` / `JWT_REFRESH_EXPIRATION_MS` | 900000 (15 min) / 604800000 (7 days) | Token lifetimes |
| `LOAN_MANAGER_APPROVAL_THRESHOLD` | 500000 | Amount above which only Manager can approve a loan |
| `REDIS_HOST` / `REDIS_PORT` | `localhost` / `6379` | ATM search cache |
| `KYC_STORAGE_DIR` | `./data/kyc-documents` | Local disk storage root for uploaded documents |

No `.env` file exists — variables are exported manually or left at defaults. The frontend has no env config; it talks to `/api` via Vite's dev proxy (`vite.config.ts`) to `localhost:8080`.

---

## Notable Dependencies & Why

- **jjwt** — hand-rolled JWT issuing/parsing (no OAuth2 server, since this is a single first-party client, not a multi-tenant auth provider)
- **Redis** — used only for ATM nearby-search caching (cache-aside, 45s TTL); nothing else touches it
- **Apache POI** — Excel-only report export (PDF was deliberately skipped to avoid a second heavy dependency)
- **Testcontainers** — backs one integration test (`AtmNearbyIT`) that requires Docker; named `*IT` (not `*Test`) so plain `mvn test` skips it automatically in Docker-less environments
- **Leaflet / react-leaflet** — chosen over Google Maps to avoid an API key requirement (OpenStreetMap tiles)

---

## How to Run It

```bash
# Prereqs (macOS, Homebrew)
brew install postgresql@16 redis
brew services start postgresql@16 redis

# create the app database + role once:
psql -U "$(whoami)" -d postgres -c "CREATE DATABASE smart_bank_manager;"
psql -U "$(whoami)" -d postgres -c "CREATE ROLE smart_bank_app WITH LOGIN PASSWORD 'smart_bank_dev_pw';"
psql -U "$(whoami)" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE smart_bank_manager TO smart_bank_app;"

# Backend
cd backend
./mvnw spring-boot:run          # Flyway migrates automatically; boots on :8080

# Frontend (separate terminal)
cd frontend
npm install
npm run dev                      # :5173, proxies /api to :8080

# Tests
cd backend && ./mvnw test         # unit tests only; the Testcontainers IT needs Docker and is skipped otherwise
cd frontend && npx tsc -b && npm run build
```

Seeded logins (password `Password123!` for all):

| Role | Email |
|---|---|
| Manager | `manager@smartbank.test` |
| Loan Officer | `loanofficer@smartbank.test` |
| Teller | `teller@smartbank.test` |
| Compliance Officer | `compliance@smartbank.test` |
| Admin | `admin@smartbank.test` |
| Customer | `customer@smartbank.test` |

Customer self-registration is also open from the customer login page.

---

## Deployment

Recommended free-tier stack: **Render** (backend web service + managed Postgres) + **Vercel** (frontend static build). Redis is optional — it's only used for ATM live-availability caching (`AtmService`) and is connected to lazily, so the app boots and runs fine without it.

### 1. Create the database

- Render dashboard → New → PostgreSQL (free plan). Copy the **Internal Database URL** it gives you (format `postgres://user:pass@host:5432/dbname`).
- No manual schema step needed — Flyway (`backend/src/main/resources/db/migration`) runs all 9 migrations automatically on backend boot.

### 2. Deploy the backend

- Render dashboard → New → Blueprint → point at this repo's `render.yaml` (or New → Web Service → Docker → `backend/Dockerfile` manually if not using Blueprints).
- `render.yaml` wires `DATABASE_URL` from the database automatically and generates `JWT_SECRET`. Set the remaining vars listed below in the Render dashboard.
- Once deployed, note the backend's public URL, e.g. `https://smart-bank-manager-api.onrender.com`.

### 3. Deploy the frontend

- Vercel dashboard → New Project → import this repo → set **Root Directory** to `frontend`.
- Vercel auto-detects the Vite build (`vercel.json` also pins `npm run build` / `dist`).
- Set the env var `VITE_API_URL=https://smart-bank-manager-api.onrender.com/api` (include the `/api` context path) in Vercel's project settings, then redeploy.

### 4. Close the loop on CORS

- Once you have the Vercel URL (e.g. `https://smart-bank-manager.vercel.app`), go back to the Render backend's env vars and set `CORS_ALLOWED_ORIGINS=https://smart-bank-manager.vercel.app` (comma-separate if you keep `http://localhost:5173` too), then redeploy the backend.

### Environment variables

**Backend** (`backend/.env.example`):

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes (prod) | Cloud Postgres connection string; parsed into JDBC url/user/password by `DatabaseUrlEnvironmentPostProcessor` at boot. Falls back to `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD` (localhost defaults) if unset. |
| `JWT_SECRET` | Yes (prod) | Signing key for access/refresh tokens. Must be changed from the dev default in production. |
| `JWT_ACCESS_EXPIRATION_MS` | No | Access token lifetime, default 15 min. |
| `JWT_REFRESH_EXPIRATION_MS` | No | Refresh token lifetime, default 7 days. |
| `LOAN_MANAGER_APPROVAL_THRESHOLD` | No | Business rule cutoff for loan manager approval routing. |
| `REDIS_HOST` / `REDIS_PORT` | No | Only needed if you want ATM live-availability caching; app runs fine without them. |
| `KYC_STORAGE_DIR` | No | Where uploaded KYC documents land. **Render's disk is ephemeral** — see Risks below. |
| `CORS_ALLOWED_ORIGINS` | Yes (prod) | Comma-separated list of frontend origins allowed to call the API. Must include your Vercel URL. |
| `PORT` | Auto-set by Render | Server listen port; don't set manually. |

**Frontend** (`frontend/.env.example`):

| Variable | Required | Purpose |
|---|---|---|
| `VITE_API_URL` | Yes (prod) | Full backend API base URL including `/api`, e.g. `https://smart-bank-manager-api.onrender.com/api`. Not needed locally — Vite proxies `/api` to `localhost:8080` in dev. |

### What will break in production if skipped

- **CORS** — without `CORS_ALLOWED_ORIGINS` set to the real Vercel origin, the browser will block every API call from the deployed frontend (fixed in code, but still needs the env var set per-deploy).
- **Hardcoded API URL** — the frontend previously assumed same-origin `/api`; on Render+Vercel the two apps have different origins, so `VITE_API_URL` must be set or every request 404s (fixed in `frontend/src/lib/apiClient.ts`, but only takes effect if the env var is actually set at build time).
- **Hardcoded DB host** — previously assumed `localhost:5432`; now reads `DATABASE_URL` (or `DB_HOST`/etc.) via `DatabaseUrlEnvironmentPostProcessor` (fixed).
- **JWT secret** — don't deploy with the dev default; `render.yaml` auto-generates one, but double-check it's actually set if you deploy manually.
- **Ephemeral KYC file storage** — Render's filesystem is wiped on every redeploy/restart. Fine for a demo, but any uploaded KYC documents will be lost. For real use, swap `AccountOpeningDocumentStorage`-style local disk writes for S3/Cloudinary.
- **No secrets in git** — `.env` is now gitignored in both `backend/` and `frontend/`; only commit `.env.example` files with placeholder values.
- **Migrations** — Flyway runs automatically on boot against whatever `DATABASE_URL` points at, so there's no separate manual migration step — just make sure `DATABASE_URL` is correct before the first deploy.

---

## Entry Points & Control Flow

**Backend**: `SmartBankManagerApplication.main()` → Spring Boot autoconfigures → Flyway runs pending migrations on startup → `SecurityFilterChain` (in `SecurityConfig`) intercepts every request → `JwtAuthenticationFilter` populates `SecurityContext` if a valid bearer token is present → `AuthorizationFilter` checks URL-pattern + `@PreAuthorize` rules → `DispatcherServlet` routes to the matching `@RestController` method → controller delegates to a `@Service` → repository → Postgres. Two `@Scheduled` jobs run independently of any request: `AtmOfflineSweepJob` (every 60s) and `NeftSettlementJob` (every 30s).

**Frontend**: `main.tsx` mounts `<App>` inside `QueryClientProvider` + `BrowserRouter` → `App.tsx`'s route table decides staff vs customer shell based on `useAuthStore` (Zustand, persisted to `localStorage`) → each page component calls a React Query hook from `api/*.ts` → `apiClient` (Axios instance) attaches the bearer token and transparently retries once on 401 via the refresh-token flow.

---

## Notable Patterns & Design Decisions

- **Package-by-feature** throughout the backend — no top-level `controllers/` / `services/` / `repositories/` split.
- **Dual-actor audit/security model** — every place that needs "who did this" (audit log, current-user lookups) has parallel staff/customer code paths rather than a unified polymorphic principal, trading abstraction for explicitness.
- **IDOR defense via 404, not 403** — customer-scoped endpoints return "not found" rather than "forbidden" when a customer requests another customer's resource, to avoid confirming existence.
- **`JOIN FETCH` over widened transactions** — `LazyInitializationException`s are consistently fixed with explicit fetch-join queries rather than broadening `@Transactional` scope.
- **RFC 7807 `ProblemDetail`** is enabled globally for framework-level validation errors (e.g., malformed ATM query params) but coexists with a separate custom `ApiError` format used elsewhere by `GlobalExceptionHandler` — two error shapes exist in the same API, scoped to where each was introduced.
- **`*IT` vs `*Test` naming** is a deliberate Maven convention to keep Docker-dependent tests out of the default `mvn test` run.

---

## Gaps, Risks & Fragile Areas

- **DB host/port not parameterized** — `application.properties` hardcodes `localhost:5432`; only name/user/password are env-driven. Needs a small fix before pointing at a remote Postgres.
- **No `.env` file or secrets management** — the JWT secret has a checked-in dev fallback; fine for local dev, must be overridden for any real deployment.
- **KYC documents stored on local disk**, not S3 — acceptable for dev, won't survive a redeploy or scale past one instance.
- **Fund transfers to `EXTERNAL_BANK` / `UPI` beneficiaries don't credit anywhere** — by design (money leaving the simulated bank), but there's no corresponding external ledger or webhook, so such a transfer just debits the source with no verifiable counterpart.
- **No automated test coverage for the transfer, onboarding, or fraud modules** — only the ATM module has unit + integration tests; everything else was verified manually (curl/Playwright) during development but has no regression safety net.
- **Bundle size warning on frontend build** (~700KB main JS chunk) — no code-splitting yet; fine for a demo, would need `React.lazy` route splitting for production.
- **AI Assistant / Default Predictor / Spending Insights / Chatbot** — named in the original spec or requested later but never built (deferred pending an LLM API key).
- **Two error response shapes** (`ApiError` vs `ProblemDetail`) — a real inconsistency a frontend consumer has to handle differently depending on which endpoint failed.
- **No CI/CD, no Docker, no automated deploy path** — everything is run manually via `mvnw` / `npm run dev`; fine for local development, a gap for repeatable deployments.
