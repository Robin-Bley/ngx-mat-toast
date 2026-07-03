# `ngx-mat-toast` documentation

This folder contains the in-depth documentation for `ngx-mat-toast`.

Use it as the primary reference once the library is installed, or as a guided learning path if you are evaluating the package for a new Angular project.

---

## Start here

| Goal                                                          | Recommended guide                                                |
| ------------------------------------------------------------- | ---------------------------------------------------------------- |
| Install the library and show the first toast                  | [`getting-started.md`](./getting-started.md)                     |
| Understand all configuration options and defaults             | [`configuration.md`](./configuration.md)                         |
| Look up exported symbols and method signatures                | [`api-reference.md`](./api-reference.md)                         |
| Customize visuals without breaking the Material overlay model | [`customization.md`](./customization.md)                         |
| Learn how the snackbar-hosted stack works internally          | [`architecture.md`](./architecture.md)                           |
| Copy production-ready usage patterns                          | [`examples.md`](./examples.md)                                   |
| Migrate from `ngx-toastr` safely                              | [`migrating-from-ngx-toastr.md`](./migrating-from-ngx-toastr.md) |
| Understand the compatibility adapter in detail                | [`compatibility-adapter.md`](./compatibility-adapter.md)         |
| Diagnose integration or styling problems                      | [`troubleshooting.md`](./troubleshooting.md)                     |

---

## Recommended reading order

1. Read [`getting-started.md`](./getting-started.md) to install and wire up the library.
2. Read [`configuration.md`](./configuration.md) to choose sensible global defaults.
3. Keep [`api-reference.md`](./api-reference.md) open while integrating the service.
4. Use [`customization.md`](./customization.md) and [`examples.md`](./examples.md) when refining UX.
5. Read [`migrating-from-ngx-toastr.md`](./migrating-from-ngx-toastr.md) or [`compatibility-adapter.md`](./compatibility-adapter.md) if you are replacing `ngx-toastr`.
6. Use [`architecture.md`](./architecture.md) and [`troubleshooting.md`](./troubleshooting.md) for advanced questions.

---

## Core concepts

`ngx-mat-toast` intentionally keeps its architecture simple and predictable:

- The main API lives in `NgxMatToastService`.
- Angular Material `MatSnackBar` remains the host outlet.
- A single snackbar outlet renders a stack of toast cards.
- Global defaults are registered once and merged with per-toast overrides.
- The library supports both standalone Angular apps and NgModule-based apps.
- The optional `ToastrService` adapter exists to make `ngx-toastr` migrations lower risk.

That design gives you a familiar toast API without abandoning Angular Material conventions.

---

## Best-practice checklist

Use these defaults unless your product has a strong reason to differ:

- Register the library once at the application root.
- Prefer `NgxMatToastService` for new code.
- Reserve `ToastrService` for migration phases.
- Keep toast messages short, action-oriented, and easy to scan.
- Use `duration: 0` only for actionable or critical notifications.
- Enable `preventDuplicates` for save flows and noisy background operations.
- Keep one consistent default position for most of the app to avoid stack movement.
- Style the overlay from global styles, not component-scoped styles.
- Enable `enableDebug` only during development or troubleshooting.

---

## Documentation map

### Foundation

- [`getting-started.md`](./getting-started.md)
- [`configuration.md`](./configuration.md)
- [`api-reference.md`](./api-reference.md)

### UX and implementation

- [`customization.md`](./customization.md)
- [`examples.md`](./examples.md)
- [`architecture.md`](./architecture.md)

### Migration and support

- [`migrating-from-ngx-toastr.md`](./migrating-from-ngx-toastr.md)
- [`compatibility-adapter.md`](./compatibility-adapter.md)
- [`troubleshooting.md`](./troubleshooting.md)

---

## Related resources

- Root overview: [`../README.md`](../README.md)
- Publishable package README: [`../projects/ngx-mat-toast/README.md`](../projects/ngx-mat-toast/README.md)
- Demo application: [`../projects/demo`](../projects/demo)
- Preview assets: [`./assets/Preview_1.png`](./assets/Preview_1.png), [`./assets/Preview_2.png`](./assets/Preview_2.png)

---

## Suggested path by audience

### New Angular consumers

Start with:

1. [`getting-started.md`](./getting-started.md)
2. [`configuration.md`](./configuration.md)
3. [`examples.md`](./examples.md)

### Teams migrating from `ngx-toastr`

> **Important:** `ngx-toastr` is [archived](https://github.com/scttcper/ngx-toastr) and no longer compatible with Angular 22+. 
> `ngx-mat-toast` provides a straightforward migration path to keep your toast notifications working.

Start with:

1. [`migrating-from-ngx-toastr.md`](./migrating-from-ngx-toastr.md)
2. [`compatibility-adapter.md`](./compatibility-adapter.md)
3. [`api-reference.md`](./api-reference.md)

### Maintainers and contributors

Start with:

1. [`architecture.md`](./architecture.md)
2. [`api-reference.md`](./api-reference.md)
3. [`troubleshooting.md`](./troubleshooting.md)

---

## Need a quick visual overview?

The project README contains preview images and a compact quick start:

- [`../README.md`](../README.md)

For the full walkthrough, stay inside this `docs/` folder.
