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
