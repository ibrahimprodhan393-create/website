# Hyper Regedit Access Website

This version is prepared for Render Web Service deployment with Neon database storage.

Why Web Service is needed:

Static Site stores admin data in each browser only. If you log in from another phone, it has a different `localStorage`, so the package/admin data will look different. To show the same admin data on every phone, the app must use a shared database through a server.

Render settings:

- Service type: Web Service
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`

Render environment variables:

- `DATABASE_URL` = your Neon pooled connection string
- `ADMIN_PASSWORD` = optional first/default admin password

Neon setup:

Run `neon-schema.sql` in Neon SQL Editor once.

Sample login keys:

- Admin panel username: `admin`
- Admin panel password: `ADMIN-2026`
- Starter user: `starter` / `KEY-1DAY-2026`
- 7 day user: `premium7` / `KEY-7DAY-2026`
- 30 day user: `ultimate30` / `KEY-30DAY-2026`

With Neon connected, admin settings, packages, features, and device locks are saved in Neon and will show the same data from any phone/browser.
