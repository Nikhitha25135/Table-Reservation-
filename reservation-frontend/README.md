# The Ledger — Reservation Frontend

A React (Vite) frontend for the Restaurant Reservation Management System, built to integrate
directly with the existing `restaurant-reservation-backend` Express/MongoDB API.

## Stack

- React 18 + Vite
- React Router v6 (routing + role-based route guards)
- Axios (API client with JWT interceptor)
- Plain CSS (no UI framework) — see "Design" below

## Setup

```bash
npm install
cp .env.example .env
# edit .env and point VITE_API_URL at your running backend, e.g.
# VITE_API_URL=http://localhost:5000/api
npm run dev
```

The app expects the backend from `restaurant-reservation-backend` to be running and reachable
at `VITE_API_URL`. Make sure the backend's `CLIENT_ORIGIN` env var includes this frontend's
origin (or is left blank to allow all origins in development) so CORS doesn't block requests.

Build for production:

```bash
npm run build
npm run preview   # serve the production build locally
```

Deploy the contents of `dist/` to any static host (Vercel, Netlify, Render static site, etc.),
and set `VITE_API_URL` in that platform's environment variables to the deployed backend's URL.

## How it meets the assignment requirements

- **Auth & roles** — `/register` lets a person sign up as a Guest or Administrator (the backend
  accepts an optional `role` on register); `/login` authenticates and stores the JWT. `AuthContext`
  re-validates the token against `GET /auth/me` on every load, so a stale or tampered local user
  object can never grant access to pages it shouldn't.
- **Customer functionality** (`/book`) — create a reservation (date, time slot, guests, optional
  specific table), view your own reservations, cancel them. The booking flow calls
  `GET /reservations/availability` first and renders the result as a literal small map of the
  room (`TableMap`), so a guest sees exactly which tables fit their party and are free before
  committing. Leaving the table unselected lets the backend auto-assign the smallest fitting table.
- **Admin functionality** (`/admin`, `/admin/tables`) — view all reservations, filter by date
  and/or status, edit any reservation in place (date, time, guests, table, status) or cancel it,
  and manage the table inventory (add tables, adjust capacity, deactivate/reactivate). The admin
  area uses a visually distinct dark "ledger" chrome so it's never confused with the guest view.
- **Availability & validation** — the frontend never invents its own conflict logic; it always
  defers to the backend's availability check and surfaces the backend's validation/conflict
  error messages (409s, 400s) directly in a banner, so the server remains the single source of
  truth for what's actually bookable.
- **Error handling** — a shared Axios instance normalizes error messages from the API's
  centralized error handler and express-validator responses into one readable string used by
  every form and list on the site.

## Design notes

The visual concept is "the maître d's reservation ledger": the guest side reads like warm paper
stock (reservation slips styled as perforated ticket stubs, with the assigned table shown as a
rotated stamp), and the admin side reads like the ledger's ruled, ink-dark register. Typography
pairs a serif display face (Fraunces) with Inter for body text and IBM Plex Mono for times, table
numbers and other data-like values. The one interactive signature element is the table map used
during booking — a literal small floor plan where each table's size roughly reflects its seating
capacity and colour reflects live availability.

## Known limitations

- Time slots are a fixed list mirrored from the backend's `TIME_SLOTS` constant
  (`src/utils/constants.js`), since the API doesn't currently expose them as a lookup endpoint.
  If the backend list changes, this file needs to be updated to match.
- Table management assumes a single restaurant with a flat list of tables (no floor/section
  grouping), matching the backend's `Table` model.
- No pagination on the admin reservations list — fine for a single small restaurant's scale, but
  would need it for high volume.
- No toast/notification system; success and error states are shown as inline banners.

## Areas for improvement with more time

- Optimistic UI updates for cancel/edit instead of a full reload after each mutation.
- Expose available time slots from the API instead of duplicating the list on the frontend.
- Add e2e tests (e.g. Playwright) covering the booking and admin-edit flows against a test backend.
- Table drag-to-arrange floor plan editor for admins instead of a flat list.
