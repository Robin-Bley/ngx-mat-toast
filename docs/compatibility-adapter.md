# `ngx-toastr` compatibility adapter

`ngx-mat-toast` ships with an optional `ToastrService` adapter to make migrations from `ngx-toastr` lower risk.

This guide explains when to use it, what it supports, and where the compatibility boundary is.

Related guides:

- [Migration guide](./migrating-from-ngx-toastr.md)
- [API reference](./api-reference.md)
- [Configuration guide](./configuration.md)
- [Architecture guide](./architecture.md)

---

## When to use the adapter

Use `ToastrService` when you want to:

- swap imports with minimal churn
- keep existing call signatures during an initial migration phase
- move a large codebase to `ngx-mat-toast` incrementally

Prefer `NgxMatToastService` when you:

- are writing new features
- want the cleanest library-native API
- are ready to finish the migration away from `ngx-toastr` terminology

---

## Import and usage

```ts
import { Component, inject } from '@angular/core';
import { ToastrService } from 'ngx-mat-toast';

@Component({
  selector: 'app-legacy-save-action',
  template: `<button type="button" (click)="save()">Save</button>`,
})
export class LegacySaveActionComponent {
  private readonly toastr: ToastrService = inject(ToastrService);

  public save(): void {
    this.toastr.success('Profile saved successfully.', 'Saved', {
      timeOut: 3000,
      progressBar: true,
      positionClass: 'toast-top-right',
    });
  }
}
```

---

## Supported methods

The adapter supports the most common `ngx-toastr` call patterns:

- `success(message, title, options)`
- `error(message, title, options)`
- `warning(message, title, options)`
- `info(message, title, options)`
- `show(message, title, options, type)`
- `clear(id?)`
- `remove(id?)`

Return types:

- `success()`, `error()`, `warning()`, `info()`, and `show()` return `ActiveToast`
- `clear()` returns `void`
- `remove()` returns `boolean`

---

## Supported configuration mapping

The adapter accepts `Partial<IndividualConfig>` and maps supported options into native `NgxMatToastOptions`.

| `ngx-toastr` option | Native mapping         |
| ------------------- | ---------------------- |
| `timeOut`           | `duration`             |
| `disableTimeOut`    | `duration: 0`          |
| `closeButton`       | `closeable`            |
| `progressBar`       | `progressBar`          |
| `tapToDismiss`      | `tapToDismiss`         |
| `preventDuplicates` | `preventDuplicates`    |
| `maxOpened`         | `maxToasts`            |
| `positionClass`     | `position`             |
| `progressAnimation` | `progressBarDirection` |

### Position class mapping

| `positionClass`             | Native position                                                       |
| --------------------------- | --------------------------------------------------------------------- |
| `'toast-top-left'`          | `{ horizontal: 'start', vertical: 'top' }`                            |
| `'toast-top-center'`        | `{ horizontal: 'center', vertical: 'top' }`                           |
| `'toast-top-right'`         | `{ horizontal: 'end', vertical: 'top' }`                              |
| `'toast-top-full-width'`    | `{ horizontal: 'center', vertical: 'top' }` with `fullWidth: true`    |
| `'toast-bottom-left'`       | `{ horizontal: 'start', vertical: 'bottom' }`                         |
| `'toast-bottom-center'`     | `{ horizontal: 'center', vertical: 'bottom' }`                        |
| `'toast-bottom-right'`      | `{ horizontal: 'end', vertical: 'bottom' }`                           |
| `'toast-bottom-full-width'` | `{ horizontal: 'center', vertical: 'bottom' }` with `fullWidth: true` |

Important note: the `full-width` position classes automatically enable the `fullWidth` layout option, which renders the toast snackbar across the full width of its container, matching the legacy ngx-toastr behavior.

---

## `ActiveToast` result shape

Adapter methods return a lightweight compatibility result.

```ts
interface ActiveToast {
  toastId: string;
  title?: string;
  message?: string;
  toastRef: NgxMatToastRef;
}
```

This lets you keep a familiar migration shape while still gaining access to the native `NgxMatToastRef` when needed.

---

## What the adapter does not try to replicate

The adapter is intentionally pragmatic. It does not aim for full feature parity with every part of `ngx-toastr`.

Notable boundaries:

- no promise of total visual parity with `ngx-toastr`
- no custom HTML or template rendering parity
- no escape from the single Angular Material snackbar host model

The adapter is best viewed as a migration bridge, not a forever abstraction.

---

## Best-practice migration strategy

### Stage 1: swap package and provider setup

- uninstall `ngx-toastr`
- install `ngx-mat-toast`
- register `provideNgxMatToast()` or `NgxMatToastModule.forRoot()`

No Angular animations provider is required for `ngx-mat-toast` itself because the library and the current Material snackbar host use CSS-native motion.

### Stage 2: change imports only

Replace:

```ts
import { ToastrService } from 'ngx-toastr';
```

with:

```ts
import { ToastrService } from 'ngx-mat-toast';
```

### Stage 3: stabilize behavior

Validate:

- global positioning
- timeout behavior
- duplicate handling
- max toast count
- styles in the overlay container

### Stage 4: migrate feature code to the native service

Over time, replace:

- `ToastrService`
- `IndividualConfig`
- `positionClass`
- `timeOut`

with:

- `NgxMatToastService`
- `NgxMatToastOptions`
- `position`
- `duration`

That gives your codebase cleaner type names and a more direct mental model.

---

## Mapping helper example

Use `mapNgxToastrConfigToNgxMatToastConfig()` if part of your configuration still lives in legacy shapes.

```ts
import { NgxMatToastOptions, mapNgxToastrConfigToNgxMatToastConfig } from 'ngx-mat-toast';

const notificationDefaults: NgxMatToastOptions = mapNgxToastrConfigToNgxMatToastConfig({
  timeOut: 3500,
  closeButton: true,
  progressBar: true,
  positionClass: 'toast-top-right',
});
```

---

## Adapter caveats to communicate to teams

If you are rolling this out across a team, make these boundaries explicit:

- The host is Angular Material `MatSnackBar`, not the original `ngx-toastr` overlay.
- Multiple positions at the same time still resolve to one active host location.
- Full-width classes are mapped, not perfectly recreated.
- The adapter should reduce migration risk, but it should not block eventual cleanup.

---

## When to remove the adapter from your app code

You should prioritize direct use of `NgxMatToastService` when:

- legacy imports are mostly gone
- your configuration has already moved to native option names
- new features no longer require `ngx-toastr` semantics
- you want one primary notification abstraction in the codebase

---

## See also

- [Migration guide](./migrating-from-ngx-toastr.md)
- [API reference](./api-reference.md)
- [Examples](./examples.md)
- [Architecture guide](./architecture.md)
