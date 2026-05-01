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
Feature toggles are optional and default to deactivated. Toggle actions show animated activate/deactivate success messages.
The install stage opens as its own focused screen without numbered step boxes. Copy Key reveals the serial form, a correct serial shows the registered service/security module message and an Install button, then the firmware/file installation loading page runs for 2 minutes before asking for the package web activation code.
Final installation loading hides the minute label on the user screen, shows a large animated final installation view, and runs 10-minute checking phases until the admin package loading time is complete.
The user dashboard includes a live reverse subscription countdown until package expiry.
