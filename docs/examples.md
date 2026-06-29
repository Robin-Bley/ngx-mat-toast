# Examples and recipes

This guide collects practical usage patterns for `ngx-mat-toast`.

Related guides:

- [Documentation overview](./README.md)
- [Getting started](./getting-started.md)
- [Configuration guide](./configuration.md)
- [Compatibility adapter guide](./compatibility-adapter.md)

---

## Example 1: simple save confirmation

Use the native service for short success feedback.

```ts
import { Component, inject } from '@angular/core';
import { NgxMatToastService } from 'ngx-mat-toast';

@Component({
  selector: 'app-profile-form',
  template: `<button type="button" (click)="save()">Save</button>`,
})
export class ProfileFormComponent {
  private readonly toast: NgxMatToastService = inject(NgxMatToastService);

  public save(): void {
    this.toast.success('Profile saved successfully.', 'Saved', {
      duration: 2500,
      progressBar: true,
    });
  }
}
```

Why it works well:

- short title
- clear success copy
- timed auto-dismiss
- progress bar gives the user a sense of duration

---

## Example 2: long-running task with explicit completion

Use a persistent info toast while work is running, then replace it with success or error feedback.

```ts
import { Injectable, inject } from '@angular/core';
import { NgxMatToastRef, NgxMatToastService } from 'ngx-mat-toast';

@Injectable({ providedIn: 'root' })
export class ExportNotificationsService {
  private readonly toast: NgxMatToastService = inject(NgxMatToastService);

  public notifyExportStarted(): NgxMatToastRef {
    const toastRef: NgxMatToastRef = this.toast.info('Export is running.', 'Export', {
      duration: 0,
      tapToDismiss: false,
      closeable: true,
    });

    return toastRef;
  }

  public notifyExportSucceeded(runningToastRef: NgxMatToastRef): void {
    runningToastRef.dismiss();
    this.toast.success('Export completed successfully.', 'Export ready', {
      duration: 3000,
      progressBar: true,
    });
  }

  public notifyExportFailed(runningToastRef: NgxMatToastRef): void {
    runningToastRef.dismiss();
    this.toast.error('Export failed. Please try again.', 'Export error', {
      duration: 0,
      tapToDismiss: false,
      closeable: true,
    });
  }
}
```

Best practice: use one persistent toast per long-running process, not a new persistent toast on every progress update.

---

## Example 3: form validation summary

Use a warning toast when the form cannot be submitted.

```ts
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMatToastService } from 'ngx-mat-toast';

@Component({
  selector: 'app-sign-up-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <button type="submit">Create account</button>
    </form>
  `,
})
export class SignUpFormComponent {
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly toast: NgxMatToastService = inject(NgxMatToastService);

  public readonly form: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(12)]],
  });

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Please review the highlighted fields.', 'Validation required', {
        duration: 4000,
        preventDuplicates: true,
      });
      return;
    }

    this.toast.success('Account created.', 'Welcome');
  }
}
```

Why `preventDuplicates` helps here:

- users often click submit more than once
- the validation toast stays singular instead of stacking repeatedly

---

## Example 4: mobile-aware positioning

Override the position when the UX needs a different placement on small screens.

```ts
import { Component, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NgxMatToastService } from 'ngx-mat-toast';

@Component({
  selector: 'app-device-aware-toast',
  template: `<button type="button" (click)="notify()">Notify</button>`,
})
export class DeviceAwareToastComponent {
  private readonly breakpoints: BreakpointObserver = inject(BreakpointObserver);
  private readonly toast: NgxMatToastService = inject(NgxMatToastService);

  public notify(): void {
    const isSmallScreen: boolean = this.breakpoints.isMatched('(max-width: 599px)');

    this.toast.info('Connection restored.', 'Online', {
      position: isSmallScreen
        ? { horizontal: 'center', vertical: 'bottom' }
        : { horizontal: 'end', vertical: 'top' },
    });
  }
}
```

Best practice: keep this kind of override intentional. Frequent position switching can make the stack feel unstable.

---

## Example 5: noisy background event suppression

Use duplicate prevention and a low toast cap for polling-heavy or event-heavy screens.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNgxMatToast } from 'ngx-mat-toast';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideNgxMatToast({
      preventDuplicates: true,
      maxToasts: 3,
      position: { horizontal: 'end', vertical: 'bottom' },
      progressBar: true,
    }),
  ],
};
```

This is a strong baseline for dashboards, monitoring UIs, and systems with frequent background status updates.

---

## Example 6: adapter-first migration from `ngx-toastr`

When migrating incrementally, keep the familiar adapter first.

```ts
import { Component, inject } from '@angular/core';
import { ToastrService } from 'ngx-mat-toast';

@Component({
  selector: 'app-legacy-save-button',
  template: `<button type="button" (click)="save()">Save</button>`,
})
export class LegacySaveButtonComponent {
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

Then migrate to the native service later when your team is ready.

---

## Example 7: map legacy config to the native option model

Use the mapping helper when consolidating old configuration.

```ts
import { NgxMatToastOptions, mapNgxToastrConfigToNgxMatToastConfig } from 'ngx-mat-toast';

const toastOptions: NgxMatToastOptions = mapNgxToastrConfigToNgxMatToastConfig({
  timeOut: 4000,
  closeButton: true,
  progressBar: true,
  positionClass: 'toast-bottom-right',
});
```

This is useful during phased refactors where some configuration still originates from `ngx-toastr` conventions.

---

## Example 8: explicit dismissal by id

If you want to dismiss a toast from another code path later, store the id.

```ts
import { Injectable, inject } from '@angular/core';
import { NgxMatToastRef, NgxMatToastService } from 'ngx-mat-toast';

@Injectable({ providedIn: 'root' })
export class SessionBannerService {
  private readonly toast: NgxMatToastService = inject(NgxMatToastService);
  private activeToastId: string | null = null;

  public showWarning(): void {
    const toastRef: NgxMatToastRef = this.toast.warning('Session expires soon.', 'Warning', {
      duration: 0,
      closeable: true,
    });

    this.activeToastId = toastRef.id;
  }

  public clearWarning(): void {
    if (!this.activeToastId) {
      return;
    }

    this.toast.dismiss(this.activeToastId);
    this.activeToastId = null;
  }
}
```

---

## Example 9: use `show()` when the toast type is dynamic

`show()` is useful when the toast type is determined at runtime.

```ts
import { Injectable, inject } from '@angular/core';
import { NgxMatToastService, ToastType } from 'ngx-mat-toast';

@Injectable({ providedIn: 'root' })
export class SyncResultNotifierService {
  private readonly toast: NgxMatToastService = inject(NgxMatToastService);

  public notify(type: ToastType, message: string): void {
    this.toast.show(message, type, 'Sync result', {
      duration: type === 'error' ? 0 : 3000,
      progressBar: type !== 'error',
      closeable: true,
    });
  }
}
```

---

## Recipe selection guide

Choose the pattern that matches your situation:

- Routine success message: Example 1
- Long-running workflow: Example 2
- Form validation: Example 3
- Responsive placement: Example 4
- Event-heavy dashboard: Example 5
- `ngx-toastr` migration: Example 6 or 7
- Cross-flow dismissal: Example 8
- Runtime-selected type: Example 9

---

## See also

- [Configuration guide](./configuration.md)
- [API reference](./api-reference.md)
- [Migration guide](./migrating-from-ngx-toastr.md)
- [Compatibility adapter guide](./compatibility-adapter.md)
