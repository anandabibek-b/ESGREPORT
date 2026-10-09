# ESG BRSR Platform API Specification

All endpoints are hosted at `/api` and require a valid Bearer JWT token in the `Authorization` header, except `/api/auth/login`.

---

## 1. Authentication & Tenant Routing
- `POST /api/auth/login`: Authenticate with email & password. Returns JWT accessToken, refreshToken, user profile, and tenant context.
- `GET /api/auth/me`: Retrieve currently authenticated user context, assigned roles, and tenant ID.

---

## 2. Organization Units & Company Profile
- `GET /api/company`: Retrieve MEIL corporate legal information (CIN, sector, listed status, headquarters).
- `GET /api/organizations`: Fetch complete multi-level tree of organization entities (Corporate HQ, Subsidiaries, Business Units, Project Sites).
- `POST /api/organizations`: Create new organization unit in tenant hierarchy.

---

## 3. Reporting Periods & Framework
- `GET /api/reporting-periods`: List all configured reporting periods (e.g. FY 2024-25, FY 2023-24).
- `GET /api/frameworks`: List supported ESG frameworks (SEBI BRSR, GRI, etc.).
- `GET /api/frameworks/versions/:id`: Retrieve full question hierarchy (Sections, Principles P1-P9, Indicators, Questions, Metrics).
- `GET /api/frameworks/brsr-core`: Fetch the 9 mandatory SEBI BRSR Core indicators with assurance attributes.

---

## 4. Submissions & Disclosures
- `GET /api/submissions`: List submissions with filters (`reportingPeriodId`, `orgUnitId`, `category`, `status`).
- `GET /api/submissions/:id`: Retrieve single submission with questions, reported values, attached evidence, validation results, and reviews.
- `POST /api/submissions`: Create a new reporting submission.
- `PUT /api/submissions/:id/values`: Save or update an array of metric values with versioning history and change justifications.
- `POST /api/submissions/:id/submit`: Transition submission from `draft` to `submitted`.
- `POST /api/submissions/:id/review`: Record reviewer feedback (`approved` or `changes_requested`).
- `POST /api/submissions/:id/approve`: Executive approval (blocked if unresolved errors exist).

---

## 5. Automated Validation Engine
- `POST /api/validations/run/:submissionId`: Run all 11 validation checks on the target submission.
- `GET /api/validations`: Fetch validation results with summary counts (`pass`, `warning`, `error`, `hasBlockingErrors`).
- `POST /api/validations/resolve/:id`: Resolve a validation finding with audit explanation and justification notes.

---

## 6. Deterministic Calculation Engine
- `GET /api/calculations`: Retrieve all persisted calculation records and input factors.
- `POST /api/calculations/scope1`: Execute Scope 1 direct combustion formula with fuel volume and IPCC factors.
- `POST /api/calculations/scope2`: Execute Scope 2 grid electricity formula with MWh and CEA grid factor.
- `POST /api/calculations/renewable-share`: Calculate renewable clean energy share %.
- `POST /api/calculations/ltifr`: Calculate Lost Time Injury Frequency Rate per million person-hours.

---

## 7. Evidence & Lineage Management
- `GET /api/evidence`: Fetch all certified evidence files with uploader attribution and SHA-256 hashes.
- `POST /api/evidence/upload`: Multer upload endpoint computing SHA-256 checksum and creating versioned records.
- `GET /api/evidence/:id/download`: Securely download evidence file verifying tenant ownership.
- `GET /api/lineage`: List all traceable metric values.
- `GET /api/lineage/:metricValueId`: Retrieve full 5-stage transformation DAG (`evidence` -> `calculation` -> `metric` -> `submission` -> `report`).

---

## 8. Reports & Regulatory Exports
- `GET /api/reports`: List all generated export artifacts.
- `POST /api/reports/generate/pdf`: Generate SEBI BRSR Annual Report PDF with corporate declarations, GHG tables, and workforce statistics.
- `POST /api/reports/generate/excel`: Generate multi-sheet audit workbook (`Executive Summary`, `Environmental`, `Social`, `Governance`, `BRSR Core`).
- `GET /api/reports/generate/json`: Machine-readable JSON schema export for regulatory APIs.
- `GET /api/reports/:id/download`: Download physical report file from storage.

---

## 9. Period Comparison & Grounded AI Assistant
- `GET /api/comparisons`: YoY comparative analysis between FY 2024-25 and FY 2023-24 baseline with percentage delta and anomaly flags.
- `POST /api/ai/query`: Grounded AI query tool answering user questions using database records, formulas, and verifiable citations.
- `GET /api/search?q=...`: Global search across disclosures, metrics, evidence, and organization units.
- `GET /api/audit-logs`: Query immutable audit trail records with entity, action, and date filters.
