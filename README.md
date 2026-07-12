Restaurant Reservation Management System
A full-stack system for managing table reservations at a single restaurant — customers can book, view, and cancel their own reservations; administrators have full visibility and control over every booking and the table inventory.
Built for the Vibe Coding Intern assignment.

GitHub repository:https://github.com/Nikhitha25135/Table-Reservation-.git
Live deployment: <add link here>
Default admin login (seeded): admin@restaurant.com / Admin@123

Tech Stack
LayerTechnologyFrontendReact 18 (Vite), React Router, AxiosBackendNode.js, ExpressDatabaseMongoDB (Mongoose)AuthenticationJWT (JSON Web Tokens)
Project Structure
restaurant-reservation-backend/   Express + MongoDB REST API
reservation-frontend/             React frontend (customer + admin views)
Each package has its own README.md with implementation-level detail. This document covers the system as a whole.
Setup Instructions
1. Backend
bashcd restaurant-reservation-backend
npm install
cp .env.example .env
Edit .env:
VariableDescriptionPORTDefaults to 5000MONGO_URIConnection string for a local or hosted MongoDB instance (e.g. Atlas)JWT_SECRETAny long, random stringJWT_EXPIRES_INToken lifetime, e.g. 7dCLIENT_ORIGINThe frontend's origin (comma-separated for multiple); leave blank to allow all origins in dev
bashnpm run seed   # creates 6 sample tables and a default admin account
npm run dev    # starts the API at http://localhost:5000/api
Health check: GET /api/health. Interactive API docs (Swagger UI): http://localhost:5000/api-docs.
2. Frontend
bashcd reservation-frontend
npm install
cp .env.example .env
Set VITE_API_URL in .env to the backend's API base URL (defaults to http://localhost:5000/api, which matches the backend's default port).
bashnpm run dev    # starts at http://localhost:5173
Open the app, register an account (as a Guest to book tables, or as an Administrator to manage them), or sign in with the seeded admin credentials above.
Production build
bashcd reservation-frontend
npm run build      # outputs static files to dist/
npm run preview    # serve the build locally to sanity-check it
Assumptions Made

Single restaurant, fixed tables. The system manages one restaurant with a fixed set of tables, each with a defined seating capacity. Tables are seeded on setup and can be added, resized, or deactivated by an admin afterward.
Fixed daily time slots, not arbitrary times. Reservations are booked against a fixed list of time slots (e.g. 18:00–19:30) rather than free-form start/end times. This keeps overlap detection unambiguous and matches how most small restaurants actually seat guests, while avoiding timezone and duration edge cases that were out of scope for this assignment.
Dates are date-only, not timestamps. A reservation's date is stored as a plain YYYY-MM-DD string rather than a full Date object, since bookings are day-based. This avoids timezone-conversion bugs entirely.
Open registration for both roles. Anyone can register as a customer, and the role field can optionally be set to admin at registration, purely to make the system easy to test and grade. In a production system, admin accounts would be provisioned separately (invite-only, or created directly by an existing admin).
Soft deletes for tables. Deactivating a table sets isActive: false rather than deleting the record outright, so historical reservations always resolve to a valid table.
Cancelling frees the slot. A cancelled reservation no longer counts toward that table's availability for that date and time slot — only confirmed reservations occupy a slot.

Reservation & Availability Logic
Correctness here was treated as the highest-priority part of the assignment, so it's enforced at two layers:
1. Application-level checks, run on every create/update:

If a specific table is requested, the system confirms the table is active, has enough capacity for the party size, and has no existing confirmed reservation for that date and time slot.
If no table is requested, the system auto-assigns the smallest available table that fits the party, so small bookings don't unnecessarily occupy large tables.
Editing a reservation (admin) re-runs the same conflict check whenever the date, time slot, or table changes.

2. A database-level constraint as the final safety net: a unique index on (table, date, timeSlot), scoped only to confirmed reservations. Even if two requests race past the application check at the same instant, the database itself rejects the second write, which the API turns into a clean 409 Conflict response. Because the index only applies to confirmed reservations, a cancelled booking immediately frees that table/date/slot for rebooking.
Guest count is validated against the assigned table's capacity independently of the conflict check — a party of 5 will never be seated at a 4-top, even if that table is otherwise free.
Before booking, the frontend calls the availability endpoint and shows the result as a small map of the room, so a guest can see at a glance which tables currently fit their party and time.
Role-Based Access (Customer vs Admin)
Two roles: customer and admin.

Every reservation, table, and admin route requires a valid JWT; requests without one are rejected before reaching any business logic.
Admin-only routes are grouped under their own route prefix and are gated by a role check applied at the routing layer, not just inside individual controllers, so the admin surface is clearly separated from customer-facing functionality by design, not by convention.
Customers can only view or cancel their own reservations — ownership is checked explicitly against the logged-in user's ID, independent of their role.
Administrators can view every reservation, filter by date or status, update or cancel any reservation, and manage the table inventory.
The frontend mirrors this split with distinct, clearly-labelled views: a guest-facing booking screen, and a visually separate admin dashboard that cannot be reached without an admin account.

Known Limitations

Time slots are a fixed list rather than fully configurable start/end times; a restaurant with variable seating durations would need a more general interval-overlap model.
No pagination on list endpoints — reasonable for a single restaurant's data volume, but would need it at scale.
No email/SMS confirmations, reminders, or payments (explicitly out of scope for this assignment).
No refresh-token flow; a JWT simply expires after its configured lifetime and the user logs in again.
No automated test suite, given the assignment's timeframe.

Areas for Improvement (With More Time)

Integration tests (e.g. Jest + Supertest) targeting the availability and conflict-handling logic specifically, since that's the highest-risk area of the system.
Configurable, arbitrary time ranges instead of fixed slots, backed by proper interval-overlap queries.
Pagination, sorting, and richer filtering on admin list views.
A refresh-token flow and password reset support.
Rate limiting on authentication endpoints.
An audit log of admin actions (who changed or cancelled what, and when).
A visual floor-plan editor for admins to arrange tables, rather than a flat list
