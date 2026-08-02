# Hospital Management System (HMS) — MERN

A full-stack Hospital Management System built with MongoDB, Express, React, and Node.js.

> **Scope note:** This is a solid, working foundation covering authentication (patient/doctor signup with OTP email verification, JWT auth, role-based access), department & doctor search, and the full appointment lifecycle (book → approve/reject → complete/cancel/reschedule with double-booking prevention). It's built to be extended module by module — medical records, prescriptions, payments, notifications, and the full admin analytics dashboard are stubbed with clear "coming next" markers so you can keep building on a clean, working base rather than untested scaffolding.

## Tech Stack

**Frontend:** React 18, Vite, React Router, Tailwind CSS, Framer Motion, React Hook Form, Axios, React Toastify, React Icons, Chart.js

**Backend:** Node.js, Express, MongoDB + Mongoose, JWT, bcrypt, Nodemailer, Helmet, express-rate-limit, express-mongo-sanitize, xss-clean, express-validator

## Project Structure

hospital-management-system/
├── server/ # Express API
│ ├── config/ # MongoDB connection
│ ├── models/ # User (base) + Patient/Doctor discriminators, Department, Appointment
│ ├── controllers/ # Business logic
│ ├── routes/ # REST endpoints
│ ├── middleware/ # auth, error handling
│ ├── validators/ # express-validator rule sets
│ ├── utils/ # helpers (email, tokens, seed script, orphaned-appointment cleanup)
│ └── server.js # entry point
└── client/ # React app
└── src/
├── pages/ # Landing, auth flow, patient/doctor dashboards
├── components/ # layout + shared UI
├── context/ # AuthContext (session, auto-login)
├── services/ # axios API layer
└── routes/ # ProtectedRoute (role-based guarding)

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — any long random string
- `SMTP_EMAIL` / `SMTP_PASSWORD` — a Gmail address + [App Password](https://myaccount.google.com/apppasswords) (or any SMTP provider) so OTP emails send correctly
- `CLOUDINARY_*` — only needed once you wire up profile picture / document uploads

Seed baseline departments and a default admin account:

```bash
npm run seed
```

This prints an admin login (`admin@citycare.com` / `Admin@12345`) — **change that password immediately** in a real deployment; admin accounts are never created through public signup.

Run the API:

```bash
npm run dev     # nodemon, auto-restarts on changes
# or
npm start
```

The API runs on `http://localhost:5000` by default.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` calls to the backend automatically (see `vite.config.js`).

### 3. Try it out

1. Open `http://localhost:5173`
2. Click **Get Started** → **Sign Up** → **Patient** (or **Doctor**)
3. Fill out the form — you'll get an OTP emailed via your configured SMTP account
4. Verify the OTP, then log in
5. Doctors additionally need `isApprovedByAdmin` set to `true` before they can log in — either flip it manually in MongoDB Atlas for now, or call `PATCH /api/doctors/:id/approve` as the seeded admin (via Postman, since there's no admin UI for this yet)
6. Admin logs in separately, at `http://localhost:5173/admin/login`, using the seeded credentials above (not the regular patient/doctor login page)

### 4. Troubleshooting: "500 error" / "Something went wrong" on every page

If login, search, or dashboards suddenly all start failing at once, it's almost always MongoDB Atlas losing connection, not an application bug — check your server terminal for the real error. Common causes:
- Your current IP isn't whitelisted under Atlas → **Network Access** (this changes often on wifi/mobile networks)
- Your Atlas cluster auto-paused from inactivity (free tier) — resume it under **Database**
- A firewall/VPN/antivirus blocking outbound port 27017

The server now fails fast (10s instead of 30s) and logs the likely cause directly to the terminal when this happens, and the API returns a clear "Database connection issue" message (503) instead of a generic 500.

## What's implemented vs. what's next

**Working now:**
- Patient & doctor signup with full field validation, OTP email verification, admin-gated doctor approval
- JWT auth via httpOnly cookies, auto-login on refresh, role-based route protection, session expiry
- Forgot/reset password via OTP
- Doctor search & filtering (department, specialization, experience, name); consultation fees are displayed and entered in **PKR**
- Appointment booking with double-booking prevention (unique compound index + pre-check), approve/reject/complete/cancel/reschedule flows, confirmation emails
- Doctor availability management: set recurring weekly shifts per day, and cancel one specific already-saved shift instantly (e.g. "I'm unexpectedly busy Thursday") without disturbing the rest of the schedule or needing a separate save step
- Patients can view a doctor's full weekly availability from the booking page (collapsed behind a "View availability" toggle) before picking a slot
- Deleting a patient or doctor account (admin) cascade-deletes their appointments too, so a removed account's appointments don't linger as broken "nameless" cards on the other side's dashboard; a one-off `npm run cleanup-orphaned-appointments` script is included to clean up any such records left over from before this fix
- Admin dashboard: stats overview, patient/doctor lists, view/edit/delete any account, activate/deactivate accounts (doctor approval currently has no dedicated UI button — see below)
- Backend resilience: MongoDB connection now fails fast (10s) with a clear terminal message instead of hanging 30s, and lost-connection errors return a clear, actionable API message instead of a generic 500
- Responsive, animated UI (glassmorphism, Framer Motion transitions, dark mode, floating icons) across landing page, auth flow, and both dashboards

**Marked as "coming next" (stubbed, not faked):**
- Medical records, prescriptions, lab reports
- Payments & invoices
- In-app notifications (email notifications for bookings already work)
- A dedicated admin UI button for approving/rejecting pending doctors (the API endpoints already exist — `PATCH /api/doctors/:id/approve` / `/reject`)
- Analytics/charts, PDF export, Cloudinary uploads, ratings/reviews

Ask me to build out any of these next and I'll add them the same way — real models, controllers, and UI wired to the actual API, not placeholders.
