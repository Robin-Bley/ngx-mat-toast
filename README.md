# ngx-mat-toast

`ngx-mat-toast` is a standalone **open source Angular toast notification library** built on top of **Angular Material Snackbar**.

It is designed to feel familiar to teams coming from `ngx-toastr`, while staying aligned with modern Angular best practices:

- Angular 21+
- standalone providers and NgModules
- Angular Material Snackbar under the hood
- fully typed API
- accessible toast markup
- Vitest-based unit tests
- demo application included in the workspace
- optional `ngx-toastr` compatibility adapter

<p>
  <img src="docs/assets/preview.gif" alt="ngx-mat-toast preview" width="800" />
</p>

## Features

- ✅ Simple service API: `success()`, `error()`, `warning()`, `info()`, `show()`, `dismiss()`, `clear()`
- ✅ Powered by **Angular Material `MatSnackBar`**
- ✅ Rich toast cards with title, message, close button, and progress bar
- ✅ Global configuration + per-toast overrides
- ✅ Positioning (`top`/`bottom`, `start`/`center`/`end`)
- ✅ Duplicate prevention
- ✅ Maximum visible toast limit
- ✅ Persistent toasts with `duration: 0`
- ✅ Optional `ToastrService` compatibility adapter for migrations from `ngx-toastr`
- ✅ No Material Icons webfont required

---

## Installation

Install the package and its peer dependencies:

```bash
npm install ngx-mat-toast @angular/material @angular/cdk @angular/animations
```

> `ngx-mat-toast` uses Angular Material Snackbar internally, so your app must also provide animations via `provideAnimations()`, `provideAnimationsAsync()`, or `provideNoopAnimations()`.

---

## Quick start (standalone)

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNgxMatToast } from 'ngx-mat-toast';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideNgxMatToast({
      duration: 3000,
      progressBar: true,
      position: { horizontal: 'end', vertical: 'top' },
    }),
  ],
};
```

```ts
// some.component.ts
import { Component, inject } from '@angular/core';
import { NgxMatToastService } from 'ngx-mat-toast';

@Component({
  selector: 'app-example',
  template: `<button (click)="save()">Save</button>`,
})
export class ExampleComponent {
  private readonly toast = inject(NgxMatToastService);

  save(): void {
    this.toast.success('Profile saved successfully.', 'Saved');
  }
}
```

---

## Quick start (NgModule)

```ts
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMatToastModule } from 'ngx-mat-toast';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    NgxMatToastModule.forRoot({
      duration: 3000,
      progressBar: true,
    }),
  ],
})
export class AppModule {}
```

---

## API overview

### `NgxMatToastService`

```ts
success(message: string, title?: string, options?: NgxMatToastOptions): NgxMatToastRef
error(message: string, title?: string, options?: NgxMatToastOptions): NgxMatToastRef
warning(message: string, title?: string, options?: NgxMatToastOptions): NgxMatToastRef
info(message: string, title?: string, options?: NgxMatToastOptions): NgxMatToastRef
show(message: string, type?: ToastType, title?: string, options?: NgxMatToastOptions): NgxMatToastRef

dismiss(id: string): boolean
clear(): void
```

### `NgxMatToastRef`

```ts
const ref = toast.success('Saved');

ref.dismiss();
ref.afterDismissed().subscribe(() => {
  console.log('Toast dismissed');
});
```

---

## Configuration

### Global configuration

Use `provideNgxMatToast()` or `NgxMatToastModule.forRoot()`.

### Per-toast options

Every toast method accepts `NgxMatToastOptions`, which are merged with the global defaults.

| Option                 | Type                                                | Default        | Description                                                          |
| ---------------------- | --------------------------------------------------- | -------------- | -------------------------------------------------------------------- |
| `duration`             | `number`                                            | `3000`         | Auto-dismiss delay in milliseconds. Use `0` for persistent toasts.   |
| `position.horizontal`  | `'start' \| 'center' \| 'end' \| 'left' \| 'right'` | `'end'`        | Horizontal placement of the snackbar outlet.                         |
| `position.vertical`    | `'top' \| 'bottom'`                                 | `'top'`        | Vertical placement of the snackbar outlet.                           |
| `closeable`            | `boolean`                                           | `true`         | Show a close button.                                                 |
| `progressBar`          | `boolean`                                           | `false`        | Show a determinate progress bar.                                     |
| `progressBarDirection` | `'decreasing' \| 'increasing'`                      | `'decreasing'` | Progress animation direction.                                        |
| `tapToDismiss`         | `boolean`                                           | `true`         | Dismiss a toast when it is clicked.                                  |
| `preventDuplicates`    | `boolean`                                           | `false`        | Do not create a second toast with the same title, message, and type. |
| `maxToasts`            | `number`                                            | `5`            | Maximum visible toasts at once. `0` disables the limit.              |
| `enableDebug`          | `boolean`                                           | `false`        | Log toast activity to the browser console.                           |

> **Implementation note:** Angular Material exposes a single snackbar outlet. `ngx-mat-toast` keeps a stack of toast cards inside that outlet. If you mix different positions while toasts are already open, the stack moves to the most recently requested position. Within that stack, the newest toast stays closest to the configured viewport edge.

---

## Customization

### Theming with Angular Material

`ngx-mat-toast` respects your Angular Material theme. To customize the toast appearance, configure your Material theme in your global styles:

```scss
// styles.scss
@use '@angular/material' as mat;
@use 'ngx-mat-toast/toast' as toast;

