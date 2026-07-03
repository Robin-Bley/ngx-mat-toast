# ngx-mat-toast

`ngx-mat-toast` is a toast notification library for Angular built on top of **Angular Material Snackbar**.

It provides a simple, `ngx-toastr`-style API while keeping the implementation aligned with modern Angular practices.

> **🚀 Migrating from `ngx-toastr`?**
>
> `ngx-toastr` is [archived](https://github.com/scttcper/ngx-toastr) and no longer compatible with Angular 22+.
> `ngx-mat-toast` provides a straightforward migration path.
> See the [migration guide](https://github.com/Robin-Bley/ngx-mat-toast/blob/main/docs/migrating-from-ngx-toastr.md) for details.

## Highlights

- Angular Material Snackbar powered
- standalone + NgModule support
- typed service API
- close button, progress bar, duplicate prevention, and max toast limits
- persistent toasts with `duration: 0`
- optional `ToastrService` compatibility adapter for `ngx-toastr` migrations
- no Material Icons font dependency

## Documentation

For the full documentation set, see the repository docs:

- [Documentation hub](https://github.com/Robin-Bley/ngx-mat-toast/blob/main/docs/README.md)
- [Getting started](https://github.com/Robin-Bley/ngx-mat-toast/blob/main/docs/getting-started.md)
- [Configuration guide](https://github.com/Robin-Bley/ngx-mat-toast/blob/main/docs/configuration.md)
- [API reference](https://github.com/Robin-Bley/ngx-mat-toast/blob/main/docs/api-reference.md)
- [Customization guide](https://github.com/Robin-Bley/ngx-mat-toast/blob/main/docs/customization.md)
- [Examples](https://github.com/Robin-Bley/ngx-mat-toast/blob/main/docs/examples.md)
- [Migration guide](https://github.com/Robin-Bley/ngx-mat-toast/blob/main/docs/migrating-from-ngx-toastr.md)
- [Compatibility adapter guide](https://github.com/Robin-Bley/ngx-mat-toast/blob/main/docs/compatibility-adapter.md)
- [Troubleshooting](https://github.com/Robin-Bley/ngx-mat-toast/blob/main/docs/troubleshooting.md)

---

## Installation

```bash
npm install ngx-mat-toast @angular/material @angular/cdk
```

> `ngx-mat-toast` uses CSS-native motion and does not require an Angular animations provider for its own snackbar-based rendering.

---

## Standalone usage

```ts
import { ApplicationConfig } from '@angular/core';
import { provideNgxMatToast } from 'ngx-mat-toast';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxMatToast({
      duration: 3000,
      progressBar: true,
      position: { horizontal: 'end', vertical: 'top' },
    }),
  ],
};
```

```ts
import { Component, inject } from '@angular/core';
import { NgxMatToastService } from 'ngx-mat-toast';

@Component({
  selector: 'app-profile',
  template: `<button (click)="save()">Save</button>`,
})
export class ProfileComponent {
  private readonly toast = inject(NgxMatToastService);

  save(): void {
    this.toast.success('Profile saved successfully.', 'Saved');
  }
}
```

---

## NgModule usage

```ts
import { NgModule } from '@angular/core';
import { NgxMatToastModule } from 'ngx-mat-toast';

@NgModule({
  imports: [
    NgxMatToastModule.forRoot({
      duration: 3000,
      progressBar: true,
    }),
  ],
})
export class AppModule {}
```

---

## Service API

```ts
success(message: string, title?: string, options?: NgxMatToastOptions): NgxMatToastRef
error(message: string, title?: string, options?: NgxMatToastOptions): NgxMatToastRef
warning(message: string, title?: string, options?: NgxMatToastOptions): NgxMatToastRef
info(message: string, title?: string, options?: NgxMatToastOptions): NgxMatToastRef
show(message: string, type?: ToastType, title?: string, options?: NgxMatToastOptions): NgxMatToastRef

dismiss(id: string): boolean
clear(): void
```

### Example

```ts
const ref = this.toast.info('Sync in progress...', 'Background job', { duration: 0 });

ref.afterDismissed().subscribe(() => {
  console.log('Toast closed');
});
```

---

## Configuration options

| Option                 | Default        | Description                                                        |
| ---------------------- | -------------- | ------------------------------------------------------------------ |
| `duration`             | `3000`         | Auto-dismiss delay in milliseconds. Use `0` for persistent toasts. |
| `position.horizontal`  | `'end'`        | Horizontal snackbar outlet position.                               |
| `position.vertical`    | `'top'`        | Vertical snackbar outlet position.                                 |
| `closeable`            | `true`         | Show a close button.                                               |
| `progressBar`          | `false`        | Show a progress bar.                                               |
| `progressBarDirection` | `'decreasing'` | Progress animation direction.                                      |
| `tapToDismiss`         | `true`         | Dismiss the toast when clicked.                                    |
| `preventDuplicates`    | `false`        | Suppress duplicate title/message/type combinations.                |
| `maxToasts`            | `5`            | Maximum visible toasts. Use `0` for unlimited.                     |
| `enableDebug`          | `false`        | Log toast activity in the browser console.                         |

Within a stack, the newest toast stays closest to the configured viewport edge.

---

## Customization

### Styling and theming

`ngx-mat-toast` respects your Angular Material theme. Customize appearance by:

1. **Configuring your Material theme:**

   ```scss
   // styles.scss
   @use '@angular/material' as mat;

   @include mat.core();

   $theme: mat.define-theme(
     (
       color: (
         theme-type: light,
         primary: mat.$blue-palette,
         tertiary: mat.$orange-palette,
       ),
     )
   );

   @include mat.all-component-themes($theme);

   :root {
     --ngx-mat-toast-success-color: #2e7d32;
     --ngx-mat-toast-error-color: #c62828;
     --ngx-mat-toast-warning-color: #ed6c02;
     --ngx-mat-toast-info-color: #1565c0;
   }
   ```

2. **Overriding toast styles from a global stylesheet:**

   ```scss
   .ngx-mat-toast-snack-panel .ngx-mat-toast-item {
     border-radius: 12px;
     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
   }
   ```

   This is preferred because Material snackbars render in the CDK overlay container.

### Per-toast configuration

Override global settings for individual toasts:

```ts
this.toast.success('Saved', 'Success', {
  duration: 2000,
  position: { horizontal: 'start', vertical: 'bottom' },
  closeable: false,
  progressBar: true,
});
```

### Toast references and programmatic control

```ts
const ref = this.toast.info('Processing...', null, { duration: 0 });

ref.dismiss();

ref.afterDismissed().subscribe(() => {
  console.log('Toast dismissed');
});
```

### Duplicate prevention and limits

Enable globally or per-toast:

```ts
// Global
provideNgxMatToast({ preventDuplicates: true, maxToasts: 3 });

// Per-toast
this.toast.success('Saved', null, { preventDuplicates: true });
```

### Debug mode

Enable console logging for development:

```ts
provideNgxMatToast({ enableDebug: true });
```

---

## `ngx-toastr` compatibility

For simpler migrations, you can import the compatibility adapter:

```ts
import { ToastrService } from 'ngx-mat-toast';
```

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

For migration details and adapter caveats, see:

- [Migration guide](https://github.com/Robin-Bley/ngx-mat-toast/blob/main/docs/migrating-from-ngx-toastr.md)
- [Compatibility adapter guide](https://github.com/Robin-Bley/ngx-mat-toast/blob/main/docs/compatibility-adapter.md)

---

## License

MIT
