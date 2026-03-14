# Setting up Resend in Railway

_Saved: 2026-02-21_

---

No problem! Resend is straightforward. Here's the setup:

## 1. Create account & get API key

1. Go to [resend.com](https://resend.com) → sign up (free tier: 3,000 emails/month, 100/day)
2. Dashboard → **API Keys** → **Create API Key**
3. Give it a name (e.g. `learnimo-production`), keep default permissions → **Add**
4. Copy the key — you won't see it again

## 2. Verify your sending domain

1. Dashboard → **Domains** → **Add Domain** → enter `learnimo.net`
2. Resend gives you DNS records to add (usually 3–4 TXT/MX records for DKIM + SPF)
3. Add them in Locaweb DNS (same place you manage learnimo.net)
4. Click **Verify** — usually takes a few minutes

> Until the domain is verified, you can only send to your own account email. The verified domain lets you send from `noreply@learnimo.net`.

## 3. Set Railway env vars

Once you have the API key and domain verified, add these in Railway → your backend service → **Variables**:

| Variable | Value |
|---|---|
| `MAIL_HOST` | `smtp.resend.com` |
| `MAIL_PORT` | `465` |
| `MAIL_USERNAME` | `resend` |
| `MAIL_PASSWORD` | `re_xxxxxxxxxxxx` (your API key) |
| `MAIL_FROM` | `noreply@learnimo.net` |

> `MAIL_USERNAME` is literally the string `resend` — that's Resend's SMTP convention, not your email.

## 4. Test it

Once deployed, hit `POST /api/v1/auth/password-reset/request` with your email and check your inbox. If no email arrives within 30s, check Railway logs for Spring Mail errors.

That's it — no SDK needed since your backend already uses standard SMTP via Spring Mail.
