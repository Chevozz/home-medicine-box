# Password Reset Implementation - Setup Guide

## Package Installation

```bash
cd frontend
# Remove resend and install nodemailer
npm uninstall resend
npm install nodemailer @types/nodemailer
```

## Environment Variables (Vercel)

Add these to your Vercel project environment variables:

```
# Required for JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Required for Gmail SMTP (App Password recommended)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Required for reset link URL in emails
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### For Gmail - App Password Setup
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Create a new app password (select "Mail" and your device)
5. Use the 16-character app password for `EMAIL_PASS`

### For Local Development (.env.local)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/medtracker?schema=public"
JWT_SECRET="your-dev-secret"
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## API Endpoint: Forgot Password

```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

Response (always success for security):
```json
{
  "message": "Jika email terdaftar, instruksi reset telah dikirim ke email Anda."
}
```

## API Endpoint: Reset Password

```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "abc123...",
  "newPassword": "newpassword123"
}
```

Response:
```json
{
  "message": "Password berhasil direset. Silakan login dengan password baru."
}
```

## Database Migration

```bash
cd frontend
npx prisma generate
npx prisma migrate dev --name add_reset_token_to_user
```

## Security Features

- Token: 32 bytes hex (256 bits entropy)
- Expiry: 15 minutes
- Single-use: Token cleared after use
- Email enumeration protection: Always returns success
- Password hashing: bcrypt with 12 rounds
- Gmail SMTP with App Password authentication

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not sending | Check `EMAIL_USER` and `EMAIL_PASS` in Vercel env vars |
| Gmail blocked | Use App Password (not regular password), enable "Less secure apps" or 2FA |
| nodemailer not found | Run `npm install nodemailer @types/nodemailer` |
| Token expired | Request new reset link (15 min expiry) |
