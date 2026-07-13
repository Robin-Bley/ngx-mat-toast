# API reference

This page documents the public exports of `ngx-mat-toast`.

Related guides:

- [Documentation overview](./README.md)
- [Getting started](./getting-started.md)
- [Configuration guide](./configuration.md)
- [Compatibility adapter guide](./compatibility-adapter.md)

---

## Public exports at a glance

| Symbol                                  | Kind            | Purpose                                              |
| --------------------------------------- | --------------- | ---------------------------------------------------- |
| `NgxMatToastService`                    | class           | Primary toast API for application code.              |
| `NgxMatToastRef`                        | class           | Handle for dismissing or observing a toast instance. |
| `NgxMatToastConfig`                     | type            | Fully resolved toast configuration shape.            |
| `NgxMatToastOptions`                    | type            | Consumer-facing configuration overrides.             |
| `DEFAULT_TOAST_CONFIG`                  | constant        | Exported default configuration object.               |
| `ToastType`                             | type            | `'success' \| 'error' \| 'warning' \| 'info'`.       |
| `ToastHorizontalPosition`               | type            | Horizontal snackbar position.                        |
| `ToastVerticalPosition`                 | type            | Vertical snackbar position.                          |
| `ToastPosition`                         | type            | `{ horizontal, vertical }`.                          |
| `ToastData`                             | type            | Exported toast model used by the stack.              |
| `provideNgxMatToast`                    | function        | Standalone provider helper.                          |
| `NgxMatToastModule`                     | class           | NgModule integration entry point.                    |
| `NGX_MAT_TOAST_CONFIG`                  | injection token | Advanced access to root-level configuration.         |
| `ToastrService`                         | class           | Migration adapter for `ngx-toastr`-style usage.      |
| `mapNgxToastrConfigToNgxMatToastConfig` | function        | Maps `ngx-toastr` config to native toast options.    |
| `ToastrPositionClass`                   | type            | Supported `ngx-toastr` position class names.         |
| `ActiveToast`                           | type            | Lightweight compatibility result for adapter calls.  |
| `IndividualConfig`                      | type            | Supported `ngx-toastr`-style override object.        |

---

## `NgxMatToastService`

This is the primary service for new code.

### Method signatures

```ts
success(message: string, title?: string, options?: NgxMatToastOptions): NgxMatToastRef
error(message: string, title?: string, options?: NgxMatToastOptions): NgxMatToastRef
warning(message: string, title?: string, options?: NgxMatToastOptions): NgxMatToastRef
info(message: string, title?: string, options?: NgxMatToastOptions): NgxMatToastRef
show(
  message: string,
  type?: ToastType,
  title?: string,
  options?: NgxMatToastOptions,
): NgxMatToastRef

dismiss(id: string): boolean
clear(): void
```

### Usage example

```ts
import { Component, inject } from '@angular/core';
import { NgxMatToastRef, NgxMatToastService } from 'ngx-mat-toast';

@Component({
  selector: 'app-order-actions',
  template: `<button type="button" (click)="completeOrder()">Complete order</button>`,
})
export class OrderActionsComponent {
  private readonly toast: NgxMatToastService = inject(NgxMatToastService);

  public completeOrder(): void {
    const toastRef: NgxMatToastRef = this.toast.success('Order completed.', 'Success', {
      duration: 2500,
      progressBar: true,
    });

    console.log(toastRef.id);
  }
}
```

### Notes

- `show()` is the generic entry point and defaults to `type: 'info'`.
- `dismiss(id)` returns `false` when the toast id is no longer active.
- `clear()` dismisses all active toasts.
- When `preventDuplicates` is enabled, the service can return the existing `NgxMatToastRef` for a matching active toast.

---

## `NgxMatToastRef`

A `NgxMatToastRef` gives you programmatic control over a single toast.

### Public members

```ts
readonly id: string

dismiss(): void
afterDismissed(): Observable<void>
onShown(): Observable<void>
onTap(): Observable<void>
```

