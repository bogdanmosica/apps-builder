# Next.js 15 

---
applyTo: 'apps/**'
---

# Next.js Best Practices for LLMs (2025)

_Last updated: July 2025_

This document summarizes the latest, authoritative best practices for building, structuring, and maintaining Next.js applications. It is intended for use by LLMs and developers to ensure code quality, maintainability, and scalability.

---

## 1. Project Structure & Organization

- **Use the `app/` directory** (App Router) for all new projects. Prefer it over the legacy `pages/` directory.
- **Top-level folders:**
  - `app/` — Routing, layouts, pages, and route handlers
  - `public/` — Static assets (images, fonts, etc.)
  - `lib/` — Shared utilities, API clients, and logic
  - `components/` — Reusable UI components
  - `contexts/` — React context providers
  - `styles/` — Global and modular stylesheets
  - `hooks/` — Custom React hooks
  - `types/` — TypeScript type definitions
- **Colocation:** Place files (components, styles, tests) near where they are used, but avoid deeply nested structures.
- **Route Groups:** Use parentheses (e.g., `(admin)`) to group routes without affecting the URL path.
- **Private Folders:** Prefix with `_` (e.g., `_internal`) to opt out of routing and signal implementation details.

- **Feature Folders:** For large apps, group by feature (e.g., `app/dashboard/`, `app/auth/`).
- **Use `src/`** (optional): Place all source code in `src/` to separate from config files.

## 2.1. Server and Client Component Integration (App Router)

**Never use `next/dynamic` with `{ ssr: false }` inside a Server Component.** This is not supported and will cause a build/runtime error.

**Correct Approach:**
- If you need to use a Client Component (e.g., a component that uses hooks, browser APIs, or client-only libraries) inside a Server Component, you must:
  1. Move all client-only logic/UI into a dedicated Client Component (with `'use client'` at the top).
  2. Import and use that Client Component directly in the Server Component (no need for `next/dynamic`).
  3. If you need to compose multiple client-only elements (e.g., a navbar with a profile dropdown), create a single Client Component that contains all of them.

**Example:**

```tsx
// Server Component
import DashboardNavbar from '@/components/DashboardNavbar';

export default async function DashboardPage() {
  // ...server logic...
  return (
    <>
      <DashboardNavbar /> {/* This is a Client Component */}
      {/* ...rest of server-rendered page... */}
    </>
  );
}
```

**Why:**
- Server Components cannot use client-only features or dynamic imports with SSR disabled.
- Client Components can be rendered inside Server Components, but not the other way around.

**Summary:**
Always move client-only UI into a Client Component and import it directly in your Server Component. Never use `next/dynamic` with `{ ssr: false }` in a Server Component.

---

## 2. Component Best Practices

- **Component Types:**
  - **Server Components** (default): For data fetching, heavy logic, and non-interactive UI.
  - **Client Components:** Add `'use client'` at the top. Use for interactivity, state, or browser APIs.
- **When to Create a Component:**
  - If a UI pattern is reused more than once.
  - If a section of a page is complex or self-contained.
  - If it improves readability or testability.
- **Naming Conventions:**
  - Use `PascalCase` for component files and exports (e.g., `UserCard.tsx`).
  - Use `camelCase` for hooks (e.g., `useUser.ts`).
  - Use `snake_case` or `kebab-case` for static assets (e.g., `logo_dark.svg`).
  - Name context providers as `XyzProvider` (e.g., `ThemeProvider`).
- **File Naming:**
  - Match the component name to the file name.
  - For single-export files, default export the component.
  - For multiple related components, use an `index.ts` barrel file.
- **Component Location:**
  - Place shared components in `components/`.
  - Place route-specific components inside the relevant route folder.
- **Props:**
  - Use TypeScript interfaces for props.
  - Prefer explicit prop types and default values.
- **Testing:**
  - Co-locate tests with components (e.g., `UserCard.test.tsx`).

## 3. Naming Conventions (General)

