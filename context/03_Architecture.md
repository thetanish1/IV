# 03 System Architecture & Feature-Based Organization

## Overview Architecture

```
                                  +-----------------------+
                                  |   Next.js 15 Client   |
                                  | (React 19 / Tailwind) |
                                  +-----------+-----------+
                                              |
                                      HTTP / REST API
                                              |
                                  +-----------v-----------+
                                  |    FastAPI Backend    |
                                  | (Feature-Based Slice) |
                                  +-----+-----+-------+---+
                                        |     |       |
                 +----------------------+     |       +---------------------+
                 |                            |                             |
        +--------v--------+          +--------v--------+           +--------v--------+
        |   PostgreSQL    |          | Razorpay Gateway|           | OpenPyXL Engine |
        |  (SQLAlchemy)   |          |   (Test Mode)   |           | (.xlsx Export)  |
        +-----------------+          +-----------------+           +-----------------+
```

## Feature-Based Organization

### Backend Structure (`backend/app/`)
- `auth/` - `router.py`, `models.py`, `schemas.py`
- `courses/` - `router.py`, `models.py`, `schemas.py`
- `internship/` - `router.py`, `models.py`, `schemas.py`
- `payments/` - `router.py`, `gateway.py`, `models.py`, `schemas.py`
- `dashboard/` - `router.py`, `schemas.py`
- `export/` - `router.py`, `excel.py`
- `shared/` - `database.py`, `security.py`, `exceptions.py`, `dependencies.py`

### Frontend Structure (`frontend/src/`)
- `app/` - Next.js App Router (`(public)/`, `admin/`)
- `components/` - Organized feature components (`cards/`, `forms/`, `tables/`, `layout/`)
- `lib/` - `api-client.ts`, `utils.ts`
- `types/` - `index.ts`
