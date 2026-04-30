# Access Activation Website

Open `index.html` in a browser to use the static demo.

Sample login keys:

- Admin panel: `ADMIN-2026`
- `KEY-1DAY-2026`
- `KEY-7DAY-2026`
- `KEY-30DAY-2026`

The admin panel stores packages and features in browser `localStorage`.
Use the same home login password box for admin and users. The Contact Admin button uses the selected contact saved in Admin Account settings.
After user login, the portal shows admin-controlled device details, legal/regulatory details, package details, clickable feature activation toggles, and the install flow with a new random web activation code on every install.
Feature toggles are optional. The serial number, package web activation code, and certificate code are validated only against the package used for login. After a correct serial number, the firmware/file installation loading page runs for 2 minutes before asking for the package web activation code.
The install stages follow the provided videos: activation key + serial card, generated-key loading card, then web activation/certificate verification cards.
