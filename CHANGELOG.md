# Changelog

All notable changes to `ngx-mat-toast` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project follows [Semantic Versioning](https://semver.org/).

---

## [22.0.7] – 2026-07-10

### Added

- **Lifecycle observables** in `NgxMatToastRef`:
  - `onShown(): Observable<void>` – emits when the toast becomes visible
  - `onTap(): Observable<void>` – emits when the toast is clicked, regardless of `tapToDismiss` setting
- **Full-width toast support** via `fullWidth: boolean` configuration option
  - Stretches toasts to fill the snackbar container width
  - Automatically enabled for `ngx-toastr` `*-full-width` position classes
- **Built-in ARIA accessibility**:
  - Errors and warnings use `role="alert"` with `aria-live="assertive"`
  - Info and success toasts use `role="status"` with `aria-live="polite"`
  - All toasts include `aria-atomic="true"` for completeness
- **Signal-based progress bar**:
  - Replaced `setInterval` implementation with RxJS observables + `animationFrameScheduler`
  - Non-blocking, frame-optimized progress animations
- **Observable properties in `ActiveToast`**:
  - `onShown: Observable<void>` – emitted when toast becomes visible
  - `onTap: Observable<void>` – emitted when toast is tapped
- **Enhanced documentation**:
  - Updated API reference with new lifecycle methods
  - Added full-width configuration guide
  - Documented ARIA accessibility features
  - Updated position class mapping table with `fullWidth` indicators

### Changed

- **`NgxMatToastModule` deprecation notice**:
  - Added JSDoc deprecation warning recommending migration to `provideNgxMatToast()` standalone API
  - NgModule support is maintained for backward compatibility but may be removed in future major versions
- **`NgxMatToastRef` constructor signature** (internal):
  - Now accepts Observable arguments for lifecycle notifications instead of internal Subjects
  - Provides cleaner separation of concerns in service lifecycle management
- **Toast container state consolidation**:
  - Merged three separate outlet fields into single `ToastOutletState` interface for cleaner service state
- **Position mapping**:
  - Extended `POSITION_CLASS_MAP` in adapter to include `fullWidth` boolean per position class

### Fixed

- Fixed toast tap event handling to emit `onTap` regardless of `tapToDismiss` configuration
- Improved type safety for Observable Subject lifecycle management

---

## [22.0.6] – 2026-07-10

### Changed

- Updated README files for improved clarity and documentation structure.

---

## [22.0.5] – 2026-07-09

### Fixed

- Fixed maximum toast container width calculation error.

---

## [22.0.4] – 2026-07-08

### Changed

- Updated library metadata.

---

## [22.0.3] – 2026-07-08

### Changed

- Updated library metadata.

---

## [22.0.2] – 2026-07-08

### Added

- Created library metadata.

### Changed

- Updated dependencies.

---

## [22.0.1] – 2026-07-03

### Changed

- **Standardized CSS custom properties for all toast types:** Added `--ngx-mat-toast-error-color` and `--ngx-mat-toast-info-color` for consistency with success and warning toasts. All four toast types now expose their own color customization variables instead of relying on Material system tokens.

---

## [22.0.0] – 2026-07-03

### Changed

- Updated package version to 22.0.0 for release branding alignment.
- Replaced README preview GIF reference with PNG preview images.
- Updated documentation references to the new preview assets.

---

## [0.2.0] – 2026-06-30

### Added

- Comprehensive documentation hub under `docs/`.
- New guides for getting started, configuration, API reference, customization, architecture, examples, compatibility, and troubleshooting.

### Changed

- Updated the root and package READMEs to link to the full documentation suite.
- Removed the Angular animations package/provider requirement from the demo, package metadata, and docs because `ngx-mat-toast` now documents CSS-native motion only.
- Updated toast style

---

## [0.1.0] – 2026-06-29

### Added

- Initial release of `ngx-mat-toast`.
- `NgxMatToastService` with `success()`, `error()`, `warning()`, `info()`, `show()`, `dismiss()`, and `clear()`.
- `NgxMatToastRef` for programmatic dismissal and lifecycle observation.
- Global configuration via `provideNgxMatToast()` and `NgxMatToastModule.forRoot()`.
- Toast options for close buttons, progress bars, duplicate prevention, persistent toasts, debug logging, and maximum visible toast count.
- Angular Material Snackbar-based stacked toast outlet.
- Inline SVG icons with no Material Icons font dependency.
- `ToastrService` compatibility adapter for easier `ngx-toastr` migrations.
- Migration guide in `docs/migrating-from-ngx-toastr.md`.
- Demo application under `projects/demo`.
- Vitest-based unit test coverage for the library and demo app.
- Open source repository files including CI, release automation, security policy, contribution guide, and code of conduct.
