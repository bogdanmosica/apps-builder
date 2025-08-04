# Asset Evaluation App - Troubleshooting Guide

## Error: "Data integrity error. Please check that all referenced data exists."

This error typically occurs when trying to save property evaluation data, but the database is missing required reference data. Here's how to diagnose and fix this issue:

## 🔍 Quick Diagnosis

### Step 1: Check Database Status
Visit these diagnostic endpoints on your deployed app:

```
https://your-app.vercel.app/api/debug/quick-check
https://your-app.vercel.app/api/debug/database-status
https://your-app.vercel.app/api/debug/property-types
```

These will show you:
- Database connection status
- Whether property types exist
- User authentication status
- Environment configuration

### Step 2: Check for Missing Data
The most common causes:

1. **Property Types Not Seeded**: The database doesn't have property type data
2. **User Session Issues**: Invalid or missing user session
3. **Database Connection**: Connection issues with your database

## 🛠️ Solutions

### Solution 1: Seed the Database (Most Common)

If the database is empty or missing property evaluation data:

#### For Local Development:
```bash
cd apps/asset-evaluation
npm run seed
# or
npx tsx lib/db/seed.ts
```

#### For Vercel Deployment:
1. **Option A - Run seed via Vercel Functions:**
   - Create a temporary API endpoint to run seeding
   - Access it once via browser to populate database
   - Remove the endpoint after seeding

2. **Option B - Seed from local environment:**
   ```bash
   # Set your production DATABASE_URL locally
   DATABASE_URL=your_production_database_url npm run seed
   ```

3. **Option C - Database Dashboard:**
   - Access your database dashboard (Neon, PlanetScale, etc.)
   - Run the SQL commands manually (check migration files)

### Solution 2: Fix Environment Variables

Ensure these environment variables are set in Vercel:

```env
DATABASE_URL=your_database_connection_string
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://your-app.vercel.app
```

### Solution 3: Database Migration

If tables don't exist, run migrations:

#### For Drizzle ORM:
```bash
npx drizzle-kit push:pg
# or
npx drizzle-kit migrate
```

### Solution 4: Check User Authentication

The error might occur if:
- User is not logged in
- Session is expired
- User ID doesn't exist in database

**Fix**: Ensure users log in before attempting to save evaluations.

## 🔧 Manual Database Seeding Script

Create a temporary API endpoint to seed the database from Vercel:

```typescript
// app/api/admin/seed/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { propertyTypes, questionCategories, questions, answers } from '@/lib/db/schema';

export async function POST() {
  try {
    // Check if already seeded
    const existingTypes = await db.select().from(propertyTypes);
    if (existingTypes.length > 0) {
      return NextResponse.json({ message: 'Database already seeded' });
    }

    // Insert your seed data here
    // (Copy from lib/db/seed.ts)
    
    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Important**: Remove this endpoint after seeding for security.

## 📊 Database Schema Requirements

Ensure these tables exist with proper relationships:

```sql
-- Property evaluation tables
propertyTypes (id, name_ro, name_en)
questionCategories (id, name_ro, name_en, propertyTypeId)
questions (id, text_ro, text_en, weight, categoryId)
answers (id, text_ro, text_en, weight, questionId)

-- User evaluation tables
evaluationSessions (id, userId, propertyTypeId, ...)
userEvaluationAnswers (id, evaluationSessionId, questionId, answerId, ...)

-- User management tables
users (id, email, passwordHash, ...)
```

## 🚨 Emergency Fixes

### Quick Property Type Fix
If you need to quickly add a property type for testing:

```sql
INSERT INTO property_types (name_ro, name_en) VALUES ('Casă', 'House');
```

### Reset Database
If the database is corrupted:

1. Drop all tables
2. Run migrations to recreate schema
3. Run seed script to populate data

## 📞 Getting Help

1. Check the diagnostic endpoints first
2. Review Vercel function logs
3. Check database logs
4. Verify environment variables
5. Test with a simple property type

## 🔐 Security Notes

- Never expose database credentials in client code
- Remove admin/debugging endpoints in production
- Use environment variables for all sensitive data
- Implement proper authentication for admin functions

## 📝 Verification Checklist

After fixing the issue:

- [ ] Database connection works
- [ ] Property types exist (at least 1)
- [ ] Questions and answers exist
- [ ] Users can log in
- [ ] Evaluation saving works
- [ ] All diagnostic endpoints show success
- [ ] Remove any temporary debugging endpoints
