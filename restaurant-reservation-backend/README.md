# Restaurant Reservation Management System — Backend

A RESTful backend for a single-restaurant table reservation system, built with
Node.js, Express, and MongoDB (Mongoose). This package is **backend only**
(no frontend, no deployment) — wire it up to any client or test it directly
with curl/Postman.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation

## Project Structure

```
restaurant-reservation-backend/
├── server.js                  # entry point
├── src/
│   ├── app.js                 # express app, middleware, route mounting
│   ├── config/
│   │   ├── db.js              # mongoose connection
│   │   └── constants.js       # roles, time slots, reservation statuses
│   ├── models/
│   │   ├── User.js
│   │   ├── Table.js
│   │   └── Reservation.js
│   ├── middleware/
│   │   ├── authMiddleware.js  # protect (JWT) + authorize (role check)
│   │   ├── validate.js        # express-validator error collector
│   │   └── errorMiddleware.js # 404 + central error handler
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── tableController.js
│   │   ├── reservationController.js  # customer-facing logic
│   │   └── adminController.js        # admin-facing logic
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── tableRoutes.js
│   │   ├── reservationRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── ApiError.js
│   │   └── generateToken.js
│   └── seed/
│       └── seedTables.js      # seeds tables + a default admin user
├── .env.example
└── package.json
```

## Setup Instructions

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
   - `MONGO_URI` — connection string for a local or hosted MongoDB instance
     (e.g. MongoDB Atlas)
   - `JWT_SECRET` — any long random string
   - `PORT` — defaults to 5000

3. **Seed the database** (creates 6 sample tables and a default admin account)
   ```bash
   npm run seed
   ```
   Default admin credentials: `admin@restaurant.com` / `Admin@123`
   (change the password after first login, or edit `src/seed/seedTables.js`
   before seeding).

4. **Run the server**
   ```bash
   npm run dev     # with nodemon, auto-restarts on changes
   # or
   npm start
   ```
   The API will be available at `http://localhost:5000/api`.
   Health check: `GET /api/health`.

## API Documentation (Swagger)

Interactive API docs are available once the server is running:

- **Swagger UI:** `http://localhost:5000/api-docs`
- **Raw OpenAPI 3.0 spec (JSON):** `http://localhost:5000/api-docs.json`

To try protected routes from the UI: call `POST /auth/login`, copy the
`token` from the response, click the **Authorize** button at the top of
the Swagger UI page, and paste it in as `Bearer <token>`.

The spec lives at `src/docs/openapi.json` — edit it directly if you add or
change routes.

## Assumptions Made

- A **single restaurant** with a **fixed set of tables**, each with a fixed
  seating capacity (seeded via `npm run seed`, or managed by an admin
  through the table endpoints).
- Reservations are booked against a **fixed list of time slots per day**
  (see `src/config/constants.js`) rather than arbitrary start/end times.
  This keeps overlap detection simple and unambiguous, and matches how most
  small restaurants actually operate (seating windows, not continuous
  scheduling). It also avoids timezone/duration edge cases that were out of
  scope for this assignment.
- `date` is stored as a plain `YYYY-MM-DD` string rather than a `Date`
  object, since reservations are day-based, not timestamp-based. This
  avoids timezone-conversion bugs entirely.
- Any authenticated user can register as `customer`; the `role` field can
  optionally be set to `admin` at registration for ease of testing/grading.
  In a production system, admin accounts would be provisioned separately
  (e.g. invite-only or created directly in the database).
- Tables are **soft-deleted** (`isActive: false`) rather than hard-deleted,
  so historical reservations always resolve to a valid table record.
- Cancelled reservations free up their table/date/slot combination for
  rebooking (the uniqueness constraint only applies to `confirmed`
  reservations).

## Reservation & Availability Logic

This is the core evaluation area, so it's enforced at **two layers**:

1. **Application-level checks** (`reservationController.js`,
   `adminController.js`):
   - On creation, if a `tableId` is provided, the system checks that the
     table is active, has sufficient capacity for the party size, and has
     no existing `confirmed` reservation for that `date` + `timeSlot`.
   - If no `tableId` is provided, the system **auto-assigns** the
     smallest available table that can seat the party (`findAvailableTables`
     in `reservationController.js`), so small parties don't block large
     tables unnecessarily.
   - Admin updates re-run the same conflict check when the date, time slot,
     or table of a reservation changes.

