# Claude AI Project Instructions

## Repository Context
This is a **Turborepo monorepo** with Next.js apps and shared packages. This file provides Claude-specific guidance for working within this codebase.

## 📁 Repository Structure

```
apps-builder/
├── apps/                          # Next.js applications
│   ├── asset-evaluation/          # Asset evaluation app (PRIMARY)
│   ├── house-evaluation-test/     # House evaluation testing app
│   ├── next-store-template/       # E-commerce template
│   ├── sass-starter/              # SaaS starter template
│   └── web/                       # Main web application
├── packages/                      # Shared packages
│   ├── ui/                        # shadcn/ui components
│   ├── next-auth/                 # Auth.js configuration  
│   ├── types/                     # Shared TypeScript types
│   ├── utils/                     # Shared utility functions
│   ├── validations/               # Zod validation schemas
│   └── typescript-config/         # TypeScript configuration
└── .github/instructions/          # Detailed coding guidelines
```

## 🛠️ Tech Stack

- **Next.js 15+** with App Router
- **TypeScript** with strict mode  
- **shadcn/ui** for UI components
- **Tailwind CSS 4+** for styling
- **Drizzle ORM** (asset-evaluation)
- **Auth.js** for authentication
- **React Query** for client-side data fetching
- **Turborepo** for monorepo management

## 📚 Essential Instructions

**ALWAYS** follow the detailed guidelines in these instruction files:
- `.github/copilot-instructions.md` - General patterns;
- `.github/instructions/nextjs-best-practices.instructions.md` - Next.js patterns, Server Actions, App Router
- `.github/instructions/reactjs-best-practices.instructions.md` - React components, hooks, patterns  
- `.github/instructions/reactquery-best-practices.instructions.md` - Data fetching, caching
- `.github/instructions/nextjs-tailwind.instructions.md` - Styling patterns
- `.github/instructions/turbo-monorepo.instructions.md` - Turborepo workflows

**Projects**
- `.github/instructions/projects/asset-evaluation.instructions.md` - Asset evaluation app specific rules

## 🎯 Primary Focus: Asset Evaluation App

### Design System
- **Primary Color**: `#FF6B00` (energetic orange) for CTAs and highlights
- **Secondary Color**: `#1CA8DD` (vivid teal) for accents
- **Mobile-first approach** with touch-friendly targets
- **Gamification elements** with progress tracking and celebrations

### Key Features
- Property evaluation wizard with dynamic questions
- Multi-user collaboration (invite family/friends)
- Offline-aware functionality with sync indicators
- Database seeding with `seed.ts` only (no separate migration files)

## 💻 Workspace Dependencies

Always use standardized workspace dependencies:

```json
{
  "dependencies": {
    "@workspace/types": "workspace:*",
    "@workspace/ui": "workspace:*", 
    "@workspace/utils": "workspace:*",
    "@workspace/validations": "workspace:*",
    "@workspace/next-auth": "workspace:*"
  }
}
```

### Usage Examples

```tsx
// UI Components
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

// Types and Validations  
import { User, Product } from '@workspace/types';
import { userSchema } from '@workspace/validations';

// Database (varies by app)
import { db } from './lib/db/drizzle'; // Asset evaluation app
```

## 🚀 Development Workflow

### Server Actions (Next.js 15)
- Place in `app/actions/{action-name}.ts`
- Use `"use server"` at file top
- One function per file for clarity
- Always validate input with Zod schemas

```tsx
// app/actions/create-user.ts  
'use server'
import { userSchema } from '@workspace/validations';

export async function createUser(data: unknown) {
  const validatedData = userSchema.parse(data);
  // Implementation...
}
```

### Components
- Use functional components with hooks
- Keep components small and single-responsibility  
- Use TypeScript interfaces over type aliases
- No hardcoded values - use constants
- Self-documenting code with meaningful names

### Database (Asset Evaluation)
- Extend Drizzle schema in `lib/db/schema.ts`
- Use proper foreign key relationships
- Follow established naming conventions
- Seed data via `lib/db/seed.ts` only

## 🧪 Quality Standards

### Before Any Feature is Complete:
- ✅ Renders without errors/warnings
- ✅ Handles invalid input gracefully  
- ✅ Responsive on desktop and mobile
- ✅ Accessible (labels, contrast, etc.)
- ✅ Loading states for async operations
- ✅ Error states with helpful feedback
- ✅ Remove all `console.log()` debugging
- ✅ Test locally with `pnpm dev`

### File Creation Rules
- **Production-focused**: Only create necessary files
- **No example files**: Avoid `TestComponent.tsx`, `ModalExample.tsx` unless specifically requested
- **Clean up**: Remove temporary/debug files after testing
- **Purposeful**: Every file serves a documented purpose

## 🎮 Gamification & UX
- Celebrate milestones with animations (confetti, progress bars)
- Use Lucide icons for visual clarity
- Immediate feedback on user interactions
- "Pending Sync" indicators for offline functionality
- Touch-friendly mobile interface

## 🔧 Common Commands

```bash
# Run specific app in development
cd apps/asset-evaluation
pnpm dev

# Add shadcn/ui component  
cd apps/asset-evaluation
pnpm dlx shadcn@latest add button

# Database operations (asset-evaluation)
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed database
pnpm db:studio    # Open Drizzle Studio
```

## 📋 Quick Reference

- **Primary app**: `apps/asset-evaluation` 
- **UI components**: `@workspace/ui/components/*`
- **Database**: Drizzle ORM in asset-evaluation, Prisma elsewhere
- **Auth**: Auth.js with `@workspace/next-auth`
- **Styling**: Tailwind CSS with design system colors
- **State**: React Query for client-side data fetching
- **Forms**: React Hook Form with Zod validation

---

*Follow this guidance for consistent, high-quality code that aligns with the project's architecture and design system.*