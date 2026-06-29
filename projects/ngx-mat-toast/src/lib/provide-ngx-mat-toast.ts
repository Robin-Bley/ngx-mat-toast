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
 * `ngx-mat-toast` relies on native CSS motion. No Angular animations provider is required
 * for the toast stack itself.
 *
 * @param config Optional global configuration overrides.
 *
 * @example
 * ```ts
 * import { bootstrapApplication } from '@angular/platform-browser';
 * import { provideNgxMatToast } from 'ngx-mat-toast';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
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
