# Hyper Regedit Access Website

This ZIP is prepared for Render Static Site deployment.

Render settings:

- Service type: Static Site
- Build command: `echo "No build step required"`
- Publish directory: `.`

Files needed for static hosting:

- `index.html`
- `styles.css`
- `app.js`
- `render.yaml`

Sample login keys:

- Admin panel: `ADMIN-2026`
- `KEY-1DAY-2026`
- `KEY-7DAY-2026`
- `KEY-30DAY-2026`

Static-site note:

The UI and flow stay the same, but static hosting stores admin packages/features in the current browser `localStorage`. That means package data created on one phone/browser is not shared automatically to other phones. Shared package login, Neon storage, and one-device locking across all users require the Node Web Service version.

The login screen is built with HTML/CSS as a Hyper Regedit Access white/gold interface. It does not require a separate login image asset, so password input, remember, contact, and login controls remain real clickable form elements.
