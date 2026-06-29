# ngx-mat-toast

`ngx-mat-toast` is an Angular toast notification library built on top of **Angular Material `MatSnackBar`**.

It is designed for teams that want a modern, typed toast API that still feels familiar when coming from `ngx-toastr`.

<p>
  <img src="docs/assets/preview.gif" alt="ngx-mat-toast preview" width="436" />
</p>

## Why `ngx-mat-toast`?

- Angular `21+`
- powered by Angular Material Snackbar
- standalone and NgModule integration styles
- simple service API: `success()`, `error()`, `warning()`, `info()`, `show()`, `dismiss()`, `clear()`
- global defaults plus per-toast overrides
- duplicate prevention, progress bars, close buttons, persistent toasts, and max toast limits
- optional `ToastrService` compatibility adapter for `ngx-toastr` migrations
- no Material Icons webfont dependency
- demo application and Vitest-based tests included in the workspace

---

## Quick start

### 1. Install

```bash
npm install ngx-mat-toast @angular/material @angular/cdk @angular/animations
```

### 2. Register the provider

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
      preventDuplicates: true,
    }),
  ],
};
```

### 3. Show a toast

```ts
import { Component, inject } from '@angular/core';
import { NgxMatToastService } from 'ngx-mat-toast';

@Component({
  selector: 'app-example',
  template: `<button type="button" (click)="save()">Save</button>`,
})
export class ExampleComponent {
  private readonly toast: NgxMatToastService = inject(NgxMatToastService);

  public save(): void {
    this.toast.success('Profile saved successfully.', 'Saved');
  }
}
```

> `ngx-mat-toast` uses Angular Material Snackbar internally, so your app must also provide animations via `provideAnimations()`, `provideAnimationsAsync()`, `provideNoopAnimations()`, `BrowserAnimationsModule`, or `NoopAnimationsModule`.

**Using NgModules instead of standalone APIs?** Use `NgxMatToastModule.forRoot()`. The full setup is documented in [`docs/getting-started.md`](docs/getting-started.md).

> **Architecture note:** `ngx-mat-toast` keeps a stack of toast cards inside a single Material snackbar host. If active toasts request different positions, the stack moves to the most recently requested position.

---

## Documentation

The root README is intentionally kept short. Use the docs below for the full guidance.

| Goal                                   | Guide                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------ |
| Start from scratch                     | [`docs/getting-started.md`](docs/getting-started.md)                     |
| Learn every option and default         | [`docs/configuration.md`](docs/configuration.md)                         |
| Look up the public API                 | [`docs/api-reference.md`](docs/api-reference.md)                         |
| Customize theming and overlay styling  | [`docs/customization.md`](docs/customization.md)                         |
| Copy practical implementation patterns | [`docs/examples.md`](docs/examples.md)                                   |
| Understand the internal design         | [`docs/architecture.md`](docs/architecture.md)                           |
| Migrate from `ngx-toastr`              | [`docs/migrating-from-ngx-toastr.md`](docs/migrating-from-ngx-toastr.md) |
| Understand the compatibility adapter   | [`docs/compatibility-adapter.md`](docs/compatibility-adapter.md)         |
| Troubleshoot setup or styling issues   | [`docs/troubleshooting.md`](docs/troubleshooting.md)                     |
| Browse the full documentation hub      | [`docs/README.md`](docs/README.md)                                       |

---

## Migration from `ngx-toastr`

If you are replacing `ngx-toastr`, you can start with the optional compatibility adapter:

```ts
import { ToastrService } from 'ngx-mat-toast';
```

Then move to the native API when you are ready.

Recommended reading:

- [`docs/migrating-from-ngx-toastr.md`](docs/migrating-from-ngx-toastr.md)
- [`docs/compatibility-adapter.md`](docs/compatibility-adapter.md)

---

## Demo

- Online demo: [StackBlitz](https://stackblitz.com/github/Robin-Bley/ngx-mat-toast?file=README.md)
- Local demo app: `projects/demo`

Run it locally:

```bash
npm install
npm start
```

---

## Development

Common workspace commands:

```bash
npm run build:lib
npm run test:lib
npm run build
npm run test:ci
```

Repository structure:

```text
projects/
  demo/             Example application
  ngx-mat-toast/    Publishable Angular library

docs/               Full documentation suite
.github/workflows/  CI and release automation
```

---

## Open source housekeeping

This repository also includes:

- [`CHANGELOG.md`](CHANGELOG.md)
- [`CONTRIBUTING.md`](CONTRIBUTING.md)
- [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)
- [`SECURITY.md`](SECURITY.md)
- [`LICENSE`](LICENSE)

---

## License

Licensed under the [MIT License](LICENSE).
