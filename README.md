# ReserveX — CSCI4370 Final Project

A restaurant reservation system for Athens, GA restaurants — browse, search,
and book a table, with a staff side for managing a restaurant's bookings and
availability. Built for CSCI 4370 (Database Systems).

## Stack

- **Backend:** Spring Boot 4, Java 21, PostgreSQL, Flyway (schema + seed data
  are both migrations — see `backend/src/main/resources/db/migration/`)
- **Frontend:** React 19, TypeScript, Vite

How to run it locally

1. Start Postgres. Either via Docker (from the repo root, with Docker
Desktop running):
docker-compose up -d

or point the backend at a Postgres instance you already have — see
`backend/src/main/resources/application-local.yml.example`.

2. Start the backend (from `backend/`):

./mvnw spring-boot:run

First run applies the Flyway migrations: the schema, then seed data (16 real
Athens restaurants, their hours, ~60 days of bookable reservation slots, and
two demo accounts). Runs on `http://localhost:8080`, API under `/api`.

3. Start the frontend** (from `frontend/`, in a separate terminal):

npm install
npm run dev

Open the printed URL (normally `http://localhost:5173`). The Vite dev server
proxies `/api` to the backend, so no extra config is needed.

Demo accounts

Both use password `demo1234`:

- **Diner** — `diner@example.com`
- **Staff** (The National) — `staff@thenational.com`

Signing up fresh through the UI works too.

 What's implemented

- Search and browse restaurants; view details, hours, and ratings
- Book a table — party size and slot capacity are checked server-side, not
  just in the UI
- View, edit, and cancel your own reservations
- Staff: a day view of a restaurant's bookings with status transitions
  (pending → confirmed → seated → completed, or cancelled/no-show) and an
  audit trail of every status change
- Session-based authentication with real authorization — a diner can only
  act on their own reservations, staff only at the restaurant they work for

Database design

The `docs/` folder has the schema design work behind this project:
functional dependencies, the 3NF/BCNF decomposition, and the UML diagram the
schema was derived from.


