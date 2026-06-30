# Changelog

All notable changes to `ngx-mat-toast` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project follows [Semantic Versioning](https://semver.org/).

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