### Usage example

```ts
import { Injectable, inject } from '@angular/core';
import { NgxMatToastRef, NgxMatToastService } from 'ngx-mat-toast';

@Injectable({ providedIn: 'root' })
export class UploadNotifierService {
  private readonly toast: NgxMatToastService = inject(NgxMatToastService);

  public notifyUploadStarted(): NgxMatToastRef {
    const toastRef: NgxMatToastRef = this.toast.info('Upload started.', 'Upload', {
      duration: 0,
      tapToDismiss: false,
    });

    toastRef.afterDismissed().subscribe((): void => {
      console.log('Upload toast dismissed.');
    });

    toastRef.onShown().subscribe((): void => {
      console.log('Upload toast is now visible.');
    });

    return toastRef;
  }
}
```

### Behavior notes

- `dismiss()` forwards to the service using the toast id.
- `afterDismissed()` emits once when the toast is dismissed and then completes.
- `onShown()` emits once when the toast becomes visible on screen and then completes.
- `onTap()` emits every time the toast card is clicked, regardless of `tapToDismiss` setting. It continues emitting on each click until the toast is dismissed.
- If a toast is removed because of `maxToasts`, `clear()`, or a direct `dismiss(id)`, the reference still receives the dismissal notification.

---

## Configuration types

### `NgxMatToastConfig`

The fully resolved internal configuration.

```ts
interface NgxMatToastConfig {
  duration: number;
  position: ToastPosition;
  closeable: boolean;
  progressBar: boolean;
  progressBarDirection: 'increasing' | 'decreasing';
  tapToDismiss: boolean;
  preventDuplicates: boolean;
  maxToasts: number;
  enableDebug: boolean;
  fullWidth: boolean;
}
```

### `NgxMatToastOptions`

The override type for consumers.

```ts
type NgxMatToastOptions = Omit<Partial<NgxMatToastConfig>, 'position'> & {
  position?: Partial<ToastPosition>;
};
```

Use this type for:

- app-level defaults via `provideNgxMatToast()`
- app-level defaults via `NgxMatToastModule.forRoot()`
- per-toast overrides passed to service methods

### `DEFAULT_TOAST_CONFIG`

```ts
const DEFAULT_TOAST_CONFIG: NgxMatToastConfig;
```

Use this when you want to start from library defaults in advanced configuration scenarios.

---

## Position and type aliases

### `ToastType`

```ts
type ToastType = 'success' | 'error' | 'warning' | 'info';
```

### `ToastHorizontalPosition`

```ts
type ToastHorizontalPosition = 'start' | 'center' | 'end' | 'left' | 'right';
```

### `ToastVerticalPosition`

```ts
type ToastVerticalPosition = 'top' | 'bottom';
```

### `ToastPosition`

```ts
interface ToastPosition {
  horizontal: ToastHorizontalPosition;
  vertical: ToastVerticalPosition;
}
```

Recommendation: prefer `start` and `end` in app code unless you need literal `left` or `right` semantics.

---

## `ToastData`

```ts
interface ToastData {
  id: string;
  message: string;
  title?: string;
  type: ToastType;
  config: NgxMatToastConfig;
  createdAt: number;
  isVisible: boolean;
}
```

This type is exported for advanced typing scenarios, but most application code should work with `NgxMatToastRef` instead of raw toast models.

---

## Standalone integration API

### `provideNgxMatToast`

```ts
function provideNgxMatToast(config?: NgxMatToastOptions): EnvironmentProviders;
```

Use this in standalone Angular apps.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideNgxMatToast } from 'ngx-mat-toast';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxMatToast({
      position: { horizontal: 'end', vertical: 'top' },
      progressBar: true,
    }),
  ],
};
```

Important: `ngx-mat-toast` uses CSS-native motion, so no Angular animations provider is required for the library itself.

---

## NgModule integration API

### `NgxMatToastModule`

```ts
class NgxMatToastModule {
  static forRoot(config?: NgxMatToastOptions): ModuleWithProviders<NgxMatToastModule>;
}
```

Use this in NgModule-based Angular applications.

```ts
import { NgModule } from '@angular/core';
import { NgxMatToastModule } from 'ngx-mat-toast';

