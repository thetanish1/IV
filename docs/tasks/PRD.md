# Product Requirement Document (PRD): Codebase Optimization & Dead Code Removal (Ralph Loop)

## 1. Project Overview & Objective
- **Project**: InternVision Tech Platform (Full-Stack Next.js 15 & FastAPI)
- **Goal**: Systematically audit the codebase, eliminate all unused/dead code, obsolete artifacts from previous IAM refactors, normalize imports, resolve any orphaned components, and verify end-to-end build and test integrity via iterative Ralph loop steps.

---

## 2. Scope & Target Areas

### Area A: Frontend Redundancy & Dead Code Elimination
1. **Orphaned Duplicate Admin Components**:
   - Audit `frontend/src/components/admin/` vs `frontend/src/components/admin/tabs/` (e.g. ensure duplicate `BrandedMailerTab.tsx` or legacy components are consolidated).
2. **Unused Imports & Types**:
   - Audit all unused React / Lucide / Type imports across `frontend/src/`.
3. **Dead Endpoints / Obsolete Route Handlers**:
   - Verify all API calls across components use normalized `/api-client` methods and eliminate deprecated endpoints.
4. **Dead Styles & Unused CSS Utilities**:
   - Audit `globals.css` and Tailwind classes for orphaned selectors.

### Area B: Backend Codebase Optimization
1. **Unused Test Scripts & Scratch Artifacts**:
   - Audit root and backend directory for temporary SQLite database files (`test_app.db`, `test_payments.db`, `sql_app.db`) and ensure `.gitignore` properly excludes local binaries and SQLite databases.
2. **Dead IAM Handlers & Redundant Role Maps**:
   - Ensure all references to multi-role IAM sub-admin schemas are cleaned up and standard super admin paths are streamlined.
3. **Exception Handling & Model Sanitization**:
   - Ensure all models cleanly export attributes without circular dependencies.

### Area C: Build & Architecture Verification
1. **TypeScript Typecheck**:
   - `npm run build` must compile with 0 errors and 0 type warnings.
2. **Python Syntax & Startup Validation**:
   - All backend routers, database schemas, and dependencies must import cleanly.
3. **Responsive UI & Security Audit**:
   - Verify that all public and admin pages load with proper TLS / CORS headers.

---

## 3. Ralph Loop Task Breakdown

| Task ID | Phase | Description | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **TASK-001** | Audit | Scan for duplicate / orphaned files in `frontend/src/components/admin/` | Only canonical components remain in `frontend/src/components/admin/tabs/` |
| **TASK-002** | Cleanup | Remove unused root/backend database artifacts and enforce `.gitignore` | Local DB files (`*.db`, `*.sqlite`) ignored from version control |
| **TASK-003** | Frontend | Normalize all API client fetch calls and ensure numeric ID conversions | Zero `TypeError` or `e.id.slice` crashes across all admin tabs |
| **TASK-004** | Backend | Verify global exception handlers and FastAPI status code preservation | HTTPException status codes (`401`, `403`, `404`) preserved with CORS |
| **TASK-005** | Verification | Run full Next.js 15 production build and backend startup smoke test | `npm run build` exits 0; Python imports pass |

---

## 4. Verification & Validation Protocol

```bash
# 1. Frontend Build & TypeScript Typecheck
cd frontend && npm run build

# 2. Backend Startup & Router Import Check
cd backend && python -c "import app.main; print('Backend validation OK')"

# 3. Git Status Cleanliness
git status -s
```

---

## 5. Definition of Done (DoD)
- [x] Zero duplicate components in `frontend/src/components/admin/`.
- [x] All database IDs safely converted to strings before UI slicing/filtering.
- [x] Backend handles all HTTP error codes with CORS headers attached.
- [x] Full production build passes with 0 errors.
- [x] Clean Git working tree with all verified changes committed.
