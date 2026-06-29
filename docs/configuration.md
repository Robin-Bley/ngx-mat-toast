# Configuration guide

This guide explains how `ngx-mat-toast` merges defaults, what each option does, and which settings are recommended in production.

Related guides:

- [Documentation overview](./README.md)
- [Getting started](./getting-started.md)
- [API reference](./api-reference.md)
- [Troubleshooting](./troubleshooting.md)

---

## Configuration model

`ngx-mat-toast` has two configuration layers:

1. **Global defaults** registered once with:
   - `provideNgxMatToast()`
   - `NgxMatToastModule.forRoot()`
2. **Per-toast overrides** passed to a toast method such as `success()` or `show()`.

The service merges them in this order:

1. `DEFAULT_TOAST_CONFIG`
2. App-level global configuration
3. Per-toast overrides

Nested `position` values are merged partially, so you can override only `horizontal` or only `vertical`.

---

## Default values

These are the library defaults exported as `DEFAULT_TOAST_CONFIG`.

| Option                 | Type                                                | Default        | What it controls                                                                                |
| ---------------------- | --------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| `duration`             | `number`                                            | `3000`         | Auto-dismiss delay in milliseconds. Use `0` for persistent toasts.                              |
| `position.horizontal`  | `'start' \| 'center' \| 'end' \| 'left' \| 'right'` | `'end'`        | Horizontal placement of the snackbar host.                                                      |
| `position.vertical`    | `'top' \| 'bottom'`                                 | `'top'`        | Vertical placement of the snackbar host.                                                        |
| `closeable`            | `boolean`                                           | `true`         | Shows the close button.                                                                         |
| `progressBar`          | `boolean`                                           | `false`        | Renders a determinate progress bar.                                                             |
| `progressBarDirection` | `'decreasing' \| 'increasing'`                      | `'decreasing'` | Controls whether the progress bar shrinks or grows over time.                                   |
| `tapToDismiss`         | `boolean`                                           | `true`         | Allows clicking the toast card to dismiss it.                                                   |
| `preventDuplicates`    | `boolean`                                           | `false`        | Reuses the active toast instead of creating a duplicate with the same title, message, and type. |
| `maxToasts`            | `number`                                            | `5`            | Maximum visible toasts. `0` disables the limit.                                                 |
| `enableDebug`          | `boolean`                                           | `false`        | Logs toast activity to the browser console.                                                     |

---

## Global configuration

Use global configuration for the behavior that should be consistent across the application.

### Standalone setup

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
      preventDuplicates: true,
      maxToasts: 4,
      position: { horizontal: 'end', vertical: 'top' },
    }),
  ],
};
```

### NgModule setup

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
      preventDuplicates: true,
      maxToasts: 4,
      position: { horizontal: 'end', vertical: 'top' },
    }),
  ],
})
export class AppModule {}
```

Best practice: use global defaults for position, max toast count, and duplicate handling. Keep per-toast overrides focused on exceptional flows.

---

## Per-toast overrides

Per-toast overrides are useful when one notification should behave differently from the global baseline.

```ts
import { Component, inject } from '@angular/core';
import { NgxMatToastRef, NgxMatToastService } from 'ngx-mat-toast';

@Component({
  selector: 'app-settings',
  template: `<button type="button" (click)="save()">Save settings</button>`,
})
export class SettingsComponent {
  private readonly toast: NgxMatToastService = inject(NgxMatToastService);

  public save(): void {
    const toastRef: NgxMatToastRef = this.toast.success('Settings saved.', 'Saved', {
      duration: 1500,
      position: { vertical: 'bottom' },
      closeable: false,
    });

    console.log(toastRef.id);
  }
}
```

In that example:

- `duration` overrides the global value.
- `position.vertical` changes only the vertical placement.
- `position.horizontal` still comes from the global configuration.

---

## Option-by-option guidance

### `duration`

- Use `2000` to `4000` for routine success and info toasts.
- Use `0` only for notifications that require acknowledgement or later dismissal.
- Very short durations can make toasts unreadable.

```ts
this.toast.error('Connection lost.', 'Offline', {
  duration: 0,
  tapToDismiss: false,
});
```

### `position`

`position` controls the Material snackbar host, not a free-floating custom overlay.

```ts
this.toast.warning('Battery is low.', 'Warning', {
  position: { horizontal: 'center', vertical: 'bottom' },
});
```

