import type { ToastPosition } from './toast-position';

/**
 * Global configuration for the ngx-mat-toast library.
 */
export interface NgxMatToastConfig {
  /**
   * Duration in milliseconds before the toast is automatically dismissed.
   * Set to `0` to disable auto-dismissal (persistent toast).
   * @default 3000
   */
  duration: number;

  /**
   * Position of the toast container on the screen.
   * @default { horizontal: 'end', vertical: 'top' }
   */
  position: ToastPosition;

  /**
   * Whether to show a close button on each toast.
   * @default true
   */
  closeable: boolean;

  /**
   * Whether to show a progress bar indicating the remaining display time.
   * @default false
   */
  progressBar: boolean;

  /**
   * Direction of the progress bar animation.
   * - `'decreasing'`: bar shrinks to zero (time running out)
   * - `'increasing'`: bar grows to full (time running out)
   * @default 'decreasing'
   */
  progressBarDirection: 'increasing' | 'decreasing';

  /**
   * Whether clicking on the toast dismisses it.
   * @default true
   */
  tapToDismiss: boolean;

  /**
   * Whether to prevent showing duplicate toasts with the same type and message.
   * @default false
   */
  preventDuplicates: boolean;

  /**
   * Maximum number of toasts to display simultaneously.
   * When the limit is reached, the oldest toast is removed.
   * Set to `0` for no limit.
   * @default 5
   */
  maxToasts: number;

  /**
   * Whether to enable extended log output to the browser console.
   * Useful during development.
   * @default false
   */
  enableDebug: boolean;
}

/**
 * Consumer-facing configuration overrides.
 *
 * Unlike `NgxMatToastConfig`, this type allows partial nested `position` overrides,
 * so callers can change just `horizontal` or `vertical` without repeating both values.
 */
export type NgxMatToastOptions = Omit<Partial<NgxMatToastConfig>, 'position'> & {
  position?: Partial<ToastPosition>;
};

/**
 * Default configuration values for ngx-mat-toast.
 */
export const DEFAULT_TOAST_CONFIG: NgxMatToastConfig = {
  duration: 3000,
  position: {
    horizontal: 'end',
    vertical: 'top',
  },
  closeable: true,
  progressBar: false,
  progressBarDirection: 'decreasing',
  tapToDismiss: true,
  preventDuplicates: false,
  maxToasts: 5,
  enableDebug: false,
};
