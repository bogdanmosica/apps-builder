````instructions
# Project-Level Improvement Guide for `apps-builder`

---
applyTo: '**'
---

# Project-Level Improvement Guide for `apps-builder`

This guide outlines recommended improvements for the `apps-builder` monorepo, focusing on project-level enhancements. These suggestions are based on best practices for maintainability, scalability, developer experience, and code quality. No code changes are included—this is a strategic roadmap for elevating the project as a whole.

---

## 1. Monorepo Structure & Consistency
- **Standardize Directory Layout:**
  - Ensure all apps and packages follow a consistent structure (e.g., `app/`, `components/`, `lib/`, `public/`, `tests/`).
  - Document the structure in a central `CONTRIBUTING.md` or `ARCHITECTURE.md`.
- **Naming Conventions:**
  - Use clear, consistent naming for apps, packages, and files.
  - Adopt a naming convention for environment files (e.g., `.env`, `.env.example`).

## 2. Dependency Management
- **Centralize Dependency Versions:**
  - Use a single source of truth for shared dependencies (e.g., via `pnpm` workspaces or `package.json` resolutions).
  - Regularly audit and update dependencies for security and compatibility.
- **Remove Duplicates:**
  - Eliminate redundant or unused dependencies across apps/packages.

## 3. Linting, Formatting, and Code Quality
- **Unified Linting:**
  - Enforce a single Biome configuration across all apps and packages.
  - Integrate Biome for code formatting consistency.
- **Automated Checks:**
  - Set up pre-commit hooks (e.g., with Husky) for linting, formatting, and type-checking.
  - Add CI workflows for lint, test, and build checks on pull requests.

## 4. TypeScript Best Practices
- **Strict Type Checking:**
  - Enable `strict: true` in all `tsconfig.json` files.
  - Avoid `any` types; prefer `unknown` or proper typings.
- **Shared Types:**
  - Centralize common types in a `packages/types` package.
  - Use type imports instead of duplicating interfaces.

## 5. Testing Strategy
- **Test Coverage:**
  - Ensure each app/package has a `tests/` directory with meaningful tests.
  - Track and improve code coverage.
- **Testing Tools:**
  - Standardize on a single test runner (e.g., Jest or Vitest).
  - Add utilities for integration and end-to-end testing.

## 6. Documentation
- **Comprehensive Docs:**
  - Maintain up-to-date `README.md` files for each app and package.
  - Add a root-level `CONTRIBUTING.md` with setup, development, and PR guidelines.
  - Document environment variables and configuration in `.env.example` and a dedicated `ENVIRONMENT.md`.
- **Architecture Overview:**
  - Provide a high-level architecture diagram and explanation.

## 7. Environment & Configuration
- **Environment Variables:**
  - Use `.env.example` as a template for required variables.
  - Validate environment variables at runtime (e.g., with Zod).
- **Configuration Management:**
  - Centralize shared config (e.g., database, auth) in packages.

## 8. Security
- **Secrets Management:**
  - Never commit secrets to the repository.
  - Use environment variables and secret management tools.
- **Dependency Audits:**
  - Regularly run `pnpm audit` or similar tools.

## 9. CI/CD & Automation
- **Automated Workflows:**
  - Set up CI for linting, testing, and building all apps/packages.
  - Automate deployments where possible.
- **Monorepo Caching:**
  - Use Turborepo or similar tools for build and test caching.

## 10. Developer Experience
- **Onboarding:**
  - Provide clear onboarding instructions in the root `README.md`.
  - Include scripts for common tasks (e.g., `pnpm dev`, `pnpm build`).
- **Editor Config:**
  - Add `.editorconfig` for consistent editor behavior.

## 11. Accessibility & Internationalization
- **Accessibility:**
  - Ensure all UI components are ARIA-compliant and accessible.
- **i18n:**
  - Centralize translations and document the process for adding new languages.

## 12. Performance & Optimization
- **Bundle Analysis:**
  - Regularly analyze and optimize bundle sizes.
- **Code Splitting:**
  - Use dynamic imports and code splitting in Next.js apps.

---

## Next Steps
1. Review and prioritize the above improvements.
2. Assign owners for each area (e.g., linting, testing, docs).
3. Track progress in a project management tool (e.g., GitHub Projects).

_This guide should be revisited and updated regularly as the project evolves._
