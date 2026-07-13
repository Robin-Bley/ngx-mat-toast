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

### From the main entry point

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

### From the secondary entry point (tree-shaking optimized)

For better tree-shaking, import from the dedicated adapter entry point:

```ts
import { ToastrService } from 'ngx-mat-toast/toastr-adapter';
```

This allows bundlers to exclude the adapter code when it is not used.

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

| `positionClass`             | Native position                                | `fullWidth` |
| --------------------------- | ---------------------------------------------- | ----------- |
| `'toast-top-left'`          | `{ horizontal: 'start', vertical: 'top' }`     | `false`     |
| `'toast-top-center'`        | `{ horizontal: 'center', vertical: 'top' }`    | `false`     |
| `'toast-top-right'`         | `{ horizontal: 'end', vertical: 'top' }`       | `false`     |
| `'toast-top-full-width'`    | `{ horizontal: 'center', vertical: 'top' }`    | `true`      |
| `'toast-bottom-left'`       | `{ horizontal: 'start', vertical: 'bottom' }`  | `false`     |
| `'toast-bottom-center'`     | `{ horizontal: 'center', vertical: 'bottom' }` | `false`     |
| `'toast-bottom-right'`      | `{ horizontal: 'end', vertical: 'bottom' }`    | `false`     |
| `'toast-bottom-full-width'` | `{ horizontal: 'center', vertical: 'bottom' }` | `true`      |

The `full-width` position classes automatically enable the `fullWidth` configuration, stretching the toast to fill the snackbar container width.

---

## `ActiveToast` result shape

Adapter methods return a lightweight compatibility result with access to lifecycle observables.

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

This lets you keep a familiar migration shape while still gaining access to:

- The native `NgxMatToastRef` for programmatic control
- `onShown` to observe when the toast becomes visible
- `onTap` to react when the toast is clicked

---

## What the adapter does not try to replicate

The adapter is intentionally pragmatic. It does not aim for full feature parity with every part of `ngx-toastr`.

Notable boundaries:

- no promise of total visual parity with `ngx-toastr`
- no literal recreation of `full-width` toast layouts
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
