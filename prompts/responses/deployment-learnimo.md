# Deployment Guide — learnimo

> Updated deployment plan for learnimo (learnimo.net). CORS env var fix already merged to main (PR #38).

---

## Stack

| Piece | Service | Notes |
|-------|---------|-------|
| Database | **Supabase** | Managed PostgreSQL. Flyway runs migrations on first boot. |
| Backend | **Railway** | Spring Boot via Dockerfile in `backend/`. |
| Web | **Vercel** | Next.js via `web/`. Connect custom domain `learnimo.net`. |

---

## Step 1 — Supabase (10 min)

1. Go to [supabase.com](https://supabase.com) → New project
2. Name: `learnimo`, choose a nearby region, set a strong DB password
3. Once created: **Project Settings → Database → Connection string → URI mode**
   - Format: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`
4. Extract the parts:

```
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<your-supabase-password>
```

> Flyway will run all migrations automatically on first backend startup. No manual SQL needed.

---

## Step 2 — Railway (Backend, 15 min)

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Select `lucasxf/engineering-daybook`
3. Set **root directory** to `backend/`
4. Railway will detect `backend/Dockerfile` automatically
5. Add environment variables (Settings → Variables):

```
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<supabase-password>
JWT_SECRET=<run: openssl rand -base64 48>
GOOGLE_CLIENT_ID=<your-google-client-id>
SERVER_PORT=8080
ALLOWED_ORIGINS=https://learnimo.net,https://www.learnimo.net
```

6. Deploy. Railway assigns a URL like `https://learnimo-backend.up.railway.app`
7. Smoke test: `GET https://learnimo-backend.up.railway.app/api/v1/health`
   - Expected: `{"status":"OK","message":"learnimo API is running"}`

---

## Step 3 — Vercel (Web, 10 min)

1. Go to [vercel.com](https://vercel.com) → New Project → Import `lucasxf/engineering-daybook`
2. Set **root directory** to `web/`
3. Framework preset: **Next.js** (auto-detected)
4. Add environment variables:

```
NEXT_PUBLIC_API_URL=https://learnimo-backend.up.railway.app/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
```

5. Deploy. Vercel assigns `learnimo.vercel.app` initially.
6. Go to **Settings → Domains** → Add `learnimo.net` and `www.learnimo.net`
7. Update DNS at your registrar to point to Vercel's nameservers (Vercel will show the records)

---

## Step 4 — Google OAuth (5 min)

In [Google Cloud Console](https://console.cloud.google.com) → your OAuth 2.0 Client → add to:

**Authorized JavaScript origins:**
```
https://learnimo.net
https://www.learnimo.net
```

**Authorized redirect URIs:**
```
https://learnimo.net
https://learnimo.net/en
https://learnimo.net/pt-BR
https://www.learnimo.net
```

---

## Step 5 — Update ALLOWED_ORIGINS on Railway

Once Vercel confirms your custom domain is live, update Railway's `ALLOWED_ORIGINS`:

```
ALLOWED_ORIGINS=https://learnimo.net,https://www.learnimo.net
```

Railway redeploys automatically on env var changes.

---

## Checklist

- [ ] Supabase project created, DB password saved
- [ ] Railway backend deployed, `/health` returns 200
- [ ] Vercel web deployed
- [ ] Custom domain `learnimo.net` connected on Vercel
- [ ] DNS propagated (check: `nslookup learnimo.net`)
- [ ] Google OAuth origins/redirects updated
- [ ] End-to-end: register → login → create learning → works on `learnimo.net`

---

*Updated: 2026-02-19 — learnimo rebrand*
