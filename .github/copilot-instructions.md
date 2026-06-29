# Copilot instructions for `ngx-mat-toast`

## Project overview

This repository contains:

- `projects/ngx-mat-toast` – the publishable Angular library
- `projects/demo` – the example application used for local verification

The library targets **Angular 21+** and is intentionally designed to feel familiar to users of `ngx-toastr`, while using **Angular Material Snackbar** internally.

## Architecture expectations

- Keep the core toast API centered around `NgxMatToastService`.
- The library **must** continue to use Angular Material `MatSnackBar` as the host outlet.
- The snackbar hosts a **stack of toast cards**; avoid switching to a hand-rolled overlay unless there is a strong reason.
- Do not introduce a runtime dependency on the Material Icons font. Prefer inline SVG or self-contained visuals.
- Preserve both integration styles:
  - `provideNgxMatToast()` for standalone apps
  - `NgxMatToastModule.forRoot()` for NgModule-based apps
- Maintain the optional `ToastrService` compatibility adapter for `ngx-toastr` migrations.

## Code style

- Prefer standalone Angular APIs and `inject()`.
- Keep the public API strongly typed and documented.
- Avoid unnecessary runtime dependencies.
- Keep styles scoped and library-safe.
- Preserve compatibility with strict TypeScript settings and `isolatedModules`.
- Use `export type` for type-only re-exports.
- **Full type annotation**: Every variable must be explicitly typed (e.g., `const name: string = 'test';`). Avoid relying on type inference.
- **Explicit access modifiers**: Mark all public member variables and functions explicitly with the `public` keyword (e.g., `public doSomething(): void {}`).
- **One interface per file**: Each interface must be defined in its own dedicated file for better modularity and maintainability.

## Tests

- Add or update tests for all non-trivial changes.
- The repository uses Angular's unit-test builder with **Vitest**.
- Avoid `fakeAsync()` unless the test environment explicitly includes `zone.js/testing`.
- Prefer Vitest spies (`vi.fn`, `vi.spyOn`) and timers when possible.

## Documentation expectations

When changing behavior, update the relevant docs:

- root `README.md`
- package `projects/ngx-mat-toast/README.md`
- `docs/migrating-from-ngx-toastr.md` when migration behavior changes
- `CHANGELOG.md`

The repository also maintains a dedicated docs suite under `docs/`:

- `docs/README.md` – documentation hub and navigation
- `docs/getting-started.md` – setup and first-use guide
- `docs/configuration.md` – configuration semantics and defaults
- `docs/api-reference.md` – public API reference
- `docs/customization.md` – theming and styling guidance
- `docs/examples.md` – practical recipes
- `docs/architecture.md` – internal design rationale
- `docs/compatibility-adapter.md` – `ToastrService` adapter details
- `docs/troubleshooting.md` – diagnostics and common issues
- `docs/migrating-from-ngx-toastr.md` – migration path from `ngx-toastr`

Documentation best practices for this repository:

- Keep documentation in English for consistency with the existing public docs.
- Keep the root `README.md` focused on overview, quick start, and links into `docs/`.
- Keep the package README concise and friendly for npm readers, with clear links back to the repository docs.
- Prefer global-style guidance for snackbar customization because Material overlays render outside component style scope.
- When public API changes, update `docs/api-reference.md` and `docs/configuration.md` together.
- When migration behavior changes, update both `docs/migrating-from-ngx-toastr.md` and `docs/compatibility-adapter.md`.

## Release expectations

- The npm package metadata lives in `projects/ngx-mat-toast/package.json`.
- The publishable package is built into `dist/ngx-mat-toast`.
- CI and release automation lives under `.github/workflows/`.
