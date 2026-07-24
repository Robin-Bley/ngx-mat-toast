# Architecture guide

This guide explains how `ngx-mat-toast` works internally so maintainers and advanced consumers can reason about behavior, styling, and trade-offs.

Related guides:

- [Documentation overview](./README.md)
- [API reference](./api-reference.md)
- [Customization guide](./customization.md)
- [Troubleshooting](./troubleshooting.md)

---

## Design goals

The library is built around a few deliberate constraints:

- keep the public API centered around `NgxMatToastService`
- continue using Angular Material `MatSnackBar` as the host outlet
- render a stack of toast cards inside that snackbar outlet
- avoid a runtime dependency on the Material Icons font
- support both standalone and NgModule integration styles
- provide a migration bridge for `ngx-toastr` users

These choices keep the API familiar while staying aligned with Angular Material.

---

## High-level flow

```text
Application code
  -> NgxMatToastService
    -> resolve defaults and overrides
    -> manage active toast signal
    -> ensure one MatSnackBar host exists for the active position
      -> ToastContainerComponent
        -> renders a stack of ToastItemComponent instances
          -> each item handles close interaction and progress UI
```

---

## Why a single snackbar host?

Angular Material already provides a robust snackbar outlet, positioning model, and overlay lifecycle. `ngx-mat-toast` reuses that foundation instead of building a separate overlay stack.

Benefits of this approach:

- simpler integration for Angular Material users
- fewer moving parts in the runtime model
- a familiar mental model for Angular teams
- easier alignment with Material theming and overlay behavior

Trade-off:

- there is one active snackbar host at a time
- if active toasts request different positions, the stack moves to the latest requested position

That trade-off is intentional and should shape your app-level defaults.

---

## Toast creation lifecycle

When application code calls `success()`, `error()`, `warning()`, `info()`, or `show()`, the service performs these steps:

1. Merge `DEFAULT_TOAST_CONFIG`, root configuration, and per-toast overrides.
2. Log debug information if `enableDebug` is active.
3. Check for duplicates when `preventDuplicates` is enabled.
4. Enforce `maxToasts` by removing the oldest toast first.
5. Create a new toast model and a `NgxMatToastRef`.
6. Add the toast to the reactive signal used by the outlet.
7. Open or reuse the snackbar host for the resolved position.
8. Schedule auto-dismiss when `duration > 0`.
9. Notify the `NgxMatToastRef` when the toast is later removed.

---

## Position behavior

`ngx-mat-toast` stores the current outlet position and compares it with the position needed by a new toast.

### If the position matches

- the existing snackbar host is reused
- the new toast is added to the existing stack

### If the position differs

- the current host is dismissed
- a new snackbar host is opened at the requested position
- the stack is re-rendered in the new host

This is why a best-practice configuration keeps one default position for most of the app.

---

## Stack ordering

Within the stack:

- the newest toast is closest to the viewport edge
- top stacks render visually from the top edge downward
- bottom stacks render visually from the bottom edge upward

This behavior is implemented with a reversed flex direction for top-positioned stacks.

---

## Visibility and pending toasts

New toasts are not always marked visible immediately.

If a toast is created while the snackbar host for its position is still opening, the toast waits in a pending state until the outlet reports that it has opened. Once the outlet is ready, pending toasts are revealed and timed dismissals begin.

This avoids starting animations and timers before the host is ready.

---

## Dismissal lifecycle

A toast can disappear in several ways:

- auto-dismiss after `duration`
- click on the toast card when `tapToDismiss` is enabled
- click on the close button when `closeable` is enabled
- programmatic dismissal through `NgxMatToastRef.dismiss()`
- programmatic dismissal through `dismiss(id)`
- bulk dismissal through `clear()`
- implicit removal because `maxToasts` was exceeded

When a toast is removed:

1. its timer is cleared
2. it is removed from the active signal
3. the corresponding `NgxMatToastRef` is notified
4. the snackbar host is destroyed when no toasts remain

---

## Progress bar behavior

Progress bars are purely visual and appear only when:

- `progressBar` is `true`
- `duration > 0`
- the toast is visible
- the toast is not already leaving

The progress value updates over time and supports two directions:

- `'decreasing'`
- `'increasing'`

Best practice: use progress bars for timed informational feedback, not for persistent error states.

---

## Duplicate handling

If `preventDuplicates` is enabled, the service checks active toasts by:

- `message`
- `title`
- `type`

When a match exists, the service returns the existing `NgxMatToastRef` instead of creating a new toast.

This keeps noisy workflows under control and is especially useful for save loops, reconnect notifications, and polling-driven updates.

---

## Max toast enforcement

If `maxToasts` is greater than `0`, the service enforces the limit before adding a new toast.

Behavior:

- when the limit is reached, the oldest toast is removed first
- the new toast is then added

This gives the newest events priority and prevents runaway visual stacks.

---

## Styling model

The styling model is intentionally library-safe:

- the snackbar host gets a stable `panelClass`: `.ngx-mat-toast-snack-panel`
- the stack gets a stable wrapper: `.ngx-mat-toast-stack`
- toast cards use stable BEM-style classes such as `.ngx-mat-toast-item__title`
- icons are inline SVG, so no Material Icons font is required

Because the snackbar renders in the overlay container, customization should typically happen in global styles.

---

## Accessibility model

`ngx-mat-toast` relies on Angular Material's `MatSnackBar` for live-region semantics and announcement behavior:

- **no local role or aria-live**: Toast cards themselves do not carry `role="status"`, `role="alert"`, or `aria-atomic` attributes. These would be redundant because the snackbar host already provides a live region.
- **politeness level**: The service automatically sets the snackbar's `politeness` configuration based on active toast types:
  - `'assertive'` when the stack contains error or warning toasts
  - `'polite'` otherwise

This approach preserves urgency cues for important notifications while avoiding duplicate live-region markup.

---

## Compatibility adapter role

`ToastrService` is intentionally a bridge, not a second first-class API surface.

Its purpose is to let teams:

- swap imports from `ngx-toastr` to `ngx-mat-toast`
- preserve common call patterns
- migrate incrementally toward `NgxMatToastService`

It supports the most common option mappings, but it does not try to mirror every `ngx-toastr` feature.

---

## Operational recommendations

### For application teams

- choose one default position
- cap the toast count for noisy systems
- enable duplicate prevention when users can trigger repeated actions quickly
- keep persistent toasts rare and meaningful

### For maintainers

- keep the host based on `MatSnackBar`
- preserve the stack model rather than opening one snackbar per toast
- keep public API changes reflected in the documentation suite
- keep compatibility behavior explicit rather than silently broadening it

---

## When to read this guide again

Return to this document when you need to answer questions like:

- Why did the stack move after a toast used a different position?
- Why did a duplicate toast not appear?
- Why are my global styles the right place for customization?
- Why does `maxToasts` remove the oldest toast first?
- Why does the library avoid a custom overlay implementation?

---

## See also

- [Configuration guide](./configuration.md)
- [Customization guide](./customization.md)
- [Compatibility adapter guide](./compatibility-adapter.md)
- [Troubleshooting](./troubleshooting.md)