// Include Material theme
@include mat.core();
$theme: mat.define-light-theme(
  (
    color: (
      primary: mat.$indigo-palette,
      accent: mat.$pink-palette,
      warn: mat.$red-palette,
    ),
  )
);
@include mat.all-component-colors($theme);

// Optionally override toast-specific colors
$custom-toast-theme: (
  success: #4caf50,
  error: #f44336,
  warning: #ff9800,
  info: #2196f3,
);
```

### Custom styling

Override toast styles by targeting the Material Snackbar container:

```scss
// app.component.scss
::ng-deep .mat-mdc-snack-bar-container {
  .ngx-mat-toast {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    .ngx-mat-toast-title {
      font-weight: 600;
      font-size: 14px;
    }

    .ngx-mat-toast-message {
      font-size: 13px;
    }
  }
}
```

### Per-toast configuration overrides

Every toast method supports per-toast options that override global defaults:

```ts
this.toast.success('Quick save', 'Saved', {
  duration: 2000,
  progressBar: true,
  closeable: false,
  position: { horizontal: 'start', vertical: 'bottom' },
});

this.toast.error('Invalid input', 'Error', {
  duration: 0, // Persistent toast
  tapToDismiss: false, // Prevent accidental dismissal
});
```

### Custom positions for specific toasts

Position toasts dynamically based on context:

```ts
if (isMobile()) {
  ref = this.toast.warning('Low battery', 'Warning', {
    position: { horizontal: 'center', vertical: 'bottom' },
  });
} else {
  ref = this.toast.warning('Low battery', 'Warning', {
    position: { horizontal: 'end', vertical: 'top' },
  });
}
```

### Working with toast references

Use the returned `NgxMatToastRef` to interact with toasts programmatically:

```ts
const ref = this.toast.info('Processing...', 'In progress', { duration: 0 });

// Dismiss the toast manually
ref.dismiss();

// Listen for dismissal
ref.afterDismissed().subscribe(() => {
  this.handleToastDismissed();
});

// Store the generated id if you want to dismiss the toast elsewhere later
const toastId = ref.id;
```

### Duplicate prevention

Prevent duplicate toasts by enabling the `preventDuplicates` option:

**Globally:**

```ts
provideNgxMatToast({
  preventDuplicates: true,
});
```

**Per-toast:**

```ts
this.toast.success('Saved', 'Success', { preventDuplicates: true });
```

### Limiting maximum visible toasts

Control the maximum number of simultaneously visible toasts:

**Globally:**

```ts
provideNgxMatToast({
  maxToasts: 3, // Show only 3 toasts at once
});
```

**Disable limit:**

```ts
provideNgxMatToast({
  maxToasts: 0, // Unlimited toasts
});
```

### Debug mode

Enable debug output to monitor toast activity:

```ts
provideNgxMatToast({
  enableDebug: true, // Logs to browser console
});
```

This logs all toast creation, dismissal, and configuration changes to the browser console.

---

## Migrating from `ngx-toastr`

This repository includes a lightweight compatibility adapter:

```ts
import { ToastrService } from 'ngx-mat-toast';
```

It supports common `ngx-toastr` patterns such as:

- `success(message, title, options)`
- `error(message, title, options)`
- `warning(message, title, options)`
- `info(message, title, options)`
- `show(message, title, options, type)`
- `clear(id?)`
- `remove(id?)`

Supported compatibility options include:

- `timeOut`
- `disableTimeOut`
- `closeButton`
- `progressBar`
- `tapToDismiss`
- `preventDuplicates`
- `maxOpened`
- `positionClass`
- `progressAnimation`

See [`docs/migrating-from-ngx-toastr.md`](docs/migrating-from-ngx-toastr.md) for a more detailed migration guide.

---

## Demo application

This workspace includes a demo app under `projects/demo`.

**Try it online:** [StackBlitz Demo](https://stackblitz.com/github/Robin-Bley/ngx-mat-toast?file=README.md)

Start it locally with:

```bash
npm install
npm start
```

Build the demo:

```bash
npm run build:demo
```

---

## Development

Build the library:

```bash
npm run build:lib
```

Run the library tests:

```bash
npm run test:lib
```

Run the demo tests:

```bash
npm run test:demo
```

Run everything used in CI:

```bash
npm run build
npm run test:ci
```

---

## Repository structure

```text
projects/
  demo/             Example application
  ngx-mat-toast/    Publishable Angular library

docs/
  migrating-from-ngx-toastr.md

.github/
  workflows/
```

---

## Open source housekeeping

This repository also includes:

- `LICENSE`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `.github/dependabot.yml`
- GitHub Actions for CI and npm publishing
- `.github/copilot-instructions.md`

---

## License

Licensed under the [MIT License](LICENSE).
