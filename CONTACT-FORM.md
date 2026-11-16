# Contact Inbox

The site uses the native MIT-licensed `@mav3ndev/emdash-contact-inbox` plugin.
It works without Cloudflare Worker Loader. Registry sandbox plugins remain disabled.

- Inbox and contact settings: `/_emdash/admin/plugins/contact-inbox/messages`
- Email delivery settings and test email: `/_emdash/admin/settings/email`
- Shared form: `src/components/ContactForm.astro`
- Browser submission and Turnstile: `src/scripts/contact-form.ts`
- Readiness check: `/api/contact-ready` (only exposes a boolean)
- Submission endpoint: `/_emdash/api/plugins/contact-inbox/submit`

Turnstile settings are stored separately in each environment's CMS database.
The managed widget allows the production workers.dev hostname, localhost, and 127.0.0.1.
Add any future custom domain to the widget before switching domains.
The form requires consent, enforces Turnstile, and limits submissions to 3 per 15 minutes per IP.
The optional phone number is included in the message body.

SMTP uses `smtp.gmail.com`, port **587**, **STARTTLS**. Port 465 timed out on Cloudflare
in this setup; a test email through 587 succeeded. Notification recipient is
`vietry.dupx@gmail.com`; the sender account is `no-reply@vietry.com.vn`.
SMTP credentials live in Cloudflare Secrets and the gitignored local `.env`:

```
EMAIL_SMTP_HOST
EMAIL_SMTP_PORT
EMAIL_SMTP_SECURE
EMAIL_SMTP_USER
EMAIL_SMTP_PASS
EMAIL_SMTP_FROM_NAME
EMAIL_SMTP_FROM_EMAIL
EMAIL_SMTP_REPLY_TO
```

Never commit credentials or copy production sessions into local storage.
The form stays disabled when no email provider is configured.
The plugin stores the message before sending notification and auto-reply emails.
If email delivery fails after saving, the visitor sees an error but the message can
already exist in Contact Inbox; check the inbox before retrying to avoid duplicates.

Run `npm run typecheck` and `npm run build` before deployment.
CMS settings and SMTP secrets are separate from Git; deploying code does not copy them.