- **Folders:** `kebab-case` (e.g., `user-profile/`)
- **Files:** `PascalCase` for components, `camelCase` for utilities/hooks, `kebab-case` for static assets
- **Variables/Functions:** `camelCase`
- **Types/Interfaces:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE`

## 4. API Routes (Route Handlers)

- **Prefer API Routes over Edge Functions** unless you need ultra-low latency or geographic distribution.
- **Location:** Place API routes in `app/api/` (e.g., `app/api/users/route.ts`).
- **HTTP Methods:** Export async functions named after HTTP verbs (`GET`, `POST`, etc.).
- **Request/Response:** Use the Web `Request` and `Response` APIs. Use `NextRequest`/`NextResponse` for advanced features.
- **Dynamic Segments:** Use `[param]` for dynamic API routes (e.g., `app/api/users/[id]/route.ts`).
- **Validation:** Always validate and sanitize input. Use libraries like `zod` or `yup`.
- **Error Handling:** Return appropriate HTTP status codes and error messages.
- **Authentication:** Protect sensitive routes using middleware or server-side session checks.

## 5. Workspace Dependencies

> **📋 Reference**: For comprehensive workspace dependency patterns and usage examples, see [React Best Practices - Workspace Dependencies](./reactjs-best-practices.instructions.md#workspace-dependencies).

In this monorepo, always use standardized workspace dependencies:

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

## 6. General Best Practices

- **TypeScript:** Use TypeScript for all code. Enable `strict` mode in `tsconfig.json`.
- **Biome:** Enforce code style and linting. Use the official Next.js Biome config.
- **Environment Variables:** Store secrets in `.env.local`. Never commit secrets to version control.
- **Testing:** Use Jest, React Testing Library, or Playwright. Write tests for all critical logic and components.
- **Accessibility:** Use semantic HTML and ARIA attributes. Test with screen readers.
- **Performance:**
  - Use built-in Image and Font optimization.
  - Use Suspense and loading states for async data.
  - Avoid large client bundles; keep most logic in Server Components.
- **Security:**
  - Sanitize all user input.
  - Use HTTPS in production.
  - Set secure HTTP headers.
- **Documentation:**
  - Write clear README and code comments.
  - Document public APIs and components.

# Avoid Unnecessary Example Files

Do not create example/demo files (like ModalExample.tsx) in the main codebase unless the user specifically requests a live example, Storybook story, or explicit documentation component. Keep the repository clean and production-focused by default.

# Always use the latest documentation and guides
- For every nextjs related request, begin by searching for the most current nextjs documentation, guides, and examples.
- Use the following tools to fetch and search documentation if they are available:
  - `resolve_library_id` to resolve the package/library name in the docs.
  - `get_library_docs` for up to date documentation.



## `use server` Directive & Server Actions: Best Practices

This guide summarizes best practices for using the `use server` directive and Server Actions in Next.js 15, combining official recommendations with custom project rules for scalable, maintainable, and high-performance applications.

---

### 1. File and Folder Organization
- **Server Actions Location:**
  - Always place server actions in the `app/actions/{page-actions}.ts` folder.
  - Each file should contain only one server action function, especially if directives are needed.
- **DRY Principle:**
  - If a URL string or constant is used more than once, define it at the top of the file for reuse.

### 2. Using the `use server` Directive
- **At the Top of the File:**
  - Prefer placing `"use server"` at the top of the file to mark all exports as server-side functions.
  - This enables importing server actions into both Server and Client Components.
- **Inline Usage:**
  - Use inline `"use server"` only for one-off or closure-based server functions within a component.
- **Performance:**
  - Placing `"use server"` at the top ensures optimal performance and clarity in your codebase.

### 3. Client vs. Server Code
- **Minimal `"use client"` Usage:**
  - Only use the `"use client"` directive in files that truly require client-side code (e.g., event handlers, stateful UI).
  - Avoid mixing client and server code in the same file.
- **Component Granularity:**
  - Create a separate component for each distinct functionality. Do not add multiple unrelated functions to the same file.

### 4. Data Fetching & State Management
- **Initial and Static Data:**
  - Always use server actions for fetching initial data or any data that does not require user input or browser events.
- **User-Triggered Fetches:**
  - For data that requires user interaction (e.g., button click, form submission), use React Query (or a similar async state management tool) in the client.

### 5. Security & Authorization
- **Authentication:**
  - Always authenticate and authorize users before performing sensitive server-side operations in server actions.
- **Sensitive Data:**
  - Never expose secrets or sensitive logic to the client. Keep all such logic within server action files.

### 6. General Coding Practices
- **Single Responsibility:**
  - Each server action file should export only one function. This improves maintainability and clarity.
- **Constants & Reuse:**
  - Define all repeated values (e.g., URLs, config) as constants at the top of the file.
- **Importing Server Actions:**
  - Import server actions into client components only from files with the `"use server"` directive at the top. 
  - Always use "use client" directive at the most granular component, the last child that needs it. 

### 7. Example Structure

```
app/
  actions/
    fetch-users.ts   // 'use server' at top, exports fetchUsers
    create-post.ts   // 'use server' at top, exports createPost
  components/
    MyProjectButton.tsx     // 'use client' at top if needed, imports server actions
