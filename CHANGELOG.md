# Changelog

All notable changes to `ngx-mat-toast` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project follows [Semantic Versioning](https://semver.org/).

---

## [22.1.0] – 2026-09-25

### Changed

- The default toast palette now uses the brand colors from the "Using brand colors" recipe. Each toast type renders as a solid brand-colored card (`success` `#15803d`, `error` `#dc0023`, `warning` `#b45309`, `info` `#0369a1`) with white title/message text, replacing the previous soft gradient surfaces. _(Colors were adjusted from the originally introduced values — see Fixed below.)_
- `closeable` now defaults to `false`. The close button is no longer rendered on toasts unless explicitly enabled.
- The close button now uses white-on-color styling so it stays legible on the solid colored cards.
- The demo application now boots with `provideNgxMatToast()` (no overrides) so its preview reflects the library defaults, including the progress bar and close button being disabled by default.

### Added

- Added `--ngx-mat-toast-success-surface`, `--ngx-mat-toast-error-surface`, `--ngx-mat-toast-warning-surface`, and `--ngx-mat-toast-info-surface` CSS custom properties to override each toast type's card background (defaulting to the brand palette). The existing `--ngx-mat-toast-*-color` variables continue to control the icon glyph and progress accent rendered on top of the card.

### Fixed

- **Accessibility (WCAG 2.1 AA)**: The originally introduced solid-surface defaults did not meet the 4.5:1 minimum contrast ratio required for normal-size text with white (`#fff`). Three surfaces have been darkened to pass AA:
  - `warning` `#ff9400` (≈2.2:1) → `#b45309` (≈5.0:1)
  - `success` `#5a9114` (≈3.8:1) → `#15803d` (≈5.0:1)
  - `info` `#0087c8` (≈4.0:1) → `#0369a1` (≈5.9:1)
  - `error` `#dc0023` (≈5.2:1) was already compliant and is unchanged.
    Consumers who have overridden `--ngx-mat-toast-*-surface` properties are unaffected.

---

## [22.0.8] – 2026-07-24

### Changed

- Removed `role` and `aria-atomic` attributes from toast items. These attributes are now redundant since MatSnackBar already provides appropriate ARIA live region semantics at the container level.
- MatSnackBar `politeness` is now automatically set based on active toast types: `'assertive'` for error/warning toasts, `'polite'` otherwise. This preserves urgency cues while eliminating duplicate live-region markup.

### Fixed

- Fixed accessibility by eliminating nested live-region attributes that could conflict with MatSnackBar's own announcements.

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