2. **Database-level constraint** (`Reservation.js`):
   - A **partial unique index** on `(table, date, timeSlot)`, scoped to
     `status: 'confirmed'`, is the final safety net. Even if two requests
     race past the application-level check simultaneously, MongoDB will
     reject the second insert with a duplicate-key error, which the
     central error handler converts into a clean `409 Conflict` response.
   - This index also means cancelled reservations don't block a slot from
     being rebooked, since the partial filter only counts `confirmed`
     documents.

Capacity is validated by comparing `guests` against the assigned table's
`capacity` — a party of 5 can't be seated at a 4-top even if that table is
otherwise free.

`GET /api/reservations/availability?date=&timeSlot=&guests=` lets a client
check open tables before committing to a booking.

## Role-Based Access Control

Two roles: `customer` and `admin` (see `src/config/constants.js`).

- **`protect` middleware** (`authMiddleware.js`) verifies the JWT from the
  `Authorization: Bearer <token>` header and attaches the corresponding
  user to `req.user`. All reservation/table/admin routes require this.
- **`authorize(...roles)` middleware** restricts a route to specific
  roles. Admin-only routes are mounted under `/api/admin/*` and every route
  in `adminRoutes.js` runs `authorize('admin')`, keeping the admin surface
  clearly separated from customer-facing routes at the routing level (not
  just in controller logic).
- Customers can only view/cancel **their own** reservations — ownership is
  checked explicitly in `cancelMyReservation` by comparing
  `reservation.user` to `req.user._id`, independent of the role check.
- Admins can view, update, or cancel **any** reservation and manage the
  table inventory.

## API Overview

| Method | Route                          | Access        | Description                          |
|--------|--------------------------------|---------------|---------------------------------------|
| POST   | /api/auth/register             | Public        | Register (customer or admin)          |
| POST   | /api/auth/login                | Public        | Login, receive JWT                    |
| GET    | /api/auth/me                   | Private       | Current user profile                  |
| GET    | /api/tables                    | Private       | List active tables                    |
| POST   | /api/tables                    | Admin         | Create a table                        |
| PUT    | /api/tables/:id                | Admin         | Update a table                        |
| DELETE | /api/tables/:id                | Admin         | Deactivate a table                    |
| GET    | /api/reservations/availability | Private       | Check open tables for date/slot       |
| POST   | /api/reservations              | Private       | Create a reservation                  |
| GET    | /api/reservations/me            | Private       | List my reservations                  |
| DELETE | /api/reservations/:id          | Private       | Cancel my reservation                 |
| GET    | /api/admin/reservations        | Admin         | List all reservations (filter by ?date=, ?status=) |
| GET    | /api/admin/reservations/:id    | Admin         | Get one reservation                   |
| PUT    | /api/admin/reservations/:id    | Admin         | Update any reservation                |
| DELETE | /api/admin/reservations/:id    | Admin         | Cancel any reservation                |

## Known Limitations

- Time slots are a fixed enum rather than fully configurable/arbitrary
  start-end times; a restaurant with variable seating durations would need
  a more general interval-overlap model.
- No pagination on list endpoints (`GET /api/admin/reservations`,
  `GET /api/tables`) — fine for a single restaurant's data volume, but
  would need it at scale.
- No email/SMS confirmation or reminders (explicitly out of scope).
- No refresh-token flow; JWTs simply expire after `JWT_EXPIRES_IN` and the
  user must log in again.
- No automated test suite included given the 48-hour scope.

## Areas for Improvement (With More Time)

- Add integration tests (e.g. Jest + Supertest) covering the availability
  and conflict-handling logic specifically, since that's the highest-risk
  area.
- Support configurable, arbitrary time ranges instead of fixed slots, with
  proper interval-overlap queries.
- Add pagination/sorting/filtering to list endpoints.
- Add a refresh-token flow and password-reset support.
- Add rate limiting on auth endpoints.
- Add an audit log for admin actions (who cancelled/updated what, when).
