# Architecture & Technical Design Specification

## 1. Multi-Tenant Architecture & Security Model

The MEIL ESG BRSR reporting platform is engineered around multi-tenant isolation. Every organization-owned entity possesses a strictly enforced `tenantId` foreign key and server-side authorization check.

```
Organization (MEIL Group)
  ├── Subsidiaries (MEIL Energy, MEIL Infra, Olectra Greentech EV)
  │     └── Business Units (Water & Irrigation, Transportation & Highways)
  │           └── Projects (Zojila Tunnel Site, Kaleshwaram Lift Irrigation)
  ├── Users & RBAC Roles (Admin, ESG Manager, Data Owner, Reviewer, Approver, Auditor)
  ├── Reporting Periods (FY 2024-25 Active, FY 2023-24 Baseline)
  └── Disclosures, Calculations, Evidence, Validations, and Generated Reports
```

### Tenant Isolation Enforcement
1. **Middleware Level (`tenantResolver`)**:
   - Extracts tenant identity from authenticated JWT token.
   - Enforces that no user can query or mutate records belonging to another tenant.
2. **Data Access Layer**:
   - All Prisma queries explicitly inject `{ where: { tenantId } }`.
   - Primary entity mutations verify parent ownership before executing upserts or deletes.
3. **IDOR Prevention**:
   - Path parameters (`/api/submissions/:id`, `/api/evidence/:id/download`) verify both `id` and `tenantId`, returning `404 Not Found` if a foreign tenant tries to probe resources.

---

## 2. Deterministic Calculation Engine

To prevent greenwashing and ensure strict audit reproducibility, all material greenhouse gas (GHG) and sustainability formulas are computed server-side in `calculationService.ts`:

### A. Scope 1 Direct Emissions (Stationary & Mobile Fuel Combustion)
- **Methodology**: IPCC 2006 Guidelines for National Greenhouse Gas Inventories.
- **Formula**:
  $$\text{Emissions } (\text{MT CO}_2\text{e}) = \text{Fuel Consumed (Litres)} \times \text{Emission Factor } (\text{kg CO}_2/\text{L}) \div 1000$$
- **Default Factors**:
  - High-Speed Diesel (HSD): $2.68 \text{ kg CO}_2\text{e/L}$
  - Motor Gasoline / Petrol: $2.31 \text{ kg CO}_2\text{e/L}$
  - Natural Gas: $1.98 \text{ kg CO}_2\text{e/m}^3$

### B. Scope 2 Indirect Emissions (Purchased Electricity)
- **Methodology**: Location-based method using Central Electricity Authority (CEA) Baseline Database.
- **Formula**:
  $$\text{Emissions } (\text{MT CO}_2\text{e}) = \text{Purchased Grid Electricity (MWh)} \times \text{CEA Grid Factor } (\text{MT CO}_2\text{e/MWh})$$
- **Default Baseline Factor**: $0.716 \text{ MT CO}_2\text{e/MWh}$ (CEA CO2 Database v20.0).

### C. Renewable Energy Consumption Ratio
- **Formula**:
  $$\text{Renewable Share } (\%) = \frac{\text{Renewable Electricity (MWh)}}{\text{Renewable MWh} + \text{Non-Renewable MWh}} \times 100$$

### D. Lost Time Injury Frequency Rate (LTIFR)
- **Methodology**: ISO 45001 / OHSAS standard rate per million person-hours worked.
- **Formula**:
  $$\text{LTIFR} = \frac{\text{Number of Lost Time Injuries (LTI)} \times 1,000,000}{\text{Total Person-Hours Worked}}$$

---

## 3. Server-Side Validation Engine

The validation engine executes 11 distinct rule types on submissions:
1. **Required Fields**: Mandatory SEBI indicators cannot be blank.
2. **Type Checking**: Strict numeric, boolean, date, and string type conformance.
3. **Range Validation**: Non-negative checks on physical quantities (energy, water, fuel).
4. **Percentage Bounds**: Ratio indicators must fall strictly within $[0, 100]\%$.
5. **Unit Integrity**: Reported units must match the framework dictionary (`MWh`, `Litres`, `KL`, `MT`).
6. **Cross-Field Math**: Total energy must equal sum of renewable and non-renewable energy.
7. **Cross-Disclosure Check**: Scope 1 fuel consumption must align with reported direct fleet activity.
8. **Evidence Sufficiency**: Material disclosures require attached, verified evidence documents.
9. **Internal Consistency**: Male + Female employees must equal total permanent workforce.
10. **Calculation Verification**: Reported emissions must match deterministic engine outputs within 1%.
11. **Period-over-Period Variance**: Shifts greater than 15% YoY generate an audit review warning.

---

## 4. End-to-End Workflow State Machine

Submissions follow a formal multi-stage state transition machine:

```
[DRAFT]
   │
   ▼  (Data Owner submits with remarks)
[SUBMITTED]
   │
   ▼  (Automated validation engine runs)
[UNDER_REVIEW]
   ├──► (Reviewer requests changes) ──► [CHANGES_REQUESTED] ──► [DRAFT]
   │
   ▼  (Reviewer approves)
[REVIEWED]
   │
   ▼  (Executive Approver checks blocking errors & signs off)
[APPROVED]
   │
   ▼  (Consolidated group filing)
[CONSOLIDATED / PUBLISHED]
```

---

## 5. Provenance & Cryptographic Lineage Graph

For every material indicator in the report, the platform constructs a 5-node directed acyclic graph (DAG):

1. **Source Document**: Primary PDF invoice or telemetry log, certified with SHA-256 hash.
2. **Deterministic Calculation**: Server-side mathematical formula and input factor record.
3. **Calibrated Metric**: Validated numeric value with timestamp and responsible data owner.
4. **Site Submission**: Project site submission with data quality score and category tags.
5. **SEBI BRSR Filing**: Consolidated group disclosure mapped to SEBI Core assurance format.
