# 🍽️ Restaurant Reservation Management System

A full-stack Restaurant Reservation Management System built with **React, Node.js, Express, and MongoDB**. The application enables customers to reserve tables online while providing administrators with complete control over reservations and restaurant table management.

This project was developed as part of a **Full-Stack Developer Assignment** and demonstrates backend API design, role-based authentication, reservation conflict handling, deployment, and frontend integration.

## Live Demo

- **Frontend:** https://table-reservation-sigma.vercel.app
- **Backend API:** https://table-reservation-backend-idg2.onrender.com
- **Swagger API Documentation:** https://table-reservation-backend-idg2.onrender.com/api-docs

## Tech Stack

**Frontend:** React, Vite, React Router, Axios, CSS

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT Authentication, bcryptjs, express-validator, Swagger

**Deployment:** Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)

## System Architecture

```
                React Frontend
                    (Vercel)
                        │
                        │ HTTPS
                        ▼
               Express REST API
                  (Render)
                        │
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
 JWT Authentication             Reservation Logic
         │                             │
         └──────────────┬──────────────┘
                        ▼
                 MongoDB Atlas
```

## Project Structure

```
Table-Reservation/
│
├── reservation-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── restaurant-reservation-backend/
    ├── server.js
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   ├── routes/
    │   ├── utils/
    │   └── seed/
    └── package.json
```

## Features

**Customer**
- Registration & login with JWT authentication
- Check table availability for a given date, time slot, and party size
- Automatic table assignment, or manual table selection
- Create, view, and cancel their own reservations

**Administrator**
- Secure admin login
- View all reservations, with filtering by date and status
- Update or cancel any reservation
- Create restaurant tables, update capacity, and deactivate tables

## Reservation Workflow

1. Customer logs in
2. Selects a reservation date, time slot, and number of guests
3. Checks table availability for that combination
4. Selects a table, or lets the system auto-assign one
5. Confirms the reservation

The backend validates table capacity, existing reservations, double-booking, and reservation status before the reservation is created — the workflow above is just the UI path to the same checks described below.

## Reservation & Availability Logic

The reservation system uses a two-level validation strategy.

**Application-level validation.** Before creating a reservation, the backend confirms the table exists, is active, has sufficient capacity for the party size, and has no existing confirmed reservation for that date and time slot. If no table is selected, the backend automatically assigns the smallest available table that satisfies the guest count.

**Database-level validation.** MongoDB enforces a partial unique index on `(table, date, timeSlot)`, scoped only to confirmed reservations. This is the final safety net: even if two requests pass the application-level check at nearly the same instant, the database itself rejects the second write, preventing race conditions and double bookings. Because the index only applies to confirmed reservations, cancelling a reservation immediately frees that table, date, and time slot for rebooking.

## Role-Based Access (Customer vs Admin)

Two roles exist: `customer` and `admin`.

Every reservation, table, and admin route requires a valid JWT — requests without one are rejected before reaching any business logic. Admin-only routes are grouped under their own route prefix and gated by a role check applied at the routing layer, not just inside individual controllers, so the admin surface is separated from customer-facing functionality by design rather than convention.

Customers can only view or cancel **their own** reservations — ownership is checked explicitly against the logged-in user's ID, independent of role. Administrators can view every reservation, filter by date or status, update or cancel any reservation, and manage the table inventory. The frontend mirrors this split with distinct, clearly-labelled views: a customer-facing booking screen, and a separate admin dashboard that's only reachable with an admin account.

## Database Models

**User** — name, email, password (hashed), role

**Table** — table number, capacity, active status

**Reservation** — user, table, reservation date, time slot, number of guests, reservation status

## REST API

**Authentication**

| Method | Endpoint |
|---|---|
| POST | /api/auth/register |
| POST | /api/auth/login |
| GET | /api/auth/me |

**Tables**

| Method | Endpoint |
|---|---|
| GET | /api/tables |
| POST | /api/tables |
| PUT | /api/tables/:id |
| DELETE | /api/tables/:id |

**Reservations**

| Method | Endpoint |
|---|---|
| GET | /api/reservations/availability |
| POST | /api/reservations |
| GET | /api/reservations/me |
| DELETE | /api/reservations/:id |

**Admin**

| Method | Endpoint |
|---|---|
| GET | /api/admin/reservations |
| GET | /api/admin/reservations/:id |
| PUT | /api/admin/reservations/:id |
| DELETE | /api/admin/reservations/:id |

Full interactive documentation is available via Swagger UI at `/api-docs` on the deployed backend (link above).

## Local Installation

Clone the repository:

```bash
git clone https://github.com/Nikhitha25135/Table-Reservation-.git
```

**Backend**

```bash
cd restaurant-reservation-backend
npm install
```

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
```

```bash
npm run seed
npm run dev
```

**Frontend**

```bash
cd reservation-frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

## Assumptions

- Single restaurant with a fixed number of tables and fixed seating capacities
- Reservations use predefined time slots rather than arbitrary start/end times
- Cancelled reservations immediately free their table for that date and slot
- Admin accounts are provisioned the same way as customer accounts, for ease of testing and grading

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization at the routing layer
- Environment variables for all secrets and connection strings
- Input validation and centralized error handling

## Known Limitations

- Fixed reservation slots rather than fully configurable time ranges
- No online payments
- No email or SMS notifications
- No refresh-token flow
- No pagination on list endpoints
- No automated test suite

## Future Improvements

- Online payments
- Email and SMS notifications
- Dynamic, configurable time slots with real interval-overlap checking
- Real-time availability updates
- Waitlist management
- Dashboard analytics
- Pagination and richer filtering on admin views
- CI/CD pipeline