```

## Server Actions & Mutations: Advanced Best Practices

### 1. Invoking Server Actions
- **Forms**: Use the `action` attribute on `<form>` to invoke a Server Action. Supports progressive enhancement (works without JS).
- **Event Handlers**: Invoke Server Actions from events like `onClick`, `onChange`, or `useEffect` for non-form mutations.
- **Programmatic Submission**: Use `form.requestSubmit()` for custom submission flows (e.g., keyboard shortcuts).

### 2. Arguments & Serialization
- **Serializable Data Only**: Arguments and return values must be serializable by React. Avoid non-serializable types.
- **Passing Extra Arguments**: Use `.bind` or hidden form fields to pass additional data to actions.

### 3. State Management & UX
- **Pending States**: Use the `useFormStatus` hook in Client Components to show loading indicators during submission.
- **Server-side Validation**: Validate form data on the server (e.g., with Zod). Return errors as serializable objects for UI display.
- **useFormState**: Use this hook to manage and display form state and errors in Client Components.
- **Optimistic Updates**: Use `useOptimistic` to update the UI before the server response arrives for a snappier experience.

### 4. Error Handling
- **Graceful Errors**: Use `try/catch` in Server Actions. Throw errors for boundary handling or return error objects for UI feedback.
- **Error Boundaries**: Errors thrown in actions are caught by the nearest `error.js` or `<Suspense>` boundary.

### 5. Data Revalidation & Redirects
- **Revalidate Data**: Use `revalidatePath` or `revalidateTag` in actions to update cached data after mutations.
- **Redirects**: Use the `redirect` API to navigate after successful actions (call outside `try/catch`).

### 6. Cookies & Headers
- **Manage Cookies**: Use the `cookies` API in Server Actions to get, set, or delete cookies securely.

### 7. Advanced Security Best Practices
- **Authentication & Authorization**: Always check user permissions in Server Actions, as they are public endpoints.
- **Closures & Sensitive Data**: Avoid capturing sensitive data in closures. Next.js encrypts closed-over variables, but do not rely solely on this for security.
- **Encryption Keys**: For multi-server deployments, set `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` to ensure consistent encryption.
- **Allowed Origins**: Use the `serverActions.allowedOrigins` config to restrict which origins can invoke actions (mitigates CSRF).
- **CSRF Protection**: Server Actions only allow POST requests and check the Origin header for additional CSRF protection.

### 8. Performance & Caching
- **Leverage Next.js Caching**: Server Actions integrate with Next.js caching and revalidation for efficient data updates.
- **Keep Actions Fast**: Minimize logic and avoid blocking operations in Server Actions to ensure responsive UIs.

### 9. Additional Server Action Tips
- **Use Native FormData**: Extract form data using the FormData API, not React state.
- **Debounce Rapid Events**: When invoking actions from frequent events (e.g., onChange), debounce to avoid excessive server calls.
- **Test with and without JS**: Ensure forms work with JavaScript disabled for true progressive enhancement.

## 8. Reference & Resources
- [Next.js 15 `use server` Directive Docs](https://nextjs.org/docs/app/api-reference/directives/use-server)
- [React Server Functions](https://19.react.dev/reference/rsc/server-functions)
- [React Query](https://tanstack.com/query/latest)

## 9 Examples

### QuerySelect Component client example

#### File: app/services/fetch-options.ts

```ts
export async function fetchOptions() {
  const res = await fetch('/api/options');
  return res.json();
}
```

#### File: app/components/QuerySelect.tsx

```tsx
'use client'
import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@workspace/ui/components/select';
import { fetchOptions } from '@/services/fetch-options';

export default function QuerySelect() {
  const { data: options = [], isLoading } = useQuery({
    queryKey: ['options'],
    queryFn: fetchOptions,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt: { value: string; label: string }) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### QuerySelect Component server example

#### File: app/actions/get-options.ts

```ts
'use server'
export async function getOptions() {
  // Example: fetch options from a database or API
  return [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'orange', label: 'Orange' }
  ];
}
```

#### File: app/components/ServerSelect.tsx

```tsx
import { getOptions } from '@/actions/get-options';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@workspace/ui/components/select';

export default async function ServerSelect() {
  const options = await getOptions();

  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```
