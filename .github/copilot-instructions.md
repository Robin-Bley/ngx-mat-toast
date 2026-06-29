# Copilot instructions for `ngx-mat-toast`

## Project overview

This repository contains:

- `projects/ngx-mat-toast` – the publishable Angular library
- `projects/demo` – the example application used for local verification

The library targets **Angular 22+** and is intentionally designed to feel familiar to users of `ngx-toastr`, while using **Angular Material Snackbar** internally.

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

## Release expectations

- The npm package metadata lives in `projects/ngx-mat-toast/package.json`.
- The publishable package is built into `dist/ngx-mat-toast`.
- CI and release automation lives under `.github/workflows/`.
