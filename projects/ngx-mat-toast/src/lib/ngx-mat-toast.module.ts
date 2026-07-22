import { ModuleWithProviders, NgModule, type Provider } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import type { NgxMatToastOptions } from './toast.config';
import { NGX_MAT_TOAST_CONFIG } from './toast-config.token';

/**
 * NgModule for using `ngx-mat-toast` in **NgModule-based** Angular applications.
 *
 * `ngx-mat-toast` uses CSS-native motion for the toast stack and does not require
 * Angular animations modules for its own snackbar-based rendering.
 *
 * @deprecated Prefer the standalone `provideNgxMatToast()` function instead.
 * `NgxMatToastModule` will be removed in a future major version once NgModule-based
 * applications are no longer a primary use-case.
 *
 * Migration:
 * ```ts
 * // Before
 * NgxMatToastModule.forRoot({ duration: 4000 })
 *
 * // After
 * provideNgxMatToast({ duration: 4000 })
 * ```
 *
 * @example
 * ```ts
 * @NgModule({
 *   imports: [
 *     NgxMatToastModule.forRoot({
 *       duration: 4000,
 *       position: { horizontal: 'end', vertical: 'top' },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@NgModule({
  imports: [MatSnackBarModule],
  exports: [MatSnackBarModule],
})
export class NgxMatToastModule {
  /**
   * Registers global `ngx-mat-toast` configuration for NgModule-based applications.
   *
   * @deprecated Prefer the standalone `provideNgxMatToast()` function.
   */
  public static forRoot(config: NgxMatToastOptions = {}): ModuleWithProviders<NgxMatToastModule> {
    return {
      ngModule: NgxMatToastModule,
      providers: [
        {
          provide: NGX_MAT_TOAST_CONFIG,
          useValue: config,
        } satisfies Provider,
      ],
    };
  }
}
