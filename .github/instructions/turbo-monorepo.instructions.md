# Turborepo Code Generation Guide

Comprehensive guide for using Turborepo's code generation features to automate the creation of apps, packages, components, and custom scaffolding in your monorepo.

## Table of Contents
1. [Overview](#overview)
2. [Built-in Generators](#built-in-generators)
3. [Custom Generators](#custom-generators)
4. [Best Practices](#best-practices)
5. [Integration with MCP](#integration-with-mcp)
6. [Advanced Patterns](#advanced-patterns)
7. [Troubleshooting](#troubleshooting)

## Overview

Turborepo's code generation system helps you:
- **Maintain consistency** across packages and apps
- **Speed up development** by automating repetitive tasks
- **Enforce standards** through template-based generation
- **Scale your monorepo** with standardized structure

### Key Features
- **Built-in generators** for common tasks (add empty packages, copy existing ones)
- **Custom generators** powered by Plop.js
- **TypeScript support** with zero configuration
- **Workspace-aware** execution from anywhere in your repo
- **Template inheritance** from local or remote sources

## Built-in Generators

### 1. Add Empty Package

Create a new, empty app or package in your monorepo:

```bash
turbo gen workspace
```

**Interactive prompts will ask for:**
- Package name
- Package type (app or package)
- Dependencies to include
- Location within monorepo

**Example output structure:**
```
packages/new-package/
├── package.json
├── tsconfig.json
├── src/
│   └── index.ts
└── README.md
```

### 2. Copy Existing Package

Copy from an existing workspace in your repo or from a remote repository:

#### Copy from Local Workspace
```bash
turbo gen workspace --copy
```

Select an existing package from your monorepo as a template.

#### Copy from Remote Source
```bash
turbo gen workspace --copy https://github.com/vercel/turborepo/tree/main/examples/with-tailwind/packages/tailwind-config
```

**Benefits:**
- Inherits structure, dependencies, and configuration
- Maintains consistency with existing patterns
- Speeds up package creation

**Note:** Remote sources may require manual dependency adjustments.

## Custom Generators

### Getting Started

Create custom generators using Plop.js configurations:

```bash
turbo gen
```

This will prompt you to:
1. Select an existing generator, or
2. Create a new one if none exist

### Generator Configuration Locations

Generators can be placed in multiple locations:

```
apps/
├── docs/
│   └── turbo/generators/     # App-specific generators
└── web/
    └── turbo/generators/     # App-specific generators
packages/
└── ui/
    └── turbo/generators/     # Package-specific generators
turbo/
└── generators/               # Global generators
```

**Key Benefits:**
- **Workspace-scoped**: Generators run from their workspace root
- **Auto-discovery**: Turborepo automatically finds and loads generators
- **Simplified paths**: Reference files relative to workspace root

### Basic Generator Structure

Create `turbo/generators/config.ts`:

```typescript
import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("component", {
    description: "Create a new React component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name:",
        validate: (input: string) => {
          if (!input) return "Component name is required";
          if (!input.match(/^[A-Z][a-zA-Z]*$/)) {
            return "Component name must be PascalCase";
          }
          return true;
        },
      },
      {
        type: "list",
        name: "type",
        message: "Component type:",
        choices: ["component", "page", "layout"],
        default: "component",
      },
    ],
    actions: [
      {
        type: "add",
        path: "components/{{pascalCase name}}/{{pascalCase name}}.tsx",
        templateFile: "templates/component.hbs",
      },
      {
        type: "add",
        path: "components/{{pascalCase name}}/index.ts",
        templateFile: "templates/component-index.hbs",
      },
    ],
  });
}
```

### Advanced Generator Examples

#### 1. UI Component Generator

```typescript
import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("ui-component", {
    description: "Create a new UI component with tests and stories",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name:",
        validate: (input: string) => input ? true : "Name is required",
      },
      {
        type: "confirm",
        name: "hasStorybook",
        message: "Include Storybook story?",
        default: true,
      },
      {
        type: "confirm",
        name: "hasTests",
        message: "Include test file?",
        default: true,
      },
    ],
    actions: (data) => {
      const actions: PlopTypes.ActionType[] = [
        {
          type: "add",
          path: "src/components/{{pascalCase name}}/{{pascalCase name}}.tsx",
          templateFile: "templates/ui-component.hbs",
        },
        {
          type: "add",
          path: "src/components/{{pascalCase name}}/index.ts",
          template: "export { {{pascalCase name}} } from './{{pascalCase name}}';",
        },
      ];

      if (data?.hasStorybook) {
        actions.push({
          type: "add",
          path: "src/components/{{pascalCase name}}/{{pascalCase name}}.stories.tsx",
          templateFile: "templates/story.hbs",
        });
      }

      if (data?.hasTests) {
        actions.push({
          type: "add",
          path: "src/components/{{pascalCase name}}/{{pascalCase name}}.test.tsx",
          templateFile: "templates/test.hbs",
        });
      }

      return actions;
    },
  });
}
```

#### 2. Next.js Page Generator

```typescript
import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("next-page", {
    description: "Create a new Next.js App Router page",
    prompts: [
      {
        type: "input",
        name: "route",
        message: "Route path (e.g., 'blog/[slug]'):",
        validate: (input: string) => input ? true : "Route is required",
      },
      {
        type: "list",
        name: "type",
        message: "Page type:",
        choices: [
          { name: "Static page", value: "static" },
          { name: "Dynamic page", value: "dynamic" },
          { name: "API route", value: "api" },
        ],
      },
      {
        type: "confirm",
        name: "includeMetadata",
        message: "Include metadata generation?",
        default: true,
        when: (answers) => answers.type !== "api",
      },
    ],
    actions: (data) => {
      const actions: PlopTypes.ActionType[] = [];
      const routePath = `app/${data?.route}`;

      if (data?.type === "api") {
        actions.push({
          type: "add",
          path: `${routePath}/route.ts`,
          templateFile: "templates/api-route.hbs",
        });
      } else {
        actions.push({
          type: "add",
          path: `${routePath}/page.tsx`,
          templateFile: "templates/page.hbs",
        });

        if (data?.includeMetadata) {
          actions.push({
            type: "add",
            path: `${routePath}/layout.tsx`,
            templateFile: "templates/layout.hbs",
          });
        }
      }

      return actions;
    },
  });
}
```

#### 3. Package Generator with Dependencies

```typescript
import type { PlopTypes } from "@turbo/gen";
import { execSync } from "child_process";

const customAction: PlopTypes.CustomActionFunction = async (answers) => {
  const packageName = answers.name;
  const dependencies = answers.dependencies || [];

  try {
    // Install dependencies
    if (dependencies.length > 0) {
      execSync(`cd packages/${packageName} && pnpm add ${dependencies.join(" ")}`, {
        stdio: "inherit",
      });
    }

    return `Successfully created package "${packageName}" with dependencies`;
  } catch (error) {
    return `Failed to install dependencies: ${error}`;
  }
};

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("package", {
    description: "Create a new package with dependencies",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Package name:",
      },
      {
        type: "checkbox",
        name: "dependencies",
        message: "Select dependencies:",
        choices: [
          "react",
          "typescript",
          "@types/react",
          "tailwindcss",
          "zod",
        ],
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/{{kebabCase name}}/package.json",
        templateFile: "templates/package-json.hbs",
      },
      {
        type: "add",
        path: "packages/{{kebabCase name}}/src/index.ts",
        template: "export * from './main';\n",
      },
      {
        type: "add",
        path: "packages/{{kebabCase name}}/src/main.ts",
        templateFile: "templates/main.hbs",
      },
      customAction,
    ],
  });
}
```

### Template Files

Create Handlebars templates in your `templates/` directory:

#### Component Template (`templates/component.hbs`)

```handlebars
import React from 'react';

interface {{pascalCase name}}Props {
  children?: React.ReactNode;
  className?: string;
}

export function {{pascalCase name}}({ children, className }: {{pascalCase name}}Props) {
  return (
    <div className={className}>
      {{#if (eq type 'page')}}
      <h1>{{pascalCase name}} Page</h1>
      {{else}}
      <div>{{pascalCase name}} Component</div>
      {{/if}}
      {children}
    </div>
  );
}
```

#### Package.json Template (`templates/package-json.hbs`)

```handlebars
{
  "name": "@workspace/{{kebabCase name}}",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    {{#each dependencies}}
    "{{this}}": "latest"{{#unless @last}},{{/unless}}
    {{/each}}
  },
  "devDependencies": {
    "@workspace/typescript-config": "workspace:*",
    "typescript": "latest"
  }
}
```

### Running Generators

#### Run Specific Generator
```bash
turbo gen component
```

#### Pass Arguments Directly
```bash
turbo gen component --args Button component
```

#### Run from Specific Directory
```bash
turbo gen component --root /path/to/workspace
```

## Best Practices

### 1. Generator Organization

```
turbo/generators/
├── config.ts              # Main generator config
├── templates/              # Template files
│   ├── component.hbs
│   ├── page.hbs
│   └── package-json.hbs
└── utils/                  # Helper functions
    ├── validation.ts
    └── dependencies.ts
```

### 2. Validation and Error Handling

```typescript
export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("validated-component", {
    description: "Component with validation",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name:",
        validate: (input: string) => {
          if (!input) return "Name is required";
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
            return "Name must be PascalCase";
          }
          // Check if component already exists
          const fs = require("fs");
          if (fs.existsSync(`src/components/${input}`)) {
            return `Component ${input} already exists`;
          }
          return true;
        },
      },
    ],
    actions: [
      // Actions here
    ],
  });
}
```

### 3. Workspace-Specific Generators

Create generators in specific workspaces for targeted functionality:

```
packages/ui/turbo/generators/config.ts    # UI component generators
apps/web/turbo/generators/config.ts       # Page generators
apps/api/turbo/generators/config.ts       # API route generators
```

### 4. Template Inheritance

Use a base template system:

```typescript
// Base template for all components
const baseComponentActions = [
  {
    type: "add",
    path: "src/{{type}}s/{{pascalCase name}}/index.ts",
    template: "export { {{pascalCase name}} } from './{{pascalCase name}}';",
  },
];

// Extend for specific component types
const componentActions = [
  ...baseComponentActions,
  {
    type: "add",
    path: "src/components/{{pascalCase name}}/{{pascalCase name}}.tsx",
    templateFile: "templates/component.hbs",
  },
];
```

## Integration with MCP

Your MCP configuration provides access to online documentation. Integrate this with generators:

### 1. Documentation-Aware Generation

```typescript
import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("documented-component", {
    description: "Component with integrated documentation links",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name:",
      },
      {
        type: "list",
        name: "framework",
        message: "Primary framework:",
        choices: ["react", "nextjs", "typescript"],
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/components/{{pascalCase name}}/{{pascalCase name}}.tsx",
        templateFile: "templates/documented-component.hbs",
      },
      {
        type: "add",
        path: "src/components/{{pascalCase name}}/README.md",
        templateFile: "templates/component-readme.hbs",
      },
    ],
  });
}
```

### 2. Template with MCP References

```handlebars
# {{pascalCase name}} Component

Generated component following best practices.

## Documentation References

{{#if (eq framework 'react')}}
- [React Documentation](https://react.dev)
- [React Hooks Reference](https://react.dev/reference/react)
{{/if}}

{{#if (eq framework 'nextjs')}}
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Components](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
{{/if}}

## Usage

```tsx
import { {{pascalCase name}} } from '@workspace/ui';

export default function Page() {
  return <{{pascalCase name}} />;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | Child components |
| className | string | - | Additional CSS classes |
```

## Advanced Patterns

### 1. Multi-Package Generation

Generate related files across multiple packages:

```typescript
export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("feature", {
    description: "Generate a complete feature across packages",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Feature name:",
      },
    ],
    actions: [
      // UI Component
      {
        type: "add",
        path: "../../packages/ui/src/components/{{pascalCase name}}/{{pascalCase name}}.tsx",
        templateFile: "templates/ui-component.hbs",
      },
      // Types
      {
        type: "add",
        path: "../../packages/types/src/{{kebabCase name}}.ts",
        templateFile: "templates/types.hbs",
      },
      // Validation
      {
        type: "add",
        path: "../../packages/validations/src/{{kebabCase name}}.ts",
        templateFile: "templates/validation.hbs",
      },
    ],
  });
}
```

### 2. Conditional Generation

```typescript
export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("conditional", {
    description: "Generator with conditional logic",
    prompts: [
      {
        type: "list",
        name: "type",
        message: "What do you want to generate?",
        choices: [
          { name: "React Component", value: "component" },
          { name: "Next.js Page", value: "page" },
          { name: "API Route", value: "api" },
        ],
      },
    ],
    actions: (data) => {
      const actions: PlopTypes.ActionType[] = [];

      switch (data?.type) {
        case "component":
          actions.push({
            type: "add",
            path: "components/{{pascalCase name}}.tsx",
            templateFile: "templates/component.hbs",
          });
          break;
        case "page":
          actions.push({
            type: "add",
            path: "pages/{{kebabCase name}}/page.tsx",
            templateFile: "templates/page.hbs",
          });
          break;
        case "api":
          actions.push({
            type: "add",
            path: "api/{{kebabCase name}}/route.ts",
            templateFile: "templates/api.hbs",
          });
          break;
      }

      return actions;
    },
  });
}
```

### 3. Interactive Dependency Management

```typescript
const manageDependencies: PlopTypes.CustomActionFunction = async (answers) => {
  const { execSync } = require("child_process");
  const path = require("path");
  
  try {
    const workspacePath = path.join(process.cwd(), `packages/${answers.name}`);
    
    // Install base dependencies
    execSync(`cd ${workspacePath} && pnpm add react typescript`, {
      stdio: "inherit",
    });
    
    // Install optional dependencies based on choices
    if (answers.includeTesting) {
      execSync(`cd ${workspacePath} && pnpm add -D vitest @testing-library/react`, {
        stdio: "inherit",
      });
    }
    
    if (answers.includeStorybook) {
      execSync(`cd ${workspacePath} && pnpm add -D @storybook/react`, {
        stdio: "inherit",
      });
    }
    
    return "Dependencies installed successfully!";
  } catch (error) {
    return `Failed to install dependencies: ${error}`;
  }
};
```

## Troubleshooting

### Common Issues

#### 1. TypeScript Support

Make sure to install `@turbo/gen` as a dev dependency:

```bash
pnpm add -D @turbo/gen
```

#### 2. ESM Dependencies

**Known Issue**: ESM dependencies are not currently supported. Use CommonJS alternatives.

#### 3. Generator Not Found

Ensure your generator config is at the correct path:
- `turbo/generators/config.ts` (global)
- `[workspace]/turbo/generators/config.ts` (workspace-specific)

#### 4. Template Not Loading

Check template file paths are relative to the generator config:

```typescript
templateFile: "templates/component.hbs" // Correct
templateFile: "./templates/component.hbs" // Also correct
templateFile: "/absolute/path/template.hbs" // Avoid
```

### Debugging Tips

#### 1. Verbose Output

```bash
turbo gen --verbose
```

#### 2. Check Generator Discovery

```bash
turbo gen --list
```

#### 3. Test Templates

Create minimal templates first, then add complexity:

```handlebars
// Minimal test template
export function {{pascalCase name}}() {
  return <div>{{name}}</div>;
}
```

### Best Practices for Troubleshooting

1. **Start Simple**: Begin with basic templates and add complexity
2. **Use Validation**: Add input validation to prevent common errors
3. **Test Locally**: Run generators in a test directory first
4. **Version Control**: Commit working generators before making changes
5. **Documentation**: Document custom helpers and complex logic

## Workspace Integration Examples

### For Your Current Monorepo

Based on your repository structure, here are specific generators you might want:

#### 1. App Generator

```typescript
export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("app", {
    description: "Create a new Next.js app",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "App name:",
      },
      {
        type: "confirm",
        name: "includeAuth",
        message: "Include Auth.js?",
        default: true,
      },
    ],
    actions: [
      {
        type: "add",
        path: "apps/{{kebabCase name}}/package.json",
        templateFile: "templates/app-package.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase name}}/next.config.ts",
        templateFile: "templates/next-config.hbs",
      },
      // Additional files...
    ],
  });
}
```

#### 2. Shared Package Generator

```typescript
export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("shared-package", {
    description: "Create a new shared package",
    prompts: [
      {
        type: "list",
        name: "type",
        message: "Package type:",
        choices: [
          { name: "UI Components", value: "ui" },
          { name: "Utilities", value: "utils" },
          { name: "Types", value: "types" },
          { name: "Validations", value: "validations" },
        ],
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/{{kebabCase name}}/package.json",
        templateFile: "templates/shared-package.hbs",
      },
      // Type-specific files based on selection
    ],
  });
}
```

This comprehensive guide provides everything you need to leverage Turborepo's code generation capabilities in your monorepo, from basic built-in generators to advanced custom solutions integrated with your MCP documentation setup.
