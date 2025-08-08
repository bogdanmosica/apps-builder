# shadcn/ui in Turborepo Monorepo

---
applyTo: 'apps/**'
---

# shadcn/ui Best Practices for Monorepo LLMs (2025)

_Last updated: January 2025_

This document outlines best practices for using shadcn/ui components in a Turborepo monorepo environment. It covers installation, configuration, usage patterns, and maintenance strategies specific to this architectural setup.

---

## 1. Monorepo Architecture Overview

In this Turborepo setup, shadcn/ui is configured as a **shared package** (`@workspace/ui`) that serves all applications:

```
apps-builder/
├── packages/
│   └── ui/                          # Centralized shadcn/ui package
│       ├── components.json          # shadcn/ui configuration
│       ├── src/
│       │   ├── components/          # All shadcn/ui components
│       │   ├── lib/utils.ts         # cn() utility function
│       │   └── styles/globals.css   # Base Tailwind styles
│       └── package.json
└── apps/
    ├── asset-evaluation/            # App consuming @workspace/ui
    ├── sass-starter/                # App consuming @workspace/ui
    └── web/                         # App consuming @workspace/ui
```

**Key Benefits:**
- ✅ **Single source of truth** for UI components
- ✅ **Consistent design system** across all apps
- ✅ **Centralized maintenance** and updates
- ✅ **Type safety** with shared TypeScript definitions

---

## 2. Package Configuration

### 2.1. Central UI Package (`packages/ui/`)

The `@workspace/ui` package serves as the central repository for all shadcn/ui components.

#### Key Files:

**`packages/ui/components.json`:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@workspace/ui/components",
    "utils": "@workspace/ui/lib/utils",
    "hooks": "@workspace/ui/hooks",
    "lib": "@workspace/ui/lib",
    "ui": "@workspace/ui/components",
    "sections": "@workspace/ui/sections"
  }
}
```

**`packages/ui/package.json` (Key Dependencies):**
```json
{
  "name": "@workspace/ui",
  "dependencies": {
    "@radix-ui/react-*": "^1.x.x",        // Radix UI primitives
    "class-variance-authority": "^0.7.1",  // CVA for variant handling
    "clsx": "^2.1.1",                      // Conditional classnames
    "lucide-react": "^0.511.0",            // Icon library
    "tailwind-merge": "^3.0.1"             // Tailwind class merging
  },
  "exports": {
    "./components/*": "./src/components/*.tsx",
    "./globals.css": "./src/styles/globals.css",
    "./hooks/*": "./src/hooks/*.ts",
    "./lib/*": "./src/lib/*.ts",
    "./sections/*": "./src/sections/*.tsx"
  }
}
```

**`packages/ui/src/lib/utils.ts`:**
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 2.2. App-Level Configuration

Each app has its own `components.json` that points to the shared `@workspace/ui` package.

#### Standard App Configuration:

**`apps/{app-name}/components.json`:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../../packages/ui/src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@workspace/ui/components",
    "utils": "@workspace/ui/lib/utils",
    "hooks": "@workspace/ui/hooks",
    "lib": "@workspace/ui/lib",
    "ui": "@workspace/ui/components",
    "sections": "@workspace/ui/sections"
  }
}
```

**Key Points:**
- ✅ CSS path points to shared package: `../../packages/ui/src/styles/globals.css`
- ✅ All aliases point to `@workspace/ui/*` paths
- ✅ Consistent configuration across all apps

---

## 3. Adding New Components

### 3.1. Installation Process

**IMPORTANT:** Always install components from the **UI package directory**, not from individual apps.

```bash
# Navigate to the UI package
cd packages/ui

# Install a new shadcn/ui component
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add dialog

# Verify the component was added
ls src/components/
```

### 3.2. Component Structure

After installation, components follow this structure:

