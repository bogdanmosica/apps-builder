# Database Schema Fix for Vercel Deployment

The "Database schema error" occurs because the production database is missing some columns that were added to the schema after the initial migration. Here's how to fix it:

## Quick Fix for Vercel

### Option 1: Use the Schema Debug API (Recommended)

1. **Deploy your current code to Vercel** (the build is successful)

2. **Check the current schema status:**
   Visit: `https://your-app.vercel.app/api/debug/schema`
   
   This will show you exactly which columns are missing.

3. **Apply the schema fix:**
   Send a POST request to: `https://your-app.vercel.app/api/debug/fix-schema`
   
   Include the header: `x-schema-fix-auth: your-auth-secret`
   
   You can do this with curl:
   ```bash
   curl -X POST https://your-app.vercel.app/api/debug/fix-schema \
     -H "x-schema-fix-auth: 4dc1b1d64debc9db673f360d3bd4c114e3b6b14fa36d93d5973d0a31b48c319f"
   ```

### Option 2: Manual Database Fix

If you have direct access to your Neon database console:

```sql
-- Add missing columns to evaluation_sessions table
ALTER TABLE evaluation_sessions ADD COLUMN IF NOT EXISTS property_name varchar(100);
ALTER TABLE evaluation_sessions ADD COLUMN IF NOT EXISTS property_location varchar(255);
ALTER TABLE evaluation_sessions ADD COLUMN IF NOT EXISTS property_surface integer;
ALTER TABLE evaluation_sessions ADD COLUMN IF NOT EXISTS property_floors varchar(20);
ALTER TABLE evaluation_sessions ADD COLUMN IF NOT EXISTS property_construction_year integer;
```

## What Happened?

The issue occurred because:

1. **Initial Migration (0010)**: Created `evaluation_sessions` table with basic columns
2. **Schema Evolution**: Added property information columns to the schema
3. **Missing Migration**: These new columns weren't included in a migration file
4. **Production Gap**: Local development worked because you might have manually added columns, but production database was missing them

## Verification

After applying the fix, test the property save functionality:

1. **Check schema status:** Visit `/api/debug/schema` - should show `"schemaStatus": "COMPLETE"`
2. **Test database operations:** Visit `/api/debug/database` - should show all operations as "OK"
3. **Try saving a property evaluation** - should work without the 500 error

## Debug Endpoints Available

- `/api/debug/schema` - Check database schema status
- `/api/debug/database` - Test database operations
- `/api/debug/env` - Check environment variables
- `/api/health` - Basic health check
- `/api/evaluation/test-save` - Simplified save operation for testing

## Environment Variables Needed on Vercel

Make sure these are set in your Vercel project settings:

```
DATABASE_URL=your_neon_database_url
AUTH_SECRET=4dc1b1d64debc9db673f360d3bd4c114e3b6b14fa36d93d5973d0a31b48c319f
BASE_URL=https://your-vercel-app-url.vercel.app
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=your_verified_email
```

## Future Prevention

To prevent this issue in the future:

1. **Always generate migrations** when changing schema:
   ```bash
   npx drizzle-kit generate
   ```

2. **Test migrations** before deploying:
   ```bash
   npx drizzle-kit migrate
   ```

3. **Use the migration script** for production deployments:
   ```bash
   npm run db:migrate:prod
   ```

The property save functionality should work correctly after applying these fixes!
