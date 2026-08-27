# Noru Hotel Employee Management System

A small, production-minded hotel staff system for the Noru technical challenge: employees, departments, roles, shifts, attendance, and useful reports.

The goal is a clean, working product — not a large HR suite.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Tailwind CSS, Redux Toolkit (slices + thunks), React Hook Form, Zod, Sonner |
| Backend | Node.js, Express, JavaScript, Zod |
| Database | PostgreSQL 16, Prisma |
| Tooling | Vite, Docker Compose |

## Folder structure

### Backend

```
backend/src
  db/            Prisma client and database error mapping
  model/         database queries for each table
  controller/    request handlers and business rules
  routes/        URL → controller mapping
  middleware/    validation, async wrapper, error handler
  utils/         dates, serializers, Zod schemas, AppError
  app.js
  server.js
```

Request flow:

`Route → validate middleware → Controller → Model → PostgreSQL`

### Frontend

```
frontend/src
  pages/         one screen per route
  component/     layout, forms, and reusable UI
  api/           Axios instance (base URL)
  services/      functions that call the API
  redux/
    store.js     combines all slices
    slices/      one slice per feature (thunks + state)
  validations/   Zod form schemas
  utils/         dates, toast helpers, error parsing
```

UI flow:

`Page → dispatch Redux thunk → service → Axios → API`

Forms are validated with Zod + React Hook Form. API failures show field errors when possible and a toast in every case.

## Database design

```
Department 1───* Employee *───1 Role
                     │
                     ├───* EmployeeShift *───1 Shift
                     └───* Attendance
```

Important constraints:

- An employee belongs to **one department** and **one role**.
- A department or role cannot be deleted while employees still use it.
- An employee can have **one shift assignment per date**.
- An employee can have **one attendance record per date**.
- Deleting an employee cascades to their shift assignments and attendance.
- Present / late records require a check-in; check-out must be after check-in (overnight shifts are supported).

## Non-trivial reports

These are PostgreSQL queries (not Prisma `findMany`):

1. **Attendance by department** — expected working days × active headcount, present/late/absent/leave mix, attendance rate, punctuality rate, average hours worked.
2. **Shift coverage** — for a given date, assigned staff vs active headcount per department × shift.
3. **Punctuality by employee** — scheduled days, recorded days, late/absent counts, average arrival time.

## How to run

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This starts Postgres 16 on **port 5433** (so it does not collide with a local Postgres install on 5432).

If you already have Postgres, create a database named `hotel_ems` and set `backend/.env` `DATABASE_URL`.

### 2. API

```bash
cd backend
copy .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

API: `http://localhost:4000`  
Health: `http://localhost:4000/health`

### 3. Web app

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

Seeded demo staff use `@noruhotel.com` emails. There is no login screen; this assessment focuses on domain modeling and CRUD.

## API overview

| Resource | Endpoints |
| --- | --- |
| Departments | `GET/POST /api/departments`, `GET/PUT/DELETE /api/departments/:id` |
| Roles | `GET/POST /api/roles`, `GET/PUT/DELETE /api/roles/:id` |
| Employees | `GET/POST /api/employees`, `GET/PUT/DELETE /api/employees/:id` |
| Shifts | `GET/POST /api/shifts`, `GET/PUT/DELETE /api/shifts/:id` |
| Assignments | `GET/POST /api/shifts/assignments`, `DELETE /api/shifts/assignments/:id` |
| Attendance | `GET/POST /api/attendance`, `GET/PUT/DELETE /api/attendance/:id` |
| Reports | `/api/reports/dashboard`, `/attendance-by-department`, `/shift-coverage`, `/punctuality` |

Errors return a consistent body:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Please correct the highlighted fields.",
    "details": [{ "field": "email", "message": "Enter a valid email address." }]
  }
}
```

## Decisions

- **Simple MVC-style backend** so the path from route → controller → model is easy to follow. Reports still use raw SQL.
- **Redux slices + thunks** so each feature has one slice, and pages use `dispatch` / `useSelector`.
- **Zod on both sides** so invalid payloads never reach the database, and the UI can show the same messages.
- **Toasts (Sonner)** for create/update/delete success and for every API failure.
- **No auth** — the brief did not ask for it, and a fake login would dilute the data model.
- **Dockerized Postgres** so the project is easy to run in one day.

## Product surface

- Dashboard with today’s staffing snapshot
- Employee CRUD with department and role assignment
- Department and role management
- Shift templates and per-day assignments
- Attendance recording (present, late, absent, leave)
- Reports with charts and tables