```typescript
// packages/ui/src/components/button.tsx
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@workspace/ui/lib/utils";  // Uses workspace alias
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
        // ... other variants
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        // ... other sizes
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### 3.3. Verification Steps

After adding a component:

1. **Check Import Paths**: Ensure all internal imports use `@workspace/ui/*`
2. **Test in Apps**: Verify the component works in consumer apps
3. **TypeScript**: Confirm no type errors across the monorepo

---

## 4. Usage Patterns in Apps

### 4.1. Basic Component Import

```typescript
// In any app: apps/{app-name}/components/MyComponent.tsx
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";

export default function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmation</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to proceed?</p>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
```

### 4.2. Form Components Pattern

```typescript
// apps/{app-name}/components/forms/CreateUserForm.tsx
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";

export default function CreateUserForm() {
  return (
    <form className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Enter your name" />
      </div>
      
      <div>
        <Label htmlFor="role">Role</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" placeholder="Tell us about yourself" />
      </div>

      <Button type="submit">Create User</Button>
    </form>
  );
}
```

### 4.3. Data Display Pattern

```typescript
// apps/{app-name}/components/data/UserTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
}

export default function UserTable({ users }: { users: User[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <Badge variant={user.status === "active" ? "default" : "secondary"}>
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### 4.4. Advanced Composition Pattern

```typescript
// apps/{app-name}/components/dashboard/MetricsCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Badge } from "@workspace/ui/components/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string;
  description: string;
  progress?: number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export default function MetricsCard({
  title,
  value,
  description,
  progress,
  trend,
  trendValue
}: MetricsCardProps) {
  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus
  }[trend || "neutral"];

  const trendColor = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-500"
  }[trend || "neutral"];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {trend && (
          <Badge variant="outline" className={trendColor}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {trendValue}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription className="text-xs text-muted-foreground">
          {description}
        </CardDescription>
        {progress !== undefined && (
          <Progress value={progress} className="mt-2" />
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 5. Customization & Theming

### 5.1. Design System Integration

The monorepo uses a consistent design system with custom colors:

**Primary Colors (from CLAUDE.md):**
```css
/* packages/ui/src/styles/globals.css */
:root {
  --primary: 14 86% 56%;        /* #FF6B00 - Energetic orange */
  --secondary: 190 70% 48%;     /* #1CA8DD - Vivid teal */
}
```

### 5.2. Component Variant Extension

To add custom variants to existing components:

```typescript
// packages/ui/src/components/button.tsx
const buttonVariants = cva(
  // ... base classes
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        // Add custom project-specific variants
        "asset-primary": "bg-[#FF6B00] text-white shadow-xs hover:bg-[#FF6B00]/90",
        "asset-secondary": "bg-[#1CA8DD] text-white shadow-xs hover:bg-[#1CA8DD]/90",
        // ... other variants
      },
      // ... other variant groups
    }
  }
);
```

### 5.3. Creating Composite Components

For project-specific component combinations:

```typescript
// packages/ui/src/components/asset-evaluation-card.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Progress } from "./progress";

export interface AssetEvaluationCardProps {
  title: string;
  progress: number;
  description: string;
  onContinue: () => void;
}

