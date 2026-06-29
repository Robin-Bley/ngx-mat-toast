import { InjectionToken } from '@angular/core';
import type { NgxMatToastOptions } from './toast.config';

/**
 * Injection token for providing global `ngx-mat-toast` configuration overrides.
 *
 * The service merges any provided values with `DEFAULT_TOAST_CONFIG`, so callers only
 * need to specify the options they want to override.
 *
 * @example
 * ```ts
 * providers: [
 *   provideNgxMatToast({
 *     duration: 5000,
 *     position: { horizontal: 'end', vertical: 'top' },
 *   }),
 * ]
 * ```
 */
export const NGX_MAT_TOAST_CONFIG = new InjectionToken<NgxMatToastOptions>('NGX_MAT_TOAST_CONFIG');
