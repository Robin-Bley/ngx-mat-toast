# Getting started with `ngx-mat-toast`

This guide covers the recommended setup for new projects and for existing Angular applications that want a modern toast API backed by Angular Material Snackbar.

Related guides:

- [Documentation overview](./README.md)
- [Configuration reference](./configuration.md)
- [API reference](./api-reference.md)
- [Examples](./examples.md)

---

## 1. Prerequisites

Before installing the library, make sure your app already uses or can use:

- Angular `21+`
- Angular Material
- Global styles that can target the Material overlay container

`ngx-mat-toast` is designed to feel familiar to `ngx-toastr` users, but the runtime host is Angular Material `MatSnackBar`.

---

## 2. Install the package

```bash
npm install ngx-mat-toast @angular/material @angular/cdk
```

If your project does not yet include Angular Material, install and configure it first according to your team standards.

---

## 3. Choose one integration style

The library supports both Angular integration styles. Use exactly one of them at the application root.

### Option A: standalone Angular applications

Use `provideNgxMatToast()` at the application root.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideNgxMatToast } from 'ngx-mat-toast';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxMatToast({
      duration: 3000,
      progressBar: true,
      position: { horizontal: 'end', vertical: 'top' },
      preventDuplicates: true,
    }),
  ],
};
```

### Option B: NgModule-based Angular applications

> **⚠️ Deprecation Notice:** NgModule support is maintained for backward compatibility but `provideNgxMatToast()` is now the recommended approach for all new projects. Plan to migrate to standalone APIs as your team transitions to modern Angular patterns.

Use `NgxMatToastModule.forRoot()` in the root module.

```ts
import { NgModule } from '@angular/core';
import { NgxMatToastModule } from 'ngx-mat-toast';

@NgModule({
  imports: [
    NgxMatToastModule.forRoot({
      duration: 3000,
      progressBar: true,
      position: { horizontal: 'end', vertical: 'top' },
      preventDuplicates: true,
    }),
  ],
})
export class AppModule {}
```

> Best practice: register the library only once at the application boundary. Avoid providing toast defaults inside feature modules or feature-level environment providers.

---

## 4. Show the first toast

Inject `NgxMatToastService` where notifications originate.

```ts
import { Component, inject } from '@angular/core';
import { NgxMatToastRef, NgxMatToastService } from 'ngx-mat-toast';

@Component({
  selector: 'app-profile',
  template: `<button type="button" (click)="save()">Save profile</button>`,
})
export class ProfileComponent {
  private readonly toast: NgxMatToastService = inject(NgxMatToastService);

  public save(): void {
    const toastRef: NgxMatToastRef = this.toast.success('Profile saved successfully.', 'Saved');

    toastRef.afterDismissed().subscribe((): void => {
      console.log('Save notification closed.');
    });
  }
}
```

For most apps, the following methods are the primary API surface:

- `success(message, title?, options?)`
- `error(message, title?, options?)`
- `warning(message, title?, options?)`
- `info(message, title?, options?)`
- `show(message, type?, title?, options?)`

---

## 5. Use persistent toasts intentionally

Set `duration: 0` when a toast must stay visible until the user or your code dismisses it.

```ts
import { Injectable, inject } from '@angular/core';
import { NgxMatToastRef, NgxMatToastService } from 'ngx-mat-toast';

@Injectable({ providedIn: 'root' })
export class ImportNotifierService {
  private readonly toast: NgxMatToastService = inject(NgxMatToastService);

  public notifyImportStarted(): NgxMatToastRef {
    const toastRef: NgxMatToastRef = this.toast.info('Import is running.', 'In progress', {
      duration: 0,
      tapToDismiss: false,
      closeable: true,
      progressBar: false,
    });

    return toastRef;
  }
}
```

Best practice:

- Use persistent toasts for long-running work, blocking errors, or actionable notifications.
- Do not use persistent toasts for routine success messages.
- Keep `tapToDismiss` enabled unless accidental dismissal would be harmful.

---

## 6. Verify the integration

Once the provider setup is done, validate the integration with this checklist:

- The toast provider is registered exactly once.
- A toast method is called from a reachable user flow.
- Notifications appear in the expected screen corner.
- Duplicate prevention and `maxToasts` behave as intended for your UX.
- Styling changes are applied from global styles, not component-local styles.

---

## 7. Recommended defaults for most apps

A practical baseline for product UIs is:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideNgxMatToast } from 'ngx-mat-toast';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxMatToast({
      duration: 3000,
      closeable: true,
      progressBar: true,
      progressBarDirection: 'decreasing',
      tapToDismiss: true,
      preventDuplicates: true,
      maxToasts: 5,
      position: { horizontal: 'end', vertical: 'top' },
    }),
  ],
};
```

Why this works well:

- Success and info messages disappear automatically.
- The progress bar communicates time remaining.
- Duplicate prevention reduces noisy bursts.
- The top-end position is familiar for many business apps.

---

## 8. Common onboarding mistakes

### Adding deprecated Angular animations setup unnecessarily

`ngx-mat-toast` and the current Angular Material snackbar host both use native CSS motion.

You do not need `provideAnimations()`, `provideAnimationsAsync()`, `provideNoopAnimations()`, `BrowserAnimationsModule`, or `NoopAnimationsModule` just to show toasts with this library.

Keep legacy Angular animations setup only when another part of your app still depends on it.

### Styling from component scope only

Material snackbars render in the CDK overlay container, outside most component style scopes.

Prefer global styles such as `styles.scss` for visual overrides.

### Mixing many positions in the same workflow

The library uses a single snackbar host at a time. If active toasts request different positions, the stack moves to the most recently requested position.

Best practice: define one default position and override it only for clear UX reasons.

### Starting a migration with the adapter and never finishing it

`ToastrService` is useful during migration, but new features should usually use `NgxMatToastService` directly.

---

## 9. Local verification with the demo app

The workspace ships with a demo application under `projects/demo`.

```bash
npm install
npm start
```

You can also build the demo separately:

```bash
npm run build:demo
```

---

## 10. Next steps

After your first integration:

1. Review the full option set in [`configuration.md`](./configuration.md).
2. Look up method details in [`api-reference.md`](./api-reference.md).
3. Apply production styling from [`customization.md`](./customization.md).
4. Copy working patterns from [`examples.md`](./examples.md).
5. If you are migrating from `ngx-toastr`, continue with [`migrating-from-ngx-toastr.md`](./migrating-from-ngx-toastr.md).
