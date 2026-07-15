# Migrating from `ngx-toastr` to `ngx-mat-toast`

This guide helps you move from `ngx-toastr` to `ngx-mat-toast` with minimal friction.

`ngx-mat-toast` keeps the API intentionally familiar while using **Angular Material Snackbar** internally.

Related guides:

- [Documentation overview](./README.md)
- [Compatibility adapter guide](./compatibility-adapter.md)
- [API reference](./api-reference.md)
- [Troubleshooting](./troubleshooting.md)

---

## 1. Install the new package

Remove `ngx-toastr` and install `ngx-mat-toast` plus the Angular Material peers:

```bash
npm uninstall ngx-toastr
npm install ngx-mat-toast @angular/material @angular/cdk
```

---

## 2. Replace the app-level setup

### Standalone apps

Before:

```ts
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

export const appConfig = {
  providers: [
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      progressBar: true,
      positionClass: 'toast-top-right',
    }),
  ],
};
```

After:

```ts
import { provideNgxMatToast } from 'ngx-mat-toast';

export const appConfig = {
  providers: [
    provideNgxMatToast({
      duration: 3000,
      progressBar: true,
      position: { horizontal: 'end', vertical: 'top' },
    }),
  ],
};
```

### NgModule apps

Before:

```ts
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [BrowserAnimationsModule, ToastrModule.forRoot()],
})
export class AppModule {}
```

After:

```ts
import { NgxMatToastModule } from 'ngx-mat-toast';

@NgModule({
  imports: [NgxMatToastModule.forRoot()],
})
export class AppModule {}
```

`ngx-mat-toast` itself does not require Angular animations providers or modules. Keep your existing Angular animations setup only if other parts of the app still rely on Angular's legacy animations package.

---

## 3. Migrate service imports

### Option A: use the native `ngx-mat-toast` service

Before:

```ts
import { ToastrService } from 'ngx-toastr';
```

After:

```ts
import { NgxMatToastService } from 'ngx-mat-toast';
```

Then map the calls directly:

```ts
this.toast.success('Saved', 'Success');
this.toast.error('Save failed', 'Error');
this.toast.warning('Please review the form', 'Warning');
this.toast.info('Background sync started', 'Info');
```

### Option B: use the compatibility adapter first

If you want a smaller first migration step, change only the import:

```ts
import { ToastrService } from 'ngx-mat-toast';
```

This compatibility adapter supports the most common `ngx-toastr` call patterns:

- `success(message, title, options)`
- `error(message, title, options)`
- `warning(message, title, options)`
- `info(message, title, options)`
- `show(message, title, options, type)`
- `clear(id?)`
- `remove(id?)`

---

## 4. Map common config options

| `ngx-toastr`                           | `ngx-mat-toast`                                          |
| -------------------------------------- | -------------------------------------------------------- |
| `timeOut`                              | `duration`                                               |
| `disableTimeOut`                       | `duration: 0`                                            |
| `closeButton`                          | `closeable`                                              |
| `progressBar`                          | `progressBar`                                            |
| `tapToDismiss`                         | `tapToDismiss`                                           |
| `preventDuplicates`                    | `preventDuplicates`                                      |
| `maxOpened`                            | `maxToasts`                                              |
| `progressAnimation`                    | `progressBarDirection`                                   |
| `positionClass: 'toast-top-right'`     | `position: { horizontal: 'end', vertical: 'top' }`       |
| `positionClass: 'toast-top-left'`      | `position: { horizontal: 'start', vertical: 'top' }`     |
| `positionClass: 'toast-top-center'`    | `position: { horizontal: 'center', vertical: 'top' }`    |
| `positionClass: 'toast-bottom-right'`  | `position: { horizontal: 'end', vertical: 'bottom' }`    |
| `positionClass: 'toast-bottom-left'`   | `position: { horizontal: 'start', vertical: 'bottom' }`  |
| `positionClass: 'toast-bottom-center'` | `position: { horizontal: 'center', vertical: 'bottom' }` |

---

## 5. Example migration

Before:

```ts
import { Component, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  template: `<button (click)="save()">Save</button>`,
})
export class ProfileComponent {
  private readonly toastr = inject(ToastrService);

  save(): void {
    this.toastr.success('Profile saved successfully.', 'Saved', {
      timeOut: 3000,
      progressBar: true,
      positionClass: 'toast-top-right',
    });
  }
}
```

After (compatibility adapter):

```ts
import { Component, inject } from '@angular/core';
import { ToastrService } from 'ngx-mat-toast';

@Component({
  selector: 'app-profile',
  template: `<button (click)="save()">Save</button>`,
})
export class ProfileComponent {
  private readonly toastr = inject(ToastrService);

  save(): void {
    this.toastr.success('Profile saved successfully.', 'Saved', {
      timeOut: 3000,
      progressBar: true,
      positionClass: 'toast-top-right',
    });
  }
}
```

After (native service):

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
    this.toast.success('Profile saved successfully.', 'Saved', {
      duration: 3000,
      progressBar: true,
      position: { horizontal: 'end', vertical: 'top' },
    });
  }
}
```

---

## 6. Known differences

- `ngx-mat-toast` uses a **single Angular Material snackbar outlet** that hosts a stack of toast cards.
- If multiple active toasts request different positions, the stack moves to the **most recently requested** position.
- The compatibility adapter intentionally focuses on the most common `ngx-toastr` options. Less common options such as HTML rendering are not mirrored.

---

## 7. Common migration pitfalls

### Expecting full-width legacy positions to look identical

Legacy `toast-top-full-width` and `toast-bottom-full-width` position classes are automatically mapped to a centered position with the `fullWidth` layout enabled. The resulting behavior matches the original ngx-toastr layout, but you can also control it directly:

```ts
// Via the adapter (automatic)
this.toastr.success('Message', 'Title', {
  positionClass: 'toast-top-full-width', // Automatically sets fullWidth: true
});

// Via the native API (explicit)
this.ngxMatToast.success('Message', 'Title', {
  position: { horizontal: 'center', vertical: 'top' },
  fullWidth: true,
});
```

### Styling the overlay from component-local styles only

Because the Material snackbar renders in the CDK overlay container, migration styling should usually move to a global stylesheet such as `styles.scss`.

### Starting with the adapter and never standardizing the native API

The `ToastrService` adapter is the safest first step, but the cleanest long-term result is to move application code toward:

- `NgxMatToastService`
- `NgxMatToastOptions`
- `duration`
- `position`

### Reusing many different toast positions in one workflow

During migration, it can be tempting to preserve every historical `positionClass`. In practice, most apps benefit from standardizing on one default position and using overrides only where the UX clearly improves.

---

## 8. Recommended migration strategy

1. Replace package installation.
2. Swap app bootstrap/module configuration.
3. Change imports from `ngx-toastr` to `ngx-mat-toast`.
4. Start with the compatibility `ToastrService` if you want a low-risk migration.
5. Gradually move to `NgxMatToastService` and `NgxMatToastOptions` for the cleanest long-term API.
