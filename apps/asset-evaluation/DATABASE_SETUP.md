# Database Setup Guide

## Overview
This project uses a **flexible database configuration**:
- **Development**: Mock database (no setup required), local PostgreSQL, or Neon
- **Production**: Neon serverless PostgreSQL (automatic)

The database connection automatically chooses the best driver:
- **Production**: Uses Neon serverless driver for optimal performance
- **Development**: Uses local PostgreSQL connection with pooling
- **No Database**: Mock database for landing page development

## Quick Start (Development)

### Option 1: No Database (Recommended for Landing Page Development)
The app works perfectly without any database setup! The landing page will function completely.

1. Keep `POSTGRES_URL` commented out in `.env`
2. Run `pnpm dev`
3. Landing page works at `http://localhost:3000`
4. ✅ All marketing features work
5. ❌ User features disabled gracefully

### Option 2: Local PostgreSQL (For Full Features)
If you want to test user authentication and full features:

1. Install PostgreSQL locally
2. Create a database called `asset_evaluation_dev`
3. Update `.env`:
   ```
   POSTGRES_URL=postgresql://username:password@localhost:5432/asset_evaluation_dev
   ```
4. Run migrations: `pnpm run db:migrate`
5. Seed data: `pnpm run db:seed`

### Option 3: Neon Development Database
Use Neon even in development for consistency:

1. Create a development database on [neon.tech](https://neon.tech)
2. Set environment variables:
   ```
   POSTGRES_URL=postgresql://username:password@hostname/database?sslmode=require
   USE_NEON=true
   ```
3. Run migrations: `pnpm run db:migrate`

## Production Setup

### Using Neon (Automatic)
Production automatically uses Neon's serverless driver for optimal performance:

1. Create account at [neon.tech](https://neon.tech)
2. Create a production database
3. Copy the connection string
4. Set environment variable:
   ```
   POSTGRES_URL=postgresql://username:password@hostname/database?sslmode=require
   NODE_ENV=production
   ```

The system will automatically:
- ✅ Use Neon serverless driver
- ✅ Enable connection pooling
- ✅ Optimize for serverless environments

## Database Commands

```bash
# Generate migration
pnpm run db:generate

# Run migrations
pnpm run db:migrate

# Open database studio
pnpm run db:studio

# Seed with sample data
pnpm run db:seed
```

## Environment Variables

### Development (.env)
```env
# Option 1: No database (landing page only)
# (Comment out POSTGRES_URL)

# Option 2: Local PostgreSQL
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/asset_evaluation_dev

# Option 3: Force Neon in development
POSTGRES_URL=postgresql://user:pass@host/db?sslmode=require
USE_NEON=true

# Other required vars
BASE_URL=http://localhost:3000
AUTH_SECRET=your_secret_here
```

### Production
```env
# Neon database URL (serverless driver used automatically)
POSTGRES_URL=postgresql://user:pass@host/db?sslmode=require
NODE_ENV=production

# Production URL
BASE_URL=https://yourdomain.com
```

## Connection Details

### Automatic Driver Selection
The database connection automatically selects the optimal driver:

| Environment | Driver | Connection Type | Use Case |
|-------------|--------|-----------------|----------|
| Production | Neon Serverless | HTTP-based | Serverless functions |
| Development + USE_NEON=true | Neon Serverless | HTTP-based | Testing production setup |
| Development (local) | PostgreSQL | TCP connection pool | Full-stack development |
| No POSTGRES_URL | Mock Database | In-memory | Landing page development |

### Connection Pooling
- **Local PostgreSQL**: 1 connection max in development
- **Neon**: Automatic serverless scaling
- **Mock**: No connections needed

## Features by Database Type

| Feature | No Database | Local PostgreSQL | Neon (Production) |
|---------|-------------|------------------|-------------------|
| Landing Page | ✅ | ✅ | ✅ |
| Property Demo | ✅ | ✅ | ✅ |
| User Authentication | ❌ | ✅ | ✅ |
| Property Saving | ❌ | ✅ | ✅ |
| Team Collaboration | ❌ | ✅ | ✅ |
| Analytics | ❌ | ✅ | ✅ |

## Troubleshooting

### Error: "Cannot connect to database"
- **Solution**: Comment out `POSTGRES_URL` in `.env` for development
- **Result**: Landing page works, user features disabled

### Error: "Database does not exist"
- **Solution**: Create the database first, then run migrations
- **Commands**: 
  ```bash
  createdb asset_evaluation_dev  # Create database
  npm run db:migrate             # Run migrations
  ```

### Error: "Connection refused"
- **Solution**: Make sure PostgreSQL is running
- **macOS**: `brew services start postgresql`
- **Windows**: Start PostgreSQL service
- **Linux**: `sudo service postgresql start`

## Schema Changes

When you modify the database schema:

1. Update `lib/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:migrate`

## Best Practices

### Development
- Use mock database for UI/landing page work
- Use local PostgreSQL for full-stack development
- Keep migrations small and focused

### Production
- Always use connection pooling
- Set appropriate connection limits
- Monitor database performance
- Regular backups with Neon

### Security
- Never commit real database URLs
- Use different databases for dev/staging/prod
- Rotate database passwords regularly
- Use SSL/TLS in production (handled by Neon)

## Database Schema Overview

Main tables:
- `users` - User accounts and authentication
- `teams` - Team/organization data
- `team_members` - User-team relationships
- `user_profiles` - Extended user information
- `activity_logs` - Activity tracking and analytics

Property evaluation tables (to be added):
- `properties` - Property listings
- `evaluations` - User property evaluations
- `evaluation_criteria` - Scoring criteria
- `shared_lists` - Collaborative property lists
