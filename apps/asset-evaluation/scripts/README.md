# Scripts Directory

This directory contains utility scripts for database operations and user management.

## User Role Management

**Important**: Use the main seed.ts file for user role management instead of individual scripts.

### Primary User Management
- **`../lib/db/seed.ts`** - Main seeding script with built-in user role management
  - Usage: `pnpm db:seed` (normal seed)
  - Usage: `pnpm db:update-role <email> <role>` (update user role)
  - Available roles: admin, member, viewer, owner

### Package Scripts
```bash
# Seed database with default admin user
pnpm db:seed

# Update a user's role (you'll need to provide email and role as arguments)
pnpm db:update-role admin@admin.com admin
pnpm db:update-role user@example.com admin

# Check all users and their roles
pnpm db:check-users
```

### Direct Usage Examples
```bash
# Seed database
npx tsx lib/db/seed.ts

# Update specific user role
npx tsx lib/db/seed.ts --update-role user@example.com admin
npx tsx lib/db/seed.ts --update-role admin@admin.com admin

# Check users
npx tsx scripts/check-user-role.ts
```

## Other Scripts
- **`check-translations.js`** - Validates translation keys synchronization
- **`migrate.js`** - Production database migration script
- **`check-user-role.ts`** - Lists all users and their roles for debugging