Best practice:

- Prefer `start` and `end` over `left` and `right` for better bidirectional layout support.
- Keep one default position for most of the application.
- Only override the position when it improves context, such as mobile-specific UX.

Important implementation note:

- Angular Material exposes one snackbar outlet at a time.
- `ngx-mat-toast` renders a stack of toast cards inside that outlet.
- If active toasts request different positions, the whole stack moves to the most recently requested position.

### `closeable`

Use the close button for long-lived or critical notifications.

```ts
this.toast.info('A background sync is running.', 'In progress', {
  duration: 0,
  closeable: true,
});
```

### `progressBar`

Turn on the progress bar when time awareness matters.

```ts
this.toast.success('Invoice sent.', 'Sent', {
  duration: 3500,
  progressBar: true,
});
```

Use it sparingly for very short toasts or for surfaces that already have heavy motion.

### `progressBarDirection`

- `'decreasing'` feels familiar to most users.
- `'increasing'` can work when the toast represents a countdown filling up to completion.

```ts
this.toast.info('Session expires soon.', 'Reminder', {
  progressBar: true,
  progressBarDirection: 'decreasing',
});
```

### `tapToDismiss`

This is enabled by default and works well for lightweight notifications.

Disable it for toasts that should not be dismissed by accidental clicks.

```ts
this.toast.error('Payment could not be captured.', 'Action required', {
  duration: 0,
  tapToDismiss: false,
});
```

### `preventDuplicates`

When enabled, the service checks active toasts for the same title, message, and type. If a match exists, it returns the existing `NgxMatToastRef` instead of creating a new toast.

```ts
this.toast.info('Sync already running.', 'Background job', {
  preventDuplicates: true,
});
```

This is especially useful for:

- repeated save actions
- retry loops
- background polling notifications
- network reconnection messaging

### `maxToasts`

When the visible count reaches `maxToasts`, the oldest toast is removed first.

```ts
this.toast.info('Queued export.', 'Export', {
  maxToasts: 3,
});
```

Best practice:

- Use a low limit for business apps with frequent status messages.
- Set `0` only when you are certain unbounded stacks are acceptable.

### `enableDebug`

Debug mode logs toast creation and resolved configuration to the browser console.

```ts
this.toast.info('Diagnostics enabled.', 'Debug', {
  enableDebug: true,
});
```

Use this only during development or when diagnosing an integration issue.

---

## Recommended presets

### Balanced product UI

```ts
provideNgxMatToast({
  duration: 3000,
  closeable: true,
  progressBar: true,
  progressBarDirection: 'decreasing',
  tapToDismiss: true,
  preventDuplicates: true,
  maxToasts: 5,
  position: { horizontal: 'end', vertical: 'top' },
});
```

### Operational dashboard

```ts
provideNgxMatToast({
  duration: 5000,
  closeable: true,
  progressBar: true,
  tapToDismiss: false,
  preventDuplicates: true,
  maxToasts: 3,
  position: { horizontal: 'end', vertical: 'bottom' },
});
```

### Migration-friendly baseline for `ngx-toastr` teams

```ts
provideNgxMatToast({
  duration: 3000,
  closeable: true,
  progressBar: true,
  tapToDismiss: true,
  preventDuplicates: false,
  maxToasts: 5,
  position: { horizontal: 'end', vertical: 'top' },
});
```

---

## Configuration anti-patterns

Avoid these common mistakes:

- Setting `duration: 0` for every toast.
- Changing the position frequently in the same user flow.
- Disabling both `tapToDismiss` and `closeable` for persistent toasts.
- Setting `maxToasts: 0` in high-volume event streams without a clear UX plan.
- Enabling `enableDebug` in production builds by default.

---

## Advanced note: `NgxMatToastConfig` vs. `NgxMatToastOptions`

The library exposes two related types:

- `NgxMatToastConfig`: the fully resolved configuration shape.
- `NgxMatToastOptions`: the consumer-facing override type.

`NgxMatToastOptions` allows `position` to be partial, which means you can override only `horizontal` or only `vertical` without repeating both values.

---

## Next steps

- Look up exact signatures in [`api-reference.md`](./api-reference.md).
- Learn safe overlay styling in [`customization.md`](./customization.md).
- Review real-world recipes in [`examples.md`](./examples.md).
- If something behaves unexpectedly, check [`troubleshooting.md`](./troubleshooting.md).
