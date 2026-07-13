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
 * @deprecated Use `provideNgxMatToast()` instead for standalone Angular applications.
 * NgModule-based support is maintained for backward compatibility but may be removed in a
 * future major version once the Angular ecosystem has fully migrated to standalone APIs.
 *
 * @example
 * ```ts
 * // Preferred – standalone API
 * bootstrapApplication(AppComponent, {
 *   providers: [provideNgxMatToast({ duration: 4000 })],
 * });
 *
 * // Legacy – NgModule
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
