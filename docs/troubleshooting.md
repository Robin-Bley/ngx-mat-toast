# Troubleshooting

Use this guide when `ngx-mat-toast` is installed but the behavior is not what you expected.

Related guides:

- [Documentation overview](./README.md)
- [Getting started](./getting-started.md)
- [Customization guide](./customization.md)
- [Architecture guide](./architecture.md)

---

## Quick diagnosis table

| Symptom                                                       | Likely cause                                            | What to check                                                                            |
| ------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| No toast appears at all                                       | Library setup is missing or the toast call never runs   | Verify `provideNgxMatToast()` or `NgxMatToastModule.forRoot()` and confirm the code path |
| Toast appears but custom styles do not apply                  | Styles live in component scope instead of global styles | Move overrides to `styles.scss` or another global stylesheet                             |
| A new toast does not appear even though the method was called | `preventDuplicates` returned the active toast           | Check whether the same title, message, and type are already visible                      |
| A toast never disappears                                      | `duration` is `0` or the toast is persistent by design  | Inspect resolved options                                                                 |
| The stack moved to another corner                             | A newer toast requested a different `position`          | Standardize position usage in the workflow                                               |
| Progress bar is missing                                       | `progressBar` is `false` or `duration <= 0`             | Check both values                                                                        |
| Close button is missing                                       | `closeable` is `false`                                  | Check global defaults and per-toast overrides                                            |
| Full-width `ngx-toastr` positions do not match old visuals    | Compatibility adapter maps them to centered positions   | Review the adapter guide and adjust expectations                                         |

---

## Problem: no toast is visible

### Checklist

1. Confirm that the library is registered:
   - standalone: `provideNgxMatToast()`
   - NgModule: `NgxMatToastModule.forRoot()`
2. Confirm that the toast method is actually executed.
3. Confirm that there is no runtime error before the toast call.

### Recommended minimal setup

```ts
import { ApplicationConfig } from '@angular/core';
import { provideNgxMatToast } from 'ngx-mat-toast';

export const appConfig: ApplicationConfig = {
  providers: [provideNgxMatToast()],
};
```

---

## Problem: the editor warns that `provideAnimations()` or `BrowserAnimationsModule` is deprecated

`ngx-mat-toast` does not need Angular's legacy animations package for its own behavior.

### Fix

Remove the deprecated animation provider or module from toast-only setup:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideNgxMatToast } from 'ngx-mat-toast';

export const appConfig: ApplicationConfig = {
  providers: [provideNgxMatToast()],
};
```

If another part of your application still uses Angular's legacy animation APIs, keep that setup only for those features.

---

## Problem: styles are not applied

`MatSnackBar` renders through the CDK overlay container, which usually sits outside component style boundaries.

### Fix

Move your overrides to a global stylesheet.

```scss
.ngx-mat-toast-snack-panel .ngx-mat-toast-item {
  border-radius: 12px;
}
```

### Avoid this assumption

Do not assume a component-scoped stylesheet can always style the snackbar overlay reliably.

---

## Problem: duplicate toasts are suppressed

If `preventDuplicates` is enabled, `ngx-mat-toast` does not create a second toast when the same active combination already exists:

- same `message`
- same `title`
- same `type`

### What happens instead?

The service returns the existing `NgxMatToastRef`.

### What to do

- keep `preventDuplicates` enabled if that behavior is desirable
- disable it for the specific toast if repeated entries are intentional
- vary the message or title only when the content is meaningfully different

---

## Problem: the toast never dismisses

The most common reason is a persistent configuration.

### Check

- `duration: 0`
- `disableTimeOut` when using the compatibility adapter

### Fix options

- restore a numeric `duration`
- add a close button with `closeable: true`
- dismiss it programmatically with `NgxMatToastRef.dismiss()` or `dismiss(id)`

---

## Problem: the stack changes position unexpectedly

This is an architectural characteristic of the library.

`ngx-mat-toast` keeps a single active snackbar host. If a later toast requests a different position, the stack moves to that new position.

### Best-practice fix

- choose one default position for the app
- override the position only for deliberate UX reasons
- avoid mixing top and bottom placements in the same burst of notifications

For more context, see [`architecture.md`](./architecture.md).

---

## Problem: progress bar does not render

The progress bar is shown only when all of the following are true:

- `progressBar === true`
- `duration > 0`
- the toast is visible

### Example that will not show a progress bar

```ts
this.toast.info('Waiting for approval.', 'Approval', {
  duration: 0,
  progressBar: true,
});
```

That toast is persistent, so there is no timed duration to visualize.

---

## Problem: close button does not show up

Check whether `closeable` is disabled globally or locally.

```ts
this.toast.error('A recoverable error occurred.', 'Retry needed', {
  duration: 0,
  closeable: true,
});
```

Also confirm that custom CSS is not hiding `.ngx-mat-toast-item__close`.

---

## Problem: migration from `ngx-toastr` does not look identical

The compatibility adapter preserves common behavior patterns, but it does not promise pixel-perfect parity.

### Important differences

- the host is Material snackbar based
- full-width legacy positions map to centered stacks
- unsupported `ngx-toastr` features stay unsupported intentionally

Use these docs together:

- [`migrating-from-ngx-toastr.md`](./migrating-from-ngx-toastr.md)
- [`compatibility-adapter.md`](./compatibility-adapter.md)

---

## Debugging tips

### Turn on debug output

```ts
import { provideNgxMatToast } from 'ngx-mat-toast';

provideNgxMatToast({
  enableDebug: true,
});
```

This logs the toast message, title, type, and resolved config to the browser console.

### Inspect the overlay DOM

In browser devtools, inspect the overlay container and look for:

- `.ngx-mat-toast-snack-panel`
- `.mat-mdc-snack-bar-container`
- `.ngx-mat-toast-stack`
- `.ngx-mat-toast-item`

If the DOM exists but the styles are wrong, the issue is usually CSS scope or selector choice.

---

## Safe escalation path

If something still behaves incorrectly, work through the problem in this order:

1. reduce the setup to a minimal toast example
2. remove custom styles temporarily
3. verify the root provider setup
4. enable debug logging
5. compare the behavior against [`architecture.md`](./architecture.md)
6. if migrating, compare the behavior against [`compatibility-adapter.md`](./compatibility-adapter.md)

---

## See also

- [Getting started](./getting-started.md)
- [Configuration guide](./configuration.md)
- [Customization guide](./customization.md)
- [Architecture guide](./architecture.md)
