# Cafe Yoto Backend (Postgres)

This is a small local server that lets the Cafe Yoto Counter app save its data
into your own PostgreSQL database instead of Claude's built-in storage.

## 1. Finish installing Postgres

You already downloaded the installer. Run **postgresql_18.exe** (or 17, either
works) if you haven't finished setup yet. During install it will ask you to
set a password for the `postgres` user — write it down, you'll need it below.
You can skip/ignore the PostGIS bundle; this app doesn't need it.

## 2. Create the database

Open **pgAdmin** (installed alongside Postgres) or a terminal with `psql`, and run:

```sql
CREATE DATABASE cafeyoto;
```

Then load the table into it. In pgAdmin: open the `cafeyoto` database, open the
Query Tool, paste the contents of `schema.sql`, and run it.

Or from a terminal:

```
psql -U postgres -d cafeyoto -f schema.sql
```

## 3. Configure the backend

```
cd cafe-yoto-backend
copy .env.example .env
```

Open `.env` and set `PGPASSWORD` to the password you set during install.
Adjust `PGPORT` if your Postgres isn't on the default 5432.

## 4. Install and run

```
npm install
npm start
```

You should see:

```
Cafe Yoto backend running on http://localhost:3001
```

Visit `http://localhost:3001/health` in your browser — it should show `{"ok":true}`.
Leave this running in the background whenever you use the POS app.

## 5. Open the app

Now that the backend also serves the app itself, just visit:

```
http://localhost:3001
```

on the computer running the backend. Everything (employees, orders,
inventory, expenses) lives in your `cafeyoto` Postgres database, in a table
called `app_state`.

## 6. Use it from a phone or another PC at the counter (same wifi)

1. On the computer running the backend, find its local network IP address.
   - Windows: open Command Prompt, run `ipconfig`, look for **IPv4 Address**
     under your Wi-Fi or Ethernet adapter — something like `192.168.1.15`.
2. The first time you do this, Windows may pop up a **Firewall** prompt when
   you run `npm start` — click **Allow access** (for Private networks at least).
3. On the phone or other PC (connected to the same wifi), open a browser and
   go to `http://192.168.1.15:3001` (using the IP you found). Bookmark it or
   add it to the home screen for quick access.
4. The backend computer needs to stay on and `npm start` needs to keep
   running for other devices to reach it.

## 7. Optional: access it from outside your wifi

If you ever want to check reports from home, or a device isn't on the same
wifi, you need a tunnel that gives you a public HTTPS address. The easiest
free option is **ngrok**:

1. Sign up at ngrok.com (free) and install it.
2. Run `ngrok config add-authtoken <your token>` (shown on your ngrok dashboard).
3. Claim one free static domain from the ngrok dashboard (so the address
   doesn't change every time you restart it).
4. Run `ngrok http --domain=your-name.ngrok-free.app 3001`, keep it running
   alongside the backend.
5. Visit `https://your-name.ngrok-free.app` from anywhere.

Let me know if you want this set up and I'll walk you through it step by step.

## Notes

- The app is now served by this same backend, so there's only one address to
  remember per device: `localhost:3001` on this computer, or the LAN IP from
  step 6 on other devices.
- To inspect your data directly, open pgAdmin → `cafeyoto` → Schemas → public
  → Tables → `app_state`. You'll see two rows: `yoto-core` (menu, employees,
  ingredients, settings) and `yoto-orders` (all orders).
