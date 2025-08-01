# Deployment Environment Variables

When deploying to production (Vercel, Netlify, etc.), make sure to set these environment variables:

## Required Variables

### Authentication
- `AUTH_SECRET`: A secure random string (32+ characters) for JWT signing
  - Generate with: `openssl rand -base64 32`
  - Example: `4dc1b1d64debc9db673f360d3bd4c114e3b6b14fa36d93d5973d0a31b48c319f`

### Database
- `DATABASE_URL`: PostgreSQL connection string for your production database
  - Format: `postgresql://username:password@host:port/database?sslmode=require`
  - Example: `postgresql://user:pass@host.neon.tech/db?sslmode=require`

### Stripe (for payments)
- `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with `sk_live_` for production)
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret from Stripe dashboard

### Email (Resend)
- `RESEND_API_KEY`: API key from resend.com (starts with `re_`)
- `FROM_EMAIL`: Verified sender email address

### Optional
- `BASE_URL`: Your production domain (auto-detected on Vercel)
- `NODE_ENV`: Set to `production` (usually auto-set)

## Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with its value
4. Redeploy your application

## Common Issues

### MIDDLEWARE_INVOCATION_FAILED
- Usually caused by missing `AUTH_SECRET`
- Make sure all required environment variables are set in your deployment platform

### Database Connection Errors
- Check `DATABASE_URL` format and credentials
- Ensure your database allows connections from your deployment platform
- For Neon: Make sure to use the pooled connection string

### Build Errors
- Run `npm run build` locally first to catch TypeScript errors
- Check that all environment variables are available during build time
