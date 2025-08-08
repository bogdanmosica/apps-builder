---
description: 'Tailwind CSS and shadcn/ui integration patterns'
applyTo: 'apps/**/*.tsx, apps/**/*.jsx, apps/**/*.css, apps/**/*.scss'
---

# Tailwind CSS & shadcn/ui Integration Guide

Instructions for implementing consistent styling with Tailwind CSS and shadcn/ui components in the monorepo environment.

## Required Setup

### 1. Layout Files Configuration

In every main `layout.tsx` file, **always include these lines at the very top and in this order:**

```tsx
// IMPORTANT: KEEP THESE LINES IN THIS ORDER
import "@workspace/ui/globals.css";
import "./globals.css";
```

The first import is critical for the `packages/ui` folder to work correctly and ensures proper CSS layer ordering.

### 2. Components.json Configuration  

Ensure a `components.json` file exists in each app root with proper workspace aliases:

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

### 3. TypeScript Path Aliases

Ensure your `tsconfig.json` includes the following paths for proper aliasing:

```jsonc
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@workspace/ui/*": ["../../packages/ui/src/*"]
    }
  }
}
```

## Tailwind CSS Best Practices

### Design System Integration

Use the established design system colors from the project:

```css
/* Primary Colors */
:root {
  --primary: 14 86% 56%;        /* #FF6B00 - Energetic orange */
  --secondary: 190 70% 48%;     /* #1CA8DD - Vivid teal */
}
```

### Component Styling Patterns

#### 1. Consistent Spacing System
```tsx
// Use consistent spacing scales
<div className="p-4 md:p-6 lg:p-8">
  <div className="space-y-4">
    <h1 className="text-2xl font-bold">Title</h1>
    <p className="text-muted-foreground">Description</p>
  </div>
</div>
```

#### 2. Responsive Design Patterns
```tsx
// Mobile-first responsive approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card className="p-4">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg md:text-xl">Card Title</CardTitle>
    </CardHeader>
  </Card>
</div>
```

#### 3. Interactive State Patterns
```tsx
// Consistent hover and focus states
<Button 
  className="transition-all hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
  variant="default"
>
  Action Button
</Button>
```

## shadcn/ui Component Usage

### Standard Import Pattern

```tsx
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
```

### Component Composition Patterns

#### Form Components
```tsx
export function ContactForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="your@email.com" />
        </div>
        <Button className="w-full">Submit</Button>
      </CardContent>
    </Card>
  );
}
```

#### Data Display Components
```tsx
export function StatsCard({ title, value, change }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {change > 0 ? '+' : ''}{change}% from last month
        </p>
      </CardContent>
    </Card>
  );
}
```

### Customization Patterns

#### Extending Component Variants
```tsx
// Create app-specific button variants
const customButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        "asset-primary": "bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90",
        "asset-secondary": "bg-[#1CA8DD] text-white hover:bg-[#1CA8DD]/90",
      }
    }
  }
);
```

#### Utility Class Combinations
```tsx
// Common utility combinations for consistent styling
const cardStyles = "rounded-lg border bg-card text-card-foreground shadow-sm";
const inputStyles = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2";
const buttonStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors";
```

## Theme Configuration

### CSS Variable Approach
```css
/* Use CSS variables for themeable properties */
.custom-component {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-radius: var(--radius);
}
```

### Dark Mode Implementation
```tsx
// Use Tailwind's dark mode utilities
<div className="bg-white dark:bg-gray-900">
  <h1 className="text-gray-900 dark:text-gray-100">
    Title that adapts to theme
  </h1>
</div>
```

## Performance Considerations

### CSS Optimization
- Use Tailwind's purge configuration to remove unused styles
- Leverage CSS custom properties for dynamic theming
- Minimize custom CSS in favor of Tailwind utilities

### Bundle Size Management
- Import only needed shadcn/ui components
- Use tree-shaking friendly import patterns
- Monitor bundle size with build analyzers

## Common Patterns

### Loading States
```tsx
<Card className="animate-pulse">
  <CardHeader>
    <div className="h-4 bg-muted rounded w-3/4"></div>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="h-3 bg-muted rounded"></div>
      <div className="h-3 bg-muted rounded w-5/6"></div>
    </div>
  </CardContent>
</Card>
```

### Error States
```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Something went wrong. Please try again.
  </AlertDescription>
</Alert>
```

### Success States
```tsx
<Alert className="border-green-500 text-green-700">
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>
    Your changes have been saved.
  </AlertDescription>
</Alert>
```

## Accessibility Integration

### Focus Management
```tsx
// Ensure proper focus indicators
<Button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Accessible Button
</Button>
```

### Semantic HTML with Styling
```tsx
// Combine semantic HTML with Tailwind classes
<main className="container mx-auto px-4 py-8">
  <section className="space-y-6">
    <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
    <p className="text-lg text-muted-foreground leading-7">
      Description with proper contrast and readability.
    </p>
  </section>
</main>
```

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [shadcn/ui Monorepo Guide](./shadcn-ui.instructions.md) - Detailed implementation for this monorepo
- [React Best Practices](./reactjs-best-practices.instructions.md) - Component development patterns