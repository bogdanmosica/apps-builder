---
applyTo: '**'
---

# GitHub Copilot Instructions

This document provides guidance for GitHub Copilot when working within this Turborepo monorepo project.

# Project Overview & Architecture

For comprehensive project improvement guidelines, see [Project Improvement Guide](./.github/instructions/project-improvement.instructions.md).

## Tech Stack

- **Next.js 15+** with App Router
- **TypeScript** with strict mode
- **shadcn/ui** for UI components
- **Tailwind CSS 4+** for styling
- **Drizzle** for database ORM
- **Auth.js** for authentication
- **React Query** for client-side data fetching

## Instruction Files

## Framework & Technology Guidelines

Follow the detailed guidelines in these instruction files:

### Core Frameworks
- [Next.js Best Practices](./.github/instructions/nextjs-best-practices.instructions.md) - App Router, Server Actions, API routes
- [React.js Best Practices](./.github/instructions/reactjs-best-practices.instructions.md) - Component patterns, hooks, state management
- [React Query Best Practices](./.github/instructions/reactquery-best-practices.instructions.md) - Data fetching, caching, mutations

### UI & Styling
- [Tailwind & shadcn/ui Guide](./.github/instructions/tailwind-shadcn.instructions.md) - Styling patterns, component usage
- [shadcn/ui Monorepo Setup](./.github/instructions/shadcn-ui.instructions.md) - Complete monorepo integration guide

### Monorepo Management
- [Turborepo Code Generation](./.github/instructions/turbo-monorepo.instructions.md) - Generators, workspace patterns

## Apps - Follow the detailed guidelines in these instruction files:
- [Asset Evaluation App Rules](./.github/instructions/projects/asset-evaluation.instructions.md)

## Templates System

Template applications are stored in the `apps` directory with a `-template` suffix. These templates can be used as a base for creating new applications.

### Available Template Applications

1. **`next-store-template`**: E-commerce application with Stripe integration

## Shared Packages Usage

### UI Components (`packages/ui`)
```tsx
import { Button } from '@workspace/ui/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
```

### Types (`packages/types`)
```typescript
import { User } from '@workspace/types';
```

### Validations (`packages/validations`)
```typescript
import { userSchema } from '@workspace/validations';
```

## Common Tasks

### Running Development Servers
```bash
# Run a specific application
cd apps/{app-name}
pnpm dev
```

### Adding shadcn/ui Components
```bash
# Navigate to the application directory
cd apps/{app-name}

# Add a new component
pnpm dlx shadcn@latest add [COMPONENT]
```

## File Creation Guidelines

### Create Only Necessary Files
- **Production-focused**: Only create files that are explicitly requested or essential for the functionality being implemented
- **No demo/example files**: Do not create example files (like `ModalExample.tsx`, `TestComponent.tsx`, etc.) unless specifically requested by the user
- **Clean repository**: Keep the codebase focused on actual application needs, not demonstrations

### Testing and Cleanup
- **Temporary files**: If creating files for testing purposes, always remove them after testing is complete
- **Test artifacts**: Clean up any temporary configuration files, test data, or debugging files created during development
- **Revert changes**: If testing requires modifying existing files, revert changes that are not part of the final solution

### File Creation Best Practices
- **Purpose-driven**: Every file should serve a specific, documented purpose in the application
- **Location matters**: Place files in the correct directories according to the project structure
- **Naming consistency**: Follow established naming conventions for the project
- **Dependencies**: Only add necessary dependencies to package.json files

### When Testing is Required
1. **Create minimal test files** only when necessary
2. **Use descriptive names** that clearly indicate they are temporary (e.g., `temp-test-component.tsx`)
3. **Document test purpose** in comments if the file needs to remain temporarily
4. **Always clean up** - Remove test files after verification is complete
5. **Commit clean state** - Ensure final commits don't include test artifacts


# ✅ Implementation & Testing Checklist

Before any feature, component, or page is considered **done**, the following must be reviewed and verified:

---

### 🧪 Basic Functionality
- [ ] Component/page renders without crashing
- [ ] Handles valid input correctly
- [ ] Fails gracefully with missing or invalid input
- [ ] Shows appropriate fallback UI (e.g., "No data available")
- [ ] Includes a reasonable mix of **unit, integration, and E2E tests** (max. 10 test cases per feature)

---

### 🧼 Console & Debugging
- [ ] No client-side console warnings or errors
- [ ] On API routes, use `console.error()` if needed — no unintentional logs
- [ ] All temporary `console.log()` calls are removed unless explicitly required

---

### 📱 Responsiveness & Accessibility
- [ ] Fully responsive — looks good on both desktop and mobile
- [ ] Elements are readable and touch-friendly on small screens
- [ ] UI is accessible and visually clear (for real human users)
- [ ] Follow basic a11y practices (labels, alt text, contrast, etc.)

---

### 📂 File & Data Handling
- [ ] Upload components validate accepted file types and sizes
- [ ] Invalid or unsupported files are gracefully rejected with feedback
- [ ] All API integrations include handling for:
- [ ] Loading states
- [ ] Success messages or transitions
- [ ] Error states and fallback behavior

---

### 🧪 Testing & QA
- [ ] Feature is testable via `apps/{app_name}` using `pnpm dev`
- [ ] Only run `pnpm dev` if port `3000` is available — otherwise restart the server
- [ ] Feature is tested **locally** before committing or requesting review
- [ ] Code submitted is **tested and cleaned**, not pasted from AI without validation

---

### 🧠 AI Usage Notes
- [ ] If using ChatGPT, Claude, or Copilot: review and adapt the output to match the project’s code style and expectations
- [ ] Validate all AI-generated code with this checklist before marking it as complete



