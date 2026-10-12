# CDT Berrechid 2026 — Vercel version  |  نسخة Vercel

Static front-end (`public/`) + serverless API (`api/`) + Upstash Redis storage.
Login is checked **on the server** (PINs are stored hashed, sessions are signed HttpOnly cookies),
and member data is only sent to the browser **after** a successful login.

## Deploy (about 15 minutes)

1. **Put the project on GitHub as a PRIVATE repository** (or skip GitHub and use `npx vercel` from this folder).
   This folder contains no member data. Never commit the data file.
2. **Vercel → Add New → Project →** import the repo. Framework preset: *Other*. Leave build settings empty → Deploy.
3. **Storage:** Project → *Storage* tab → *Create / Connect* → **Upstash Redis** (free plan is enough) → connect it to the project.
   Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
4. **Environment variables** (Project → Settings → Environment Variables, all environments):
   - `SESSION_SECRET` = a long random string (`openssl rand -base64 32`, or any 40+ random characters)
   - `SETUP_TOKEN` = a one-time key you choose (you will type it once in step 6)
5. **Redeploy** (Deployments → ⋯ → Redeploy) so the variables are picked up.
6. Open your site. On the first visit you see **«إعداد أولي»**: choose `cdt-berrechid-data.json`, enter `SETUP_TOKEN`, upload.
   Every account without a PIN gets a random 6-digit PIN, shown **once** (download the CSV and hand them out).
7. Log in as «الكاتب العام», then in **المستخدمون** you can set your own PINs (4–8 digits).
8. **Afterwards:** delete the `SETUP_TOKEN` variable (this disables the setup route), and delete the data JSON from your computer/downloads.

## How it behaves

- Several people can work at once: saves are version-checked; if two people save at the same moment, the app merges
  both edits automatically (per record). Every ~45 s it also pulls changes made by others.
- 5 wrong PINs on one account (or 40 from one address) lock login for 15 minutes.
- A snapshot of the previous state is kept once per day for 30 days (Redis keys `cdt:backup:YYYY-MM-DD`).
  The admin's «تصدير نسخة احتياطية» button still works and is the recommended extra backup.
- Only the admin can create/modify accounts and PINs (enforced by the server).

## Known limits

- Row-level scoping (a local-office secretary seeing only her own members) is still enforced **in the browser**, as in the original app.
  Anyone with a valid login could read the full dataset via the browser dev-tools. Server-side filtering per role is the next step if needed.
- Vercel limits a request body to 4.5 MB (the data is ≈0.4 MB today).
- Check Vercel's plan terms for your usage (Hobby is meant for personal, non-commercial projects).

## Local test

```
LOCAL_DEV=1 SETUP_TOKEN=test node dev-server.js     # http://localhost:3000, in-memory storage
```