@NgModule({
  imports: [
    NgxMatToastModule.forRoot({
      progressBar: true,
      preventDuplicates: true,
    }),
  ],
})
export class AppModule {}
```

---

## `NGX_MAT_TOAST_CONFIG`

```ts
const NGX_MAT_TOAST_CONFIG: InjectionToken<NgxMatToastOptions>;
```

This token is exported for advanced scenarios. Most applications should prefer the supported setup helpers:

- `provideNgxMatToast()`
- `NgxMatToastModule.forRoot()`

Use the token only if you have a strong DI-specific requirement.

---

## Compatibility adapter API

### `ToastrService`

The adapter exists for migrations from `ngx-toastr`.

```ts
success(message?: string, title?: string, override?: Partial<IndividualConfig>): ActiveToast
error(message?: string, title?: string, override?: Partial<IndividualConfig>): ActiveToast
info(message?: string, title?: string, override?: Partial<IndividualConfig>): ActiveToast
warning(message?: string, title?: string, override?: Partial<IndividualConfig>): ActiveToast
show(
  message?: string,
  title?: string,
  override?: Partial<IndividualConfig>,
  type?: string,
): ActiveToast

clear(toastId?: string): void
remove(toastId?: string): boolean
```

Important differences from the native service:

- The `show()` argument order follows `ngx-toastr` expectations.
- Calls return `ActiveToast`, not `NgxMatToastRef` directly.
- The adapter focuses on common migration cases, not total API parity.

### `ActiveToast`

```ts
interface ActiveToast {
  toastId: string;
  title?: string;
  message?: string;
  toastRef: NgxMatToastRef;
  onShown: Observable<void>;
  onTap: Observable<void>;
}
```

### `IndividualConfig`

```ts
interface IndividualConfig {
  timeOut?: number;
  disableTimeOut?: boolean | 'timeOut' | 'extendedTimeOut';
  closeButton?: boolean;
  progressBar?: boolean;
  tapToDismiss?: boolean;
  preventDuplicates?: boolean;
  maxOpened?: number;
  positionClass?: ToastrPositionClass;
  progressAnimation?: 'increasing' | 'decreasing';
}
```

### `ToastrPositionClass`

```ts
type ToastrPositionClass =
  | 'toast-top-left'
  | 'toast-top-center'
  | 'toast-top-right'
  | 'toast-top-full-width'
  | 'toast-bottom-left'
  | 'toast-bottom-center'
  | 'toast-bottom-right'
  | 'toast-bottom-full-width';
```

### `mapNgxToastrConfigToNgxMatToastConfig`

```ts
function mapNgxToastrConfigToNgxMatToastConfig(
  config?: Partial<IndividualConfig>,
): NgxMatToastOptions;
```

Use this helper when you want to translate legacy `ngx-toastr` configuration into native `ngx-mat-toast` options during a staged migration.

---

## Compatibility adapter secondary entry point

For tree-shaking optimization, you can import the `ToastrService` adapter from a separate entry point:

```ts
import { ToastrService, mapNgxToastrConfigToNgxMatToastConfig } from 'ngx-mat-toast/toastr-adapter';
```

This allows consumers who do not use the compatibility layer to exclude it from their bundle.

---

## Which API should you choose?

### Choose `NgxMatToastService` when:

- you are writing new application code
- you want the clearest type signatures
- you want the library-native option names

### Choose `ToastrService` when:

- you are replacing `ngx-toastr` incrementally
- you want to minimize churn in existing call sites
- you plan to migrate to the native service later

---

## See also

- [Configuration guide](./configuration.md)
- [Examples](./examples.md)
- [Migration guide](./migrating-from-ngx-toastr.md)
- [Compatibility adapter guide](./compatibility-adapter.md)
