# Changelog

All notable changes to `ngx-mat-toast` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project follows [Semantic Versioning](https://semver.org/).

---

## [22.0.7] – 2026-07-23

### Added

- Added `fullWidth` support end-to-end (config surface + snackbar panel class + ngx-toastr positionClass mapping).
- Added `NgxMatToastRef.onTap()` and `NgxMatToastRef.onShown()` for improved lifecycle and tap observability.

### Fixed

- Fixed toast close button styling to ensure the hover background renders as an 8px rounded square (instead of inheriting Material's circular icon-button shape) and that the "×" glyph is visually centered within the button.

### Changed

- Refactored `ToastItemComponent` and `NgxMatToastService` for signal-based state and consolidated outlet state.
- Updated unit tests to reflect refactored architecture.
- Plumbed tap events from toast item → container → service.
- Sets the Material icon-button container shape token to 8px for the close button.
- Forces the close button to use inline-flex with centered alignment to better center the "×" content.

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
