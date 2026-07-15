import type { Signal } from '@angular/core';
import type { ToastData } from '../toast.model';
import type { ToastPosition } from '../toast-position';

/**
 * Data passed from `NgxMatToastService` into the persistent Material snackbar outlet.
 *
 * @internal
 */
export interface ToastOutletData {
  toasts: Signal<ToastData[]>;
  dismiss: (id: string) => void;
  tap: (id: string) => void;
  position: ToastPosition;
  fullWidth: boolean;
}
