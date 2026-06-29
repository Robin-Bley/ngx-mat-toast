import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import type { NgxMatToastOptions } from './toast.config';
import { NGX_MAT_TOAST_CONFIG } from './toast-config.token';

/**
 * Provides `ngx-mat-toast` for **standalone** Angular applications.
 *
 * The provider registers the Angular Material snackbar infrastructure used by the library
 * and accepts optional global configuration overrides.
 *
 * > **Important:** Angular Material snackbars require animations. Make sure your app also
 * > provides either `provideAnimations()`, `provideAnimationsAsync()`, or
 * > `provideNoopAnimations()`.
 *
 * @param config Optional global configuration overrides.
 *
 * @example
 * ```ts
 * import { bootstrapApplication } from '@angular/platform-browser';
 * import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
 * import { provideNgxMatToast } from 'ngx-mat-toast';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideAnimationsAsync(),
 *     provideNgxMatToast({
 *       duration: 5000,
 *       progressBar: true,
 *       position: { horizontal: 'end', vertical: 'top' },
 *     }),
 *   ],
 * });
 * ```
 */
export function provideNgxMatToast(config: NgxMatToastOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    importProvidersFrom(MatSnackBarModule),
    {
      provide: NGX_MAT_TOAST_CONFIG,
      useValue: config,
    },
  ]);
}
