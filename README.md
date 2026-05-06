# Access Activation Website

Run this as a Node web service so admin-created packages are shared for every user.

Local start:

```bash
npm start
```

Then open `http://localhost:3000`.

Sample login keys:

- Admin panel: `ADMIN-2026`
- `KEY-1DAY-2026`
- `KEY-7DAY-2026`
- `KEY-30DAY-2026`

The admin panel stores packages and features on the server. A package password is locked to the first browser/device ID that logs in successfully. The same device can keep using that package password, but another device receives `Already used on another device`.
Admin can clear a package device lock from Package Management with `Reset Device Lock`.
To change the admin password, log in with the current admin password, open Admin Account, edit Admin Panel Password, then click Save Admin Settings. After saving, the old default password no longer works unless you set it again.
Use the same home login password box for admin and users. The Contact Admin button uses the selected contact saved in Admin Account settings.
After user login, the portal shows admin-controlled device details, legal/regulatory details, package details, clickable feature activation toggles, and the install flow with a new random web activation code on every install.
Feature toggles are optional and default to deactivated. Toggle actions show animated activate/deactivate success messages.
The install stage opens as its own focused screen without numbered step boxes. Copy Key reveals the serial form, a correct serial shows the registered service/security module message and an Install button, then the firmware/file installation loading page runs for 2 minutes before asking for the package web activation code.
Final installation loading hides the minute label on the user screen, shows a large animated final installation view, and runs 10-minute checking phases until the admin package loading time is complete.
The user dashboard includes a live reverse subscription countdown until package expiry.
The dashboard also includes Free Fire and Free Fire Max injection buttons above the live countdown.
The login screen is built with HTML/CSS as a Hyper Regedit Access white/gold interface. It does not require a separate login image asset, so password input, remember, contact, and login controls remain real clickable form elements.

Render deploy:

- Service type: Web Service
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`

The server writes shared data to `data/store.json`. For long-term production persistence, connect a database later; this file-based store is a lightweight Render-ready version for the current package flow.
