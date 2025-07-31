# User Settings - General Tab Implementation

This implementation provides a complete, dynamic General settings tab with database persistence for user profile and company information.

## What's Been Implemented

### 1. Database Schema Extensions

**New Table: `user_profiles`**
- Stores extended user information beyond basic auth data
- Fields include: firstName, lastName, bio, phone, timezone, language, company info, social links
- Linked to users table with foreign key relationship
- Auto-generated timestamps for created_at and updated_at

### 2. Server Actions

**File: `lib/actions/user-settings.ts`**
- `updateProfileAction()` - Handles profile information updates
- `updateCompanyAction()` - Handles company information updates
- `getUserSettingsData()` - Fetches user data with profile for display
- Full form validation using Zod schemas
- Error handling with user-friendly messages

### 3. Database Queries

**Enhanced: `lib/db/queries.ts`**
- `getUserWithProfile()` - Joins user and profile data
- `createUserProfile()` - Creates new profile record
- `updateUserProfile()` - Updates existing profile
- `updateUserBasicInfo()` - Updates core user data (name, email)

### 4. React Components

**Main Component: `components/settings/general-settings.tsx`**
- Fully dynamic form with real data binding
- Two sections: Profile Information & Company Information
- Loading states and error handling
- Toast notifications for success/error feedback
- Timezone and language dropdowns with predefined options
- Form validation and submission handling

**Updated: `components/enhanced-settings.tsx`**
- Modified to accept user data as props
- Renders dynamic General tab content
- Other tabs remain as static placeholders for future implementation

### 5. Page Integration

**Updated: `app/(dashboard)/dashboard/settings/page.tsx`**
- Server component that fetches user data
- Passes data to settings component
- Handles authentication redirect

## Features

### Profile Information Section
- ✅ First Name & Last Name fields
- ✅ Email address (updates core user record)
- ✅ Phone number
- ✅ Bio/description (500 char limit)
- ✅ Timezone selection (predefined options)
- ✅ Language preference
- ✅ Real-time form validation
- ✅ Loading states during submission
- ✅ Success/error toast notifications

### Company Information Section
- ✅ Company name
- ✅ Company website (URL validation)
- ✅ Job title
- ✅ Separate save action
- ✅ Independent form handling

### Technical Features
- ✅ Server-side form processing with Server Actions
- ✅ Database transactions for data integrity
- ✅ Optimistic UI updates
- ✅ Form state management with useTransition
- ✅ Comprehensive error handling
- ✅ Data validation with Zod schemas
- ✅ Responsive design
- ✅ Accessibility considerations

## Database Migration

A migration has been generated and applied:
- **File**: `lib/db/migrations/0007_careless_bruce_banner.sql`
- **Manual backup**: `manual-user-profiles-migration.sql`

## Usage

1. Navigate to `/dashboard/settings`
2. The General tab will be selected by default
3. Forms are pre-populated with existing user data
4. Make changes and click "Save Changes" or "Update Company"
5. Toast notifications provide feedback
6. Data is immediately saved to database

## Next Steps

The remaining 6 tabs are ready for similar implementation:
1. **Security** - Password changes, 2FA, active sessions
2. **Notifications** - Email & push notification preferences  
3. **Billing** - Subscription management, payment methods
4. **Team** - Team member management, invitations
5. **Integrations** - Third-party service connections
6. **Advanced** - Danger zone, account deletion

Each tab can follow the same pattern:
1. Create server actions for data handling
2. Build dynamic components with real data
3. Add database queries as needed
4. Implement proper validation and error handling

## Dependencies Added

- ✅ `sonner` - Toast notifications (already configured in layout)
- ✅ `zod` - Form validation (already installed)
- ✅ All UI components available from workspace package

## File Structure

```
apps/sass-starter/
├── app/(dashboard)/dashboard/settings/page.tsx        # Settings page
├── components/
│   ├── enhanced-settings.tsx                          # Main settings component
│   └── settings/
│       └── general-settings.tsx                       # General tab component
├── lib/
│   ├── actions/
│   │   └── user-settings.ts                          # Server actions
│   └── db/
│       ├── schema.ts                                  # Database schema
│       ├── queries.ts                                 # Database queries
│       └── migrations/
│           └── 0007_careless_bruce_banner.sql         # User profiles migration
└── manual-user-profiles-migration.sql                # Manual migration backup
```

This implementation provides a solid foundation for a comprehensive user settings system with proper data persistence, validation, and user experience considerations.
