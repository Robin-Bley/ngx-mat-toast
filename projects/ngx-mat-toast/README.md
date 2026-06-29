# ngx-mat-toast

`ngx-mat-toast` is a toast notification library for Angular built on top of **Angular Material Snackbar**.

It provides a simple, `ngx-toastr`-style API while keeping the implementation aligned with modern Angular practices.

## Highlights

- Angular Material Snackbar powered
- standalone + NgModule support
- typed service API
- close button, progress bar, duplicate prevention, and max toast limits
- persistent toasts with `duration: 0`
- optional `ToastrService` compatibility adapter for `ngx-toastr` migrations
- no Material Icons font dependency

---

## Installation

```bash
npm install ngx-mat-toast @angular/material @angular/cdk @angular/animations
```

> Your app must also provide Angular animations with `provideAnimations()`, `provideAnimationsAsync()`, or `provideNoopAnimations()`.

---

## Standalone usage

```ts
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
   $theme: mat.define-light-theme((...));
   @include mat.all-component-colors($theme);
   ```

2. **Overriding toast styles:**
   ```scss
   ::ng-deep .mat-mdc-snack-bar-container {
     .ngx-mat-toast {
       border-radius: 12px;
       box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
     }
   }
   ```

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

---

## License

MIT
