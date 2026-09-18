# Password Reset Implementation - Setup Guide

## 1. Install Dependencies

```bash
cd frontend
npm install resend@latest
```

## 2. Generate Prisma Client (Required!)

```bash
cd frontend
npx prisma generate
```

This will create the TypeScript types for the new `reset_token` and `reset_token_expiry` fields in the User model.

## 3. Database Migration

Run the migration to add the new columns to your PostgreSQL database:

```bash
cd frontend
npx prisma migrate dev --name add_reset_token_to_user
```

Or if using the migration file directly:

```bash
cd frontend
npx prisma migrate deploy
```

## 4. Environment Variables (Vercel)

Add these to your Vercel project environment variables:

```
# Required for JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Required for password reset emails (get from https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxx

# Required for reset link URL in emails
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### For Local Development (.env.local)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/medtracker?schema=public"
JWT_SECRET="your-dev-secret"
RESEND_API_KEY=""  # Leave empty for dev mode (logs URL to console)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 5. Resend Setup

1. Create account at [resend.com](https://resend.com)
2. Verify your domain or use their test domain
3. Get API key and add to Vercel env vars
4. Update `from` email in `forgot-password/route.ts`:
   ```typescript
   from: "MedTracker <noreply@your-verified-domain.com>",
   ```

## 6. API Endpoints

### Request Reset
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

### Execute Reset
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

## 7. Frontend Pages

- `/login` - Has "Forgot Password?" link that opens modal
- `/reset-password?token=xxx` - Reset password form

## 8. Test Flow

1. Go to `/login`
2. Click "Lupa Password?"
3. Enter registered email
4. Check console (dev) or email (prod) for reset link
5. Click link → goes to `/reset-password?token=...`
6. Enter new password (min 8 chars) twice
7. Submit → redirects to `/login`

## Security Features

- ✅ Token: 32 bytes hex (256 bits entropy)
- ✅ Expiry: 15 minutes
- ✅ Single-use: Token cleared after use
- ✅ Email enumeration protection: Always returns success
- ✅ Password hashing: bcrypt with 12 rounds
- ✅ Rate limiting: Add via Vercel Edge Middleware if needed

## Troubleshooting

| Issue | Solution |
|-------|----------|
| TypeScript errors on `reset_token` | Run `npx prisma generate` |
| Email not sending | Check `RESEND_API_KEY` in Vercel env vars |
| Reset link 404 | Ensure `/reset-password` page exists |
| Token expired | Request new reset link (15 min expiry) |