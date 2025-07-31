# GitHub Copilot Instructions

This document provides guidance for GitHub Copilot when working within this Turborepo monorepo project. The tech stack includes Next.js, Auth.js, Drizzle, shadcn/ui, Tailwind CSS, Tailwind Motion, Stripe, and i18n-js.

## Repository Structure

This is a monorepo managed by Turborepo with the following structure, based on the [shadcn/ui monorepo documentation](https://ui.shadcn.com/docs/monorepo):

```
.
├── apps/                      # Next.js applications
│   ├── docs/                  # Documentation site
│   ├── web/                   # Main web application
│   ├── dashboard-template/    # Dashboard template for app creation
│   ├── marketing-template/    # Marketing site template for app creation
│   ├── auth-template/         # Authentication template for app creation
│   └── ecommerce-template/    # E-commerce template for app creation
├── packages/                  # Shared packages
│   ├── ui/                    # shadcn/ui components
│   │   └── src/
│   │       ├── components/    # UI components
│   │       ├── hooks/         # React hooks
│   │       └── utils/         # Utility functions
│   ├── database-Drizzle/       # Drizzle schema and client
│   ├── auth/                  # Auth.js configuration
│   ├── stripe/                # Stripe integration and utilities
│   ├── eslint-config/         # ESLint configuration
│   ├── typescript-config/     # TypeScript configuration
│   ├── utils/                 # Shared utility functions
│   ├── types/                 # Shared TypeScript types
│   ├── validations/           # Zod validation schemas
│   └── i18n-js/               # Internationalization utilities
└── turbo.json                 # Turborepo configuration
```

## Tech Stack Details

- **Turborepo**: Used for managing the monorepo, handling dependencies between packages, and optimizing builds
- **Next.js**: React framework for building web applications
- **Auth.js**: Authentication solution for Next.js
- **Drizzle**: TypeScript ORM for database access
- **shadcn/ui**: Reusable UI components built with Radix UI and Tailwind
- **Tailwind CSS**: Utility-first CSS framework
- **Tailwind Motion**: Animation library for Tailwind CSS
- **Stripe**: Payment processing platform and subscription management
- **Zod**: TypeScript-first schema validation library
- **i18n-js**: Internationalization library for managing translations

## Templates System

Template applications are stored in the `apps` directory with a `-template` suffix. These templates can be used as a base for creating new applications.

### Available Template Applications

1. **`dashboard-template`**: Admin dashboard with authentication and data management
2. **`next-store-template`**: E-commerce application with Stripe integration

### Template Structure

Each template application follows the standard Next.js App Router structure:

```
apps/{template-name}-template/
├── app/              # Next.js app directory with routes
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── ...           # Other routes and pages
├── components/       # Application-specific components
├── lib/              # Application-specific utilities
├── public/           # Static assets
├── styles/           # Custom styles (if needed)
├── i18n/             # Localization files
├── next.config.js    # Next.js configuration
├── package.json      # Dependencies
└── tsconfig.json     # TypeScript configuration
```

## Generating Applications from Stories

When a user story is provided, use the following steps to generate a new application:

1. Identify the appropriate template based on the story requirements
2. Create a new directory in the `apps` folder
3. Copy and customize the appropriate template
4. Update dependencies in the package.json
5. Add the new application to the workspace in the root package.json
6. Create new routes, components, and database models as needed

### Story Processing Guidelines

- Analyze the story for key features and user flows
- Determine the most appropriate base template
- Identify required database models
- Plan the necessary UI components
- Map out the authentication requirements
- Structure the application routes
- Determine payment processing needs (if Stripe is required)
- Identify internationalization requirements

## Shared Packages

### UI Components (`packages/ui`)

Contains reusable shadcn/ui components that can be used across all applications.

```
packages/ui/
├── src/
│   ├── components/    # UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── hooks/         # React hooks
│   │   ├── use-media-query.ts
│   │   └── ...
│   └── utils/         # Utility functions
│       ├── cn.ts
│       └── ...
├── index.tsx       # Re-exports all components
├── package.json
└── tsconfig.json
```

### Database (`packages/database-Drizzle`)

Contains Drizzle schema and client setup for database operations.

```
packages/database-Drizzle/
├── Drizzle/
│   └── schema.Drizzle
├── src/
│   └── index.ts    # Exports Drizzle client
├── package.json
└── tsconfig.json
```

### Auth (`packages/auth`)

Contains Auth.js configuration and utilities.

```
packages/auth/
├── src/
│   ├── index.ts
│   └── auth-options.ts
├── package.json
└── tsconfig.json
```

### Stripe (`packages/stripe`)

Contains Stripe integration utilities.

```
packages/stripe/
├── src/
│   ├── index.ts
│   ├── client.ts
│   └── webhooks.ts
├── package.json
└── tsconfig.json
```

### Types (`packages/types`)

Contains shared TypeScript types.

```
packages/types/
├── src/
│   ├── index.ts
│   ├── user.ts
│   ├── product.ts
│   └── ...
├── package.json
└── tsconfig.json
```

### Validations (`packages/validations`)

Contains Zod validation schemas.

```
packages/validations/
├── src/
│   ├── index.ts
│   ├── user.ts
│   ├── product.ts
│   └── ...
├── package.json
└── tsconfig.json
```

### i18n-js (`packages/i18n-js`)

Contains internationalization utilities and shared translations.

```
packages/i18n-js/
├── src/
│   ├── index.ts
│   ├── translations/
│   │   ├── en.json
│   │   ├── es.json
│   │   └── ...
│   └── utils.ts
├── package.json
└── tsconfig.json
```

### Configuration Packages

#### TypeScript Config (`packages/typescript-config`)

```
packages/typescript-config/
├── base.json       # Base tsconfig for all packages
├── nextjs.json     # Next.js specific configuration
├── react-library.json  # Configuration for React libraries
└── package.json
```

#### ESLint Config (`packages/eslint-config`)

```
packages/eslint-config/
├── index.js        # Base ESLint configuration
├── next.js         # Next.js specific rules
├── react.js        # React specific rules
└── package.json
```

## Common Code Patterns

### API Routes with Drizzle

```typescript
import { Drizzle } from '@workspace/database-Drizzle';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const items = await Drizzle.item.findMany();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const data = await request.json();
  const newItem = await Drizzle.item.create({ data });
  return NextResponse.json(newItem);
}
```

### Authentication with Auth.js

```typescript
import { auth } from '@workspace/auth';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/login', nextUrl));
  }

  return null;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Shadcn/UI Component Usage

```tsx
import { Button } from '@workspace/ui/src/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/src/components/card';

export function FeatureCard({ title, description, onClick }) {
  return (
    <Card className='hover:shadow-lg transition-shadow'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
        <Button onClick={onClick} className='mt-4'>
          Learn More
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Shadcn/UI Component Usage

```tsx
import { Button } from '@workspace/ui/src/components/button';
import { ArrowRight } from 'lucide-react';

export function FeatureCard({ title, description, onClick }) {
  return (
    <Button onClick={onCLick}>
      <ArrowRight className='w-4 h-4 ml-2' aria-hidden='true' />
    </Button>
  );
}
```

### Using UI Hooks

```tsx
import { useMediaQuery } from '@workspace/ui/src/hooks/use-media-query';

export function ResponsiveComponent() {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return <div>{isDesktop ? <p>Desktop view</p> : <p>Mobile view</p>}</div>;
}
```

### Tailwind Motion Animation

```tsx
import { motion } from 'tailwind-motion';

export function AnimatedHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='text-center p-12'
    >
      <h1 className='text-4xl font-bold'>Welcome to Our Platform</h1>
    </motion.div>
  );
}
```

### Using Zod Validation

```typescript
import { userSchema } from '@workspace/validations/src/user';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = userSchema.parse(body);

    // Process valid data
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
  }
}
```

### i18n-js Integration

```tsx
// Using translations in a component
import { useTranslation } from '@workspace/i18n-js';

export function WelcomeMessage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.description')}</p>
    </div>
  );
}
```

```tsx
// Always use Dialog component  instead of alert browser api
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DialogCloseButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Share</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue="https://ui.shadcn.com/docs/installation"
              readOnly
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Stripe Integration

```typescript
// Server-side Stripe API handler
import { stripe } from '@workspace/stripe';
import { NextResponse } from 'next/server';
import { auth } from '@workspace/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { priceId } = await request.json();

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/canceled`,
      customer_email: session.user.email,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response('Error creating checkout session', { status: 500 });
  }
}
```

```tsx
// Client-side Stripe Checkout button
'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/src/components/button';

export function CheckoutButton({ priceId }: { priceId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Subscribe Now'}
    </Button>
  );
}
```

## Database Schema

The base Drizzle schema is defined in `packages/database-Drizzle/Drizzle/schema.Drizzle`. When creating new applications, extend this schema with application-specific models.

```ts
// Base User model from packages/database-Drizzle/src/schema.ts
import { pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  stripeCustomerId: text("stripe_customer_id"),
}, (users) => ({
  emailIndex: uniqueIndex("email_idx").on(users.email),
}));

// Stripe related models
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id, { onDelete: "cascade" }),
  stripeSubscriptionId: text("stripe_subscription_id").notNull(),
  stripePriceId: text("stripe_price_id").notNull(),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),
  stripeCreatedAt: timestamp("stripe_created_at").defaultNow(),
  stripeStatus: text("stripe_status"),
  canceled: text("canceled").default("false"),
});

// Example of extending with app-specific models
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  stripePriceId: text("stripe_price_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
```

## Creating a New App from Template

To create a new application based on a template:

1. Copy the template directory from `apps/{template-name}-template` to `apps/{new-app-name}`
2. Update the package name in the new app's package.json
3. Add the new application to workspaces in the root package.json
4. Install dependencies and start developing

Example script for creating a new app:

```bash
# Create a new app from a template
pnpm run create-app --name my-new-app --template dashboard
```

## Common Tasks

### Running Development Servers

```bash
# Run all applications
pnpm run dev

# Run a specific application
pnpm run dev --filter=@workspace/web
```

```bash
# Run a specific application
cd apps/{{app-name}}; pnpm dev
```

### Building Applications

```bash
# Build all applications
pnpm run build

# Build a specific application
pnpm run build --filter=@workspace/web
```

### Adding a New shadcn/ui Component

To add components to your project, you need to run the shadcn CLI within the specific app directory:

```bash
# Navigate to the application directory
cd apps/web

# Add a new component (using shadcn CLI)
pnpm dlx shadcn@canary add [COMPONENT]
```

### Adding a New Translation

```bash
# Add a new translation key
# 1. Add the key to the main translation file
echo '{"newKey": "New translation content"}' >> packages/i18n-js/src/translations/en.json

# 2. Add translations for other languages
echo '{"newKey": "Nuevo contenido de traducción"}' >> packages/i18n-js/src/translations/es.json
```

# Monorepo Development Guidelines

## Monorepo Management: Turborepo

This project uses Turborepo for monorepo management. Follow these guidelines:

- Use Turborepo pipelines defined in `turbo.json` for task orchestration
- Configure remote caching for optimal build performance
- Use `--filter` flag for targeted builds and tests
- Implement proper task dependencies for reliable builds

## Repository Structure

This monorepo follows the pattern: `packages/* ; apps/* ;`

**Structure Guidelines:**

- Maintain consistent naming conventions across all workspaces
- Use clear package boundaries to avoid circular dependencies
- Place shared code in dedicated utility packages
- Follow the established folder structure for new additions

## Programming Language: TypeScript

**TypeScript Best Practices:**

- Use strict TypeScript configuration with `"strict": true`
- Prefer interfaces over type aliases for object shapes
- Use explicit return types for all public functions
- Avoid `any` type - use `unknown` or proper typing instead
- Use utility types (Pick, Omit, Partial) for type transformations
- Implement proper null/undefined checking

## Framework: Next.js

**Next.js Development Guidelines:**

- Use App Router (app directory) for new features and pages
- Implement proper SEO with the metadata API
- Use Server Components by default, Client Components when necessary
- Follow Next.js performance best practices and caching strategies
- Implement proper loading states and error pages
- Use Next.js API routes for backend functionality

## Framework: React

**React Development Guidelines:**

- Emphasize modularity by breaking down the UI into smaller, reusable components
- Avoid creating large, monolithic components; split them into smaller components if they handle multiple responsibilities
- Avoid hardcoding values; use constants with naming conventions like SOME_LIST or SOME_CONSTANT
- Define all string literals as constants (e.g., const PRODUCT = "product") to ensure consistency and maintainability
- Use functional components with hooks for state and lifecycle management
- Follow React performance best practices, such as memoization (React.memo, useMemo, useCallback) where applicable
- Implement proper error boundaries to handle unexpected errors gracefully
- Use context for global state when necessary
- Ensure components are accessible (ARIA-compliant) and follow best practices for accessibility
- Write unit tests for components using tools like React Testing Library or Jest
- Use PropTypes or TypeScript for type checking and enforcing component prop contracts
- Maintain a consistent folder structure for components, hooks, and utilities
- Ensure each component has a single responsibility and adheres to the "Separation of Concerns" principle.

## Code Style: Clean Code

**Clean Code Principles:**

- Write self-documenting code with meaningful names
- Keep functions small and focused on a single responsibility
- Avoid deep nesting and complex conditional statements
- Use consistent formatting and indentation
- Write code that tells a story and is easy to understand
- Refactor ruthlessly to eliminate code smells

## AI Code Generation Preferences

When generating code, please:

- Generate complete, working code examples with proper imports
- Include inline comments for complex logic and business rules
- Follow the established patterns and conventions in this project
- Suggest improvements and alternative approaches when relevant
- Consider performance, security, and maintainability
- Include error handling and edge case considerations
- Generate appropriate unit tests when creating new functions
- Follow accessibility best practices for UI components
- Use semantic HTML and proper ARIA attributes when applicable