export function AssetEvaluationCard({
  title,
  progress,
  description,
  onContinue
}: AssetEvaluationCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <Button 
          variant="asset-primary" 
          className="w-full"
          onClick={onContinue}
        >
          Continue Evaluation
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## 6. Development Workflow

### 6.1. Adding Components Workflow

1. **Navigate to UI package:**
   ```bash
   cd packages/ui
   ```

2. **Install component:**
   ```bash
   pnpm dlx shadcn@latest add [component-name]
   ```

3. **Verify installation:**
   ```bash
   # Check component was created
   ls src/components/[component-name].tsx
   
   # Check imports use workspace aliases
   grep -n "@workspace/ui" src/components/[component-name].tsx
   ```

4. **Test in consuming apps:**
   ```bash
   # Navigate to an app
   cd ../../apps/asset-evaluation
   
   # Run dev server to test
   pnpm dev
   ```

5. **Update types if needed:**
   ```bash
   # Run type check across monorepo
   cd ../..
   pnpm build
   ```

### 6.2. Component Updates

When updating existing components:

1. **Always update in the UI package** (`packages/ui/src/components/`)
2. **Never modify shadcn/ui components directly in app folders**
3. **Test changes across all consuming apps**
4. **Run type checking**: `pnpm build` from root

### 6.3. Version Management

```bash
# Update shadcn/ui to latest version
cd packages/ui
pnpm dlx shadcn@latest update

# Update specific components
pnpm dlx shadcn@latest update button card dialog
```

---

## 7. Troubleshooting

### 7.1. Common Issues

**Issue: Component not found**
```
Cannot resolve '@workspace/ui/components/button'
```
**Solution:**
1. Verify component exists in `packages/ui/src/components/`
2. Check `packages/ui/package.json` exports
3. Ensure workspace dependency is installed in consuming app

**Issue: Styles not applied**
```
Components render but have no styling
```
**Solution:**
1. Verify CSS import in app: `import "@workspace/ui/globals.css"`
2. Check Tailwind configuration includes UI package paths
3. Ensure `components.json` CSS path is correct

**Issue: TypeScript errors**
```
Type 'ButtonProps' is not assignable to type...
```
**Solution:**
1. Run `pnpm build` from root to regenerate types
2. Check component export/import paths
3. Verify workspace dependencies are up to date

### 7.2. Debugging Steps

```bash
# 1. Check workspace dependencies
pnpm ls @workspace/ui

# 2. Verify component structure
ls packages/ui/src/components/

# 3. Test component imports
cd apps/[app-name]
node -e "console.log(require.resolve('@workspace/ui/components/button'))"

# 4. Check build process
pnpm build --filter=@workspace/ui

# 5. Validate TypeScript
pnpm type-check
```

---

## 8. Best Practices Summary

### 8.1. DO's ✅

- **Always install components in `packages/ui/`**
- **Use consistent workspace aliases** (`@workspace/ui/*`)
- **Keep components pure and reusable** across apps
- **Follow naming conventions** (`PascalCase` for components)
- **Test changes across all consuming apps**
- **Use TypeScript** for all component definitions
- **Follow design system colors** and spacing
- **Document custom variants** and composite components

### 8.2. DON'Ts ❌

- **Never install shadcn/ui components directly in apps**
- **Don't modify shadcn/ui components in app-specific folders**
- **Avoid hardcoding colors** - use design system variables
- **Don't create duplicate components** across apps
- **Never commit temporary or example components**
- **Don't skip type checking** after component updates
- **Avoid mixing UI logic with business logic**

### 8.3. Performance Considerations

- **Tree-shaking**: Import only needed components
- **Bundle size**: Monitor with `pnpm dlx @next/bundle-analyzer`
- **CSS-in-JS**: Use Tailwind classes, avoid runtime styling
- **Loading states**: Implement Suspense boundaries for data-dependent components

---

## 9. Migration Strategies

### 9.1. From Individual shadcn/ui Installations

If apps previously had individual shadcn/ui installations:

```bash
# 1. Remove app-specific shadcn/ui components
rm -rf apps/*/components/ui/

# 2. Update imports in app components
# Change: from "./ui/button" 
# To: from "@workspace/ui/components/button"

# 3. Remove app-specific shadcn/ui dependencies
# Remove from apps/*/package.json:
# - @radix-ui/* packages
# - class-variance-authority
# - clsx, tailwind-merge

# 4. Ensure workspace dependency exists
# Add to apps/*/package.json:
# "@workspace/ui": "workspace:*"
```

### 9.2. Component Consolidation

When consolidating components:

```typescript
// Before (app-specific):
// apps/app1/components/ui/button.tsx
// apps/app2/components/ui/button.tsx (slightly different)

// After (consolidated):
// packages/ui/src/components/button.tsx (single source)

// Migration process:
// 1. Compare app-specific variations
// 2. Create comprehensive variant system
// 3. Add necessary customization options
// 4. Update all consuming components
```

---

## 10. Resources & References

### 10.1. Official Documentation
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

### 10.2. Turborepo Integration
- [Turborepo Documentation](https://turbo.build/repo)
- [Workspace Dependencies](https://pnpm.io/workspaces)

### 10.3. Internal Resources
- `CLAUDE.md` - Project-specific design system and colors
- `.github/instructions/nextjs-best-practices.instructions.md` - Next.js patterns
- `.github/instructions/reactjs-best-practices.instructions.md` - React patterns
- `.github/instructions/nextjs-tailwind.instructions.md` - Tailwind integration

---

**This guide ensures consistent, maintainable, and scalable use of shadcn/ui across the entire monorepo while providing clear patterns for development teams and LLMs.**